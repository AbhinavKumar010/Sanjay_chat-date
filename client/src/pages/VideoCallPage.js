import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaPhoneSlash,
  FaUserFriends,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

import {
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const VideoCallPage = () => {
  const { user } = useAuth();

  const userId = user?._id || user?.id;

  const { userId: targetUserId } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  // =========================
  // INCOMING CALL DATA
  // =========================

  const incomingCall = location.state?.incomingCall;

  const incomingCallData = location.state?.callData;

  // =========================
  // STATES
  // =========================

  const [call, setCall] = useState({
    isReceivingCall: false,
    from: null,
    name: '',
    signal: null,
  });

  const [callAccepted, setCallAccepted] =
    useState(false);

  const [callEnded, setCallEnded] =
    useState(false);

  const [remoteStreamActive, setRemoteStreamActive] =
    useState(false);

  const [isCalling, setIsCalling] =
    useState(false);

  // =========================
  // REFS
  // =========================

  const localVideoRef = useRef(null);

  const remoteVideoRef = useRef(null);

  const socketRef = useRef(null);

  const peerRef = useRef(null);

  const localStreamRef = useRef(null);

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
    // ANSWER RECEIVED
    // =========================

    socketRef.current.on('answer_made', async (data) => {
      if (!peerRef.current) return;

      try {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        setCallAccepted(true);

        setIsCalling(false);
      } catch (error) {
        console.error(error);
      }
    });

    // =========================
    // ICE CANDIDATE
    // =========================

    socketRef.current.on('ice_candidate', async (data) => {
      if (!peerRef.current) return;

      try {
        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (error) {
        console.error(error);
      }
    });

    // =========================
    // CALL ENDED
    // =========================

    socketRef.current.on('call_ended', () => {
      endCall();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      endCall();
    };
  }, [userId]);

  // =========================
  // SET INCOMING CALL
  // =========================

  useEffect(() => {
    if (incomingCall && incomingCallData) {
      setCall({
        isReceivingCall: true,
        from: incomingCallData.from,
        name: incomingCallData.name,
        signal: incomingCallData.offer,
      });
    }
  }, [incomingCall, incomingCallData]);

  // =========================
  // AUTO START CALL
  // =========================

  useEffect(() => {
    if (
      targetUserId &&
      userId &&
      !incomingCall
    ) {
      callUser();
    }
  }, [targetUserId, userId]);

  // =========================
  // GET CAMERA
  // =========================

  const getLocalStream = async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    return stream;
  };

  // =========================
  // CREATE PEER
  // =========================

  const createPeerConnection = (targetId) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    });

    // REMOTE VIDEO

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject =
          event.streams[0];

        setRemoteStreamActive(true);
      }
    };

    // ICE

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice_candidate', {
          to: targetId,
          candidate: event.candidate,
        });
      }
    };

    // LOCAL TRACKS

    const localStream =
      localStreamRef.current;

    if (localStream) {
      localStream
        .getTracks()
        .forEach((track) => {
          peer.addTrack(track, localStream);
        });
    }

    peerRef.current = peer;

    return peer;
  };

  // =========================
  // CALL USER
  // =========================

  const callUser = async () => {
    if (!targetUserId) return;

    try {
      setIsCalling(true);

      setCallEnded(false);

      await getLocalStream();

      const peer =
        createPeerConnection(targetUserId);

      const offer =
        await peer.createOffer();

      await peer.setLocalDescription(offer);

      socketRef.current.emit('call_user', {
        to: targetUserId,
        from: userId,
        name: user?.name || 'User',
        offer,
      });
    } catch (error) {
      console.error(error);

      toast.error(
        'Unable to start video call'
      );
    }
  };

  // =========================
  // ANSWER CALL
  // =========================

  const answerCall = async () => {
    try {
      setCallAccepted(true);

      setIsCalling(true);

      await getLocalStream();

      const peer =
        createPeerConnection(call.from);

      await peer.setRemoteDescription(
        new RTCSessionDescription(call.signal)
      );

      const answer =
        await peer.createAnswer();

      await peer.setLocalDescription(answer);

      socketRef.current.emit('make_answer', {
        to: call.from,
        answer,
      });

      setCall((prev) => ({
        ...prev,
        isReceivingCall: false,
      }));
    } catch (error) {
      console.error(error);

      toast.error(
        'Unable to answer call'
      );
    }
  };

  // =========================
  // END CALL
  // =========================

  const endCall = () => {
    try {
      socketRef.current.emit('end_call', {
        to: targetUserId || call.from,
      });
    } catch {}

    if (peerRef.current) {
      peerRef.current.close();

      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      localStreamRef.current = null;
    }

    setCallAccepted(false);

    setIsCalling(false);

    setRemoteStreamActive(false);

    setCallEnded(true);

    setCall({
      isReceivingCall: false,
      from: null,
      name: '',
      signal: null,
    });
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* HEADER */}

      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">

        <button
          onClick={() => {
            endCall();

            navigate('/chat');
          }}
          className="text-white bg-gray-800 hover:bg-gray-700 p-3 rounded-full"
        >
          <FaArrowLeft />
        </button>

        <div className="text-center">

          <h2 className="text-white text-2xl font-bold">
            {call?.name || 'Video Call'}
          </h2>

          <p className="text-gray-400 text-sm mt-1">

            {callAccepted
              ? 'Connected'
              : isCalling
              ? 'Calling...'
              : call.isReceivingCall
              ? 'Incoming Call'
              : 'Connecting'}

          </p>
        </div>

        <button
          onClick={endCall}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"
        >
          <FaPhoneSlash />
        </button>
      </div>

      {/* VIDEO AREA */}

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* REMOTE VIDEO */}

        <div className="flex-1 relative bg-gray-950">

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {!remoteStreamActive && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 flex-col">

              <FaUserFriends className="text-7xl mb-4" />

              <p className="text-xl">
                Waiting for video...
              </p>
            </div>
          )}
        </div>

        {/* LOCAL VIDEO */}

        <div className="absolute bottom-6 right-6 w-36 md:w-60 rounded-3xl overflow-hidden border-2 border-white shadow-2xl bg-black">

          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-48 object-cover"
          />
        </div>
      </div>

      {/* INCOMING CALL */}

      {call.isReceivingCall && !callAccepted && (
        <motion.div
          initial={{
            opacity: 0,
            y: 100,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-3xl p-6 text-white w-[90%] max-w-md"
        >

          <h3 className="text-2xl font-bold text-center">
            Incoming Video Call
          </h3>

          <p className="text-center text-gray-400 mt-2">
            {call.name} is calling you
          </p>

          <div className="flex gap-4 mt-6">

            <button
              onClick={answerCall}
              className="flex-1 bg-green-500 hover:bg-green-600 py-4 rounded-full font-bold"
            >
              Answer
            </button>

            <button
              onClick={() => {
                endCall();

                navigate('/chat');
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 py-4 rounded-full font-bold"
            >
              Decline
            </button>
          </div>
        </motion.div>
      )}

      {/* CALL ENDED */}

      {callEnded && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="absolute inset-0 bg-black/80 flex items-center justify-center"
        >
          <div className="bg-gray-900 p-8 rounded-3xl text-center text-white">

            <h2 className="text-3xl font-bold">
              Call Ended
            </h2>

            <button
              onClick={() => navigate('/chat')}
              className="mt-6 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full"
            >
              Back to Chat
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VideoCallPage;