# WeChat Official Account: Setup Guide

This guide walks you through setting up a **WeChat Official Account** for the Trade Finance Middleware.

## 1. Account Types
To use this middleware, you should ideally have a **Service Account** (verified).
- **Subscription Account**: Good for content, limited APIs.
- **Service Account**: Required for advanced messaging and file uploads.
- **Sandbox Account**: If you just want to test, use the [WeChat Sandbox](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login).

## 2. Basic Configuration
1. Log in to the [WeChat Official Account Admin Platform](https://mp.weixin.qq.com/).
2. In the sidebar, go to **Settings and Development > Basic Configuration** (设置与开发 > 基本配置).

### AppID and AppSecret
- Copy the **AppID** and **AppSecret**.
- These correspond to `WECHAT_APP_ID` and `WECHAT_APP_SECRET` in your environment variables.

## 3. Server Configuration (The Webhook)
On the same "Basic Configuration" page, look for **Server Configuration** (服务器配置).
1. Click **Modify** (修改).
2. **URL**: Your Vercel URL followed by `/wechat` (e.g., `https://my-bot.vercel.app/wechat`).
3. **Token**: Create a random secret string (e.g., `wechat_secret_123`). This **must** match the `WECHAT_TOKEN` in your settings.
4. **EncodingAESKey**: Click "Random Generation". (We will use "Plain Mode" for initial setup).
5. **Encryption Mode**: Select **Plain Mode** (明文模式) unless you want to implement AES decryption.
6. Click **Submit**. 
   - *Note: WeChat will immediately send a GET request to your URL to verify it. Ensure your server is deployed and running before clicking submit.*

## 4. IP Whitelist
1. In the "Basic Configuration" page, find **IP Whitelist**.
2. Because Vercel uses dynamic IPs, you may need to add the IP of the machine you are testing from, or use a proxy if WeChat blocks Vercel's range.

## 5. Obtaining an Access Token
Unlike WhatsApp, WeChat's `access_token` expires every 2 hours.
- Our middleware will automatically handle the refresh using the **AppID** and **AppSecret**.

## 6. Testing with the Sandbox
If you don't have a verified Service Account yet:
1. Go to the [WeChat Sandbox](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login).
2. Scan the QR code with your WeChat.
3. You will get a test AppID and AppSecret immediately.
4. Set the **Interface Configuration** (URL and Token) as described above.

---
*Created on 2026-03-10*
