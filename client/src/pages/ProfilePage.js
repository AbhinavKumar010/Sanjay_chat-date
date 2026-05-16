import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaMapMarkerAlt, FaHeart, FaImage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    interests: '',
    preferenceGender: 'both',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location?.city || '',
        interests: user.interests?.join(', ') || '',
        preferenceGender: user.preferenceGender || 'both',
      });
      setPreviewUrl(user.profilePhoto || '');
    }
  }, [user]);

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
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const updateData = new FormData();

  updateData.append('name', formData.name);
  updateData.append('bio', formData.bio);
  updateData.append('location', formData.location);

  updateData.append(
    'interests',
    JSON.stringify(
      formData.interests
        .split(',')
        .map((item) => item.trim())
    )
  );

  updateData.append(
    'preferenceGender',
    formData.preferenceGender
  );

  if (photoFile) {
    updateData.append('profilePhoto', photoFile);
  }

  try {
    await updateProfile(updateData);

    toast.success('Profile updated successfully');
  } catch (err) {
    console.error(err);

    toast.error('Unable to update profile');
  } finally {
    setLoading(false);
  }
};
    

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-3xl bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-gradient-to-br from-purple-900 to-pink-600 p-8 text-white">
            <div className="flex flex-col items-center gap-4">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-xl">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-purple-800 bg-white/20">
                    <FaUser />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold">{user?.name || 'Your Profile'}</h2>
                <p className="text-sm text-purple-200 mt-2">Upload a photo and update your bio so others can see your profile.</p>
              </div>
            </div>
          </div>

          <div className="md:w-2/3 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-500 mt-2">Update your details and make your profile stand out.</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-900 text-white px-4 py-3 rounded-full hover:bg-gray-800 transition"
              >
                Back to Dashboard
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500 transition"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500 transition"
                    placeholder="Tell people a little about yourself"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-semibold text-gray-700">Location</label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-4 top-4 text-purple-500" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 transition"
                        placeholder="City"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-gray-700">Interests</label>
                    <div className="relative">
                      <FaHeart className="absolute left-4 top-4 text-pink-500" />
                      <input
                        type="text"
                        name="interests"
                        value={formData.interests}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 transition"
                        placeholder="e.g. hiking, art, cooking"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700">Looking for</label>
                  <select
                    name="preferenceGender"
                    value={formData.preferenceGender}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500 transition"
                  >
                    <option value="male">Males</option>
                    <option value="female">Females</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700">Profile Photo</label>
                  <div className="rounded-3xl border border-dashed border-purple-300 p-4 bg-purple-50">
                    <div className="flex items-center gap-3">
                      <FaImage className="text-purple-600 text-xl" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                      />
                    </div>
                    {previewUrl && (
                      <img src={previewUrl} alt="Preview" className="mt-4 w-full h-56 object-cover rounded-3xl" />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-full font-bold text-lg hover:shadow-xl transition disabled:opacity-60"
              >
                {loading ? 'Saving profile...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
