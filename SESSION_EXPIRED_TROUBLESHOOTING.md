# Session Expired Error - Complete Troubleshooting Guide

## 🔍 1. Possible Causes

### A. **Token Expiration**
- Clerk JWT tokens expire after a set time (typically 1 hour)
- User remains signed in but token becomes invalid
- Backend rejects expired tokens with 401 status

### B. **Token Not Being Refreshed**
- Frontend wasn't detecting 401 responses
- No automatic token refresh mechanism
- User had to manually sign in again

### C. **Backend Token Validation Issues**
- Backend wasn't checking token expiration
- Invalid tokens were being accepted
- Mismatch between frontend and backend token validation

### D. **API Response Status Missing**
- API functions didn't include HTTP status codes
- Frontend couldn't detect authentication failures
- Errors were silently ignored

## 🔧 2. Step-by-Step Troubleshooting

### Step 1: Check Browser Console
```javascript
// Open DevTools (F12) → Console tab
// Look for:
// - "Session expired" messages
// - 401 errors in Network tab
// - Token refresh attempts
```

### Step 2: Verify Token Status
```javascript
// In browser console:
const { useAuth } = require('@clerk/clerk-react');
// Check if token exists and is valid
```

### Step 3: Check Network Requests
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests returning 401
4. Check Authorization header is present

### Step 4: Verify Backend Logs
```bash
# Check server console for:
# - "Clerk verification failed" warnings
# - "Token expired" messages
# - Authentication errors
```

### Step 5: Test Token Refresh
1. Wait for token to expire (or manually expire)
2. Perform an action (add to cart, etc.)
3. Check if token refresh happens automatically
4. Verify request succeeds after refresh

## 🐛 3. Problem Areas in Code

### Frontend Issues (FIXED ✅)

#### **Problem 1: API Functions Missing Status Codes**
**Location**: `client/src/utils/api.js`
**Issue**: Functions returned only JSON, no HTTP status
**Fix**: Added `json.status = response.status` to all functions

#### **Problem 2: No Token Refresh Logic**
**Location**: Multiple components
**Issue**: 401 errors weren't handled with token refresh
**Fix**: Added automatic token refresh on 401 responses

#### **Problem 3: Inconsistent Error Handling**
**Location**: `client/src/context/AppContext.jsx`
**Issue**: Some functions checked `data.status`, others didn't
**Fix**: Standardized all API calls to include status codes

### Backend Issues (FIXED ✅)

#### **Problem 1: Token Expiration Not Checked**
**Location**: `server/middleware/auth.js`
**Issue**: JWT expiration wasn't validated in fallback mode
**Fix**: Added `payload.exp` check before accepting token

#### **Problem 2: Poor Error Messages**
**Location**: `server/middleware/auth.js`
**Issue**: Generic "Authentication failed" messages
**Fix**: Added specific "Token expired" message with code

## ✅ 4. All Fixes Applied

### Fix 1: API Status Codes ✅
**File**: `client/src/utils/api.js`
- All API functions now include `response.status`
- Pattern: `const json = await response.json(); json.status = response.status; return json;`

### Fix 2: Token Expiration Check ✅
**File**: `server/middleware/auth.js`
- Added expiration validation: `if (payload.exp < currentTime)`
- Returns proper 401 with `TOKEN_EXPIRED` code

### Fix 3: Automatic Token Refresh ✅
**Files**: All frontend components making API calls
- Pattern: Check for 401 → Refresh token → Retry request
- Uses: `getToken({ template: 'default' })` to force refresh

### Fix 4: Better Error Messages ✅
**Files**: All components
- Clear "Session expired" messages
- Guidance to sign in again
- Fallback to local storage when appropriate

## 🧪 Testing the Fixes

### Test 1: Normal Operation
1. Sign in to application
2. Perform actions (add to cart, etc.)
3. ✅ Should work without errors

### Test 2: Token Expiration
1. Sign in to application
2. Wait for token to expire (or manually expire in Clerk dashboard)
3. Click any button requiring auth
4. ✅ Should automatically refresh token and succeed

### Test 3: Multiple Rapid Actions
1. Sign in to application
2. Perform multiple actions quickly
3. ✅ All should work, token refresh happens once

### Test 4: Network Issues
1. Sign in to application
2. Disconnect network temporarily
3. Reconnect and try action
4. ✅ Should handle gracefully with clear error

## 📋 Code Patterns Used

### Token Refresh Pattern:
```javascript
let token = await getToken();
let data = await api.someFunction(params, token);

// If unauthorized, try to refresh token
if (data && data.status === 401) {
  try {
    token = await getToken({ template: 'default' });
    if (token) {
      data = await api.someFunction(params, token);
    }
  } catch (refreshErr) {
    console.warn('Token refresh failed:', refreshErr);
  }
}

if (data && data.status === 401) {
  toast.error('Session expired. Please sign in again.');
  return;
}
```

### API Function Pattern:
```javascript
someFunction: async (params, token) => {
  const response = await fetch(`${API_BASE_URL}/endpoint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(params)
  });
  const json = await response.json().catch(() => ({}));
  json.status = response.status; // ← KEY FIX
  return json;
}
```

## 🎯 Expected Behavior Now

1. **Token expires** → First action triggers refresh → Works seamlessly
2. **401 received** → Automatic refresh → Retry request → Success
3. **Refresh fails** → Clear error message → User can sign in again
4. **Network issues** → Graceful error handling → User informed

## 🚨 If Issues Persist

1. **Check Clerk Configuration**
   - Verify `CLERK_SECRET_KEY` in server `.env`
   - Verify `VITE_CLERK_PUBLISHABLE_KEY` in client `.env`
   - Check Clerk dashboard for token settings

2. **Check Backend Logs**
   - Look for authentication errors
   - Verify token format
   - Check expiration times

3. **Check Frontend Console**
   - Look for token refresh errors
   - Verify API calls include Authorization header
   - Check for CORS issues

4. **Verify Token Format**
   - Tokens should be JWT format (three parts separated by dots)
   - Check token payload in browser DevTools

## ✅ Summary

All session expired issues have been fixed:
- ✅ API functions include status codes
- ✅ Token expiration checked on backend
- ✅ Automatic token refresh implemented
- ✅ Better error messages
- ✅ Consistent error handling

The application should now handle token expiration gracefully with automatic refresh and clear user feedback.

