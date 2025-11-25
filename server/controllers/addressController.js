import Address from '../models/Address.js';
import User from '../models/User.js';

// Get all addresses for user
export const getAddresses = async (req, res) => {
  try {
    const { userId } = req;
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const addresses = await Address.find({ userId: user._id }).sort({ isDefault: -1, createdAt: -1 });
    
    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
};

// Get address by ID
export const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const address = await Address.findOne({ _id: id, userId: user._id });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json({
      success: true,
      address
    });
  } catch (error) {
    console.error('Get address by ID error:', error);
    res.status(500).json({ message: 'Error fetching address', error: error.message });
  }
};

// Add address
export const addAddress = async (req, res) => {
  try {
    const { userId } = req;
    const { firstName, lastName, email, phone, street, city, state, zipCode, country, isDefault } = req.body;
    
    if (!firstName || !lastName || !email || !phone || !street || !city || !state || !zipCode || !country) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If this is set as default, unset other default addresses
    if (isDefault) {
      await Address.updateMany(
        { userId: user._id },
        { $set: { isDefault: false } }
      );
    }
    
    const address = await Address.create({
      userId: user._id,
      firstName,
      lastName,
      email,
      phone,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false
    });
    
    // Add address reference to user
    user.addresses.push(address._id);
    await user.save();
    
    res.status(201).json({
      success: true,
      address
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Error adding address', error: error.message });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { firstName, lastName, email, phone, street, city, state, zipCode, country, isDefault } = req.body;
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const address = await Address.findOne({ _id: id, userId: user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // If this is set as default, unset other default addresses
    if (isDefault) {
      await Address.updateMany(
        { userId: user._id, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }
    
    // Update fields
    if (firstName) address.firstName = firstName;
    if (lastName) address.lastName = lastName;
    if (email) address.email = email;
    if (phone) address.phone = phone;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode) address.zipCode = zipCode;
    if (country) address.country = country;
    if (typeof isDefault === 'boolean') address.isDefault = isDefault;
    
    await address.save();
    
    res.json({
      success: true,
      address
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const address = await Address.findOne({ _id: id, userId: user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    await Address.findByIdAndDelete(id);
    
    // Remove address reference from user
    user.addresses = user.addresses.filter(addrId => addrId.toString() !== id);
    await user.save();
    
    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const address = await Address.findOne({ _id: id, userId: user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Unset other default addresses
    await Address.updateMany(
      { userId: user._id, _id: { $ne: id } },
      { $set: { isDefault: false } }
    );
    
    // Set this as default
    address.isDefault = true;
    await address.save();
    
    res.json({
      success: true,
      address
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ message: 'Error setting default address', error: error.message });
  }
};

