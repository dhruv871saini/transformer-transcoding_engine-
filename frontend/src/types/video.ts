export type TranscodeStatus = "pending" | "completed" | "failed";

export interface VideoUrls {
  master?: string;
  "360p"?: string;
  "480p"?: string;
  "720p"?: string;
  "1080p"?: string;
  poster?: string;
}

export interface Video {
  _id?: string;
  title: string;
  videoId: string;
  videoUrls?: VideoUrls;
  status: TranscodeStatus;
  createdAt: string;
  updatedAt: string;
}
