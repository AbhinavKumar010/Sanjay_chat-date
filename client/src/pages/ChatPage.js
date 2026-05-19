import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaVideo } from 'react-icons/fa';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  'https://jay-sathi.onrender.com';

const ChatPage = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedUserRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // =========================
  // INIT USER
  // =========================
  useEffect(() => {
    const routeUserId = params?.userId || location.state?.userId;

    if (routeUserId) {
      setSelectedUserId(routeUserId);

      setSelectedUser({
        _id: routeUserId,
        name: location.state?.name || location.state?.userName || 'User',
      });
    }
  }, [params, location.state]);

  // =========================
  // FETCH USER DETAILS (optional)
  // =========================
  const fetchUserDetails = async (id) => {
    try {
      const res = await apiClient.get(`/users/${id}`);
      if (res.data) setSelectedUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (selectedUserId) fetchUserDetails(selectedUserId);
  }, [selectedUserId]);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // =========================
  // SOCKET CONNECT
  // =========================
  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', userId);
    });

    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('receive_message', (message) => {
      const activeChatUser = String(selectedUserRef.current);

      const senderId = String(message.senderId || message.sender?._id);

      // ONLY SHOW IF SAME CHAT
      if (senderId !== activeChatUser) {
        toast.success('New message received');
        return;
      }

      setMessages((prev) => {
        const exists = prev.some((m) => String(m._id) === String(message._id));
        if (exists) return prev;

        return [
          ...prev,
          {
            _id: message._id || Date.now().toString(),
            content: message.content,
            sender: { _id: senderId },
            receiver: message.receiverId,
            createdAt: message.createdAt || new Date(),
          },
        ];
      });
    });

    socket.on('typing', ({ senderId }) => {
      if (String(senderId) === String(selectedUserRef.current)) {
        setIsTyping(true);
      }
    });

    socket.on('stop_typing', ({ senderId }) => {
      if (String(senderId) === String(selectedUserRef.current)) {
        setIsTyping(false);
      }
    });

    socket.on('incoming_call', async (data) => {
      if (String(data.to) !== String(userId)) return;

      navigate(`/video-call/${data.from}`, {
        state: {
          incomingCall: true,
          callData: data,
        },
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, navigate]);

  // =========================
  // LOAD MESSAGES
  // =========================
  const fetchMessages = async (id) => {
    try {
      setLoadingMessages(true);
      const res = await apiClient.get(`/messages/conversation/${id}`);
      setMessages(res.data || []);
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    selectedUserRef.current = selectedUserId;

    if (selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId]);

  // =========================
  // SEND MESSAGE
  // =========================
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedUserId) return;

    const content = messageText.trim();

    const newMessage = {
      _id: Date.now().toString(),
      content,
      sender: { _id: userId },
      receiver: selectedUserId,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageText('');

    try {
      socketRef.current.emit('send_message', {
        ...newMessage,
        senderId: userId,
        receiverId: selectedUserId,
      });

      await apiClient.post('/messages/send', {
        receiverId: selectedUserId,
        content,
      });
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  // =========================
  // TYPING
  // =========================
  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (!socketRef.current || !selectedUserId) return;

    socketRef.current.emit('typing', {
      receiverId: selectedUserId,
      senderId: userId,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stop_typing', {
        receiverId: selectedUserId,
        senderId: userId,
      });
    }, 1000);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* HEADER */}
      <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
        <div>
          <h2 className="text-white font-bold text-xl">
            {selectedUser?.name || 'Chat'}
          </h2>

          <p className="text-gray-400 text-sm">
            {onlineUsers.includes(selectedUserId) ? 'Online' : 'Offline'}
          </p>
        </div>

        <button
          onClick={() =>
            navigate(`/video-call/${selectedUserId}`, {
              state: { userName: selectedUser?.name },
            })
          }
          className="text-white bg-purple-600 p-3 rounded-full"
        >
          <FaVideo />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg._id}
            className={`flex ${
              msg.sender?._id === userId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className="bg-gray-700 text-white px-4 py-2 rounded-xl max-w-xs">
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <p className="text-gray-400 text-sm">typing...</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSendMessage} className="p-4 flex gap-2 border-t border-gray-700">
        <input
          value={messageText}
          onChange={handleTyping}
          className="flex-1 p-3 rounded-full bg-gray-800 text-white outline-none"
          placeholder="Type message..."
        />

        <button className="bg-purple-600 p-3 rounded-full text-white">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatPage;