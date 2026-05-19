import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaBell, FaRegCommentDots } from 'react-icons/fa';

const NotificationsPage = () => {
  const { user } = useAuth();

  const userId = user?._id || user?.id;

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/notifications/');
      setNotifications(res.data || []);
    } catch (e) {
      console.error('[notifications] fetch failed:', {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
      });
      toast.error('Unable to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      if (userId) socketRef.current.emit('join', userId);
    });

    socketRef.current.on('incoming_call', (data) => {

      setNotifications((prev) => [
        {
          _id: data._id || Date.now().toString(),
          type: 'call',
          from: data.from,
          name: data.name,
          content: data.name || '',
          createdAt: new Date(),
          isRead: false,
        },
        ...prev,
      ]);
    });

    socketRef.current.on('receive_message', (message) => {
      // server emits populated Message:
      // { _id, sender: { _id, name, ... }, receiver: {...}, content, createdAt, ... }
      const fromUser = message?.sender;

      setNotifications((prev) => [
        {
          _id: message._id || Date.now().toString(),
          type: 'message',
          from: fromUser?._id || fromUser,
          content: message?.content,
          createdAt: message?.createdAt || new Date(),
          isRead: false,
        },
        ...prev,
      ]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
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

    // Remove notification immediately after click
    setNotifications((prev) => prev.filter((x) => x._id !== n._id));

    // If it's an incoming call, open VideoCallPage directly
    if (n.type === 'call') {
      navigate(`/video-call/${n.from._id}`, {
        state: {
          incomingCall: true,
          callData: n,
        },
      });
      return;
    }

    // Otherwise open chat
    navigate(`/chat/${n.from._id}`, {
      state: { userId: n.from._id },
    });
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

