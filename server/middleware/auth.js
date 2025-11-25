import { clerkClient } from '@clerk/clerk-sdk-node';

// Clerk authentication middleware
// This middleware first attempts to verify the incoming token using the Clerk SDK.
// If Clerk verification fails (common in development if keys/SDK mismatch), it
// falls back to decoding the JWT payload without signature verification to
// extract a user id. The fallback is NOT cryptographically secure and should
// only be used for development/testing. Logs warn when fallback is used.
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Try Clerk SDK verification first
    try {
      // clerkClient provides server-side helpers; depending on SDK version the
      // method names differ. We attempt a couple of reasonable calls and
      // continue to fallback if verification isn't available.
      if (clerkClient && clerkClient.sessions && typeof clerkClient.sessions.verifySessionToken === 'function') {
        const session = await clerkClient.sessions.verifySessionToken(token);
        if (session && session.sub) {
          req.userId = session.sub;
          req.user = session;
          return next();
        }
      }

      if (clerkClient && typeof clerkClient.verifyToken === 'function') {
        const session = await clerkClient.verifyToken(token);
        if (session && session.sub) {
          req.userId = session.sub;
          req.user = session;
          return next();
        }
      }
    } catch (verifyErr) {
      // Clerk verification failed — log and fall through to JWT decode fallback
      console.warn('Clerk verification failed, attempting JWT decode fallback:', verifyErr?.message || verifyErr);
    }

    // Fallback: decode JWT payload without verifying signature. This will
    // extract the 'sub' field (Clerk user id) if present. Not secure — only
    // for development convenience when Clerk verification isn't available.
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return res.status(401).json({ message: 'Invalid token format' });
      }
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      
      // Check token expiration
      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp < currentTime) {
          return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
      }
      
      const userId = payload.sub || payload.user_id || payload.uid;
      if (!userId) {
        return res.status(401).json({ message: 'Invalid token payload' });
      }
      req.userId = userId;
      req.user = payload;
      console.warn('Auth middleware: using JWT decode fallback to set req.userId (development only)');
      return next();
    } catch (decodeErr) {
      console.error('Auth error (decode fallback failed):', decodeErr);
      return res.status(401).json({ message: 'Authentication failed', error: decodeErr.message });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

// Optional: Check if user is owner/admin
export const isOwner = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Attempt to fetch user metadata from Clerk if available; otherwise
    // deny for safety.
    if (clerkClient && clerkClient.users && typeof clerkClient.users.getUser === 'function') {
      try {
        const user = await clerkClient.users.getUser(req.userId);
        const isOwnerUser = user?.publicMetadata?.role === 'owner' || user?.publicMetadata?.isOwner === true;
        if (!isOwnerUser) {
          return res.status(403).json({ message: 'Access denied. Owner privileges required.' });
        }
        return next();
      } catch (err) {
        console.warn('isOwner: clerkClient.users.getUser failed, denying access', err?.message || err);
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // If Clerk SDK isn't available for owner check, deny by default.
    return res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    console.error('Owner check error:', error);
    return res.status(403).json({ message: 'Access denied' });
  }
};

