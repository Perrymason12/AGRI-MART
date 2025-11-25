import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

// Script to make a user an owner/admin
// Usage: node server/utils/makeUserOwner.js <clerkId or email>

const makeUserOwner = async () => {
  try {
    await connectDB();
    
    const identifier = process.argv[2]; // Get from command line argument
    
    if (!identifier) {
      console.error('Please provide a Clerk ID or email address');
      console.log('Usage: node server/utils/makeUserOwner.js <clerkId or email>');
      process.exit(1);
    }
    
    // Find user by Clerk ID or email
    const user = await User.findOne({
      $or: [
        { clerkId: identifier },
        { email: identifier.toLowerCase() }
      ]
    });
    
    if (!user) {
      console.error(`User not found with identifier: ${identifier}`);
      process.exit(1);
    }
    
    // Update user to owner
    user.role = 'owner';
    user.isOwner = true;
    await user.save();
    
    console.log(`✅ Successfully made user an owner:`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Clerk ID: ${user.clerkId}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Is Owner: ${user.isOwner}`);
    console.log('\n⚠️  Note: You should also update Clerk publicMetadata for full access.');
    console.log('   Go to Clerk Dashboard > Users > Your User > Metadata');
    console.log('   Add: { "role": "owner", "isOwner": true }');
    
    process.exit(0);
  } catch (error) {
    console.error('Error making user owner:', error);
    process.exit(1);
  }
};

makeUserOwner();

