import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { motion } from 'framer-motion';
import { FaComments, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await apiClient.get('/users/matches');
      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching matches');
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-6xl text-white"
        >
          💕
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 via-red-500 to-orange-600 p-6">
      {/* Header */}
      <motion.div
        className="mb-12 flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full flex items-center gap-2 transition backdrop-blur"
        >
          <FaArrowLeft /> Back
        </button>
        <h2 className="text-4xl font-bold text-white">Your Matches</h2>
      </motion.div>

      {matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-20"
        >
          <p className="text-4xl font-bold text-white mb-4">No matches yet 💔</p>
          <p className="text-lg text-white/90 mb-8">Start browsing and liking users to find your match!</p>
          <motion.button
            onClick={() => navigate('/browse')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-red-600 px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition"
          >
            Browse Users
          </motion.button>
        </motion.div>
      ) : (
        <>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white text-lg mb-8 text-center"
          >
            You have {matches.length} match{matches.length !== 1 ? 'es' : ''}! 🎉
          </motion.p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {matches.map((match) => (
              <motion.div
                key={match._id}
                variants={itemVariants}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                className="bg-white rounded-3xl overflow-hidden shadow-xl transition transform"
              >
                {/* Profile Image */}
                {match.profilePhoto ? (
                  <img
                    src={match.profilePhoto}
                    alt={match.name}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-6xl">👤</span>
                  </div>
                )}

                {/* User Info */}
                <div className="p-6">
                  <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-2xl font-bold text-gray-800 mb-2"
                  >
                    {match.name}, {match.age}
                  </motion.h3>

                  {match.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{match.bio}</p>
                  )}

                  {match.location && (
                    <p className="text-gray-500 text-sm mb-4">📍 {match.location.city}</p>
                  )}

                  <motion.button
                    onClick={() => navigate('/chat', { state: { userId: match._id, userName: match.name } })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:shadow-lg text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 transition"
                  >
                    <FaComments />
                    Start Chat
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default MatchesPage;
