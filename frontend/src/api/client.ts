const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function apiPath(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return apiBase ? `${apiBase}${p}` : p;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON from server");
  }
}

export async function fetchVideos() {
  const res = await fetch(apiPath("/videos"));
  const data = await parseJson<{ videos?: unknown }>(res);
  if (!res.ok) {
    const msg = (data as { message?: string }).message || res.statusText;
    throw new Error(msg);
  }
  return data;
}

export async function fetchVideo(videoId: string) {
  const res = await fetch(apiPath(`/videos/${encodeURIComponent(videoId)}`));
  const data = await parseJson<{ video?: unknown; message?: string }>(res);
  if (!res.ok) {
    throw new Error(data.message || res.statusText);
  }
  return data;
}

export async function uploadVideo(file: File) {
  const body = new FormData();
  body.append("video", file);
  const res = await fetch(apiPath("/upload"), {
    method: "POST",
    body,
  });
  const data = await parseJson<{ message?: string; video?: unknown }>(res);
  if (!res.ok) {
    throw new Error(data.message || res.statusText);
  }
  return data;
}

export async function deleteVideo(videoId: string) {
  const res = await fetch(apiPath(`/videos/${encodeURIComponent(videoId)}`), {
    method: "DELETE",
  });
  const data = await parseJson<{ message?: string }>(res);
  if (!res.ok) {
    throw new Error(data.message || res.statusText);
  }
  return data;
}

export async function deleteAllVideos() {
  const res = await fetch(apiPath("/videos"), { method: "DELETE" });
  const data = await parseJson<{ message?: string; deletedCount?: number }>(res);
  if (!res.ok) {
    throw new Error(data.message || res.statusText);
  }
  return data;
}
