// src/lib/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8130";

export async function analyzeAudio(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }
  return res.json() as Promise<{
    id: string;
    is_real: boolean;
    confidence: number;
    prob_fake: number;
    duration: number;
    sample_rate: number;
    processing_ms: number;
    timestamp: string;
    explanations?: any;
  }>;
}
