const axios = require('axios');

/**
 * Sends a text message to a user via the Meta WhatsApp Cloud API.
 * 
 * @param {string} to - The recipient's phone number
 * @param {string} text - The text message to send
 * @returns {Promise<Object>} The response data from WhatsApp API
 */
async function sendWhatsAppMessage(to, text) {
  const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.error("Missing WhatsApp credentials in environment variables.");
    return null;
  }

  try {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "text",
      text: {
        preview_url: false,
        body: text
      }
    };

    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Message successfully sent to ${to}. Message ID: ${response.data.messages[0].id}`);
    return response.data;
  } catch (error) {
    console.error("Error sending WhatsApp message:");
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

/**
 * Sends a document (JSON file) to a user via the Meta WhatsApp Cloud API.
 * 
 * @param {string} to - The recipient's phone number
 * @param {string} fileName - The name of the file
 * @param {string} content - Stringified JSON content
 * @returns {Promise<Object>}
 */
async function sendWhatsAppDocument(to, fileName, content) {
  const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  try {
    // 1. Upload the content as a media object
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', Buffer.from(content), {
      filename: fileName,
      contentType: 'application/json',
    });
    form.append('messaging_product', 'whatsapp');

    const uploadRes = await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_ID}/media`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        },
      }
    );

    const mediaId = uploadRes.data.id;

    // 2. Send the message with the media ID
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "document",
      document: {
        id: mediaId,
        filename: fileName
      }
    };

    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error sending WhatsApp document:", error.response?.data || error.message);
  }
}

module.exports = { sendWhatsAppMessage, sendWhatsAppDocument };
