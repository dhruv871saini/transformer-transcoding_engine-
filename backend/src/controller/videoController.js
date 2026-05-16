import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import TranscodeModel from "../model/transcode.model.js";
import config from "../config/index.js";

async function removeHlsOutputDir(videoId) {
  const dir = path.join(process.cwd(), "hls-outputs", videoId);
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}
const videoController = {
  async upload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Video not provided" });
      }

      const videoId = uuid();
      const uploadedVideoPath = req.file.path;


      const createdVideo = await TranscodeModel.create({
        title: req.file.originalname,
        videoId,
      });
      if (!uploadedVideoPath) {
        return res.status(400).json({ message: "Video not provided" });
      }
      console.log("uploadvideopath",uploadedVideoPath)
      const toTranscode ={
        data:{
          videoId,
          uploadedVideoPath
        },
      }


      await config.rabbitMQConfig.sendData(toTranscode);
      console.log("sending in rabbitmq ");

      return res.status(201).json({
        message: "Video uploaded",
        video: createdVideo,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const videos = await TranscodeModel.find()
        .sort({ createdAt: -1 })
        .lean();
      return res.status(200).json({ videos });
    } catch (error) {
      next(error);
    }
  },

  async getByVideoId(req, res, next) {
    try {
      const { videoId } = req.params;
      const video = await TranscodeModel.findOne({ videoId }).lean();
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      return res.status(200).json({ video });
    } catch (error) {
      next(error);
    }
  },

  async deleteAll(req, res, next) {
    try {
      const videos = await TranscodeModel.find().select("videoId").lean();
      for (const v of videos) {
        await removeHlsOutputDir(v.videoId);
      }
      const result = await TranscodeModel.deleteMany({});
      return res.status(200).json({
        message: "All videos deleted",
        deletedCount: result.deletedCount ?? 0,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteByVideoId(req, res, next) {
    try {
      const { videoId } = req.params;
      const deleted = await TranscodeModel.findOneAndDelete({ videoId });
      if (!deleted) {
        return res.status(404).json({ message: "Video not found" });
      }
      await removeHlsOutputDir(videoId);
      return res.status(200).json({
        message: "Video deleted",
        videoId,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default videoController;