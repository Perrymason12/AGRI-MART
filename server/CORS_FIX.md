# CORS Configuration Fix

## Issue
The FRONTEND_URL environment variable was causing CORS errors when:
1. Variable was not set
2. Multiple frontend URLs needed to be supported
3. Development vs production environments

## Solution
Updated CORS configuration to:
- Support multiple allowed origins
- Handle undefined FRONTEND_URL gracefully
- Allow localhost variations
- Support development mode with relaxed CORS
- Include proper headers and methods

## Configuration
The CORS now allows:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)
- `http://127.0.0.1:5173` (Alternative localhost)
- `http://127.0.0.1:3000` (Alternative localhost)
- Any URL set in `FRONTEND_URL` environment variable
- All origins in development mode

## Environment Variable
Set in `server/.env`:
```
FRONTEND_URL=http://localhost:5173
```

Or for production:
```
FRONTEND_URL=https://yourdomain.com
```

## Testing
After the fix, CORS errors should be resolved. If you still see CORS errors:
1. Check that your frontend URL matches one of the allowed origins
2. Verify the FRONTEND_URL in .env file
3. Check browser console for specific CORS error messages
4. Ensure credentials: true matches frontend fetch configuration

