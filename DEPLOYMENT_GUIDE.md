# 🚀 Deployment Guide: Frontend (Vercel) + Backend (Render)

This guide will help you deploy your Agri-Mart application with the frontend on Vercel and backend on Render.

---

## 📋 Prerequisites

- [ ] GitHub account with your code pushed to a repository
- [ ] Vercel account (free tier available)
- [ ] Render account (free tier available)
- [ ] MongoDB Atlas account (free tier available)
- [ ] Clerk account (for authentication)
- [ ] Stripe account (for payments)
- [ ] Cloudinary account (for image uploads)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your Backend

1. **Fix MongoDB URI** (if needed):
   - Your MongoDB URI should be in format: `mongodb+srv://username:password@cluster.mongodb.net/database-name`
   - Make sure there are no duplicate parameters

2. **Create `render.yaml`** (optional but recommended):
   ```yaml
   services:
     - type: web
       name: agri-mart-backend
       env: node
       buildCommand: cd server && npm install
       startCommand: cd server && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 10000
   ```

### Step 2: Deploy on Render

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Name**: `agri-mart-backend`
   - **Environment**: `Node`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if you prefer)

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   PORT=10000
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-app.vercel.app
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agri-mart
   CLERK_SECRET_KEY=sk_test_... (or sk_live_... for production)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
   STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

6. **Click "Create Web Service"**
7. **Wait for deployment** (takes 2-5 minutes)
8. **Copy your Render URL** (e.g., `https://agri-mart-backend.onrender.com`)

### Step 3: Update Render Settings

1. **Auto-Deploy**: Enable "Auto-Deploy" so it redeploys on git push
2. **Health Check**: Render automatically checks `/api/health` endpoint
3. **Note**: Free tier services spin down after 15 minutes of inactivity (first request may be slow)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Your Frontend

1. **Update API URL** in your `.env` file (for local testing):
   ```
   VITE_API_URL=https://your-render-backend.onrender.com/api
   ```

2. **Create `vercel.json`** in the `client` folder (if not exists):
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### Step 2: Deploy on Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. **Go to [Vercel Dashboard](https://vercel.com)**
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure the project**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` (click "Edit" and set to `client`)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)
   - **Install Command**: `npm install` (should auto-detect)

5. **Add Environment Variables** (click "Environment Variables"):
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
   VITE_CURRENCY=$
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
   VITE_API_URL=https://your-render-backend.onrender.com/api
   ```

6. **Click "Deploy"**
7. **Wait for deployment** (takes 1-3 minutes)
8. **Copy your Vercel URL** (e.g., `https://agri-mart.vercel.app`)

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to client folder
cd client

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? agri-mart (or your choice)
# - Directory? ./
# - Override settings? No
```

### Step 3: Update Backend CORS

1. **Go back to Render Dashboard**
2. **Edit your backend service**
3. **Update `FRONTEND_URL` environment variable**:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
4. **Save and redeploy** (or it will auto-redeploy)

---

## Part 3: MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Cluster

1. **Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
2. **Sign in or create account**
3. **Create a new cluster** (Free tier: M0)
4. **Wait for cluster to be created** (2-3 minutes)

### Step 2: Configure Database Access

1. **Go to "Database Access"**
2. **Click "Add New Database User"**
3. **Choose "Password" authentication**
4. **Create username and password** (save these securely!)
5. **Set user privileges**: "Atlas Admin" (or "Read and write to any database")
6. **Click "Add User"**

### Step 3: Configure Network Access

1. **Go to "Network Access"**
2. **Click "Add IP Address"**
3. **For Render**: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add Render's IP ranges if you prefer
4. **Click "Confirm"**

### Step 4: Get Connection String

1. **Go to "Database" → "Connect"**
2. **Choose "Connect your application"**
3. **Copy the connection string**:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
4. **Replace `<username>` and `<password>`** with your database user credentials
5. **Add database name** at the end:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/agri-mart?retryWrites=true&w=majority
   ```
6. **Add this to Render environment variables** as `MONGODB_URI`

---

## Part 4: Post-Deployment Checklist

### ✅ Backend (Render)
- [ ] Service is running and accessible
- [ ] Health check endpoint works: `https://your-backend.onrender.com/api/health`
- [ ] All environment variables are set
- [ ] MongoDB connection is working
- [ ] CORS allows your Vercel domain

### ✅ Frontend (Vercel)
- [ ] Site is accessible
- [ ] All environment variables are set
- [ ] API calls are going to Render backend
- [ ] Authentication works
- [ ] Products load correctly

### ✅ Testing
- [ ] Sign in/Sign up works
- [ ] Products display correctly
- [ ] Add to cart works
- [ ] Checkout process works
- [ ] Payment processing works (test mode)
- [ ] Order confirmation emails are sent

---

## Part 5: Environment Variables Reference

### Frontend (Vercel)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_... or pk_live_...
VITE_CURRENCY=$
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend (Render)
```env
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agri-mart
CLERK_SECRET_KEY=sk_test_... or sk_live_...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## Part 6: Troubleshooting

### Backend Issues

**Service won't start:**
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `package.json` has correct `start` script
- Check MongoDB connection string format

**MongoDB connection fails:**
- Verify IP whitelist includes Render IPs (or 0.0.0.0/0)
- Check username and password are correct
- Ensure connection string includes database name
- Check MongoDB Atlas cluster is running

**CORS errors:**
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check backend CORS configuration allows your Vercel domain
- Restart the Render service after updating environment variables

### Frontend Issues

**Build fails:**
- Check Vercel build logs
- Verify Node version (Vercel uses 18.x by default)
- Check for missing dependencies
- Ensure `package.json` is in the `client` folder

**API calls fail:**
- Verify `VITE_API_URL` points to your Render backend
- Check browser console for CORS errors
- Ensure backend is running and accessible
- Test backend health endpoint directly

**Environment variables not working:**
- Variables must start with `VITE_` to be accessible in Vite
- Redeploy after adding/changing environment variables
- Check variable names match exactly (case-sensitive)

---

## Part 7: Production Checklist

Before going live:

- [ ] Switch Stripe to live mode keys
- [ ] Switch Clerk to production keys
- [ ] Update all environment variables to production values
- [ ] Test all functionality in production
- [ ] Set up custom domain (optional)
- [ ] Enable monitoring and error tracking
- [ ] Set up backups for MongoDB
- [ ] Configure email service for production
- [ ] Test payment processing with real card (small amount)
- [ ] Verify SSL/HTTPS is enabled (automatic on both platforms)

---

## Part 8: Custom Domain (Optional)

### Vercel Custom Domain
1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain
4. Follow DNS configuration instructions

### Render Custom Domain
1. Go to Render service settings
2. Click "Custom Domains"
3. Add your domain
4. Configure DNS records as instructed

---

## Quick Commands

### Check Backend Health
```bash
curl https://your-backend.onrender.com/api/health
```

### View Render Logs
- Go to Render Dashboard → Your Service → Logs

### View Vercel Logs
- Go to Vercel Dashboard → Your Project → Deployments → Click on deployment → View Function Logs

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Clerk Docs**: https://clerk.com/docs
- **Stripe Docs**: https://stripe.com/docs

---

## Notes

- **Render Free Tier**: Services spin down after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.
- **Vercel Free Tier**: Unlimited deployments, 100GB bandwidth/month
- **MongoDB Atlas Free Tier**: 512MB storage, shared cluster
- Keep all environment variables secure and never commit them to Git
- Use production keys only in production environment

Good luck with your deployment! 🚀

