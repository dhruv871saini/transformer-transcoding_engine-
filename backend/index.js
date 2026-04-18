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
    await config.rabbitMQConfig.connectChannel();
    logger.info("Connected successfully");
    logger.info(`Server running on port ${port}`);
    await config.rabbitMQConfig.receiveData();
  } catch (error) {
    logger.error(`Connection failed: ${error.message}`);
    process.exit(1);
  }
});