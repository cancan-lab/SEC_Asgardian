# server/app.py
"""
Voxhance API (FastAPI)
- POST /api/analyze : upload audio -> analisis
- GET  /            : status ringkas (cek version, model_type, raw_keys)
- GET  /health      : health check
- GET  /debug/model : info model (tipe, n_features)
- GET  /debug/pickle: ringkasan isi joblib (keys & tipe)
Docs: /docs
"""

from pathlib import Path
from typing import Optional, Any, Set, Dict
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import joblib
import librosa
import soundfile as sf
import io
import os
import time
import traceback

# =========================
# Konfigurasi dasar
# =========================
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
# default: joblib
MODEL_PATH = Path(os.getenv("VOXHANCE_MODEL", str(MODELS_DIR / "logreg_mfcc.joblib")))

SR = 16_000
MAX_SECONDS = 30.0

ALLOWED_MIME = {
    "audio/wav", "audio/x-wav", "audio/mpeg", "audio/webm",
    "audio/ogg", "audio/mp4", "audio/aac", "audio/x-m4a",
    "application/octet-stream"
}

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:3000", "http://127.0.0.1:3000",
]

# =========================
# App & CORS
# =========================
app = FastAPI(title="Voxhance API", version="0.1.9")
app.add_middleware(
    CORSMiddleware,
    allow_origins=DEFAULT_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print(f"[boot] app.py loaded from: {Path(__file__).resolve()}")
print(f"[boot] MODEL_PATH: {MODEL_PATH}")

# =========================
# Loader model (rekursif + fail-fast)
# =========================
RAW_OBJ: Any = None   # simpan isi joblib mentah (apa pun bentuknya)
model: Any = None     # estimator sklearn (Pipeline/Estimator)

PREFERRED_KEYS = ("pipeline", "model", "estimator", "clf", "classifier", "regressor")

def _is_estimator(x: Any) -> bool:
    return any(hasattr(x, attr) for attr in ("predict_proba", "predict", "decision_function"))

def _find_estimator(obj: Any, seen: Optional[Set[int]] = None) -> Optional[Any]:
    """Cari estimator sklearn secara REKURSIF di dalam dict/list/tuple/set."""
    if seen is None:
        seen = set()
    try:
        oid = id(obj)
        if oid in seen:
            return None
        seen.add(oid)
    except Exception:
        pass

    if _is_estimator(obj):
        return obj

    if isinstance(obj, dict):
        # Prioritas key umum lebih dulu
        for key in PREFERRED_KEYS:
            if key in obj:
                est = _find_estimator(obj[key], seen)
                if est is not None:
                    print(f"[boot] unwrap dict['{key}'] -> {type(est)}")
                    return est
        # Coba rangkai scaler + clf jadi pipeline
        scaler = None
        clf = None
        for k, v in obj.items():
            name = str(k).lower()
            if scaler is None and ("scaler" in name or "standardscaler" in name):
                scaler = v
            if clf is None and _is_estimator(v):
                clf = v
        if scaler is not None and clf is not None:
            try:
                from sklearn.pipeline import make_pipeline
                pipe = make_pipeline(scaler, clf)
                print(f"[boot] built pipeline from dict parts: {type(scaler)}, {type(clf)}")
                return pipe
            except Exception as e:
                print("[boot] failed to build pipeline:", e)
        # Telusuri semua value
        for v in obj.values():
            est = _find_estimator(v, seen)
            if est is not None:
                return est

    if isinstance(obj, (list, tuple, set)):
        for v in obj:
            est = _find_estimator(v, seen)
            if est is not None:
                return est

    return None

def _summarize_raw(obj: Any, max_items: int = 50) -> Dict[str, Any]:
    """Ringkas isi raw joblib (keys & tipe) agar aman ditampilkan."""
    summary: Dict[str, Any] = {"type": str(type(obj))}
    if isinstance(obj, dict):
        keys = list(obj.keys())
        short = keys[:max_items]
        summary["dict_keys"] = short
        summary["dict_types"] = {str(k): str(type(obj[k])) for k in short}
        if len(keys) > max_items:
            summary["note"] = f"truncated keys: showing {max_items}/{len(keys)}"
    elif isinstance(obj, (list, tuple, set)):
        as_list = list(obj)
        sample = as_list[:max_items]
        summary["sequence_len"] = len(as_list)
        summary["sample_types"] = [str(type(x)) for x in sample]
    return summary

def _load_model(path: Path):
    global RAW_OBJ, model
    if not path.exists():
        raise RuntimeError(f"Model file tidak ditemukan: {path}")
    try:
        RAW_OBJ = joblib.load(path)
        est = _find_estimator(RAW_OBJ)
        if est is None:
            # Tidak ketemu estimator → FAIL FAST dengan info jelas
            if isinstance(RAW_OBJ, dict):
                keys = list(RAW_OBJ.keys())
                raise RuntimeError(
                    "File joblib berisi dict tetapi tidak ada estimator sklearn (.predict/.predict_proba). "
                    f"Keys tersedia: {keys}. Simpan joblib yang memuat Pipeline/Estimator pada salah satu key {list(PREFERRED_KEYS)} "
                    "atau simpan estimator langsung (bukan dict)."
                )
            raise RuntimeError(
                f"Tipe objek joblib tidak didukung untuk prediksi: {type(RAW_OBJ)}. "
                f"Harus ada estimator sklearn di dalamnya."
            )
        model = est
        print(f"[boot] model resolved: {type(model)}  from: {path}")
        n_in = getattr(model, "n_features_in_", None)
        if n_in is not None:
            print(f"[boot] model.n_features_in_ = {n_in}")
    except Exception as e:
        print("[boot] FATAL while loading model:\n", e)
        raise

_load_model(MODEL_PATH)

# =========================
# Audio utils & fitur (241D)
# =========================
def trim_or_pad(y: np.ndarray, sr: int, max_seconds: float = MAX_SECONDS) -> np.ndarray:
    if max_seconds is None or max_seconds <= 0:
        return y
    max_len = int(sr * max_seconds)
    return y[:max_len] if y.shape[-1] > max_len else y

def extract_features_241(y: np.ndarray, sr: int) -> np.ndarray:
    """
    241D:
      mel 100 -> mean(100)+std(100)=200
      mfcc 20 -> mean(20)+std(20)=40
      durasi  -> 1
    """
    if y.ndim > 1:
        y = np.mean(y, axis=1)
    y = librosa.util.normalize(y)

    mel = librosa.feature.melspectrogram(
        y=y, sr=sr, n_fft=1024, hop_length=256, n_mels=100, fmax=sr/2
    )
    mel_db = librosa.power_to_db(mel, ref=np.max)
    mel_stats = np.concatenate([mel_db.mean(axis=1), mel_db.std(axis=1)])  # 200

    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20, n_fft=1024, hop_length=256)
    mfcc_stats = np.concatenate([mfcc.mean(axis=1), mfcc.std(axis=1)])     # 40

    dur = np.array([len(y)/sr], dtype=np.float32)                          # 1

    feat = np.concatenate([mel_stats, mfcc_stats, dur]).astype(np.float32) # 241
    return feat

