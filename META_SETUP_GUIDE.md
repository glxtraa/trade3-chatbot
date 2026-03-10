# Meta WhatsApp API: Beginner's Setup Guide

This guide walks you through setting up the Meta Developer Portal for this project.

## 1. Create a Meta Developer App
1. Go to [developers.facebook.com](https://developers.facebook.com/apps/).
2. Click **Create App**.
3. Select **Other** > **Business** as the app type.
4. Give your app a name (e.g., `Trade-Finance-Bot`) and click **Create App**.

## 2. Add WhatsApp to Your App
1. In the sidebar of your new app, scroll down and find **Add Product**.
2. Find the **WhatsApp** card and click **Set Up**.
   - **Tip**: If you don't see "WhatsApp" in the sidebar, click the **"Add Product"** link first!
3. Follow the prompts to select or create a Meta Business Account.

## 3. Configuration (The Webhook)
Once WhatsApp is added, you will see a **WhatsApp** section in the left sidebar.
1. Click **WhatsApp > Configuration**.
2. Click **Edit** in the "Webhook" box.
3. **Callback URL**: Paste your Vercel URL followed by `/webhook` (e.g., `https://my-bot.vercel.app/webhook`).
4. **Verify Token**: Type a secret phrase (e.g., `trade_secret_123`). This **must** match the `WHATSAPP_VERIFY_TOKEN` in your Vercel settings.
5. Click **Verify and Save**.

### Important: Subscribe to Messages
1. In the same "Configuration" page, click **Manage** in the "Webhook fields" section.
2. Find **messages** in the list.
3. Click the **Subscribe** button in that row.
4. Click **Done**.

## 4. Get Your Credentials (API Setup)
1. In the sidebar, click **WhatsApp > API Setup**.
2. **Temporary Access Token**: Copy this. Note that it expires every 23 hours. (For production, you'll need a Permanent System User token).
3. **Phone Number ID**: Copy the 15-digit ID (e.g., `123456789012345`). **Do not use the actual phone number.**

## 5. Adding Testers (Development Mode)
If your app is not yet "Live":
1. Go to **App Roles > Roles**.
2. Click **Add Testers**.
3. Enter your Facebook username/ID.
4. You **must** go to [facebook.com/notifications](https://www.facebook.com/notifications) on your personal account and accept the tester invite.
5. Back in **WhatsApp > API Setup**, select your phone number in the "To" field to start the 24-hour testing window.

## 6. Testing the Connection (The 24-Hour Window)
1. From the **API Setup** page, click the blue **Send Message** button.
2. You will receive a "Hello World" message on WhatsApp.
3. **Reply to that message.** 
   - **Why?** Meta rules require the user to message the business first. Replying "Hi" opens a **24-hour window** where your bot can then send its own replies (like the PO confirmation).
   - If the window is closed, your bot will fail to send messages!


---
*Created on 2026-03-10*
