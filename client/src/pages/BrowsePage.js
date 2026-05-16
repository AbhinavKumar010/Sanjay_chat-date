import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BrowsePage = () => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users/browse');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching users');
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const likedUser = users[currentIndex];
    try {
      const response = await apiClient.post('/users/like', { likedUserId: likedUser._id });
      if (response.data.isMatch) {
        toast.success('It\'s a match! 🎉');
      } else {
        toast.success('User liked! 💕');
      }
      nextUser();
    } catch (error) {
      toast.error('Error liking user');
    }
  };

  const handlePass = () => {
    toast.success('Passed! 👋');
    nextUser();
  };

  const nextUser = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      fetchUsers();
      setCurrentIndex(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-6xl text-white"
        >
          ⚡
        </motion.div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <p className="text-4xl font-bold mb-6">No more users! 😅</p>
          <p className="text-lg mb-8">Come back later for more profiles</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-lg transition"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex flex-col items-center justify-center p-4">
      <motion.button
        onClick={() => navigate('/dashboard')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full flex items-center gap-2 transition backdrop-blur"
      >
        <FaArrowLeft /> Back
      </motion.button>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentUser._id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Profile Image */}
            {currentUser.profilePhoto ? (
              <img
                src={currentUser.profilePhoto}
                alt={currentUser.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <span className="text-6xl">👤</span>
              </div>
            )}

            {/* User Info */}
            <div className="p-6">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-800 mb-2"
              >
                {currentUser.name}, {currentUser.age}
              </motion.h3>

              {currentUser.bio && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 mb-4"
                >
                  {currentUser.bio}
                </motion.p>
              )}

              {currentUser.location && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-500 text-sm mb-6"
                >
                  📍 {currentUser.location.city}, {currentUser.location.country}
                </motion.p>
              )}

              {currentUser.interests && currentUser.interests.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-2 mb-6"
                >
                  {currentUser.interests.map((interest, idx) => (
                    <span key={idx} className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="px-6 pb-6 flex gap-4"
            >
              <motion.button
                onClick={handlePass}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-full font-bold transition shadow-lg"
              >
                <FaTimes className="text-xl" />
                Pass
              </motion.button>
              <motion.button
                onClick={handleLike}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 hover:shadow-xl text-white py-3 rounded-full font-bold transition shadow-lg"
              >
                <FaHeart className="text-xl" />
                Like
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress */}
      <motion.p
        className="text-white mt-8 text-lg font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {currentIndex + 1} of {users.length}
      </motion.p>
    </div>
  );
};

export default BrowsePage;
