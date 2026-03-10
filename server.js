require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { extractPurchaseOrder } = require('./llm');
const { purchaseOrderSchema } = require('./schema');
const { sendWhatsAppMessage } = require('./whatsapp');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const TRADE_API_URL = process.env.TRADE_API_URL || 'https://api.ourtradeplatform.com/v1/purchase-orders';
const TRADE_API_KEY = process.env.TRADE_API_KEY;

// In-memory store for chat sessions. 
// Key: sender_id, Value: { messages: [], lastActive: timestamp }
const chatSessions = new Map();
const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Clean up old sessions periodically to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [senderId, session] of chatSessions.entries()) {
    if (now - session.lastActive > SESSION_TIMEOUT_MS) {
      chatSessions.delete(senderId);
      console.log(`Cleaned up expired session for \${senderId}`);
    }
  }
}, 60 * 1000); // Check every minute

/**
 * GET Webhook for Meta verification
 */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/**
 * POST Webhook for incoming WhatsApp messages
 */
app.post('/webhook', async (req, res) => {
  // Acknowledge receipt to Meta immediately to avoid retries
  res.sendStatus(200);

  const { body } = req;

  if (body.object) {
    // Basic structural validation for Meta webhook payload
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const messageObj = body.entry[0].changes[0].value.messages[0];
      const senderId = messageObj.from;
      let textContent = '';

      if (messageObj.type === 'text') {
        textContent = messageObj.text.body;
      } else {
         // Optionally handle document/image uploads here in future
         console.log('Received non-text message type:', messageObj.type);
         return;
      }

      // 1. Maintain Conversation State
      let session = chatSessions.get(senderId) || { messages: [], lastActive: Date.now() };
      session.messages.push(`User (\${senderId}): \${textContent}`);
      session.lastActive = Date.now();
      chatSessions.set(senderId, session);

      console.log(`Received message from \${senderId}: \${textContent}`);

      // 2. Check for Trigger Word
      if (textContent.trim().toUpperCase() === 'CONFIRM PO') {
        // Run processing asynchronously to not block the current thread
        processPurchaseOrder(senderId, session.messages).catch(console.error);
      }
    }
  }
});

/**
 * Orchestrates the data extraction, validation, and downstream API Call.
 */
async function processPurchaseOrder(senderId, messages) {
  try {
    await sendWhatsAppMessage(senderId, "Processing your request. Compiling history and generating Purchase Order...");

    // 1. Extract JSON via LLM
    const rawPayload = await extractPurchaseOrder(messages);

    // 2. Validate Data with Zod schemas
    const validationResult = purchaseOrderSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      const errorMsg = "Extraction failed due to missing or invalid fields. Please review the missing information and try again.";
      await sendWhatsAppMessage(senderId, errorMsg);
      return;
    }

    const validatedPayload = validationResult.data;

    // 3. Send to Internal Trade API
    if (process.env.TEST_MODE === 'true') {
      console.log("TEST MODE ACTIVE: Skipping Axios call to Trade API.", JSON.stringify(validatedPayload, null, 2));
    } else {
      const response = await axios.post(TRADE_API_URL, validatedPayload, {
        headers: {
          'Authorization': `Bearer \${TRADE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("Successfully posted PO to Trade API", response.status);
    }

    // 4. Construct Feedback Message
    const payloadBase = validatedPayload["Sending Payload"].base;
    const commodities = validatedPayload["Sending Payload"].commodities;
    
    // Calculate total amount assuming price * quantity for each item
    const totalAmount = commodities.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const eta = new Date(payloadBase.estimated_delivery_date).toLocaleDateString();

    const successMessage = `✅ Purchase Order Successfully Generated!

` +
      `Title: \${payloadBase.title}
` +
      `Total Amount: \${totalAmount} \${payloadBase.currency || 'USD'}
` +
      `ETA: \${eta}

` +
      `Your order has been registered in the system.`;

    await sendWhatsAppMessage(senderId, successMessage);
    
    // Clean up the session history after successful processing
    chatSessions.delete(senderId);

  } catch (error) {
    console.error("Error processing PO:", error);
    await sendWhatsAppMessage(senderId, "An error occurred while processing the PO. Please try again later or contact support.");
  }
}

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port \${PORT}`);
  });
}

// Export the Express API for Vercel serverless deployment
module.exports = app;
