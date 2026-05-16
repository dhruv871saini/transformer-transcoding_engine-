import { useCallback, useRef, useState } from "react";
import { uploadVideo } from "@/api/client";

type Props = {
  onUploaded: () => void;
};

export function UploadPanel({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runUpload = useCallback(
    async (file: File) => {
      setError(null);
      setMessage(null);
      if (!file.name.toLowerCase().endsWith(".mp4")) {
        setError("Only MP4 files are accepted.");
        return;
      }
      setBusy(true);
      try {
        await uploadVideo(file);
        setMessage("Upload queued. Transcoding runs in the background.");
        onUploaded();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [onUploaded],
  );

  const onFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) void runUpload(file);
    },
    [runUpload],
  );

  return (
    <section className={`upload-panel ${dragOver ? "upload-panel--active" : ""}`}>
      <div
        className="upload-panel__drop"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,.mp4"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="upload-panel__copy">
          <h2 className="upload-panel__title">Upload MP4</h2>
          <p className="upload-panel__hint">Drag and drop here, or choose a file.</p>
          <button
            type="button"
            className="btn btn--secondary"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Uploading…" : "Browse"}
          </button>
        </div>
      </div>
      {message ? <p className="feedback feedback--ok">{message}</p> : null}
      {error ? <p className="feedback feedback--err">{error}</p> : null}
    </section>
  );
}
