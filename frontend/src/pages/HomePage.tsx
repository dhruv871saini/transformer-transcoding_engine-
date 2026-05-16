import { useCallback, useEffect, useState } from "react";
import { deleteAllVideos, fetchVideos } from "@/api/client";
import { UploadPanel } from "@/components/UploadPanel";
import { VideoCard } from "@/components/VideoCard";
import type { Video } from "@/types/video";

function isVideoRecord(x: unknown): x is Video {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.videoId === "string" &&
    typeof o.title === "string" &&
    (o.status === "pending" || o.status === "completed" || o.status === "failed")
  );
}

export function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchVideos();
      const list = Array.isArray(data.videos) ? data.videos.filter(isVideoRecord) : [];
      setVideos(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDeleteAll = useCallback(async () => {
    if (videos.length === 0) return;
    if (
      !window.confirm(
        `Delete all ${videos.length} videos and their HLS folders? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingAll(true);
    setError(null);
    try {
      await deleteAllVideos();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete videos");
    } finally {
      setDeletingAll(false);
    }
  }, [videos.length, load]);

  return (
    <div className="page page--home">
      <header className="page-header">
        <h1 className="page-title">Library</h1>
        <p className="page-lead">Upload MP4s, track transcoding, and play adaptive HLS streams.</p>
      </header>

      <UploadPanel onUploaded={() => void load()} />

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">All videos</h2>
          <div className="section-actions">
            <button
              type="button"
              className="btn btn--danger"
              disabled={loading || deletingAll || videos.length === 0}
              onClick={() => void handleDeleteAll()}
            >
              {deletingAll ? "Deleting…" : "Delete all"}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => void load()} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {loading ? <p className="muted">Loading…</p> : null}
        {error ? <p className="feedback feedback--err">{error}</p> : null}

        {!loading && !error && videos.length === 0 ? (
          <p className="muted empty-state">No videos yet. Upload an MP4 to get started.</p>
        ) : null}

        <div className="grid">
          {videos.map((v) => (
            <VideoCard key={v.videoId} video={v} onDeleted={() => void load()} />
          ))}
        </div>
      </section>
    </div>
  );
}
