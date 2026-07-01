const amqp = require("amqplib");

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";
const QUEUE_NAME = "notification_queue";

const startWorker = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URI);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    // Process one message at a time
    channel.prefetch(1);
    
    console.log(`👷 Notification Worker listening to "${QUEUE_NAME}" queue...`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        const payload = JSON.parse(msg.content.toString());
        
        console.log("\n================ [WORKER: NEW MESSAGE] ================");
        console.log(`📨 Received type: ${payload.type}`);
        console.log(`📱 Sending to: ${payload.phone}`);
        console.log(`💬 Message body: ${payload.body}`);
        console.log("=======================================================\n");

        // Simulate network delay / heavy processing
        setTimeout(() => {
          console.log(`✅ Successfully processed message for report ${payload.reportId}`);
          channel.ack(msg); // Acknowledge message so it gets removed from the queue
        }, 2000);
      }
    });

  } catch (error) {
    console.error("🔴 Worker Error:", error.message);
    console.log("   (Make sure RabbitMQ is running or your RABBITMQ_URI is correct)");
  }
};

startWorker();
