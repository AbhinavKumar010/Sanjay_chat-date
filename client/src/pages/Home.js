import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaComments } from 'react-icons/fa';

const Home = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center px-4" >
      <motion.div
        className="text-center text-white max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex justify-center gap-4 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              <FaHeart className="text-red-300" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              <FaComments className="text-blue-300" />
            </motion.div>
          </div>
          <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">
            Meet & Connect
          </h1>
          <p className="text-xl text-white/90 drop-shadow-md">
            Find your perfect match and chat with people around you
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
        >
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition"
            >
              Login
            </motion.button>
          </Link>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(9, 9, 9, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-br from-blue-500 to-pink-500 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition border-2 border-white"
            >
              Register
            </motion.button>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16">
          <p className="text-sm text-white/70">Join thousands of singles today</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
