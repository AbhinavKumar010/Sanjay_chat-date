const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const Message = require('./models/Message');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dating-app')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

/* ======================================================
   🔥 ONLINE USERS (FIXED)
   userId -> Set(socketIds)
====================================================== */
const onlineUsers = new Map();

/* ======================================================
   SOCKET CONNECTION
====================================================== */
io.on('connection', (socket) => {
  console.log('New user:', socket.id);

  /* ---------------- JOIN ---------------- */
  socket.on('join', (userId) => {
    if (!userId) return;

    socket.userId = String(userId);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    console.log('JOINED:', userId, socket.id);

    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  /* ---------------- TYPING ---------------- */
  socket.on('typing', (data) => {
    const receivers = onlineUsers.get(data.receiverId);

    if (receivers) {
      receivers.forEach((id) => {
        io.to(id).emit('typing', {
          senderId: data.senderId,
        });
      });
    }
  });

  socket.on('stop_typing', (data) => {
    const receivers = onlineUsers.get(data.receiverId);

    if (receivers) {
      receivers.forEach((id) => {
        io.to(id).emit('stop_typing', {
          senderId: data.senderId,
        });
      });
    }
  });

  /* ---------------- MESSAGE ---------------- */
  socket.on('send_message', async (data) => {
  try {

    // SAVE MESSAGE
    const message = await Message.create({
      sender: data.senderId,
      receiver: data.receiverId,
      content: data.content,
    });

    // POPULATE
    const populatedMessage =
      await Message.findById(message._id)
        .populate('sender', 'name profilePhoto')
        .populate('receiver', 'name profilePhoto');

    // NOTIFICATION
    const notificationController =
      require('./controllers/notificationController');

    await notificationController.createNotification({
      ownerId: data.receiverId,
      fromId: data.senderId,
      type: 'message',
      content: data.content,
    });

    // SEND TO RECEIVER (and sender as well, but avoid duplicates when sender==receiver)
    const receiverSockets = onlineUsers.get(data.receiverId);
    if (receiverSockets) {
      receiverSockets.forEach((id) => {
        io.to(id).emit('receive_message', populatedMessage);
      });
    }

    const senderSockets = onlineUsers.get(data.senderId);
    if (senderSockets) {
      senderSockets.forEach((id) => {
        // prevent double-send to the same socket if receiverId === senderId
        if (String(data.receiverId) === String(data.senderId) && receiverSockets?.has(id)) return;
        io.to(id).emit('receive_message', populatedMessage);
      });
    }

  } catch (err) {
    console.error(err);
  }
});

  /* ---------------- CALL USER ---------------- */
  socket.on('call_user', async (data) => {
    try {
      const notificationController = require('./controllers/notificationController');

      await notificationController.createNotification({
        ownerId: data.to,
        fromId: data.from,
        type: 'call',
        content: data.name || '',
      });

      const receivers = onlineUsers.get(data.to);

      if (receivers) {
        receivers.forEach((id) => {
          io.to(id).emit('incoming_call', data);
        });
      } else {
        console.log('User offline:', data.to);
      }
    } catch (err) {
      console.error(err);
    }
  });

  /* ---------------- WEBRTC ANSWER ---------------- */
  socket.on('make_answer', (data) => {
    const receivers = onlineUsers.get(data.to);

    if (receivers) {
      receivers.forEach((id) => {
        io.to(id).emit('answer_made', data);
      });
    }
  });

  /* ---------------- ICE CANDIDATE ---------------- */
  socket.on('ice_candidate', (data) => {
    const receivers = onlineUsers.get(data.to);

    if (receivers) {
      receivers.forEach((id) => {
        io.to(id).emit('ice_candidate', data);
      });
    }
  });

  /* ---------------- END CALL ---------------- */
  socket.on('end_call', (data) => {
    const receivers = onlineUsers.get(data.to);

    if (receivers) {
      receivers.forEach((id) => {
        io.to(id).emit('call_ended', data);
      });
    }
  });

  /* ---------------- DISCONNECT ---------------- */
  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);

    const userId = socket.userId;

    if (userId && onlineUsers.has(userId)) {
      const set = onlineUsers.get(userId);

      set.delete(socket.id);

      if (set.size === 0) {
        onlineUsers.delete(userId);
      }
    }

    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

/* ======================================================
   ROUTES
====================================================== */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/* ======================================================
   START SERVER
====================================================== */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});