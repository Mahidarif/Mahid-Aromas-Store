const mongoose = require('mongoose');
const bcrypt    = require('bcryptjs');

// ─── Sub-Schema: Saved Address ────────────────────────────────────────────────
// Stored as an embedded array on the User document so users can select
// from previously used addresses at checkout without re-typing.
const addressSchema = new mongoose.Schema(
  {
    label:      { type: String, trim: true, default: 'Home' }, // e.g. "Home", "Office"
    fullName:   { type: String, required: true, trim: true },
    phone:      { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city:       { type: String, required: true, trim: true },
    province:   { type: String, required: true, trim: true },  // e.g. Punjab, Sindh
    postalCode: { type: String, trim: true },
    country:    { type: String, default: 'Pakistan', trim: true },
    isDefault:  { type: Boolean, default: false },
  },
  { _id: true } // Keep individual IDs so the frontend can reference a specific address
);

// ─── Main User Schema ─────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Full name is required'],
      trim:     true,
    },

    email: {
      type:      String,
      required:  [true, 'Email address is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:   false, // Never return password in queries by default
    },

    phone: {
      type:  String,
      trim:  true,
    },

    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },

    // Embedded array of saved shipping addresses
    savedAddresses: [addressSchema],

    // Reference to past orders (populated on demand, not auto-joined)
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'Order',
      },
    ],

    // Password reset flow
    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpires: { type: Date,   select: false },

    isActive: {
      type:    Boolean,
      default: true, // Allows soft-disabling accounts without deletion
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
  }
);

// ─── Pre-Save Hook: Hash Password ─────────────────────────────────────────────
// Only re-hash if the password field was actually modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt    = await bcrypt.genSalt(12); // 12 rounds is a safe modern default
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Method: Verify Password ────────────────────────────────────────
// Called during login: user.matchPassword(enteredPassword)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Instance Method: Set Default Address ────────────────────────────────────
// Ensures only one address is flagged as default at a time
userSchema.methods.setDefaultAddress = function (addressId) {
  this.savedAddresses.forEach((addr) => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  });
};

module.exports = mongoose.model('User', userSchema);
