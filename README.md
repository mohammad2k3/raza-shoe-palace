# RAZA SHOE PALACE — Premium Full-Stack Footwear E-Commerce Platform

> **Step Into Style.**  
> A complete, production-ready, database-driven footwear retail platform built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB.

---

## 🌟 Brand Identity & Aesthetic

- **Luxury Black**: `#151515`
- **Pure White**: `#FFFFFF`
- **Champagne Gold**: `#D6B878`
- **Warm Ivory**: `#F5F3EF`
- **Charcoal**: `#292929`
- **Light Gray**: `#EAEAEA`

---

## 🚀 Key Highlights & Architecture

1. **Independent, Dynamic Category Architecture**:
   - Zero hardcoding of categories.
   - Dynamic MongoDB category creation, editing, subcategory assignment, display ordering, and safe deletion protection (prevents deletion if products belong to the category).
   - Real-time propagation to website navigation bar, mobile menu, shop filters, and homepage showcase.

2. **Variant-Wise Inventory Management**:
   - Every footwear model maintains distinct inventory for every **Size × Color** permutation.
   - Example: Size UK 8 in Onyx Black has independent stock from Size UK 9 in Cognac Brown.
   - Server-side inventory guard prevents overselling during checkout and restocks automatically upon cancellation.

3. **Complete Administrator Control Center (`/admin`)**:
   - **Overview Telemetry**: Real MongoDB database aggregations (Total Revenue, Orders, Products, Categories, Customers, Pending Orders, Low Stock Alerts, Monthly Sales Graph).
   - **Product Management**: Full CRUD, image uploads (Cloudinary or local storage fallback), pricing, descriptions, specifications builder, and variant inventory matrix.
   - **Category Management**: Dynamic category & subcategory CRUD with safe deletion reassignment protection.
   - **Order Fulfillment**: 7-stage status workflow (`Order Placed` → `Delivered`), courier tracking number (AWB), tracking URL, and payment verification.
   - **Inventory Matrix**: Granular live stock counters with inline adjustments.
   - **Client Directory**: Customer profiles, order frequency, and cumulative spend.
   - **Coupons Engine**: Create percentage (%) or flat (₹) discounts, minimum spend, max discount caps, and expiry dates.
   - **Review Moderation**: Approve/reject genuine customer reviews with verified purchase validation.
   - **Visual Banners**: Manage hero slides, promotional sections, and announcement messages.
   - **Store Business Settings**: Live editable store name, tagline, email, phone, physical address, shipping charges, free shipping thresholds, and return policies.
   - **Reports**: Audit reports for sales, order statuses, and payment methods.

4. **Customer Experience**:
   - Modern, responsive luxury footwear storefront optimized for Mobile, Tablet, and Desktop.
   - Advanced search, price filters, category filters, size filters, color filters, and sorting.
   - Product details with high-resolution image gallery, zoom, size guide conversion modal, live PIN code delivery checker, and verified buyer reviews.
   - Shopping bag with dynamic coupon redemption, free shipping progress bar, and variant adjustments.
   - Wishlist with local persistence and one-click move to bag.
   - Secure checkout with Cash on Delivery (COD) and Razorpay test mode online payments (with backend cryptographic HMAC-SHA256 signature verification).
   - Live order tracker with visual timeline and downloadable/printable invoice.
   - Customer account portal for managing saved delivery destinations and viewing order history.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM v6, Lucide React, Axios, Context API
- **Backend**: Node.js (ESM), Express.js, JWT Authentication, HttpOnly Cookies, Multer, Helmet, Morgan, Express Rate Limit
- **Database**: MongoDB & Mongoose
- **Integrations**: Cloudinary (Product image uploads with local disk fallback), Razorpay (Online payment gateway)

---

## 📁 Repository Structure

