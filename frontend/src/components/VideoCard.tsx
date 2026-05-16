import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { deleteVideo } from "@/api/client";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import type { Video } from "@/types/video";

const statusLabel: Record<Video["status"], string> = {
  pending: "Processing",
  completed: "Ready",
  failed: "Failed",
};

export function VideoCard({
  video,
  onDeleted,
}: {
  video: Video;
  onDeleted?: () => void;
}) {
  const ready = video.status === "completed";

  async function handleDelete(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (
      !window.confirm(
        `Delete "${video.title}" and its HLS output? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await deleteVideo(video.videoId);
      onDeleted?.();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <article className={`card video-card ${ready ? "video-card--ready" : ""}`}>
      <div className="video-card__thumb">
        {video.videoUrls?.poster ? (
          <img
            src={resolveMediaUrl(video.videoUrls.poster)}
            alt=""
            className="video-card__poster"
            loading="lazy"
          />
        ) : (
          <div className="video-card__placeholder" aria-hidden />
        )}
        <span className={`badge badge--${video.status}`}>{statusLabel[video.status]}</span>
      </div>
      <div className="video-card__body">
        <h2 className="video-card__title">{video.title}</h2>
        <p className="video-card__meta mono">{video.videoId}</p>
        <div className="video-card__actions video-card__actions--row">
          <Link to={`/videos/${video.videoId}`} className="btn btn--primary">
            Open
          </Link>
          <button type="button" className="btn btn--danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
