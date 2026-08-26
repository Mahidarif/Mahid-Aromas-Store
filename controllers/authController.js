const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: Sign JWT ─────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ─── Helper: Build standard user response payload ─────────────────────────────
// Avoids repeating the same object shape in every auth handler.
const userPayload = (user, token) => ({
  _id:            user._id,
  name:           user.name,
  email:          user.email,
  phone:          user.phone,
  role:           user.role,
  savedAddresses: user.savedAddresses,
  createdAt:      user.createdAt,
  token,
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Creates a new user account.  Password is hashed by the User pre-save hook.
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields before hitting the DB
    if (!name || !email || !password) {
      const err = new Error('Name, email, and password are required');
      err.statusCode = 400;
      return next(err);
    }

    // Check for duplicate email (also caught by DB unique index, but a
    // pre-flight check gives a friendlier error message faster)
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      const err = new Error('An account with this email already exists');
      err.statusCode = 409;
      return next(err);
    }

    const user  = await User.create({ name, email, phone, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data:    userPayload(user, token),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Authenticates user by email + password and returns a fresh JWT.
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Email and password are required');
      err.statusCode = 400;
      return next(err);
    }

    // Explicitly select password back — schema has select:false by default
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      // Deliberately vague — don't reveal whether the email exists
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      return next(err);
    }

    if (!user.isActive) {
      const err = new Error('Your account has been deactivated — contact support');
      err.statusCode = 403;
      return next(err);
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data:    userPayload(user, token),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/profile ────────────────────────────────────────────────────
// Returns the authenticated user's profile data.
// req.user is populated by the `protect` middleware before this runs.
const getProfile = async (req, res, next) => {
  try {
    // Re-fetch to ensure fresh data (the token payload only contains user ID)
    const user = await User.findById(req.user._id);

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      success: true,
      data: {
        _id:            user._id,
        name:           user.name,
        email:          user.email,
        phone:          user.phone,
        role:           user.role,
        savedAddresses: user.savedAddresses,
        orders:         user.orders,
        createdAt:      user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
// Lets the authenticated user update their own name, phone, or password.
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    const { name, phone, currentPassword, newPassword } = req.body;

    if (name)  user.name  = name;
    if (phone) user.phone = phone;

    // Password change requires verification of the current password
    if (newPassword) {
      if (!currentPassword) {
        const err = new Error('Please provide your current password to set a new one');
        err.statusCode = 400;
        return next(err);
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        const err = new Error('Current password is incorrect');
        err.statusCode = 401;
        return next(err);
      }
      if (newPassword.length < 8) {
        const err = new Error('New password must be at least 8 characters');
        err.statusCode = 400;
        return next(err);
      }
      user.password = newPassword; // pre-save hook will re-hash
    }

    const updatedUser = await user.save();
    const token       = signToken(updatedUser._id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data:    userPayload(updatedUser, token),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/address ───────────────────────────────────────────────────
// Adds a new shipping address to the user's savedAddresses array.
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { label, fullName, phone, addressLine1, addressLine2, city, province, postalCode, country, isDefault } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !province) {
      const err = new Error('Full name, phone, address, city, and province are required');
      err.statusCode = 400;
      return next(err);
    }

    // If this new address is being set as default, clear all existing defaults
    if (isDefault) {
      user.savedAddresses.forEach((addr) => { addr.isDefault = false; });
    }

    user.savedAddresses.push({ label, fullName, phone, addressLine1, addressLine2, city, province, postalCode, country, isDefault });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added',
      data:    user.savedAddresses,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateProfile, addAddress };
