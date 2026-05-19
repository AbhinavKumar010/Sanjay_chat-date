import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaSignOutAlt,
  FaFire,
  FaComments,
  FaHeart,
  FaUser,
  FaBell,
  FaArrowRight,
  FaCrown,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const primaryCards = [
    {
      icon: FaFire,
      label: 'Browse',
      desc: 'Discover new people',
      path: '/browse',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: FaHeart,
      label: 'Matches',
      desc: 'Your connections',
      path: '/matches',
      gradient: 'from-pink-500 to-rose-500',
    },
    
    {
      icon: FaBell,
      label: 'Notifications',
      desc: 'Latest activity',
      path: '/notifications',
      gradient: 'from-yellow-400 to-orange-500',
    },
  ];

  const secondaryCards = [
    {
      icon: FaUser,
      label: 'Profile',
      path: '/profile',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: FaUser,
      label: 'Terms',
      path: '/terms',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: FaCrown,
      label: 'Subscription',
      path: '/subscription',
      gradient: 'from-fuchsia-500 to-purple-600',
    },
  ];

  const Card = ({ card, index }) => {
    const Icon = card.icon;

    return (
      <motion.button
        onClick={() => navigate(card.path)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 text-left shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
      >
        {/* Glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition duration-500`}
        />

        {/* Top */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}
            >
              <Icon className="text-white text-xl" />
            </div>

            <h3 className="text-white font-bold text-xl mt-5">
              {card.label}
            </h3>

            {card.desc && (
              <p className="text-white/60 text-sm mt-1">{card.desc}</p>
            )}
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition duration-300">
            <FaArrowRight className="text-white/70 text-lg" />
          </div>
        </div>

        {/* Bottom Line */}
        <div className="relative z-10 mt-6 h-[5px] rounded-full overflow-hidden bg-white/10">
          <div
            className={`h-full w-1/3 rounded-full bg-gradient-to-r ${card.gradient} group-hover:w-full transition-all duration-500`}
          />
        </div>
      </motion.button>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816]">
      {/* Background Effects */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-purple-600/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-pink-600/20 blur-[140px] rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 p-5 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5"
        >
          <div>
            <p className="text-purple-300 font-medium mb-2">
              Welcome back 👋
            </p>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              {user?.name || 'User'}
            </h1>

            <p className="text-white/50 mt-3 max-w-lg">
              Manage your profile, chats, matches and notifications from one
              modern dashboard.
            </p>
          </div>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-red-500/15 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all shadow-lg backdrop-blur-xl"
          >
            <FaSignOutAlt />
            Logout
          </motion.button>
        </motion.div>

        {/* Main Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 mt-10">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-4 rounded-[32px] border border-white/10 bg-white/[0.05] backdrop-blur-2xl p-6 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[3px]">
                  <div className="w-full h-full rounded-full bg-[#0b1120] flex items-center justify-center">
                    <FaUser className="text-white text-4xl" />
                  </div>
                </div>

                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-400 border-4 border-[#0b1120]" />
              </div>

              <h2 className="text-white text-2xl font-bold mt-5">
                {user?.name || 'User'}
              </h2>

              <p className="text-white/50 text-sm mt-1 break-all">
                {user?.email}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <p className="text-white/50 text-sm">Profile Views</p>
                <h3 className="text-3xl font-black text-white mt-2">234</h3>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <p className="text-white/50 text-sm">Matches</p>
                <h3 className="text-3xl font-black text-white mt-2">12</h3>
              </div>
            </div>

            {/* Premium Card */}
            <div className="mt-6 rounded-3xl p-5 bg-gradient-to-br from-purple-600/30 to-pink-600/20 border border-purple-400/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <FaCrown className="text-yellow-300 text-xl" />
                </div>

                <div>
                  <h3 className="text-white font-bold">Premium Plan</h3>
                  <p className="text-white/60 text-sm">
                    Unlock unlimited swipes & boosts
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/subscription')}
                className="mt-5 w-full py-3 rounded-2xl bg-white text-black font-bold hover:scale-[1.02] transition"
              >
                Upgrade Now
              </button>
            </div>
          </motion.div>

          {/* Right Content */}
          <div className="xl:col-span-8 space-y-8">
            {/* Main Cards */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white text-2xl font-bold">
                  Main Features
                </h2>

                <span className="text-white/40 text-sm">
                  Quick access
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {primaryCards.map((card, idx) => (
                  <Card key={card.path} card={card} index={idx} />
                ))}
              </div>
            </div>

            {/* Secondary */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white text-2xl font-bold">
                  Settings & More
                </h2>

                <span className="text-white/40 text-sm">
                  Manage account
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {secondaryCards.map((card, idx) => (
                  <Card key={card.path} card={card} index={idx} />
                ))}
              </div>
            </div>

            {/* Bottom Banner */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/10 p-7 backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/20 blur-3xl rounded-full" />

              <div className="relative z-10">
                <p className="text-purple-300 font-semibold">
                  Smart Suggestions
                </p>

                <h3 className="text-white text-2xl font-black mt-2">
                  Complete your profile to get better matches ✨
                </h3>

                <p className="text-white/60 mt-3 max-w-2xl">
                  Users with complete profiles receive more likes, faster
                  responses and higher visibility in recommendations.
                </p>

                <button
                  onClick={() => navigate('/profile')}
                  className="mt-6 px-6 py-3 rounded-2xl bg-white text-black font-bold hover:scale-105 transition"
                >
                  Complete Profile
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;