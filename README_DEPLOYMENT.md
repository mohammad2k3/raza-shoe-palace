# RAZA SHOE PALACE — PRODUCTION DEPLOYMENT GUIDE

**Version:** 1.0.0 (Production-Ready)  
**Brand:** RAZA SHOE PALACE — *Step Into Style.*  
**Architecture:** Decoupled Full-Stack MERN (Frontend on Vercel, Backend on Render, Database on MongoDB Atlas)

---

## 1. Architecture Overview

```
                      +-----------------------------+
                      |       Vercel (Frontend)     |
                      |   React 18 + Vite + Tailwind|
                      |   https://razashoepalace.com |
                      +--------------+--------------+
                                     |
                          HTTPS / REST API Requests
                                     |
                      +--------------v--------------+
                      |       Render (Backend)      |
                      |   Node.js 20+ / Express     |
                      |   https://api.razashoepalace|
                      +-------+-------------+-------+
                              |             |
           +------------------+             +--------------------+
           |                                                     |
+----------v-----------+                             +-----------v-----------+
|    MongoDB Atlas     |                             |  Cloudinary & Razorpay|
| Cluster M0/M10 (DB)  |                             | Image CDN & Gateway   |
+----------------------+                             +-----------------------+
```

---

## 2. Step 1: MongoDB Atlas Setup

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create or select a cluster (Shared M0 is sufficient for launch).
3. Under **Database Access**, create a user (e.g. `raza_admin`) with **Read and Write to Any Database** permissions.
4. Under **Network Access**, add an IP Access entry:
   - For Render server communication, add `0.0.0.0/0` (Allow Access from Anywhere) with a description like `Render Web Service`.
5. Under **Database** -> **Connect** -> **Drivers (Node.js)**, copy your connection string:
   ```
   mongodb+srv://raza_admin:<PASSWORD>@cluster0.xxxxx.mongodb.net/raza_shoe_palace?retryWrites=true&w=majority
   ```

---

## 3. Step 2: Backend Deployment on Render

1. Create a new account or log in to [Render](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your Git repository containing the Raza Shoe Palace code.
4. Fill in the deployment details:
   - **Name:** `raza-shoe-palace-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free or Starter
5. Under **Environment Variables**, add:

| Key | Example Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production security & headers |
| `PORT` | `5000` | Render internal port binding |
| `CLIENT_URL` | `https://your-frontend.vercel.app` | Allowed CORS origin |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas URI |
| `JWT_SECRET` | `your_64_character_cryptographic_random_string` | Minimum 32-character token secret |
| `JWT_EXPIRE` | `30d` | Session duration |
| `RAZORPAY_KEY_ID` | `rzp_live_...` or `rzp_test_...` | Razorpay API Key ID |
| `RAZORPAY_KEY_SECRET` | `your_razorpay_secret` | Razorpay Secret |
| `RAZORPAY_WEBHOOK_SECRET`| `your_webhook_secret` | Razorpay Webhook Secret |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary Cloud Name (Optional) |
| `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary API Key (Optional) |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary Secret (Optional) |

6. Click **Deploy Web Service**.
7. Test the health check endpoint: `https://your-backend.onrender.com/api/health`.

---

## 4. Step 3: Frontend Deployment on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your Git repository.
4. Set **Root Directory** to `client`.
5. Build settings will auto-detect Vite:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Under **Environment Variables**, configure:

| Key | Example Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com` | Live backend URL on Render |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_...` or `rzp_test_...` | Razorpay public key for checkout |

7. Click **Deploy**.
8. Verify that direct URL navigation (e.g., `https://your-app.vercel.app/shop` or `https://your-app.vercel.app/admin`) functions properly using the included `vercel.json` rewrite configuration.

---

## 5. Step 4: Razorpay Webhook Configuration

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Navigate to **Settings** -> **Webhooks** -> **Add New Webhook**.
3. Set **Webhook URL** to:
   ```
   https://your-backend.onrender.com/api/orders/webhook/razorpay
   ```
4. Set **Secret** to match `RAZORPAY_WEBHOOK_SECRET` in your Render environment variables.
5. Select active events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
6. Save and activate the webhook.

---

## 6. Step 5: Initial Production Seeding

To seed categories, initial admin account, and storefront banners into your live database:
1. From your development terminal:
   ```powershell
   $env:MONGODB_URI="mongodb+srv://raza_admin:<PASSWORD>@cluster0.xxxxx.mongodb.net/raza_shoe_palace?retryWrites=true&w=majority"
   node server/scripts/seed.js
   ```
2. Log in at `https://your-frontend.vercel.app/admin/login` using your configured admin credentials.
3. Change the admin password under **Account Settings** immediately after first login.

---

## 7. Security Architecture Checklist

- [x] Zero hardcoded JWT fallbacks; strong 32+ character key requirement.
- [x] Strict CORS verification with credentials support.
- [x] Rate limiting on Authentication, Orders, and API endpoints.
- [x] NoSQL injection operator sanitization on all request inputs.
- [x] Cryptographic guest order tracking tokens protecting customer PII.
- [x] Atomic inventory reservation preventing overselling race conditions.
- [x] Idempotent stock restoral and payment handling.
- [x] SPA URL rewrite routing via `client/vercel.json`.
- [x] Graceful shutdown and retry-backed database connection pools.
