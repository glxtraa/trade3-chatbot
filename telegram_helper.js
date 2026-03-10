const axios = require('axios');
const FormData = require('form-data');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

/**
 * Sends a text message via Telegram Bot API
 * @param {string} chatId - The ID of the chat/user
 * @param {string} text - The message content
 */
async function sendTelegramMessage(chatId, text) {
    try {
        const response = await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown'
        });
        return response.data;
    } catch (error) {
        console.error("Error sending Telegram message:", error.response?.data || error.message);
    }
}

/**
 * Sends a document (JSON) via Telegram Bot API
 * @param {string} chatId - The ID of the chat/user
 * @param {string} fileName - Name for the file
 * @param {string} content - JSON string content
 */
async function sendTelegramDocument(chatId, fileName, content) {
    try {
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('document', Buffer.from(content), {
            filename: fileName,
            contentType: 'application/json'
        });

        const response = await axios.post(`${TELEGRAM_API}/sendDocument`, form, {
            headers: form.getHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Error sending Telegram document:", error.response?.data || error.message);
    }
}

module.exports = {
    sendTelegramMessage,
    sendTelegramDocument
};
