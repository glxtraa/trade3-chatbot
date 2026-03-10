# Telegram Bot: Setup Guide

Telegram is one of the easiest platforms for individuals to set up a bot. Follow these steps to get your API key.

## 1. Create the Bot via @BotFather
1. Open the **Telegram** app on your phone or desktop.
2. Search for **@BotFather** and start a chat with him.
3. Send the command: `/newbot`
4. Choose a **name** for your bot (e.g., `My Trade Finance Bot`).
5. Choose a **username** for your bot (e.g., `trade_finance_po_bot`). It **must** end in `bot`.
6. BotFather will send you an **API Token**. 
   - It will look like: `123456789:ABCDefghIJKLmnopQRSTuvwxyz`
   - Copy this! This is your `TELEGRAM_BOT_TOKEN`.

## 2. Configure the Webhook
Unlike WhatsApp, you don't need a developer portal. You can set the webhook using a simple URL in your browser.

1. Take your Vercel URL (e.g., `https://my-bot.vercel.app`).
2. Construct this URL in your browser:
   `https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=<YOUR_VERCEL_URL>/telegram`
3. Replace `<YOUR_TOKEN>` and `<YOUR_VERCEL_URL>` with your real values.
4. Press Enter. You should see a response: `{"ok":true,"result":true,"description":"Webhook was set"}`.

## 3. Environment Variables
Add this to your Vercel Project Settings:
- `TELEGRAM_BOT_TOKEN`: The token you got from BotFather.

## 4. Testing
Once the middleware is implemented:
1. Find your bot on Telegram by searching for its username.
2. Send a message like: *"buy 500kg of lobster for $25"*
3. Send: *"CONFIRM PO"*

---
*Created on 2026-03-10*
