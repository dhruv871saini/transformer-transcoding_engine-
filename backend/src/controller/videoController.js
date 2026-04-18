import { v4 as uuid } from "uuid";
import TranscodeModel from "../model/transcode.model.js";
import config from "../config/index.js";

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
      const video = createdVideo.save();
      if(!uploadedVideoPath){
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
      console.log("sending in rabbitmq ")

      return res.status(201).json({
        message: "Video uploaded",
        video,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default videoController;