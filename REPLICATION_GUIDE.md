# Replication Guide: WhatsApp Trade Finance Middleware

This guide is designed for an AI agent to replicate this project from scratch. It outlines the architecture, core dependencies, and implementation logic.

## 1. Project Architecture
The system acts as a bridge between the **Meta WhatsApp Business API**, **OpenAI GPT-4 Turbo**, and an **Internal Trade Finance API**.

### Core Flow:
1. **Webhook Listener**: Express.js server handles `GET` (verification) and `POST` (incoming messages) from Meta.
2. **Session Persistence**: In-memory `Map` stores chat history by `senderId` with a 10-minute expiry.
3. **Trigger Logic**: Watches for the string `"CONFIRM PO"` to start the extraction process.
4. **Data Extraction**:
   - **Production**: Sends session history to OpenAI with a strict system prompt and `json_object` response format.
   - **Test Mode**: Uses a robust regex-based logic to extract items, quantities, and prices from the chat history.
5. **Validation**: Uses **Zod** to validate the extracted JSON against a complex Trade Finance schema.
6. **Downstream Action**:
   - Posts the validated JSON to the Trade Finance API via Axios.
   - Sends a text confirmation back to the user via WhatsApp.
   - Generates and sends a `.json` file attachment to the user via WhatsApp Media API.

## 2. File Structure & Key Logic
- `server.js`: The entry point. Handles Express routing, session management, and the `processPurchaseOrder` orchestration.
- `llm.js`: Wraps OpenAI SDK. Includes the `TEST_MODE` regex fallback and the system prompt for Supply Chain data extraction.
- `whatsapp.js`: Helper module for `sendWhatsAppMessage` (text) and `sendWhatsAppDocument` (file upload + send).
- `schema.js`: Defines the Zod validation schema for the PO payload.
- `vercel.json`: Configuration for routing and serverless function deployment.

## 3. Key Dependencies
- `express`: Web server.
- `axios`: HTTP client for Meta and Internal API calls.
- `openai`: LLM integration.
- `zod`: Schema validation.
- `dotenv`: Environment variable management.
- `form-data`: Required for the WhatsApp Media Upload process.

## 4. Replication Steps
1. **Initialize**: Create `package.json` and install dependencies.
2. **Setup Express**: Implement the `/webhook` endpoint with Meta's challenge-response verification.
3. **Internal State**: Create a Map to link messages to a phone number.
4. **Implement Extraction**: 
   - Write the system prompt (found in `llm.js`).
   - Implement the regex fallback for `TEST_MODE`.
5. **WhatsApp Media Flow**:
   - First, `POST` the JSON string as a Buffer to `graph.facebook.com/v19.0/{PHONE_ID}/media`.
   - Take the returned `id` and `POST` it as a `document` message to the user.
6. **Vercel Deploy**: Ensure `module.exports = app` is present in `server.js` for serverless compatibility.

---
*Created on 2026-03-10*
