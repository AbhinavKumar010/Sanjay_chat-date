import React, { useState, useEffect } from 'react';
import apiClient, { userService } from '../services/api';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaUser,
  FaComments,
  FaCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BrowsePage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await userService.listUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Unable to load users');
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-white text-5xl animate-spin">⚡</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-6">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-white/20 text-white px-4 py-2 rounded-full hover:bg-white/30 transition"
        >
          <FaArrowLeft /> Back
        </button>

        <h1 className="text-3xl font-bold text-white">
          Discover People ({users.length})
        </h1>
      </div>

      {/* EMPTY STATE */}
      {users.length === 0 ? (
        <div className="text-center text-white mt-20">
          <p className="text-3xl font-bold">No users found 😢</p>
          <p className="mt-2 opacity-80">Try again later</p>
        </div>
      ) : (
        <div className="space-y-5 max-w-3xl mx-auto">

          {users.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-3xl shadow-xl p-4 flex gap-4 items-center"
            >

              {/* PROFILE IMAGE */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-200 flex items-center justify-center">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-3xl text-gray-400" />
                )}
              </div>

              {/* INFO */}
              <div className="flex-1">

                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-800">
                    {user.name}
                  </h2>

                  <span className="text-sm bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                    {user.age || '18+'}
                  </span>

                  <FaCircle className="text-green-500 text-xs" />
                </div>

                <p className="text-gray-500 text-sm line-clamp-1">
                  {user.bio || "No bio available"}
                </p>

                {user.location && (
                  <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                    <FaMapMarkerAlt />
                    {user.location.city}
                  </p>
                )}

              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-2">

                <button
                  onClick={() => navigate(`/chat/${user._id}`, { state: { userId: user._id,
                    name: user.name,
                   }, })}
                  className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                >
                  <FaComments />
                  Chat
                </button>

                <button
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold"
                >
                  View
                </button>

              </div>

            </motion.div>
          ))}

        </div>
      )}
    </div>
  );
};

export default BrowsePage;