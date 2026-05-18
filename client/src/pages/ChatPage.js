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

      setSelectedUser({
        _id: routeUserId,
        name:
          location.state?.name ||
          'User',
      });
    }
  }, []);

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
  // SOCKET
  // =========================

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      console.log('socket connected');

      socketRef.current.emit('join', userId);
    });

    // =========================
    // RECEIVE MESSAGE
    // =========================

    socketRef.current.on(
      'receive_message',
      (message) => {
        console.log(
          'message received',
          message
        );

        const activeUser =
          selectedUserRef.current;

        const isCurrentChat =
          message.senderId ===
            activeUser ||
          message.receiverId ===
            activeUser;

        if (!isCurrentChat) {
          toast.success(
            'New message received'
          );

          return;
        }

        setMessages((prev) => {
          const exists = prev.some(
            (msg) =>
              msg._id ===
                message._id ||
              (msg.content ===
                message.content &&
                msg.sender?._id ===
                  message.senderId)
          );

          if (exists) return prev;

          return [
            ...prev,
            {
              _id:
                message._id ||
                Date.now(),
              content:
                message.content,
              sender: {
                _id:
                  message.senderId,
              },
              receiver:
                message.receiverId,
              createdAt:
                message.createdAt ||
                new Date(),
            },
          ];
        });
      }
    );

    // =========================
    // TYPING
    // =========================

    socketRef.current.on(
      'typing',
      ({ senderId }) => {
        if (
          senderId ===
          selectedUserRef.current
        ) {
          setIsTyping(true);
        }
      }
    );

    socketRef.current.on(
      'stop_typing',
      ({ senderId }) => {
        if (
          senderId ===
          selectedUserRef.current
        ) {
          setIsTyping(false);
        }
      }
    );

    // =========================
    // ONLINE USERS
    // =========================

    socketRef.current.on(
      'online_users',
      (users) => {
        setOnlineUsers(users);
      }
    );

    // =========================
    // INCOMING VIDEO CALL
    // =========================

    socketRef.current.on(
      'incoming_call',
      async (data) => {
        if (data.to !== userId)
          return;

        // SAVE NOTIFICATION

        try {
          await apiClient.post(
            '/notifications/quick',
            {
              type: 'call',
              fromId: data.from,
              content:
                data.name || '',
            }
          );
        } catch (error) {
          console.error(error);
        }

        // OPEN VIDEO PAGE

        navigate(
          `/video-call/${data.from}`,
          {
            state: {
              incomingCall: true,
              callData: data,
            },
          }
        );
      }
    );

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

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

      // INSTANT UI

      setMessages((prev) => [
        ...prev,
        newMessage,
      ]);

      setMessageText('');

      try {
        // SOCKET SEND

        socketRef.current.emit(
          'send_message',
          {
            ...newMessage,
            senderId: userId,
            receiverId:
              selectedUserId,
          }
        );

        // DATABASE SAVE

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

        <div>

          <h2 className="text-2xl font-bold text-white">

            {selectedUser?.name ||
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

        {/* VIDEO BUTTON */}

        {selectedUserId && (
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
                      hour: '2-digit',
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