# ⚡ Quick Deployment Checklist

## 🎯 Step-by-Step Deployment

### Step 1: Fix MongoDB URI (IMPORTANT!)

Your current MongoDB URI has duplicate parameters. It should be:
```
mongodb+srv://masonpakwo_db_user:Ntalechristine1@agri-mart.onfhngj.mongodb.net/agri-mart?retryWrites=true&w=majority
```

**Fix in your `.env` file:**
- Remove duplicate `appName` parameters
- Add database name (`/agri-mart`) before the `?`
- Keep only one `appName` or remove it entirely

---

### Step 2: Deploy Backend to Render (10 minutes)

1. **Go to**: https://dashboard.render.com
2. **Click**: "New +" → "Web Service"
3. **Connect**: Your GitHub repository
4. **Configure**:
   - Name: `agri-mart-backend`
   - Environment: `Node`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables** (see list below)
6. **Deploy** and copy the URL (e.g., `https://agri-mart-backend.onrender.com`)

---

### Step 3: Deploy Frontend to Vercel (5 minutes)

1. **Go to**: https://vercel.com
2. **Click**: "Add New Project"
3. **Import**: Your GitHub repository
4. **Configure**:
   - Framework: `Vite`
   - Root Directory: `client` ⚠️ **IMPORTANT**
   - Build Command: `npm run build` (auto)
   - Output Directory: `dist` (auto)
5. **Add Environment Variables** (see list below)
   - **VITE_API_URL**: Use your Render backend URL from Step 2
6. **Deploy** and copy the URL (e.g., `https://agri-mart.vercel.app`)

---

### Step 4: Update Backend CORS

1. **Go back to Render Dashboard**
2. **Edit your backend service**
3. **Update `FRONTEND_URL`**: Set to your Vercel URL from Step 3
4. **Save** (auto-redeploys)

---

## 📝 Environment Variables

### Backend (Render) - Copy & Paste These:

```env
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
MONGODB_URI=mongodb+srv://masonpakwo_db_user:Ntalechristine1@agri-mart.onfhngj.mongodb.net/agri-mart?retryWrites=true&w=majority
CLERK_SECRET_KEY=sk_test_vDF6NGhDJl5zCozFEBkLkGPUpSMa5RUmKGeiJ56SWY
CLOUDINARY_CLOUD_NAME=dxy4riaod
CLOUDINARY_API_KEY=725461834179129
CLOUDINARY_API_SECRET=sE65QmUwl7d0M8k_FM9hU0hiRrg
STRIPE_SECRET_KEY=sk_test_51SVVUBPusEnCvzL1SQzTPSGbKGTvwVafPbrPs4v7LgDnvX5CJiEOjt1ausk48XVkm5cnNsWixgQGSKkqk3Bl9J0c00F3h9QMkk
STRIPE_PUBLISHABLE_KEY=pk_test_51SVVUBPusEnCvzL1lRkrFC8b3AqgnUlAeXy38liA21hSqP24B6cydOrr5zjSoAFM2oCW4F76VYakEZvAUxu1GQ2z00Iu9XRTR9
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=munguditperry@gmail.com
SMTP_PASS=tops ckeo plxm fsjk
```

**⚠️ Important**: 
- Replace `https://your-vercel-app.vercel.app` with your actual Vercel URL after deployment
- Fix the MongoDB URI format (remove duplicate appName, add database name)

### Frontend (Vercel) - Copy & Paste These:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZmFpci1wb255LTI2LmNsZXJrLmFjY291bnRzLmRldiQ
VITE_CURRENCY=$
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SVVUBPusEnCvzL1lRkrFC8b3AqgnUlAeXy38liA21hSqP24B6cydOrr5zjSoAFM2oCW4F76VYakEZvAUxu1GQ2z00Iu9XRTR9
VITE_API_URL=https://your-render-backend.onrender.com/api
```

**⚠️ Important**: 
- Replace `https://your-render-backend.onrender.com` with your actual Render URL after deployment

---

## ✅ Post-Deployment Testing

1. **Test Backend**: Visit `https://your-backend.onrender.com/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

2. **Test Frontend**: Visit your Vercel URL
   - Should load the homepage
   - Check browser console for errors

3. **Test API Connection**:
   - Try signing in
   - Try loading products
   - Try adding to cart

---

## 🐛 Common Issues

### Backend won't start
- Check Render logs
- Verify MongoDB URI format is correct
- Ensure all environment variables are set

### CORS errors
- Update `FRONTEND_URL` in Render to match your Vercel URL exactly
- Restart Render service

### Frontend can't connect to backend
- Verify `VITE_API_URL` in Vercel matches your Render URL
- Check backend is running (test health endpoint)
- Check browser console for specific errors

### MongoDB connection fails
- Verify IP whitelist in MongoDB Atlas includes `0.0.0.0/0`
- Check username/password are correct
- Ensure database name is in the connection string

---

## 📚 Full Guide

For detailed instructions, see `DEPLOYMENT_GUIDE.md`

---

## 🎉 You're Done!

Once both are deployed:
1. ✅ Backend running on Render
2. ✅ Frontend running on Vercel
3. ✅ Environment variables configured
4. ✅ CORS updated
5. ✅ Tested and working

Your app is live! 🚀

