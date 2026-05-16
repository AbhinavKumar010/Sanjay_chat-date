import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSignOutAlt, FaFire, FaComments, FaHeart, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const cards = [
    { icon: FaFire, label: 'Browse', path: '/browse', color: 'from-orange-400 to-red-500' },
    { icon: FaHeart, label: 'Matches', path: '/matches', color: 'from-pink-400 to-red-500' },
    { icon: FaComments, label: 'Messages', path: '/chat', color: 'from-blue-400 to-purple-500' },
    { icon: FaUser, label: 'Profile', path: '/profile', color: 'from-green-400 to-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      {/* Header */}
      <motion.div
        className="flex justify-between items-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.h1
          className="text-4xl font-bold text-white"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Welcome, {user?.name}! 👋
        </motion.h1>
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold transition"
        >
          <FaSignOutAlt />
          Logout
        </motion.button>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-12 text-white shadow-xl"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-lg">Email: <span className="font-semibold">{user?.email}</span></p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              onClick={() => navigate(card.path)}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-8 cursor-pointer shadow-xl transform transition`}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                <Icon className="text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white">{card.label}</h3>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-gray-800 rounded-2xl p-6 text-white border-l-4 border-pink-500">
          <p className="text-gray-400 text-sm">Profile Views</p>
          <p className="text-3xl font-bold mt-2">234</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 text-white border-l-4 border-blue-500">
          <p className="text-gray-400 text-sm">New Matches</p>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
