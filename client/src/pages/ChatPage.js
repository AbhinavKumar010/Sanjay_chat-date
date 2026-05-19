import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

import { motion } from 'framer-motion';

import {
  FaPaperPlane,
  FaVideo,
} from 'react-icons/fa';

import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { io } from 'socket.io-client';

import toast from 'react-hot-toast';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const ChatPage = () => {
  const { user } = useAuth();

  const userId = user?._id || user?.id;

  const navigate = useNavigate();

  const location = useLocation();

  const params = useParams();

  // =========================
  // REFS
  // =========================

  const socketRef = useRef(null);

  const messagesEndRef = useRef(null);

  const selectedUserRef = useRef(null);

  const typingTimeoutRef = useRef(null);

  // =========================
  // STATES
  // =========================

  const [selectedUserId, setSelectedUserId] =
    useState(null);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [messageText, setMessageText] =
    useState('');

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [isTyping, setIsTyping] =
    useState(false);

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  // =========================
  // INITIAL USER
  // =========================

  useEffect(() => {
    const routeUserId =
      params?.userId ||
      location.state?.userId;

    if (routeUserId) {
      setSelectedUserId(routeUserId);

      // TEMP NAME
      setSelectedUser({
        _id: routeUserId,
        name:
          location.state?.name ||
          location.state?.userName ||
          'Loading...',
      });
    }
  }, [
    params?.userId,
    location.state?.userId,
    location.state?.name,
    location.state?.userName,
  ]);

  // =========================
  // FETCH USER DETAILS
  // =========================

  const fetchUserDetails = async (id) => {
    try {
      const response = await apiClient.get(
        `/users/${id}`
      );

      if (response.data) {
        setSelectedUser(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchUserDetails(selectedUserId);
    }
  }, [selectedUserId]);

  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
      });
    }, 100);
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
      console.log('socket connected');

      socket.emit('join', userId);
    });

    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('incoming_call', async (data) => {
      if (String(data.to) !== String(userId))
        return;

      try {
        await apiClient.post(
          '/notifications/quick',
          {
            type: 'call',
            fromId: data.from,
            content: data.name || '',
          }
        );
      } catch (error) {
        console.error(error);
      }

      navigate(`/video-call/${data.from}`, {
        state: {
          incomingCall: true,
          callData: data,
          userName: data.name,
        },
      });
    });

    return () => {
      socket.off();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, navigate]);

  // =========================
  // SOCKET LISTENERS
  // =========================

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket || !selectedUserId)
      return;

    const handleReceiveMessage = (
      message
    ) => {
      const activeUser =
        selectedUserRef.current;

      const senderId = String(
        message.senderId ??
          message.sender?._id ??
          ''
      );

      const receiverId = String(
        message.receiverId ??
          message.receiver?._id ??
          ''
      );

      const isCurrentChat =
        senderId === String(activeUser) ||
        receiverId === String(activeUser);

      if (!isCurrentChat) {
        toast.success(
          'New message received'
        );
        return;
      }

      setMessages((prev) => {
        const exists = prev.some(
          (msg) =>
            msg._id === message._id ||
            (msg.content ===
              message.content &&
              String(
                msg.sender?._id
              ) === senderId)
        );

        if (exists) return prev;

        return [
          ...prev,
          {
            _id:
              message._id ||
              Date.now().toString(),
            content: message.content,
            sender: {
              _id:
                message.senderId ??
                message.sender?._id,
            },
            receiver:
              message.receiverId ??
              message.receiver?._id,
            createdAt:
              message.createdAt ||
              new Date(),
          },
        ];
      });
    };

    const handleTyping = ({
      senderId,
    }) => {
      if (
        String(senderId) ===
        String(selectedUserRef.current)
      ) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({
      senderId,
    }) => {
      if (
        String(senderId) ===
        String(selectedUserRef.current)
      ) {
        setIsTyping(false);
      }
    };

    socket.on(
      'receive_message',
      handleReceiveMessage
    );

    socket.on(
      'typing',
      handleTyping
    );

    socket.on(
      'stop_typing',
      handleStopTyping
    );

    return () => {
      socket.off(
        'receive_message',
        handleReceiveMessage
      );

      socket.off(
        'typing',
        handleTyping
      );

      socket.off(
        'stop_typing',
        handleStopTyping
      );
    };
  }, [selectedUserId]);

  // =========================
  // LOAD MESSAGES
  // =========================

  useEffect(() => {
    selectedUserRef.current =
      selectedUserId;

    if (selectedUserId) {
      fetchMessages(
        selectedUserId
      );
    }
  }, [selectedUserId]);

  const clearChatHistory =
    async () => {
      if (!selectedUserId) return;

      try {
        setLoadingMessages(true);

        await apiClient.delete(
          `/messages/conversation/${selectedUserId}/clear`
        );

        setMessages([]);

        toast.success(
          'Chat history cleared'
        );
      } catch (e) {
        console.error(e);

        toast.error(
          'Unable to clear chat history'
        );
      } finally {
        setLoadingMessages(false);
      }
    };

  const fetchMessages = async (
    chatUserId
  ) => {
    try {
      setLoadingMessages(true);

      const response =
        await apiClient.get(
          `/messages/conversation/${chatUserId}`
        );

      setMessages(
        response.data || []
      );
    } catch (error) {
      console.error(error);

      toast.error(
        'Unable to load messages'
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  // =========================
  // SEND MESSAGE
  // =========================

  const handleSendMessage =
    async (e) => {
      e.preventDefault();

      if (
        !messageText.trim() ||
        !selectedUserId
      )
        return;

      const tempId =
        Date.now().toString();

      const content =
        messageText.trim();

      const newMessage = {
        _id: tempId,
        content,
        sender: {
          _id: userId,
        },
        receiver:
          selectedUserId,
        createdAt: new Date(),
      };

      setMessages((prev) => [
        ...prev,
        newMessage,
      ]);

      setMessageText('');

      try {
        socketRef.current.emit(
          'send_message',
          {
            ...newMessage,
            senderId: userId,
            receiverId:
              selectedUserId,
          }
        );

        await apiClient.post(
          '/messages/send',
          {
            receiverId:
              selectedUserId,
            content,
          }
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to send message'
        );
      }
    };

  // =========================
  // TYPING
  // =========================

  const handleTyping = (e) => {
    const value =
      e.target.value;

    setMessageText(value);

    if (
      !socketRef.current ||
      !selectedUserId
    )
      return;

    socketRef.current.emit(
      'typing',
      {
        receiverId:
          selectedUserId,
        senderId: userId,
      }
    );

    clearTimeout(
      typingTimeoutRef.current
    );

    typingTimeoutRef.current =
      setTimeout(() => {
        socketRef.current.emit(
          'stop_typing',
          {
            receiverId:
              selectedUserId,
            senderId: userId,
          }
        );
      }, 1000);
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* HEADER */}

      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div>
            <h2 className="text-2xl font-bold text-white">
              {selectedUser?.name ||
                selectedUser?.username ||
                'Chat'}
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              {onlineUsers.includes(
                selectedUserId
              )
                ? 'Online'
                : 'Offline'}
            </p>
          </div>
        </div>

        {/* VIDEO BUTTON */}

        {selectedUserId && (
          <div className="flex items-center gap-2">

            <button
              onClick={
                clearChatHistory
              }
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              Clear
            </button>

            <button
              onClick={() =>
                navigate(
                  `/video-call/${selectedUserId}`,
                  {
                    state: {
                      userName:
                        selectedUser?.name,
                    },
                  }
                )
              }
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition"
            >
              <FaVideo />
            </button>
          </div>
        )}
      </div>

      {/* CHAT AREA */}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {loadingMessages ? (
          <div className="text-center text-white">
            Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No messages yet
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg._id}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className={`flex ${
                msg.sender?._id ===
                userId
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.sender?._id ===
                  userId
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-white rounded-bl-none'
                }`}
              >
                <p className="break-words">
                  {msg.content}
                </p>

                <div className="text-[10px] opacity-70 text-right mt-1">
                  {new Date(
                    msg.createdAt
                  ).toLocaleTimeString(
                    [],
                    {
                      hour:
                        '2-digit',
                      minute:
                        '2-digit',
                    }
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* TYPING */}

        {isTyping && (
          <div className="text-sm text-gray-400 px-2">
            typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}

      <form
        onSubmit={
          handleSendMessage
        }
        className="border-t border-gray-700 p-4 flex gap-3"
      >

        <input
          type="text"
          value={messageText}
          onChange={
            handleTyping
          }
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 text-white px-5 py-3 rounded-full outline-none"
        />

        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full transition"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatPage;