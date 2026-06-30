const twilio = require("twilio");

// Twilio credentials from env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let client = null;

if (accountSid && authToken) {
  try {
    client = twilio(accountSid, authToken);
    console.log("🟢 Twilio SMS client initialized.");
  } catch (error) {
    console.error("🔴 Failed to initialize Twilio client:", error);
  }
} else {
  console.log("🟡 Twilio credentials not found. SMS Service running in MOCK MODE.");
}

/**
 * Send an SMS to a user. If Twilio is not configured, it simulates the send.
 * @param {string} to - The recipient's phone number (e.g. +919876543210)
 * @param {string} body - The SMS message text
 */
const sendSMS = async (to, body) => {
  if (!to) {
    console.error("🔴 SMS Dispatch Failed: Recipient phone number is missing.");
    return false;
  }

  // Ensure country code is present (assuming India +91 if not provided)
  const formattedTo = to.startsWith("+") ? to : `+91${to}`;

  if (client && fromPhone) {
    try {
      const message = await client.messages.create({
        body: body,
        from: fromPhone,
        to: formattedTo,
      });
      console.log(`🟢 SMS sent successfully to ${formattedTo}. SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error(`🔴 Twilio SMS Dispatch Failed to ${formattedTo}:`, error.message);
      return false;
    }
  } else {
    // MOCK MODE
    console.log("\n================ [MOCK SMS DISPATCH] ================");
    console.log(`To: ${formattedTo}`);
    console.log(`Body: ${body}`);
    console.log("======================================================\n");
    return true; // Simulate success
  }
};

module.exports = {
  sendSMS,
};
