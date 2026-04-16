import amqp from 'amqplib'
import transcode from '../controller/transcoderController.js';

let channel, connection;
const connectChannel = async () => {
    try {
        connection = await amqp.connect(process.env.RABBIT_MQ);
        channel = await connection.createChannel();
        await channel.assertExchange(process.env.EXCHANGE, "direct", { durable: true })
        console.log("channel connected -------");

    } catch (error) {
        console.log("error in connectChannel ::", error)
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
    } catch (error) {
        console.log("error in sendData func", error)
    }
}

const  receiveData = async()=> {
 channel.consume(process.env.QUEUE_NAME, async (msg) => {
  if (msg.content) {
    try {
      const data = JSON.parse(msg.content.toString());

      await transcode(data); // wait for processing

      channel.ack(msg); // ack ONLY after success
    } catch (error) {
      console.error("Processing failed:", error);

      channel.nack(msg, false, false); // reject message
    }
  }
});
}

export default {receiveData,sendData,connectChannel}