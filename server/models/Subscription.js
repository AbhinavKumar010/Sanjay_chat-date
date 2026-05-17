const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    planId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['inactive', 'active', 'past_due', 'canceled', 'expired'],
      default: 'inactive',
      index: true,
    },

    currentPeriodStart: {
      type: Date,
    },

    currentPeriodEnd: {
      type: Date,
    },

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },

    paymentGateway: {
      type: String,
      enum: ['razorpay'],
      default: 'razorpay',
    },

    // Razorpay fields
    razorpayCustomerId: {
      type: String,
    },
    razorpaySubscriptionId: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },

    lastPaymentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);

