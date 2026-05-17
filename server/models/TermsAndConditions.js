const mongoose = require('mongoose');

const termsSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    effectiveFrom: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TermsAndConditions', termsSchema);

