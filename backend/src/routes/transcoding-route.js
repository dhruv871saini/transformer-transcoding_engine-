import { Router } from "express";
import config from "../config/index.js";
import controller from "../controller/index.js";
const router =Router();

router.post(
  "/upload",
  config.upload.single("video"),
  controller.videoController.upload
);
router.get("/videos", controller.videoController.getAll);
router.delete("/videos", controller.videoController.deleteAll);
router.get("/videos/:videoId", controller.videoController.getByVideoId);
router.delete("/videos/:videoId", controller.videoController.deleteByVideoId);

export default router;