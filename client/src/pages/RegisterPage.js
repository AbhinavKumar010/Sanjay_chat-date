import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaBirthdayCake, FaVenusMars, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'male',
    preferenceGender: 'female',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const registrationData = new FormData();
    Object.keys(formData).forEach((key) => {
      registrationData.append(key, formData[key]);
    });
    if (photoFile) {
      registrationData.append('profilePhoto', photoFile);
    }

    try {
      await register(registrationData);
      toast.success('Registration successful! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom) => ({
      opacity: 1,
      x: 0,
      transition: { delay: custom * 0.1 },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center px-4 py-8">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-8 text-gray-800"
        >
          Create Account
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-4 text-pink-500" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
                placeholder="Your name"
                required
              />
            </div>
          </motion.div>

          <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-4 text-pink-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
                placeholder="your@email.com"
                required
              />
            </div>
          </motion.div>

          <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-4 text-pink-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
          </motion.div>

          <motion.div custom={4} variants={itemVariants} initial="hidden" animate="visible">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
            <div className="relative">
              <FaBirthdayCake className="absolute left-3 top-4 text-pink-500" />
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
                placeholder="18"
                required
              />
            </div>
          </motion.div>

          <motion.div custom={5} variants={itemVariants} initial="hidden" animate="visible">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
            <div className="relative">
              <FaVenusMars className="absolute left-3 top-4 text-pink-500" />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </motion.div>

          <motion.div custom={6} variants={itemVariants} initial="hidden" animate="visible">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo</label>
            <div className="border-2 border-dashed border-pink-300 rounded-xl p-4 cursor-pointer hover:border-pink-500 transition">
              <div className="flex items-center gap-3">
                <FaImage className="text-pink-500 text-xl" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200"
                />
              </div>
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="profile preview"
                  className="mt-4 w-full h-48 object-cover rounded-xl"
                />
              )}
            </div>
          </motion.div>

          <motion.div custom={7} variants={itemVariants} initial="hidden" animate="visible">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Looking for</label>
            <select
              name="preferenceGender"
              value={formData.preferenceGender}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
            >
              <option value="male">Males</option>
              <option value="female">Females</option>
              <option value="both">Both</option>
            </select>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            custom={7}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transition disabled:opacity-50 mt-6"
          >
            {loading ? 'Creating account...' : 'Register'}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-gray-600"
        >
          Already have an account?{' '}
          <a href="/login" className="text-pink-600 font-bold hover:underline">
            Login here
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
