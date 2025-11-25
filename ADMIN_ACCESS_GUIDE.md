# How to Gain Admin/Owner Access

This guide explains how to grant yourself admin/owner access to the application.

## Understanding Access Control

The application checks for owner access in two places:
1. **Clerk Public Metadata** (Primary) - `publicMetadata.role === 'owner'` or `publicMetadata.isOwner === true`
2. **Database User Record** (Secondary) - `user.role === 'owner'` or `user.isOwner === true`

## Method 1: Via Clerk Dashboard (Recommended) ⭐

This is the recommended method as it syncs with the database automatically.

### Steps:

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Sign in to your Clerk account

2. **Select Your Application**
   - Choose the application you're using

3. **Navigate to Users**
   - Click on "Users" in the left sidebar

4. **Find Your User**
   - Search for your user by email or name
   - Click on your user to open their profile

5. **Edit Public Metadata**
   - Click on the "Metadata" tab
   - Scroll to "Public metadata"
   - Click "Edit" or the "+" button
   - Add the following JSON:
     ```json
     {
       "role": "owner",
       "isOwner": true
     }
     ```
   - Click "Save"

6. **Refresh Your Session**
   - Sign out of your application
   - Sign back in
   - The owner access should now be active

## Method 2: Via Database Script (Alternative)

If you prefer to update the database directly, use the provided script.

### Steps:

1. **Find Your Clerk ID or Email**
   - You can find your Clerk ID in the Clerk Dashboard (Users > Your User > User ID)
   - Or use your email address

2. **Run the Script**
   ```bash
   cd server
   npm run make:owner <your-clerk-id-or-email>
   ```
   
   Example:
   ```bash
   npm run make:owner user_2abc123xyz
   # or
   npm run make:owner your-email@example.com
   ```

3. **Update Clerk Metadata (Still Recommended)**
   - Even after updating the database, you should still update Clerk metadata
   - Follow Method 1 steps 1-6 above

## Method 3: Direct Database Update (Advanced)

If you have direct MongoDB access:

1. **Connect to MongoDB**
   ```bash
   mongosh mongodb://localhost:27017/agri-mart
   ```

2. **Find Your User**
   ```javascript
   db.users.findOne({ email: "your-email@example.com" })
   ```

3. **Update User**
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { 
       $set: { 
         role: "owner",
         isOwner: true
       }
     }
   )
   ```

4. **Update Clerk Metadata**
   - Still follow Method 1 to update Clerk publicMetadata

## Verifying Access

After granting owner access:

1. **Sign out and sign back in** to your application
2. **Check for Owner Button**
   - You should see an "Owner" button in the header (top right)
3. **Access Owner Dashboard**
   - Click the "Owner" button or navigate to `/owner`
   - You should see the owner dashboard with:
     - Dashboard
     - Add Product
     - List Product

## Troubleshooting

### Still can't access owner section?

1. **Check Clerk Metadata**
   - Make sure `publicMetadata.role === 'owner'` or `publicMetadata.isOwner === true`
   - Refresh your session (sign out/in)

2. **Check Database**
   - Verify `user.role === 'owner'` or `user.isOwner === true`
   - Run the script again if needed

3. **Clear Browser Cache**
   - Clear your browser cache and cookies
   - Sign in again

4. **Check Console Logs**
   - Open browser DevTools (F12)
   - Check for any errors in the console
   - Check Network tab for API responses

## Security Note

⚠️ **Important**: Only grant owner access to trusted users. Owner access allows:
- Adding/editing/deleting products
- Viewing all orders
- Managing order status
- Accessing dashboard statistics

