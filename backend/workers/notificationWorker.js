const amqp = require("amqplib");
const { sendEmail } = require("../utils/emailService");

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
        if (payload.type === "SMS") {
          console.log(`📱 Sending SMS to: ${payload.phone}`);
          console.log(`💬 Message body: ${payload.body}`);
        } else if (payload.type === "EMAIL") {
          console.log(`📧 Sending Email to: ${payload.to}`);
          console.log(`✉️ Subject: ${payload.subject}`);
          // Send the actual email (or mock it)
          await sendEmail(payload.to, payload.subject, payload.html);
        }
        
        console.log("=======================================================\n");

        // Simulate network delay / heavy processing for SMS (Email handles its own await)
        setTimeout(() => {
          console.log(`✅ Successfully processed ${payload.type} event.`);
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
