import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { subscriptionService } from '../services/api';

const plans = [
  { planId: 'basic_monthly', label: 'Basic Monthly', price: '₹499/month (demo)' },
  { planId: 'premium_monthly', label: 'Premium Monthly', price: '₹999/month (demo)' },
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
      toast.error(e?.response?.data?.message || 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) fetchMySub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const subscribe = async (planId) => {
    setBusyPlanId(planId);
    try {
      const res = await subscriptionService.createCheckout({ planId });
      // Real app: redirect to Razorpay Checkout with checkout details.
      // Demo: we just show success.
      toast.success(`Checkout created (demo) for ${planId}`);
      await fetchMySub();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to subscribe');
    } finally {
      setBusyPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white">Subscription</h1>
        <p className="text-gray-300 mt-2">Choose a plan to unlock premium features (demo flow).</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((p) => (
            <div key={p.planId} className="bg-gray-800/60 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white">{p.label}</h2>
              <p className="text-gray-300 mt-2">{p.price}</p>
              <button
                disabled={!!busyPlanId || !user}
                onClick={() => subscribe(p.planId)}
                className="mt-5 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 px-5 py-2 rounded-lg font-semibold"
              >
                {busyPlanId === p.planId ? 'Creating checkout...' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-black/20 border border-white/10 rounded-2xl p-6 text-gray-200">
          <h3 className="text-lg font-bold">Your status</h3>
          {loading ? (
            <p className="text-gray-400 mt-2">Loading...</p>
          ) : (
            <pre className="mt-3 whitespace-pre-wrap text-sm">{JSON.stringify(sub, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;

