import User from '../models/User.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

// Get or create user
export const getUser = async (req, res) => {
  try {
    const { userId } = req;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    console.log('Get user request for userId:', userId);
    
    // Check if user exists in database first
    let user = await User.findOne({ clerkId: userId });
    
    // Try to get user from Clerk to sync/update info
    let clerkUser = null;
    try {
      // Check if CLERK_SECRET_KEY is set
      if (!process.env.CLERK_SECRET_KEY) {
        console.warn('CLERK_SECRET_KEY is not set, skipping Clerk sync');
      } else {
        const clerk = clerkClient();
        if (clerk) {
          console.log('Fetching user from Clerk API...');
          clerkUser = await clerk.users.getUser(userId);
          console.log('Clerk user fetched successfully');
        }
      }
    } catch (clerkError) {
      console.warn('Failed to fetch user from Clerk:', clerkError?.message || clerkError);
      // Continue without Clerk data if user already exists in database
      if (!user) {
        // If user doesn't exist and we can't get Clerk data, return error
        return res.status(500).json({ 
          message: 'Failed to fetch user from Clerk and user not found in database', 
          error: clerkError?.message || 'Clerk API error'
        });
      }
      // If user exists, continue with existing data
      console.log('Using existing user data from database');
    }
    
    if (!user) {
      // Create new user
      if (!clerkUser) {
        return res.status(500).json({ 
          message: 'Cannot create user: Clerk data unavailable',
          error: 'Failed to fetch user from Clerk API'
        });
      }
      
      try {
        user = await User.create({
          clerkId: userId,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          imageUrl: clerkUser.imageUrl || '',
          role: clerkUser.publicMetadata?.role || 'user',
          isOwner: clerkUser.publicMetadata?.isOwner || false
        });
        console.log('New user created in database:', user._id);
      } catch (createError) {
        console.error('Error creating user:', createError);
        // If duplicate key error, try to find the user again
        if (createError.code === 11000) {
          user = await User.findOne({ clerkId: userId });
          if (user) {
            console.log('User found after duplicate key error');
          } else {
            throw createError;
          }
        } else {
          throw createError;
        }
      }
    } else {
      // Update user info from Clerk if available
      if (clerkUser) {
        user.email = clerkUser.emailAddresses?.[0]?.emailAddress || user.email;
        user.firstName = clerkUser.firstName || user.firstName;
        user.lastName = clerkUser.lastName || user.lastName;
        user.imageUrl = clerkUser.imageUrl || user.imageUrl;
        user.role = clerkUser.publicMetadata?.role || user.role;
        user.isOwner = clerkUser.publicMetadata?.isOwner || user.isOwner;
        await user.save();
        console.log('User updated from Clerk data');
      }
    }
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        role: user.role,
        isOwner: user.isOwner
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error fetching user', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Create or update user (sync with Clerk)
export const createOrUpdateUser = async (req, res) => {
  try {
    const { userId } = req;
    const clerk = clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      user = await User.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        imageUrl: clerkUser.imageUrl || '',
        role: clerkUser.publicMetadata?.role || 'user',
        isOwner: clerkUser.publicMetadata?.isOwner || false
      });
    } else {
      user.email = clerkUser.emailAddresses[0]?.emailAddress || user.email;
      user.firstName = clerkUser.firstName || user.firstName;
      user.lastName = clerkUser.lastName || user.lastName;
      user.imageUrl = clerkUser.imageUrl || user.imageUrl;
      user.role = clerkUser.publicMetadata?.role || user.role;
      user.isOwner = clerkUser.publicMetadata?.isOwner || user.isOwner;
      await user.save();
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Create/Update user error:', error);
    res.status(500).json({ message: 'Error syncing user', error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { userId } = req;
    const { firstName, lastName, role, isOwner } = req.body;
    
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    if (typeof isOwner === 'boolean') user.isOwner = isOwner;
    
    await user.save();
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

