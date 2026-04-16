import { Router } from "express";
import config from "../config/index.js";
import controller from "../controller/index.js";
const router =Router();

router.post('/upload',config.upload.single("video"),controller.videoController.upload)

export default router;