const nodemailer = require("nodemailer");

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      service: "gmail", // Assuming Gmail for ease, can be changed via env vars if needed
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log("🟢 Nodemailer SMTP client initialized.");
  } catch (error) {
    console.error("🔴 Failed to initialize Nodemailer client:", error);
  }
} else {
  console.log("🟡 SMTP credentials not found. Email Service running in MOCK MODE.");
}

/**
 * Send an Email to a user. If SMTP is not configured, it simulates the send.
 * @param {string} to - The recipient's email address
 * @param {string} subject - The email subject line
 * @param {string} html - The HTML body of the email
 */
const sendEmail = async (to, subject, html) => {
  if (!to) {
    console.error("🔴 Email Dispatch Failed: Recipient email address is missing.");
    return false;
  }

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"CivicPulse" <${SMTP_USER}>`,
        to: to,
        subject: subject,
        html: html,
      });
      console.log(`🟢 Email sent successfully to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`🔴 Nodemailer Dispatch Failed to ${to}:`, error.message);
      return false;
    }
  } else {
    // MOCK MODE
    console.log("\n================ [MOCK EMAIL DISPATCH] ================");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (HTML length): ${html.length} chars`);
    console.log("=======================================================\n");
    return true; // Simulate success
  }
};

module.exports = {
  sendEmail,
};
