const amqp = require("amqplib");

// For local testing, we default to localhost if no URI is provided.
const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";

let channel = null;
let connection = null;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URI);
    channel = await connection.createChannel();
    console.log("🐰 Connected to RabbitMQ");
  } catch (error) {
    console.error("🔴 Failed to connect to RabbitMQ:", error.message);
    console.log("   (Make sure RabbitMQ is running. e.g., docker run -d --name rabbitmq -p 5672:5672 rabbitmq:3)");
  }
};

const publishMessage = async (queue, data) => {
  if (!channel) {
    console.error("🔴 Cannot publish message: RabbitMQ channel not initialized.");
    return false;
  }
  
  try {
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
    console.log(`📤 Published message to queue "${queue}":`, data);
    return true;
  } catch (error) {
    console.error("🔴 Error publishing message to RabbitMQ:", error);
    return false;
  }
};

module.exports = {
  connectRabbitMQ,
  publishMessage,
};
