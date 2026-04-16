import { configDotenv } from "dotenv";
configDotenv()
import express from "express";
import config  from "./src/config/index.js";
import { logger } from "./logger.js";
import { TranscodingRoute } from "./src/routes/index.js";

const app = express();
const port = process.env.PORT || 3000;

app.use('/',TranscodingRoute);

app.get("/", (req, res) => {
  res.status(200).json({ message: "getting the data ..." });
});

app.listen(port, async () => {
  try {
    await config.dbConnect();
    logger.info("Connected successfully");
    logger.info(`Server running on port ${port}`);
  } catch (error) {
    logger.error(`Connection failed: ${error.message}`);
  }
});