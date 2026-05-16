import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaBell, FaRegCommentDots } from 'react-icons/fa';

const NotificationsPage = () => {
  const { } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/notifications');
      setNotifications(res.data || []);
    } catch (e) {
      toast.error('Unable to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markRead = async (id) => {
    try {
      await apiClient.put(`/notifications/mark-read/${id}`);
    } catch (e) {
      // ignore
    }
  };

  const handleClickNotification = async (n) => {
    await markRead(n._id);

    // Navigate to chat with sender selected
    // ChatPage expects either route param /chat/:userId or navigation state.
    navigate(`/chat/${n.from._id}`, {
      state: { userId: n.from._id },
    });

    // Optimistic update
    setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-10"
      >
        <div className="flex items-center gap-3">
          <FaBell className="text-3xl text-white" />
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-gray-300">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-gray-800/60 rounded-2xl p-8 border border-gray-700 text-gray-300">
          <p className="text-lg font-semibold">No notifications</p>
          <p className="text-sm text-gray-400 mt-2">When someone messages or calls you, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className={`cursor-pointer p-4 rounded-2xl border transition ${
                n.isRead ? 'bg-gray-800/40 border-gray-700' : 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-400/40'
              }`}
              onClick={() => handleClickNotification(n)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-white mt-0.5">
                    <FaRegCommentDots className="text-2xl" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {n.type === 'message' ? 'Message' : 'Incoming call'} from {n.from?.name || 'Unknown'}
                    </p>
                    {n.type === 'message' && n.content ? (
                      <p className="text-gray-300 text-sm mt-1 line-clamp-2">{n.content}</p>
                    ) : null}
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!n.isRead && <span className="text-xs text-white bg-red-500/90 px-2 py-1 rounded-full">New</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

