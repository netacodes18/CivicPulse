const amqp = require("amqplib");

// For local testing, we default to localhost if no URI is provided.
const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";

let channel = null;
let connection = null;

const connectRabbitMQ = async () => {
  if (process.env.NODE_ENV === "production" && !process.env.RABBITMQ_URI) {
    console.log("🟡 No RABBITMQ_URI provided in production. Running in MOCK MODE.");
    return;
  }

  let retries = 5;
  while (retries > 0) {
    try {
      connection = await amqp.connect(RABBITMQ_URI, { family: 4 });
      
      // Add error handlers to prevent unhandled socket errors from crashing the Node process
      connection.on("error", (err) => {
        console.error("🔴 RabbitMQ Connection Error:", err.message);
      });
      connection.on("close", () => {
        console.warn("🟡 RabbitMQ Connection Closed");
        channel = null;
        connection = null;
      });

      channel = await connection.createChannel();
      console.log("🐰 Connected to RabbitMQ");
      break; // Success
    } catch (error) {
      console.error(`🔴 Failed to connect to RabbitMQ: ${error.message}`);
      retries -= 1;
      if (retries === 0) {
        console.log("   (Make sure RabbitMQ is running. e.g., docker run -d --name rabbitmq -p 5672:5672 rabbitmq:3)");
      } else {
        console.log(`⏳ Retrying RabbitMQ connection in 5 seconds... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
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
