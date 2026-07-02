const amqp = require("amqplib");
const { sendEmail } = require("../utils/emailService");

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";
const QUEUE_NAME = "notification_queue";

const startWorker = async () => {
  if (process.env.NODE_ENV === "production" && !process.env.RABBITMQ_URI) {
    console.log("🟡 No RABBITMQ_URI provided in production. Worker running in MOCK MODE.");
    return;
  }

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
        try {
          if (payload.type && payload.type.toUpperCase() === "EMAIL") {
            console.log(`📧 Sending Email to: ${payload.to}`);
            console.log(`✉️ Subject: ${payload.subject}`);
            await sendEmail(payload.to, payload.subject, payload.html);
            console.log(`✅ Worker successfully processed email to ${payload.to}`);
          } else if (payload.type && payload.type.toUpperCase() === "SMS") {
            console.log(`📱 Sending SMS to: ${payload.phone}`);
            console.log(`💬 Message body: ${payload.body}`);
            console.log(`✅ Worker processed SMS event (simulated)`);
          }
          channel.ack(msg);
        } catch (error) {
          console.error("🔴 Error processing message:", error);
          channel.nack(msg, false, false); // Do not requeue if processing fails
        }
        
      }
    });

  } catch (error) {
    console.error("🔴 Worker Error:", error);
    console.log("   (Make sure RabbitMQ is running or your RABBITMQ_URI is correct)");
  }
};

startWorker();
