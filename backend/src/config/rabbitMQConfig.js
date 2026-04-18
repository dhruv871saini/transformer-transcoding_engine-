import amqp from 'amqplib'
import transcodeHandler from '../controller/transcoderController.js';

let channel, connection;
const connectChannel = async () => {
    try {
        connection = await amqp.connect(process.env.RABBIT_MQ);
        channel = await connection.createChannel();
        await channel.assertExchange(process.env.EXCHANGE, "direct", { durable: true })
        console.log("channel connected -------");

    } catch (error) {
        console.log("error in connectChannel ::", error);
        process.exit(1);
    }
}

const sendData = async (data) => {
    try {
        await channel.assertExchange(process.env.EXCHANGE, "direct", { durable: true })
        await channel.assertQueue(process.env.QUEUE_NAME, { durable: true });
        await channel.bindQueue(
            process.env.QUEUE_NAME,
            process.env.EXCHANGE,
            "transformer bro"
        )
        channel.publish(
            process.env.EXCHANGE,
            "transformer bro",
            Buffer.from(JSON.stringify(data))
        )

        console.log("video added in queue")
        console.log("data::sendData",data)
    } catch (error) {
        console.log("error in sendData func", error)
        process.exit(1);
    }
}

const  receiveData = async()=> {
 channel.consume(process.env.QUEUE_NAME, async (msg) => {
  if (msg.content) {
    try {
      const data = JSON.parse(msg.content.toString());
        console.log("data.uploadedVideopath",data)
      await transcodeHandler(data); // wait for processing

      channel.ack(msg); // ack ONLY after success
    } catch (error) {
      console.error("Processing failed:", error);

      channel.nack(msg, false, false); // reject message
    }
  }
});
}

export default {receiveData,sendData,connectChannel}