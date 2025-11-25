# Debug Guide - Application Testing & Error Fixes

## ✅ Fixed Issues

### 1. **API Request Function Error**
- **Problem**: `apiRequest` function was undefined in `api.js`
- **Fix**: Replaced all `apiRequest` calls with direct `fetch` calls
- **Files**: `client/src/utils/api.js`

### 2. **Server Import Order**
- **Problem**: Import statement in middle of file
- **Fix**: Moved `connectDB` import to top with other imports
- **Files**: `server/server.js`

### 3. **Uploads Directory**
- **Problem**: Uploads directory might not exist
- **Fix**: Added automatic directory creation in upload middleware
- **Files**: `server/middleware/upload.js`

### 4. **React Hook Dependencies**
- **Problem**: Missing dependency in useEffect
- **Fix**: Added proper dependencies and eslint-disable comment
- **Files**: `client/src/components/CartTotal.jsx`

## 🧪 Testing Checklist

### Backend Testing

1. **Start Server**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   - Check: Server starts on port 5000
   - Check: MongoDB connection successful
   - Check: No import errors

2. **Test Health Endpoint**
   ```bash
   curl http://localhost:5000/api/health
   ```
   - Expected: `{"status":"OK","message":"Server is running"}`

3. **Test Authentication**
   - Check: Clerk token verification works
   - Check: User routes accessible with token

### Frontend Testing

1. **Start Client**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   - Check: App loads without errors
   - Check: Clerk authentication works
   - Check: No console errors

2. **Test Pages**
   - [ ] Home page loads
   - [ ] Products fetch correctly
   - [ ] Cart functionality works
   - [ ] Add to cart works
   - [ ] Address form works
   - [ ] Order creation works
   - [ ] Stripe payment form appears

## 🔍 Common Issues & Solutions

### Issue 1: "Cannot find module" errors
**Solution**: Run `npm install` in both client and server directories

### Issue 2: MongoDB connection error
**Solution**: 
- Check MongoDB is running
- Verify MONGODB_URI in `.env` file
- Check network connectivity

### Issue 3: Clerk authentication fails
**Solution**:
- Verify CLERK_SECRET_KEY in server `.env`
- Verify VITE_CLERK_PUBLISHABLE_KEY in client `.env`
- Check token format in requests

### Issue 4: Stripe payment not working
**Solution**:
- Add VITE_STRIPE_PUBLISHABLE_KEY to client `.env`
- Verify STRIPE_SECRET_KEY in server `.env`
- Check Stripe test mode keys

### Issue 5: Image upload fails
**Solution**:
- Check Cloudinary credentials in `.env`
- Verify uploads directory exists
- Check file size limits (5MB)

### Issue 6: CORS errors
**Solution**:
- Verify FRONTEND_URL in server `.env`
- Check CORS configuration in server.js
- Ensure frontend URL matches exactly

## 🚀 Running the Application

### Step 1: Environment Setup

**Server `.env` file:**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/agri-mart
CLERK_SECRET_KEY=your_clerk_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Client `.env` file:**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_API_URL=http://localhost:5000/api
VITE_CURRENCY=$
```

### Step 2: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Step 3: Start Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Step 4: Test Application

1. Open browser to `http://localhost:5173`
2. Sign in with Clerk
3. Browse products
4. Add items to cart
5. Test checkout flow
6. Test payment (Stripe test cards)

## 📝 Debug Commands

### Check Server Logs
```bash
# Watch server logs
cd server
npm run dev
```

### Check Frontend Console
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

### Test API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Get products (no auth needed)
curl http://localhost:5000/api/products
```

## 🐛 Known Issues & Workarounds

1. **PowerShell command syntax**
   - Use `;` instead of `&&` for command chaining
   - Use `if` statements for conditional execution

2. **File upload paths**
   - Uploads directory is auto-created
   - Files are uploaded to Cloudinary and deleted locally

3. **Stripe Elements loading**
   - Requires Stripe publishable key
   - Falls back gracefully if key is missing

## ✅ Verification Steps

After fixes, verify:
- [x] All API calls use proper fetch syntax
- [x] Server imports are in correct order
- [x] Uploads directory auto-creates
- [x] React hooks have proper dependencies
- [x] No linter errors
- [x] All environment variables documented

## 📞 Next Steps

1. Test each feature individually
2. Check browser console for runtime errors
3. Verify API responses
4. Test payment flow with Stripe test cards
5. Check email sending (if SMTP configured)

