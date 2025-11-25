# 🌾 AGRI-MART

A modern, full-stack e-commerce platform specializing in agricultural products and equipment. AGRI-MART provides a seamless shopping experience for customers while offering comprehensive management tools for store owners.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## 🎯 About

AGRI-MART is a complete e-commerce solution designed for the agricultural sector. The platform enables customers to browse, search, and purchase agricultural products online, while providing store owners with powerful tools to manage inventory, process orders, and track sales.

### Live Application

- **Frontend**: Hosted on [Vercel](https://vercel.com)
- **Backend API**: Hosted on [Render](https://render.com)

## ✨ Features

### Customer Features

- 🔐 **User Authentication** - Secure login/signup using Clerk authentication
- 🛍️ **Product Browsing** - Browse products by category, type, and popularity
- 🔍 **Search & Filter** - Search products and filter by various criteria
- 🛒 **Shopping Cart** - Add, update, and manage items in cart
- 📍 **Address Management** - Save multiple shipping addresses
- 💳 **Secure Payments** - Multiple payment options including Stripe integration
- 📦 **Order Management** - View order history and track shipments
- 📱 **Responsive Design** - Fully responsive design for all devices
- ✉️ **Order Notifications** - Email confirmations for orders

### Owner/Admin Features

- 📊 **Dashboard** - Comprehensive analytics and sales overview
- ➕ **Product Management** - Add, edit, and delete products
- 📝 **Bulk Upload** - Upload multiple products at once
- 📈 **Stock Management** - Toggle stock availability and manage inventory
- 🎯 **Order Processing** - Update order status and track fulfillment
- 👥 **User Management** - View and manage user accounts

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Clerk** - Authentication and user management
- **Stripe** - Payment processing
- **React Hot Toast** - Toast notifications
- **Swiper** - Touch sliders

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **Clerk SDK** - Backend authentication
- **Stripe SDK** - Payment processing
- **Cloudinary** - Image hosting and optimization
- **Nodemailer** - Email service
- **Multer** - File upload handling

### Security & Performance

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API request throttling
- **Express Validator** - Input validation
- **bcryptjs** - Password hashing

## 🏗️ Architecture

AGRI-MART follows a modern full-stack architecture:

```
┌─────────────────┐
│   React Client  │ (Vercel)
│   (Frontend)    │
└────────┬────────┘
         │ HTTPS/REST API
         │
┌────────▼────────┐
│  Express API    │ (Render)
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬────────────┐
    │         │          │            │
┌───▼───┐ ┌──▼──┐ ┌─────▼────┐ ┌────▼────┐
│MongoDB│ │Stripe│ │Cloudinary│ │  Clerk  │
│ Atlas │ │      │ │          │ │         │
└───────┘ └──────┘ └──────────┘ └─────────┘
```

### How It Works

1. **User Flow**:
   - Users authenticate via Clerk (OAuth or email/password)
   - Browse products, add to cart, and proceed to checkout
   - Select/enter shipping address
   - Complete payment via Stripe
   - Receive order confirmation email
   - Track orders through dashboard

2. **Owner Flow**:
   - Owners access admin dashboard
   - Manage product inventory (add, edit, delete)
   - Monitor sales and orders
   - Update order status and fulfill shipments

3. **Backend Processing**:
   - API validates requests and authenticates users
   - Processes business logic (cart calculations, order creation)
   - Handles file uploads to Cloudinary
   - Integrates with Stripe for payments
   - Sends emails via Nodemailer
   - Stores data in MongoDB

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB instance)
- **Clerk** account for authentication
- **Stripe** account for payments
- **Cloudinary** account for image storage

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd AGRI-MART
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../client
npm install
```

### Step 4: Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agri-mart?retryWrites=true&w=majority

# Authentication
CLERK_SECRET_KEY=sk_test_...

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Frontend Environment Variables

Create a `.env` file in the `client` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Payment Processing
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Currency
VITE_CURRENCY=$
```

### Step 5: Run the Application

#### Start Backend Server

```bash
cd server
npm run dev  # For development with nodemon
# OR
npm start    # For production
```

The backend server will run on `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:5173`

### Step 6: Seed Database (Optional)

To populate the database with sample products:

```bash
cd server
npm run seed:products
```

To make a user an owner:

```bash
npm run make:owner <clerk-user-id>
```

## ⚙️ Configuration

### MongoDB Setup

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user and whitelist your IP address
4. Get your connection string and update `MONGODB_URI` in `.env`

### Clerk Setup

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Configure authentication methods (Email, OAuth, etc.)
4. Copy the secret key and publishable key to your `.env` files

### Stripe Setup

1. Create an account at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. Use test keys for development (`pk_test_...` and `sk_test_...`)
4. Add keys to both frontend and backend `.env` files

### Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret
3. Add them to the backend `.env` file

### Email Service Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Use the app password in `SMTP_PASS`

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Import project on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure project settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add environment variables**
   - `VITE_API_URL`: Your Render backend URL
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `VITE_CURRENCY`: `$`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your Vercel URL (e.g., `https://agri-mart.vercel.app`)

### Backend Deployment (Render)

1. **Prepare for deployment**
   - Ensure all environment variables are documented
   - Test API endpoints locally

2. **Create Web Service on Render**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure service**
   - **Name**: `agri-mart-backend`
   - **Environment**: Node
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid)

