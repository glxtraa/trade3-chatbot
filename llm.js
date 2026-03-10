const OpenAI = require('openai');

// Initialize OpenAI SDK with API Key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || (process.env.TEST_MODE === 'true' ? 'dummy' : undefined),
});

const SYSTEM_PROMPT = `You are an expert supply chain and trade finance data extraction AI. Your task is to analyze the provided trade documents (e.g., Commercial Invoices, Proforma Invoices, and Master Agreements) to generate a structured Purchase Order JSON payload.

Please map the extracted data strictly to the following JSON schema. Do not add keys outside of this schema. 

Rules for extraction:
1. **Parties**: Extract the Seller/Vendor name and the Buyer/Bill-To name. Map the Seller to "company_id" 17 and the Buyer to "company_id" 161 (unless specified otherwise).
2. **Commodities**: Extract the line items from the invoice. Identify the product name, unit price, origin country, unit of measure (e.g., KG), and quantity. Put specific item descriptions or packaging details (e.g., "40 CTN") into additional_informations.
3. **Payment Schedules**: Extract the designated payment schedules from the associated Master Agreement. Put the condition triggers (e.g., "Settle payment after receiving two batches") into the memo field, and the specific days (e.g., "Mondays and Thursdays") into the due_period. Keep the standard required documents array intact.
4. **Base**: Generate a brief, descriptive title for the PO. Find the Estimated Time of Arrival (ETA) or Delivery Date on the invoice and convert it strictly to an ISO 8601 format (YYYY-MM-DDTHH:MM:SS.000Z) for the estimated_delivery_date. Extract shipping terms (e.g., "C.N.F") into additional_informations.
5. **Constants**: Keep the provided map constants, IDs, and hashes exactly as provided in the template schema unless instructed to generate new ones.

Output ONLY valid JSON matching the exact schema definition requested.`;

/**
 * Extracts a Purchase Order payload using OpenAI's GPT-4 Turbo model
 * @param {Array<string>} messages - Array of recent chat history messages
 * @returns {Promise<Object>} The parsed JSON output from the LLM
 */
async function extractPurchaseOrder(messages) {
  try {
    const chatHistory = messages.join('\n');

    // MOCK MODE: Use improved regex instead of hitting the OpenAI API
    if (process.env.TEST_MODE === 'true') {
      console.log("TEST MODE ACTIVE: Using Improved Regex Extraction");

      const priceMatch = chatHistory.match(/(?:\$|USD|EUR)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:\$|USD|EUR)/i);
      const qtyMatch = chatHistory.match(/(\d+(?:\.\d+)?)\s*(?:MT|metric tons|KG|kgs|kilograms|units|CTN|items)\b/i);
      const itemMatch = chatHistory.match(/(?:buy|order|item|of:)\s+(?:[\d.,]+\s*(?:MT|metric tons|KG|kgs|kilograms|units|CTN|items)\s+)?(?:of\s+)?(lobster|geoduck(?:\s*clams)?|clams|[A-Za-z\s]{2,30})/i);
      const dateMatch = chatHistory.match(/(?:by|delivery|eta|date:)\s+([A-Za-z0-9\s,-/]+)(?:\.|$)/i);
      const currencyMatch = chatHistory.match(/(USD|EUR|GBP|\$)/i);

      let currency = "USD";
      if (currencyMatch) {
        const c = currencyMatch[0].toUpperCase();
        currency = c === "$" ? "USD" : c;
      }

      let estDate = new Date();
      if (dateMatch) {
        const parsedDate = new Date(dateMatch[1].trim());
        if (!isNaN(parsedDate.getTime())) estDate = parsedDate;
      }

      return {
        "Sending Payload": {
          "parties": [
            { "company_id": 17, "name": "Dummy Seller" },
            { "company_id": 161, "name": "Dummy Buyer" }
          ],
          "commodities": [
            {
              "name": itemMatch ? itemMatch[1].trim() : "Default Commodity",
              "price": priceMatch ? parseFloat(priceMatch[1] || priceMatch[2]) : 100,
              "origin": "US",
              "unit": qtyMatch ? (chatHistory.match(/(?:MT|metric tons|KG|kgs|kilograms|units|CTN|items)/i)?.[0].toLowerCase().startsWith('k') ? "KG" : chatHistory.match(/(?:MT|metric tons|KG|kgs|kilograms|units|CTN|items)/i)?.[0]) || "units" : "units",
              "quantity": qtyMatch ? parseFloat(qtyMatch[1]) : 1
            }
          ],
          "payment_schedules": [
            {
              "payment_percentage": 100,
              "payment_method": "Wire",
              "memo": "Standard payment terms",
              "due_period": "30 days",
              "documents": ["Commercial Invoice", "Bill of Lading"]
            }
          ],
          "base": {
            "title": `PO for ${itemMatch ? itemMatch[1].trim() : "Goods"}`,
            "estimated_delivery_date": estDate.toISOString(),
            "currency": currency
          }
        }
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Here is the chat history containing the trade documents and negotiation context:\n\n${chatHistory}` }
      ],
      temperature: 0.1, // Keep it low for consistent data extraction
    });

    const jsonString = response.choices[0].message.content;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error in LLM extraction:", error);
    throw new Error('Failed to extract purchase order from LLM.');
  }
}

module.exports = { extractPurchaseOrder };
