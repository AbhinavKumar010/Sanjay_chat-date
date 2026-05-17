import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { subscriptionService } from '../services/api';
import { motion } from 'framer-motion';
import {
  FaCheck,
  FaCrown,
  FaGem,
  FaBolt,
  FaShieldAlt,
} from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';

const plans = [
  {
    planId: 'basic_monthly',
    label: 'Basic',
    price: '₹499',
    duration: '/month',
    icon: FaBolt,
    gradient: 'from-blue-500 to-cyan-500',
    popular: false,
    features: [
      'Unlimited browsing',
      '20 daily likes',
      'Basic chat access',
      'Standard profile boost',
    ],
  },
  {
    planId: 'premium_monthly',
    label: 'Premium',
    price: '₹999',
    duration: '/month',
    icon: FaCrown,
    gradient: 'from-pink-500 to-purple-600',
    popular: true,
    features: [
      'Unlimited likes',
      'Priority matching',
      'Advanced filters',
      'Unlimited chats',
      'Profile spotlight boost',
    ],
  },
];

const SubscriptionPage = () => {
  const { user, isLoading } = useAuth();

  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyPlanId, setBusyPlanId] = useState(null);

  const fetchMySub = async () => {
    setLoading(true);

    try {
      const res = await subscriptionService.getMySubscription();
      setSub(res.data);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || 'Failed to load subscription'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) fetchMySub();
    // eslint-disable-next-line
  }, [isLoading]);

  const subscribe = async (planId) => {
    setBusyPlanId(planId);

    try {
      await subscriptionService.createCheckout({ planId });

      toast.success('Subscription checkout created ✨');

      await fetchMySub();
    } catch (e) {
      toast.error(
        e?.response?.data?.message || 'Failed to subscribe'
      );
    } finally {
      setBusyPlanId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-5 py-8">
      {/* Background Effects */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-pink-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-purple-600/20 blur-[120px] rounded-full" />
      <motion.button
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.96 }}
  onClick={() => window.history.back()}
  className="mb-8 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-xl"
>
  <FaArrowLeft className="text-sm" />
  Back
</motion.button>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-300 text-sm backdrop-blur-xl">
            <FaGem />
            Premium Membership
          </div>

          <h1 className="mt-5 text-4xl md:text-6xl font-black text-white tracking-tight">
            Upgrade Your Experience
          </h1>

          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-lg">
            Unlock premium features, unlimited likes, priority matches
            and advanced filters with our membership plans.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.planId}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -8 }}
                className={`relative overflow-hidden rounded-[32px] border backdrop-blur-2xl p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'border-pink-500/40 bg-white/[0.08]'
                    : 'border-white/10 bg-white/[0.05]'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-5 right-5 px-4 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-lg">
                    MOST POPULAR
                  </div>
                )}

                {/* Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-10`}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-2xl`}
                  >
                    <Icon className="text-white text-2xl" />
                  </div>

                  {/* Title */}
                  <h2 className="text-white text-3xl font-black mt-6">
                    {plan.label}
                  </h2>

                  {/* Price */}
                  <div className="flex items-end gap-2 mt-4">
                    <span className="text-5xl font-black text-white">
                      {plan.price}
                    </span>

                    <span className="text-white/50 mb-2">
                      {plan.duration}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="mt-8 space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <FaCheck className="text-green-400 text-xs" />
                        </div>

                        <span className="text-white/75">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <button
                    disabled={!!busyPlanId || !user}
                    onClick={() => subscribe(plan.planId)}
                    className={`mt-10 w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-[1.02] shadow-xl'
                        : 'bg-white text-black hover:scale-[1.02]'
                    } disabled:opacity-60`}
                  >
                    {busyPlanId === plan.planId
                      ? 'Creating checkout...'
                      : 'Get Started'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 rounded-[32px] border border-white/10 bg-white/[0.05] backdrop-blur-2xl p-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <FaShieldAlt className="text-white text-xl" />
            </div>

            <div>
              <h3 className="text-white text-2xl font-bold">
                Your Subscription Status
              </h3>

              <p className="text-white/50 mt-1">
                Manage and monitor your current membership.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/60">
                Loading subscription...
              </p>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-black/20 border border-white/10 p-5 overflow-auto">
              <pre className="text-sm text-green-300 whitespace-pre-wrap">
                {JSON.stringify(sub, null, 2)}
              </pre>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionPage;