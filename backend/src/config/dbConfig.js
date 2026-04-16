import mongoose from "mongoose";
import { logger } from "../../logger.js";

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    logger.info("===DB connected ===");
  } catch (error) {
    logger.error(error, "==DB failed to connect==");
  }
};

export default dbConnect;
