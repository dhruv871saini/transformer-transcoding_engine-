import Hls from "hls.js";
import { useEffect, useRef } from "react";
import { resolveMediaUrl } from "@/lib/mediaUrl";

type Props = {
  src: string;
  poster?: string;
  className?: string;
};

export function HlsPlayer({ src, poster, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const resolved = resolveMediaUrl(src);
    if (!resolved) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hls.loadSource(resolved);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              hls = null;
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = resolved;
    }

    return () => {
      hls?.destroy();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      controls
      playsInline
      poster={poster ? resolveMediaUrl(poster) : undefined}
      preload="metadata"
    />
  );
}
