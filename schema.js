const { z } = require('zod');

// Zod Schema to validate the incoming JSON from the LLM
const purchaseOrderSchema = z.object({
  "Sending Payload": z.object({
    parties: z.array(z.object({
      company_id: z.number(),
      name: z.string(),
      wallet_address: z.number().optional()
    })).min(2, "At least two parties (Seller and Buyer) are required"),
    
    commodities: z.array(z.object({
      name: z.string(),
      price: z.number(),
      origin: z.string(),
      code: z.string().optional(),
      unit: z.string(),
      quantity: z.number(),
      additional_informations: z.string().optional()
    })).min(1, "At least one commodity is required"),
    
    financings: z.array(z.any()).optional(),
    delivery_places: z.number().optional(),
    
    payment_schedules: z.array(z.object({
      payment_percentage: z.number(),
      payment_method: z.string(),
      memo: z.string(),
      due_period: z.string(),
      from_company_id: z.number().optional(),
      to_company_id: z.number().optional(),
      documents: z.array(z.string())
    })),
    
    base: z.object({
      title: z.string(),
      estimated_delivery_date: z.string().datetime({ message: "Must be a valid ISO 8601 date string" }),
      currency: z.string().optional(),
      additional_informations: z.string().optional()
    }),
    
    constants: z.object({
      master_contract_id: z.number().optional(),
      company_id_to_trade_party_map: z.record(z.string(), z.number()).optional(),
      commodity_name_to_id_map: z.record(z.string(), z.number()).optional(),
      financing_name_to_id_map: z.record(z.string(), z.any()).optional(),
      party_is_multisig_map: z.record(z.string(), z.boolean()).optional()
    }).optional(),
    
    constant_hash: z.string().optional()
  })
});

module.exports = { purchaseOrderSchema };
