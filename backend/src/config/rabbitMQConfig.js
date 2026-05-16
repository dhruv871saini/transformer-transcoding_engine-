import amqp from "amqplib";
import transcodeHandler from "../controller/transcoderController.js";
import { logger } from "../../logger.js";

let channel;
let connection;

/** Serial queue: FFmpeg jobs can exceed RabbitMQ's consumer ack timeout (30 min). */
const jobQueue = [];
let processingJob = false;

async function drainJobQueue() {
  if (processingJob || jobQueue.length === 0) return;
  processingJob = true;
  const { data } = jobQueue.shift();
  try {
    await transcodeHandler(data);
  } catch (error) {
    logger.error(`Transcode job failed: ${error?.message || error}`);
  } finally {
    processingJob = false;
    void drainJobQueue();
  }
}

function enqueueTranscodeJob(data) {
  jobQueue.push({ data });
  void drainJobQueue();
}

const connectChannel = async () => {
  try {
    connection = await amqp.connect(process.env.RABBIT_MQ);
    channel = await connection.createChannel();

    connection.on("error", (err) => {
      logger.error(`RabbitMQ connection error: ${err.message}`);
    });
    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
    });

    channel.on("error", (err) => {
      logger.error(`RabbitMQ channel error: ${err.message}`);
    });
    channel.on("close", () => {
      logger.warn("RabbitMQ channel closed");
    });

    await channel.assertExchange(process.env.EXCHANGE, "direct", { durable: true });
    await channel.prefetch(1);
    logger.info("RabbitMQ channel connected");
  } catch (error) {
    logger.error(`connectChannel failed: ${error.message}`);
    throw error;
  }
};

const sendData = async (data) => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not ready");
  }
  await channel.assertExchange(process.env.EXCHANGE, "direct", { durable: true });
  await channel.assertQueue(process.env.QUEUE_NAME, { durable: true });
  await channel.bindQueue(
    process.env.QUEUE_NAME,
    process.env.EXCHANGE,
    "transformer bro",
  );
  channel.publish(
    process.env.EXCHANGE,
    "transformer bro",
    Buffer.from(JSON.stringify(data)),
    { persistent: true },
  );
  logger.info("Video added to transcode queue");
};

const receiveData = async () => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not ready");
  }

  await channel.consume(
    process.env.QUEUE_NAME,
    (msg) => {
      if (!msg?.content) return;

      let data;
      try {
        data = JSON.parse(msg.content.toString());
      } catch (error) {
        logger.error(`Invalid queue message, discarding: ${error.message}`);
        channel.ack(msg);
        return;
      }

      // Ack immediately so RabbitMQ does not close the channel while FFmpeg runs.
      // Job state is already stored in MongoDB (pending) before the message is sent.
      channel.ack(msg);
      logger.info(`Transcode job received (queue depth: ${jobQueue.length + 1})`);
      enqueueTranscodeJob(data);
    },
    { noAck: false },
  );

  logger.info("RabbitMQ consumer listening");
};

export default { receiveData, sendData, connectChannel };
