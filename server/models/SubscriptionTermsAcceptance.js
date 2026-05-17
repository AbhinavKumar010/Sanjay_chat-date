const mongoose = require('mongoose');

const acceptanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    termsVersion: {
      type: String,
      required: true,
    },

    acceptedAt: {
      type: Date,
      default: Date.now,
    },

    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true }
);

acceptanceSchema.index({ userId: 1, termsVersion: 1 }, { unique: true });

module.exports = mongoose.model('SubscriptionTermsAcceptance', acceptanceSchema);

