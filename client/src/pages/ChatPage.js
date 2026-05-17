import React, { useState, useEffect, useRef } from 'react';
import apiClient, { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaArrowLeft, FaVideo, FaPhoneSlash, FaUserFriends } from 'react-icons/fa';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import toast from 'react-hot-toast';
import { io } from 'socket.io-client';


const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const ChatPage = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [call, setCall] = useState({ isReceivingCall: false, from: null, name: '', signal: null });
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [remoteStreamActive, setRemoteStreamActive] = useState(false);
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const selectedUserRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  useEffect(() => {
    fetchConversations();

    // Prefer route param, then navigation state.
    const routeUserId = params?.userId;
    if (routeUserId) {
      setSelectedUserId(routeUserId);
    } else if (location.state?.userId) {
      setSelectedUserId(location.state.userId);
    }
  }, []);


  useEffect(() => {
    selectedUserRef.current = selectedUserId;

    // Keep selectedUser in sync with selectedUserId + loaded users.
    if (selectedUserId) {
      // We don't render user/conversation lists here; selectedUser is only used for message placeholder/title.
      setSelectedUser({ _id: selectedUserId, name: selectedUserId });


      // Load messages once when switching chats.
      handleSelectUser(selectedUserId);
    } else {
      setSelectedUser(null);
      setMessages([]);
    }
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, callAccepted]);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', userId);
      // eslint-disable-next-line no-console
      console.log('[socket] connected, joined as', userId);
    });

    socketRef.current.on('receive_message', async (data) => {
      // eslint-disable-next-line no-console
      console.log('[socket] receive_message', data);

      const activePeerId = selectedUserRef.current;
      const isFromActivePeer = data.senderId === activePeerId;
      const isToActivePeer = data.receiverId === activePeerId;

      // If user is actively chatting with the other person, append to UI.
      if (isFromActivePeer || isToActivePeer) {
        setMessages((prev) => [
          ...prev,
          {
            content: data.content,
            sender: { _id: data.senderId },
          },
        ]);
        return;
      }

      // Otherwise persist notification so it remains in Notifications even if user is online.
      try {
        console.log('[notif/quick][message] payload:', {
          type: 'message',
          fromId: data.senderId,
          content: data.content,
        });
        await apiClient.post('/notifications/quick', {
          type: 'message',
          fromId: data.senderId,
          content: data.content,
        });
      } catch (e) {
        console.error('[notif/quick][message] failed:', e?.response?.data || e?.message || e);
      }

      toast.success('New message received');
    });


    socketRef.current.on('incoming_call', async (data) => {
      // eslint-disable-next-line no-console
      console.log('[socket] incoming_call', {
        ...data,
        ["[clientState] userId"]: userId,
        ["[clientState] selectedUserRef.current"]: selectedUserRef.current,
      });

      // Always persist call notification when it is for this user.
      try {
        const toMe = String(data.to) === String(userId);
        if (toMe) {
          const payload = {
            type: 'call',
            fromId: data.from,
            content: data.name || '',
          };
          console.log('[notif/quick][call] saving because toMe=true:', {
            payload,
            dataTo: data.to,
            userId,
          });
          await apiClient.post('/notifications/quick', payload);
          console.log('[notif/quick][call] saved');
        }
      } catch (e) {
        console.error('[notif/quick][call] failed:', e?.response?.data || e?.message || e);
      }

      handleIncomingCall(data);
    });

    socketRef.current.on('answer_made', (data) => {
      // eslint-disable-next-line no-console
      console.log('[socket] answer_made', data);
      handleAnswer(data);
    });
    socketRef.current.on('ice_candidate', (data) => {
      // eslint-disable-next-line no-console
      console.log('[socket] ice_candidate', data);
      if (!data?.candidate) {
        console.warn('[webrtc][ice] missing data.candidate; full payload:', data);
      }
      handleIceCandidate(data);
    });
    socketRef.current.on('call_ended', (data) => {
      // eslint-disable-next-line no-console
      console.log('[socket] call_ended', data);
      handleCallEnded(data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      endCall();
    };
  }, [userId]);

  const fetchUsers = async () => {
    try {
      const response = await userService.listUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Unable to fetch users');
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await apiClient.get('/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSelectUser = async (userId) => {
    setSelectedUserId(userId);
    setLoadingMessages(true);

    try {
      const response = await apiClient.get(`/messages/conversation/${userId}`);
      setMessages(response.data);
    } catch (error) {
      toast.error('Error fetching messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;

    const content = messageText.trim();
    setMessages((prev) => [...prev, { content, sender: { _id: userId } }]);
    setMessageText('');

    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        receiverId: selectedUserId,
        senderId: userId,
        content,
      });
    }

    try {
      await apiClient.post('/messages/send', {
        receiverId: selectedUserId,
        content,
      });
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  const getLocalStream = async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  };

  const createPeerConnection = (targetId) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteStreamActive(true);
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice_candidate', {
          to: targetId,
          candidate: event.candidate,
        });
      }
    };

    const localStream = localStreamRef.current;
    if (localStream) {
      localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));
    }

    peerRef.current = peer;
    return peer;
  };

  const callUser = async () => {
    if (!selectedUserId) {
      toast.error('Select a user first');
      return;
    }
    setIsCalling(true);
    setCallEnded(false);

    try {
      await getLocalStream();
      const peer = createPeerConnection(selectedUserId);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      if (socketRef.current) {
        socketRef.current.emit('call_user', {
          to: selectedUserId,
          from: userId,
          name: user?.name || 'Anonymous',
          offer,
        });
      }
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Unable to start video call');
      setIsCalling(false);
    }
  };

  const handleIncomingCall = async (data) => {
    if (data.to !== userId) return;
    setCall({ isReceivingCall: true, from: data.from, name: data.name, signal: data.offer });
  };

  const answerCall = async () => {
    setCallAccepted(true);
    setIsCalling(true);

    try {
      await getLocalStream();
      const peer = createPeerConnection(call.from);
      await peer.setRemoteDescription(new RTCSessionDescription(call.signal));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit('make_answer', {
          to: call.from,
          answer,
        });
      }
    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Unable to answer video call');
    } finally {
      setCall({ ...call, isReceivingCall: false });
    }
  };

  const handleAnswer = async (data) => {
    if (!peerRef.current) return;
    try {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      setCallAccepted(true);
    } catch (error) {
      console.error('Error setting remote description:', error);
    }
  };

  const handleIceCandidate = async (data) => {
    if (!peerRef.current) return;

    if (!data?.candidate) {
      console.warn('[webrtc][ice] cannot add candidate; missing data.candidate', data);
      return;
    }

    try {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (error) {
      console.error('[webrtc][ice] Error adding ICE candidate:', error, 'payload:', data);
    }
  };

  const endCall = () => {
    if (socketRef.current && selectedUserId) {
      socketRef.current.emit('end_call', { to: selectedUserId });
    }

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setCallAccepted(false);
    setIsCalling(false);
    setRemoteStreamActive(false);
    setCall({ isReceivingCall: false, from: null, name: '', signal: null });
    setCallEnded(true);
  };

  const handleCallEnded = (data) => {
    if (data.to !== userId) return;
    endCall();
    toast('Call ended');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col md:flex-row">
      {/* Sidebar removed: Chat opens directly for selected user */}
      <motion.div
        className="flex-1 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >

        <div className="p-6 border-b border-gray-700 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">{selectedUser ? selectedUser.name : 'Select a user'}</h2>
            <p className="text-gray-400 mt-1">{selectedUser ? `Chat and video call ${selectedUser.name}` : 'Choose a user from the sidebar to begin'}.</p>
          </div>
          {selectedUser && (
            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                onClick={() => {
                  // On mobile: open dedicated video call page
                  if (window.innerWidth < 768) {
                    navigate(`/video/${selectedUserId}`);
                    return;
                  }
                  // On desktop/tablet: keep old in-page video UI
                  callUser();
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-full font-semibold transition shadow-lg"
              >
                <FaVideo className="inline-block mr-2" /> Start Video Call
              </motion.button>

              {callAccepted && (
                <motion.button
                  onClick={endCall}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-red-500 text-white px-4 py-3 rounded-full font-semibold transition shadow-lg"
                >
                  <FaPhoneSlash className="inline-block mr-2" /> End Call
                </motion.button>
              )}
            </div>
          )}
        </div>

       <div className="flex-1 overflow-hidden md:flex">
  
  {/* CHAT AREA */}
  <div className="flex-1 flex flex-col min-h-0">
    
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {selectedUser ? (
        <>
          {loadingMessages ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex justify-center"
            >
              <span className="text-4xl">⚡</span>
            </motion.div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 mt-10"
            >
              <p className="text-lg">No messages yet. Send the first one!</p>
            </motion.div>
          ) : (
            messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  msg.sender._id === userId
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                    msg.sender._id === userId
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none'
                      : 'bg-gray-700 text-white rounded-bl-none'
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                </div>
              </motion.div>
            ))
          )}

          <div ref={messagesEndRef} />
        </>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 px-6">
          <FaUserFriends className="text-6xl mb-4" />
          <p className="text-xl font-semibold">
            Select a user to open a chat.
          </p>
          <p className="mt-2 text-sm">
            All registered users are available in the sidebar.
          </p>
        </div>
      )}
    </div>

    {/* MESSAGE INPUT */}
    <form
      onSubmit={handleSendMessage}
      className="border-t border-gray-700 p-4 flex gap-3"
    >
      <input
        type="text"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder={
          selectedUser
            ? `Message ${selectedUser.name}...`
            : 'Select a user to send a message'
        }
        className="flex-1 bg-gray-800 text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        disabled={!selectedUser}
      />

      <motion.button
        type="submit"
        whileHover={{ scale: selectedUser ? 1.05 : 1 }}
        whileTap={{ scale: selectedUser ? 0.95 : 1 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-4 disabled:opacity-50"
        disabled={!selectedUser}
      >
        <FaPaperPlane />
      </motion.button>
    </form>

  </div>

  {/* VIDEO PANEL */}
  <div className="w-full md:w-96 border-l border-gray-700 bg-gray-950 p-4 md:p-6 overflow-y-auto">
    
    <div className="flex items-start justify-between gap-3 mb-4">
      <h3 className="text-xl md:text-2xl text-white font-semibold">Video Call</h3>
      {callAccepted && (
        <button
          onClick={endCall}
          className="bg-red-500 text-white px-3 py-2 rounded-full font-semibold transition shadow-lg active:scale-95"
        >
          End
        </button>
      )}
    </div>

    <div className="space-y-4">

      <div className="rounded-3xl bg-gray-900 border border-gray-700 p-4">
        <p className="text-gray-400 mb-3">Local camera</p>

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-56 rounded-2xl bg-black"
        />
      </div>

      <div className="rounded-3xl bg-gray-900 border border-gray-700 p-4">
        <p className="text-gray-400 mb-3">Remote stream</p>

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-56 rounded-2xl bg-black"
        />

        {!remoteStreamActive && (
          <p className="text-gray-500 text-sm mt-3">
            Remote video will appear here once connected.
          </p>
        )}
      </div>

      {call.isReceivingCall && (
        <div className="rounded-3xl bg-purple-900/90 border border-purple-700 p-4 text-white">
          <p className="font-semibold">
            Incoming call from {call.name}
          </p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={answerCall}
              className="flex-1 bg-green-500 hover:bg-green-600 rounded-full py-3 font-semibold"
            >
              Answer
            </button>

            <button
              onClick={endCall}
              className="flex-1 bg-red-500 hover:bg-red-600 rounded-full py-3 font-semibold"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {callAccepted && (
        <div className="rounded-3xl bg-green-900/80 border border-green-700 p-4 text-white">
          <p>Video call active.</p>
        </div>
      )}

      {callEnded && (
        <div className="rounded-3xl bg-red-900/80 border border-red-700 p-4 text-white">
          <p>Call ended.</p>
        </div>
      )}

    </div>
  </div>

</div>

      </motion.div>
    </div>
  );
};

export default ChatPage;
