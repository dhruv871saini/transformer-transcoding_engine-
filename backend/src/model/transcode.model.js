import mongoose from "mongoose";
const transcodeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    videoId: { type: String, required: true },
    videoUrls: {
      master: { type: String },
      "360p": { type: String },
      "480p": { type: String },
      "720p": { type: String },
      "1080p": { type: String },
      poster: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const transcodeModel = mongoose.model("transcode", transcodeSchema);
export default transcodeModel;