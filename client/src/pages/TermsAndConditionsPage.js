import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { subscriptionService } from '../services/api';

const TermsAndConditionsPage = () => {
  const { user } = useAuth();
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  const fetchActiveTerms = async () => {
    setLoading(true);
    try {
      const res = await subscriptionService.getActiveTerms();
      setTerms(res.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load terms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accept = async () => {
    if (!terms?.version) return;
    setAccepting(true);
    try {
      await subscriptionService.acceptTerms({ termsVersion: terms.version });
      toast.success('Terms accepted');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to accept terms');
    } finally {
      setAccepting(false);
      fetchActiveTerms();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-800/50 border border-white/10 rounded-2xl p-6">
        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
        <p className="text-gray-300 mt-2">
          {terms ? `Version: ${terms.version} • Effective: ${new Date(terms.effectiveFrom).toLocaleDateString()}` : 'Loading...'}
        </p>

        <div className="mt-5 whitespace-pre-wrap text-gray-200 bg-black/20 rounded-xl p-4 border border-white/10">
          {loading ? 'Loading terms...' : terms?.content}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            disabled={accepting || !user}
            onClick={accept}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 px-5 py-2 rounded-lg font-semibold"
          >
            {accepting ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;