4. **Add environment variables**
   ```env
   PORT=10000
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-app.vercel.app
   MONGODB_URI=mongodb+srv://...
   CLERK_SECRET_KEY=sk_live_...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=...
   SMTP_PASS=...
   ```

5. **Deploy and update CORS**
   - Deploy the service
   - Copy the Render URL (e.g., `https://agri-mart-backend.onrender.com`)
   - Update `FRONTEND_URL` in Render to match your Vercel URL
   - Update `VITE_API_URL` in Vercel to match your Render backend URL

### Post-Deployment Checklist

- [ ] Backend health check endpoint works: `/api/health`
- [ ] Frontend can connect to backend API
- [ ] Authentication works (sign in/sign up)
- [ ] Products load correctly
- [ ] Cart functionality works
- [ ] Payment processing works (test mode)
- [ ] Order emails are sent
- [ ] Admin dashboard is accessible for owners

**Note**: 
- Render free tier services spin down after 15 minutes of inactivity (first request may take 30-60 seconds)
- Use production keys (`sk_live_...`, `pk_live_...`) for live deployment
- Ensure MongoDB Atlas network access allows Render IPs

## 📡 API Endpoints

### User Endpoints

- `GET /api/users/me` - Get current user
- `POST /api/users` - Create or update user
- `PUT /api/users/:id` - Update user
- `GET /api/users` - Get all users (owner/admin only)

### Product Endpoints

- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (owner/admin only)
- `PUT /api/products/:id` - Update product (owner/admin only)
- `DELETE /api/products/:id` - Delete product (owner/admin only)
- `PATCH /api/products/:id/toggle-stock` - Toggle stock status
- `POST /api/products/bulk-upload` - Bulk upload products

### Cart Endpoints

- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:productId/:size` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Address Endpoints

- `GET /api/address` - Get user's addresses
- `POST /api/address` - Add new address
- `PUT /api/address/:id` - Update address
- `DELETE /api/address/:id` - Delete address
- `PATCH /api/address/:id/default` - Set default address

### Order Endpoints

- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders` - Get all orders (owner/admin only)
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/dashboard/stats` - Get dashboard statistics

### Payment Endpoints

- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/:id` - Get payment status

### Health Check

- `GET /api/health` - Server health status

## 📁 Project Structure

```
AGRI-MART/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context providers
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Images and icons
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Backend Express API
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── uploads/          # Uploaded files (local)
│   ├── server.js         # Entry point
│   └── package.json
│
├── render.yaml           # Render deployment config
├── package.json          # Root package.json
└── README.md            # This file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is part of a final project assignment.

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Built with ❤️ using React, Node.js, and MongoDB**
