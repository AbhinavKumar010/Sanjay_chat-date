import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPhoneSlash, FaUserFriends } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const VideoCallPage = () => {
  const { user } = useAuth();
  const userId = user?._id;


  const { userId: targetUserId } = useParams();
  const navigate = useNavigate();

  const [call, setCall] = useState({ isReceivingCall: false, from: null, name: '', signal: null });
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const [remoteStreamActive, setRemoteStreamActive] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const selectedUserRef = useRef(targetUserId);

  useEffect(() => {
    selectedUserRef.current = targetUserId;
  }, [targetUserId]);

  useEffect(() => {
    if (!userId || !targetUserId) return;

    // Create a new socket each time we have both IDs.
    // (Prevents duplicate listeners across re-renders)
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
    });


    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', userId);
      // eslint-disable-next-line no-console
      console.log('[socket] connected, joined as', userId);
    });

    socketRef.current.on('incoming_call', async (data) => {
      if (data.to !== userId) return;

      // Always persist call notification when it is for this user.
      try {
        const toMe = String(data.to) === String(userId);
        if (toMe) {
          await apiClient.post('/notifications/quick', {
            type: 'call',
            fromId: data.from,
            content: data.name || '',
          });
        }
      } catch (e) {
        console.error('[notif/quick][call] failed:', e?.response?.data || e?.message || e);
      }

      setCall({ isReceivingCall: true, from: data.from, name: data.name, signal: data.offer });
    });

    socketRef.current.on('answer_made', (data) => {
      // eslint-disable-next-line no-console
      console.log('[socket] answer_made', data);
      handleAnswer(data);
    });

    socketRef.current.on('ice_candidate', (data) => {
      // eslint-disable-next-line no-console
      console.log('[socket] ice_candidate', data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, targetUserId]);

  const getLocalStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;

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
    if (!targetUserId) {
      toast.error('No user selected');
      return;
    }
    setIsCalling(true);
    setCallEnded(false);

    try {
      await getLocalStream();
      const peer = createPeerConnection(targetUserId);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      if (socketRef.current) {
        socketRef.current.emit('call_user', {
          to: targetUserId,
          from: userId,
          name: user?.name || 'Anonymous',
          offer,
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error starting call:', error);
      toast.error('Unable to start video call');
      setIsCalling(false);
    }
  };

  const answerCall = async () => {
    if (!call?.from || !call?.signal) return;

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
      // eslint-disable-next-line no-console
      console.error('Error answering call:', error);
      toast.error('Unable to answer video call');
    } finally {
      setCall((prev) => ({ ...prev, isReceivingCall: false }));
    }
  };

  const handleAnswer = async (data) => {
    if (!peerRef.current) return;
    try {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      setCallAccepted(true);
      setIsCalling(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error setting remote description:', error);
    }
  };

  const handleIceCandidate = async (data) => {
    if (!peerRef.current) return;

    if (!data?.candidate) {
      // eslint-disable-next-line no-console
      console.warn('[webrtc][ice] cannot add candidate; missing data.candidate', data);
      return;
    }

    try {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[webrtc][ice] Error adding ICE candidate:', error, 'payload:', data);
    }
  };

  const endCall = () => {
    try {
      if (socketRef.current && targetUserId) {
        socketRef.current.emit('end_call', { to: targetUserId });
      }
    } catch {
      // ignore
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
    // Best-effort: if the server sends {to}
    if (data?.to && String(data.to) !== String(userId)) return;
    endCall();
    toast('Call ended');
  };

  const headerTitle = call?.isReceivingCall
    ? `Incoming call from ${call.name}`
    : 'Video Call';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col">
      <div className="p-6 border-b border-gray-700 flex items-center justify-between gap-3">
        <button
          onClick={() => {
            endCall();
            navigate('/chat');
          }}
          className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-full font-semibold transition flex items-center gap-2"
        >
          <FaArrowLeft /> Back
        </button>
        <h2 className="text-2xl font-bold text-white">{headerTitle}</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl bg-gray-900 border border-gray-700 p-4">
              <p className="text-gray-400 mb-3">Local camera</p>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-56 md:h-80 rounded-2xl bg-black"
              />
            </div>

            <div className="rounded-3xl bg-gray-900 border border-gray-700 p-4">
              <p className="text-gray-400 mb-3">Remote stream</p>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-56 md:h-80 rounded-2xl bg-black"
              />

              {!remoteStreamActive && (
                <p className="text-gray-500 text-sm mt-3">
                  Remote video will appear here once connected.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            {call.isReceivingCall && (
              <div className="rounded-3xl bg-purple-900/90 border border-purple-700 p-4 text-white">
                <p className="font-semibold">Incoming call from {call.name}</p>
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
              <div className="rounded-3xl bg-green-900/80 border border-green-700 p-4 text-white mt-4">
                <p className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-green-300" />
                  Video call active.
                </p>
              </div>
            )}

            {callEnded && (
              <div className="rounded-3xl bg-red-900/80 border border-red-700 p-4 text-white mt-4">
                <p>Call ended.</p>
              </div>
            )}

            {!callAccepted && !call.isReceivingCall && !callEnded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl bg-gray-900/60 border border-gray-700 p-4 text-white mt-4"
              >
                <p className="text-gray-300">
                  {isCalling ? 'Connecting...' : 'Preparing call...'}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="w-full md:w-96 border-t md:border-l border-gray-700 bg-gray-950 p-4 overflow-y-auto">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="text-xl md:text-2xl text-white font-semibold">Controls</h3>
            {callAccepted && (
              <button
                onClick={endCall}
                className="bg-red-500 text-white px-3 py-2 rounded-full font-semibold transition shadow-lg active:scale-95 flex items-center gap-2"
              >
                <FaPhoneSlash /> End
              </button>
            )}
          </div>

          {targetUserId ? (
            <div className="rounded-3xl bg-gray-900 border border-gray-700 p-4 text-white">
              <p className="text-gray-400 mb-2">Calling</p>
              <p className="font-semibold break-all">{targetUserId}</p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 px-6 py-12">
              <FaUserFriends className="text-6xl mb-4" />
              <p className="text-xl font-semibold">No user selected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;

