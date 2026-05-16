import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteVideo, fetchVideo } from "@/api/client";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import type { Video } from "@/types/video";

const HlsPlayer = lazy(() =>
  import("@/components/HlsPlayer").then((m) => ({ default: m.HlsPlayer })),
);

function isVideoRecord(x: unknown): x is Video {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.videoId === "string" &&
    typeof o.title === "string" &&
    (o.status === "pending" || o.status === "completed" || o.status === "failed")
  );
}

export function VideoDetailPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!videoId) return;
    setError(null);
    setLoading(true);
    try {
      const data = await fetchVideo(videoId);
      const v = data.video;
      setVideo(isVideoRecord(v) ? v : null);
      if (!isVideoRecord(v)) setError("Unexpected response from server");
    } catch (e) {
      setVideo(null);
      setError(e instanceof Error ? e.message : "Could not load video");
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = useCallback(async () => {
    if (!videoId) return;
    if (
      !window.confirm(
        "Delete this video and its HLS output folder? This cannot be undone.",
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await deleteVideo(videoId);
      navigate("/", { replace: true });
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }, [videoId, navigate]);

  const master = video?.videoUrls?.master;

  return (
    <div className="page page--detail">
      <Link to="/" className="back-link">
        ← Back to library
      </Link>

      {loading ? <p className="muted">Loading…</p> : null}
      {error ? <p className="feedback feedback--err">{error}</p> : null}

      {video && !loading ? (
        <>
          <header className="page-header">
            <h1 className="page-title">{video.title}</h1>
            <p className="page-lead mono">{video.videoId}</p>
            <div className="detail-header-row">
              <span className={`badge badge--${video.status} detail-badge`}>
                {video.status === "completed"
                ? "Ready to play"
                : video.status === "failed"
                  ? "Transcode failed"
                  : "Transcoding"}
              </span>
              <button
                type="button"
                className="btn btn--danger"
                disabled={deleting}
                onClick={() => void handleDelete()}
              >
                {deleting ? "Deleting…" : "Delete video"}
              </button>
            </div>
          </header>

          {video.status === "completed" && master ? (
            <div className="player-shell card">
              <Suspense
                fallback={<div className="player-fallback muted">Loading player…</div>}
              >
                <HlsPlayer src={master} poster={video.videoUrls?.poster} className="video-el" />
              </Suspense>
            </div>
          ) : video.status === "failed" ? (
            <div className="card waiting-card">
              <p className="feedback feedback--err">
                Transcoding failed. Check backend logs, then delete and re-upload if needed.
              </p>
            </div>
          ) : (
            <div className="card waiting-card">
              <p className="muted">
                This video is still being processed. Refresh in a few moments once FFmpeg finishes.
              </p>
              <button type="button" className="btn btn--secondary" onClick={() => void load()}>
                Refresh status
              </button>
            </div>
          )}

          {video.status === "completed" && video.videoUrls ? (
            <section className="section">
              <h2 className="section-title">Renditions</h2>
              <ul className="rendition-list mono">
                {(["360p", "480p", "720p", "1080p"] as const).map((key) => {
                  const url = video.videoUrls?.[key];
                  if (!url) return null;
                  return (
                    <li key={key}>
                      <span className="rendition-label">{key}</span>
                      <a
                        href={resolveMediaUrl(url)}
                        className="rendition-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open playlist
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