# =========================
# Prediksi
# =========================
def predict_proba_fake(feats_2d: np.ndarray) -> float:
    if not _is_estimator(model):
        raise RuntimeError("Model tidak valid: bukan estimator sklearn (cek /debug/pickle untuk melihat isi joblib).")

    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(feats_2d)[0]
        # tentukan indeks 'fake'
        fake_index: Optional[int] = None
        try:
            classes = getattr(model, "classes_", None)
            if classes is not None:
                idx = np.where(np.array(classes) == 1)[0]  # int label 1
                if idx.size:
                    fake_index = int(idx[0])
                else:
                    idx = np.where(np.array(classes, dtype=str).astype(str) == "fake")[0]
                    if idx.size:
                        fake_index = int(idx[0])
        except Exception:
            pass
        if fake_index is None:
            fake_index = 1 if proba.shape[0] > 1 else 0
        return float(proba[fake_index])

    if hasattr(model, "decision_function"):
        d = float(model.decision_function(feats_2d)[0])
        return 1.0 / (1.0 + np.exp(-d))

    pred = int(model.predict(feats_2d)[0])
    return float(pred)

# =========================
# Routes
# =========================
@app.get("/")
def root():
    info = {
        "status": "ok",
        "docs": "/docs",
        "analyze": "/api/analyze",
        "model_path": str(MODEL_PATH),
        "sr": SR,
        "feature_dim": 241,
        "feature_schema": "mel100(mean+std)=200 + mfcc20(mean+std)=40 + dur=1",
        "model_type": str(type(model)),
        "model_n_features_in": getattr(model, "n_features_in_", None),
        "version": "0.1.9",
        "code_path": str(Path(__file__).resolve()),
    }
    if isinstance(RAW_OBJ, dict):
        info["raw_type"] = "dict"
        info["raw_keys"] = list(RAW_OBJ.keys())
    else:
        info["raw_type"] = str(type(RAW_OBJ))
    return info

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/debug/model")
def debug_model():
    return {
        "model_type": str(type(model)),
        "model_n_features_in": getattr(model, "n_features_in_", None),
        "is_estimator": _is_estimator(model),
    }

@app.get("/debug/pickle")
def debug_pickle():
    return _summarize_raw(RAW_OBJ)

@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    t0 = time.time()

    if file.content_type not in ALLOWED_MIME:
        name = (file.filename or "").lower()
        if not (
            file.content_type == "application/octet-stream"
            and (name.endswith(".wav") or name.endswith(".mp3")
                 or name.endswith(".m4a") or name.endswith(".ogg")
                 or name.endswith(".webm") or name.endswith(".aac"))
        ):
            raise HTTPException(
                status_code=400,
                detail=f"Tipe file tidak didukung: {file.content_type} (nama: {file.filename})",
            )

    try:
        raw = await file.read()

        duration = None
        try:
            with sf.SoundFile(io.BytesIO(raw)) as snd:
                duration = len(snd) / float(snd.samplerate)
        except Exception:
            pass

        y, sr = librosa.load(io.BytesIO(raw), sr=SR, mono=True)
        if y.size == 0:
            raise ValueError("Audio kosong atau gagal didekode.")
        y = trim_or_pad(y, sr, MAX_SECONDS)

        feat = extract_features_241(y, sr)
        print(f"[analyze] feature_len={feat.shape[0]} (expected 241)")
        feats = feat.reshape(1, -1)

        proba_fake = predict_proba_fake(feats)
        is_real = proba_fake < 0.5
        confidence = 1.0 - proba_fake if is_real else proba_fake

        elapsed = time.time() - t0
        return {
            "id": f"anl_{int(time.time()*1000)}",
            "is_real": bool(is_real),
            "confidence": float(round(confidence, 4)),
            "prob_fake": float(round(proba_fake, 4)),
            "duration": float(duration if duration is not None else round(len(y) / sr, 2)),
            "sample_rate": int(sr),
            "processing_ms": int(elapsed * 1000),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "explanations": {
                "features": "241D (mel100 mean+std + mfcc20 mean+std + duration)"
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        print("[analyze] error\n", traceback.format_exc())
        raise HTTPException(status_code=400, detail=f"Gagal menganalisis audio: {e}")
    finally:
        await file.close()
