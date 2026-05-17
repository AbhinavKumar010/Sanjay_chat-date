const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const TermsAndConditions = require('../models/TermsAndConditions');
const SubscriptionTermsAcceptance = require('../models/SubscriptionTermsAcceptance');

// Razorpay integration (without the actual SDK dependency)
// We treat Razorpay webhook payloads as-is and update DB.

const plans = {
  basic_monthly: {
    planId: 'basic_monthly',
    label: 'Basic Monthly',
  },
  premium_monthly: {
    planId: 'premium_monthly',
    label: 'Premium Monthly',
  },
};

// 1) Fetch active terms
exports.getActiveTerms = async (req, res) => {
  try {
    const terms = await TermsAndConditions.findOne({ isActive: true }).sort({ effectiveFrom: -1 });
    if (!terms) {
      return res.status(404).json({ message: 'No active terms found' });
    }
    res.json({ version: terms.version, content: terms.content, effectiveFrom: terms.effectiveFrom });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching terms', error: e.message });
  }
};

// 2) User accepts terms (required before subscription activation)
exports.acceptTerms = async (req, res) => {
  try {
    const { termsVersion } = req.body;
    if (!termsVersion) return res.status(400).json({ message: 'termsVersion is required' });

    const terms = await TermsAndConditions.findOne({ version: termsVersion });
    if (!terms) return res.status(404).json({ message: 'Terms version not found' });

    await SubscriptionTermsAcceptance.findOneAndUpdate(
      { userId: req.user.id, termsVersion },
      {
        $setOnInsert: {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || '',
        },
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Terms accepted' });
  } catch (e) {
    res.status(500).json({ message: 'Error accepting terms', error: e.message });
  }
};

// 3) Create Razorpay subscription session (server creates a Razorpay-like payload)
// NOTE: For real razorpay integration, you must install razorpay SDK and use REST API.
// This endpoint returns a checkout payload and expects client to proceed.
exports.createSubscriptionCheckout = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId || !plans[planId]) {
      return res.status(400).json({ message: 'Invalid planId' });
    }

    // Must accept active terms first
    const activeTerms = await TermsAndConditions.findOne({ isActive: true }).sort({ effectiveFrom: -1 });
    if (!activeTerms) return res.status(404).json({ message: 'No active terms found' });

    const accepted = await SubscriptionTermsAcceptance.findOne({
      userId: req.user.id,
      termsVersion: activeTerms.version,
    });

    if (!accepted) {
      return res.status(403).json({ message: 'Terms must be accepted before subscribing' });
    }

    // Create/update placeholder subscription record
    let subscription = await Subscription.findOne({ userId: req.user.id });
    if (!subscription) {
      subscription = new Subscription({ userId: req.user.id, planId });
    }

    // Create dummy razorpay IDs (replace with real razorpay create-subscription call)
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);

    const dummyRazorpaySubId = `sub_${crypto.randomBytes(8).toString('hex')}`;
    const dummyRazorpayCustomerId = `cust_${crypto.randomBytes(8).toString('hex')}`;

    subscription.planId = planId;
    subscription.status = 'active';
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = end;
    subscription.paymentGateway = 'razorpay';
    subscription.razorpayCustomerId = dummyRazorpayCustomerId;
    subscription.razorpaySubscriptionId = dummyRazorpaySubId;

    await subscription.save();

    res.json({
      message: 'Checkout session created',
      checkout: {
        provider: 'razorpay',
        subscriptionId: dummyRazorpaySubId,
        customerId: dummyRazorpayCustomerId,
        planId,
        // client would normally call Razorpay Checkout here
      },
    });
  } catch (e) {
    res.status(500).json({ message: 'Error creating checkout', error: e.message });
  }
};

// 4) Razorpay webhook handler (verify signature)
// This is a simplified handler. For production, verify using your Razorpay secret.
exports.razorpayWebhook = async (req, res) => {
  try {
    const event = req.body;

    // Signature verification placeholder
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (secret && signature) {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(event))
        .digest('hex');

      if (expected !== signature) {
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const { payload } = event;
    const subscriptionId = payload?.subscription?.entity?.id || payload?.subscription?.id || payload?.payment?.subscription_id;
    const status = payload?.status || payload?.payment?.status;
    const userId = payload?.notes?.userId; // If you set notes.userId when creating checkout

    if (!userId) {
      // fallback: do not update subscription if user cannot be derived
      return res.json({ received: true });
    }

    let sub = await Subscription.findOne({ userId });
    if (!sub) {
      return res.status(404).json({ message: 'Subscription not found for user' });
    }

    sub.razorpaySubscriptionId = subscriptionId || sub.razorpaySubscriptionId;

    if (status === 'active' || status === 'paid') {
      sub.status = 'active';
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 1);
      sub.currentPeriodStart = now;
      sub.currentPeriodEnd = end;
      sub.lastPaymentAt = now;
    } else if (status === 'cancelled') {
      sub.status = 'canceled';
    } else if (status === 'failed') {
      sub.status = 'past_due';
    }

    await sub.save();

    res.json({ received: true });
  } catch (e) {
    res.status(500).json({ message: 'Webhook handling error', error: e.message });
  }
};

// 5) Check subscription status
exports.getMySubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user.id });
    if (!sub) return res.json({ status: 'inactive' });
    res.json(sub);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching subscription', error: e.message });
  }
};

