import { configDotenv } from "dotenv";
configDotenv();
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import config from "./src/config/index.js";
import { logger } from "./logger.js";
import { TranscodingRoute } from "./src/routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) ?? true;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.use("/hls-outputs", express.static(path.join(__dirname, "hls-outputs")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).json({ message: "getting the data ..." });
});

app.use("/", TranscodingRoute);

app.use((err, req, res, next) => {
  logger.error(err?.message || String(err));
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ message });
});

app.listen(port, async () => {
  try {
    await config.dbConnect();
    await config.rabbitMQConfig.connectChannel();
    logger.info("Connected successfully");
    logger.info(`Server running on port ${port}`);
    await config.rabbitMQConfig.receiveData();
  } catch (error) {
    logger.error(`Connection failed: ${error.message}`);
    process.exit(1);
  }
});