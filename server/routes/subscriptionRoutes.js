const express = require('express');
const auth = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

// Active terms
router.get('/terms/active', subscriptionController.getActiveTerms);

// Accept terms (must be authenticated)
router.post('/terms/accept', auth, subscriptionController.acceptTerms);

// Create checkout (must be authenticated)
router.post('/checkout', auth, subscriptionController.createSubscriptionCheckout);

// Get my subscription (must be authenticated)
router.get('/me', auth, subscriptionController.getMySubscription);

// Razorpay webhook (no auth)
// Razorpay requires raw body; this project uses express.json() globally.
// For now we keep it simple. For production, set a raw body parser for this route.
router.post('/webhook/razorpay', subscriptionController.razorpayWebhook);

module.exports = router;

