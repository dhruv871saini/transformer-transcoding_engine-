import dbConnect from "./dbConfig.js";
import upload from "./multerConfig.js";
import rabbitMQConfig from "./rabbitMQConfig.js";

const config = {
  dbConnect,
  upload,
  rabbitMQConfig

};

export default config;