```
raza-shoe-palace/
├── client/                     # Vite + React Frontend
│   ├── public/                 # Static assets, favicon, robots.txt, sitemap.xml
│   ├── src/
│   │   ├── components/common/  # Navbar, Footer, AnnouncementBar, ProductCard, Modals
│   │   ├── context/            # Auth, Cart, Wishlist, StoreSettings, Category contexts
│   │   ├── layouts/            # MainLayout, AdminLayout
│   │   ├── pages/              # Home, Shop, ProductDetail, Cart, Wishlist, Checkout, etc.
│   │   │   └── admin/          # Admin Dashboard, Products, Categories, Orders, etc.
│   │   ├── services/           # api.js (Axios instance with base URL & interceptors)
│   │   ├── utils/              # formatCurrency, formatDate
│   │   ├── App.jsx             # Route definitions
│   │   ├── index.css           # Tailwind + Custom Champagne Gold Styling
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                     # Express.js REST API
│   ├── config/                 # db.js, cloudinary.js, razorpay.js
│   ├── controllers/            # auth, product, category, order, coupon, review, etc.
│   ├── middleware/             # auth.js, upload.js, errorHandler.js
│   ├── models/                 # User, Product, Category, Order, Coupon, Review, etc.
│   ├── routes/                 # Express API routes
│   ├── scripts/                # seed.js, testWorkflows.js
│   ├── uploads/                # Local uploaded files directory
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── data/db/                    # Local MongoDB storage directory
├── package.json                # Root package with dev & test scripts
└── README.md
```

---

## ⚙️ Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher) & npm
- MongoDB (Local Community Server or MongoDB Atlas URI)

### 1. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Inside `server/`, create a `.env` file from `.env.example`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/raza_shoe_palace

# JWT Secret
JWT_SECRET=raza_shoe_palace_ultra_secure_jwt_secret_key_2026_xyz987
JWT_EXPIRE=30d

# Cloudinary (Optional: Local storage fallback is active if omitted)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Test Mode (Optional: COD works out of the box if omitted)
RAZORPAY_KEY_ID=rzp_test_yourKeyHere
RAZORPAY_KEY_SECRET=yourSecretHere

# Default Administrator Seed Credentials
ADMIN_NAME=Raza Admin
ADMIN_EMAIL=admin@razashoepalace.com
ADMIN_PASSWORD=Admin@Raza2026!
ADMIN_PHONE=+919876543210
```

### 3. Initialize & Seed Database
Run the automated seed script to initialize:
- The 6 initial categories: *Men's Shoes, Sports Shoes, Casual Shoes, Formal Shoes, Sneakers, Sandals & Slippers*
- Default store settings (shipping threshold, phone, email, address, announcement)
- Initial promotional coupons (`RAZAWELCOME` for 10% off, `STEPINTOSTYLE` for ₹500 off)
- Default hero and promotional banners
- Default Secure Administrator account
- Initial handcrafted footwear sample models with complete variant stock matrices

```bash
cd server
npm run seed
```

### 4. Run Application in Development
Open two terminal windows:

**Terminal 1 — Backend API:**
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 — Frontend Client:**
```bash
cd client
npm run dev
# Running on http://127.0.0.1:5173
```

---

## 🔐 Administrator Access

- **Admin Login Route**: `http://localhost:5173/admin/login`
- **Initial Admin Email**: `admin@razashoepalace.com`
- **Initial Admin Password**: `Admin@Raza2026!`

*(Note: There is intentionally no public signup for admin accounts to prevent unauthorized access. Administrators can only be created via database seed or existing admin authorization).*

---

## 🧪 Automated End-to-End Test Suite

Run the full workflow test script to verify all core functional requirements:
```bash
cd server
node scripts/testWorkflows.js
```
**Test coverage verified:**
- Backend health check
- Dynamic category listing
- Product filtering by category, price, size, color, and stock
- Admin authentication & JWT token generation
- Customer registration and session handling
- Dynamic category creation by admin
- Safe category deletion protection (prevents deletion if products exist)
- Coupon validation (`RAZAWELCOME` 10% calculation)
- Order placement with real-time variant stock deduction
- Prevention of overselling (rejecting excess quantities)
- Order tracking retrieval & progress updates
- Real MongoDB database analytics aggregation

---

## 🚢 Production Deployment Guide

### Backend (Render, Railway, or VPS)
1. Set the Root Directory to `server`.
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Set production environment variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `CLOUDINARY_*`, `RAZORPAY_*`).
5. Run `npm run seed` once in the deploy shell or during initialization.

### Frontend (Vercel, Netlify, or Cloudflare Pages)
1. Set the Root Directory to `client`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set the rewrite rule in `vercel.json` or `_redirects` to forward `/api/*` to your production backend URL and all other routes to `/index.html`.

---

## 📜 License & Ownership
Designed and developed for **RAZA SHOE PALACE**. All rights reserved.
