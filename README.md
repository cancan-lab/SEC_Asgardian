```md
# SEC_Asgardian

Demo **Audio Deepfake Detection**: Frontend (React + Vite + TypeScript), Backend (FastAPI), dan skrip Model (Python).  
Aplikasi memungkinkan pengguna mengunggah audio lalu mendapatkan prediksi apakah audio tersebut **real** atau **fake**.

---

## 🚀 Fitur
- Upload audio (browser) → kirim ke API
- Prediksi model (server Python)
- Respons JSON berisi probabilitas & label
- Siap dipisah menjadi **frontend/**, **backend/** (atau `server/`), dan **model/**

> Catatan: Jika di repo kamu folder backend masih bernama `server/`, anggap instruksi **backend/** di bawah mengacu ke folder **server/**.

---

## 📂 Struktur Proyek



```

.
├─ frontend/                  # React + Vite + TS (UI)
│  ├─ src/
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.ts
├─ backend/                   # FastAPI (bisa masih bernama: server/)
│  ├─ app.py
│  └─ requirements.txt
├─ model/                     # Skrip/model ML
│  └─ check\_model.py
├─ README.md
└─ .gitignore

```



---

## ✅ Prasyarat
- **Node.js 18+** dan **npm**
- **Python 3.10+** (disarankan pakai virtual environment)
- Git (opsional untuk kontribusi)

---

## 🧩 Konfigurasi Lingkungan

### Frontend
Buat file **`frontend/.env.local`**:
```

VITE\_API\_BASE\_URL=[http://localhost:8000](http://localhost:8000)

```

### Backend
Jika perlu, buat **`backend/.env`** (opsional):
```

CORS\_ORIGINS=[http://localhost:5173](http://localhost:5173)

````

---

## ▶️ Menjalankan Proyek (Lokal)

### 1) Backend (FastAPI)
```bash
cd backend          # atau cd server jika foldermu bernama server
python -m venv .venv
# Windows (Git Bash/PowerShell):
source .venv/Scripts/activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --reload
````

Default jalan di **[http://localhost:8000](http://localhost:8000)**

### 2) Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

Default jalan di **[http://localhost:5173](http://localhost:5173)**

> Jalankan **backend** dan **frontend** di terminal terpisah.

---

## 🛠️ Endpoint API (contoh)

### `POST /api/analyze`

* **Content-Type**: `multipart/form-data`
* **Field**: `file` (audio, misal `.wav`, `.mp3`)
* **Respons (contoh)**:

```json
{
  "label": "fake",
  "prob_fake": 0.91,
  "prob_real": 0.09,
  "model_version": "v0.1.0"
}
```

### `GET /health`

* Cek status server:

```json
{ "status": "ok" }
```

---

## 🧪 Contoh Request

### cURL (umum)

```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -F "file=@/path/ke/audio.wav"
```

### PowerShell (Windows)

> **PS 7+** mendukung `-Form`. Jika kamu menggunakan **PS 5**, gunakan `curl` di atas.

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:8000/api/analyze" `
  -Method Post `
  -Form @{ file = Get-Item "D:\SEC\contoh.wav" }
```

### fetch (browser/JS)

```ts
const form = new FormData();
form.append("file", fileInput.files[0]);
const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analyze`, {
  method: "POST",
  body: form,
});
const data = await res.json();
console.log(data);
```

---

## 🧱 Build Produksi (Frontend)

```bash
cd frontend
npm run build   # output di frontend/dist
```

Jika ingin disajikan oleh backend (opsional), arahkan static file ke `frontend/dist`.

---

## 🧹 .gitignore (disarankan di root)

```
# Node / Vite
node_modules/
frontend/node_modules/
frontend/dist/

# Python
.venv/
__pycache__/

# Env
.env
.env.local
frontend/.env*
backend/.env*
```

---

## 🧭 Alur Kerja Dev Singkat

1. Jalankan **backend** → `uvicorn app:app --reload`
2. Jalankan **frontend** → `npm run dev`
3. Pastikan `VITE_API_BASE_URL` mengarah ke alamat backend
4. Unggah audio dari UI dan amati respons prediksi

---

## 🧯 Troubleshooting

* **CORS error**: Tambahkan origin frontend (mis. `http://localhost:5173`) pada konfigurasi CORS di backend.
* **Port sudah dipakai**: Ganti port `uvicorn` → `uvicorn app:app --reload --port 8001` dan sesuaikan `VITE_API_BASE_URL`.
* **413 Payload Too Large**: Atur limit ukuran file di server/reverse proxy (mis. Nginx) atau validasi di frontend.
* **Git push ditolak (non-fast-forward)**:

  ```
  git pull --rebase origin main
  # selesaikan konflik (jika ada)
  git push origin main
  ```

  (Atau pakai `git push --force-with-lease` jika memang ingin menimpa remote.)

---

## 📜 Lisensi

Tentukan lisensi yang kamu inginkan (mis. MIT).
© 2025 cancan-lab & kontributor.
