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

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dating-app')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

const onlineUsers = new Map();

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('join', (userId) => {
    if (userId) {
      onlineUsers.set(String(userId), socket.id);
      socket.userId = String(userId);
      console.log('User joined socket room:', socket.userId);
    }
  });


  socket.on('typing', (data) => {
    try {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', {
          senderId: data.senderId,
        });
      }
    } catch (e) {
      console.error('Error handling typing', e);
    }
  });

  socket.on('send_message', async (data) => {
    try {
      const notificationController = require('./controllers/notificationController');

      // Always persist notification (so receiver gets it even if they aren't on ChatPage)
      await notificationController.createNotification({
        ownerId: data.receiverId,
        fromId: data.senderId,
        type: 'message',
        content: data.content,
      });

      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', {

          content: data.content,
          senderId: data.senderId,
          receiverId: data.receiverId,
          createdAt: new Date(),
        });
      }
    } catch (e) {
      console.error('Error handling send_message', e);
    }
  });


  socket.on('call_user', async (data) => {
    try {
      const notificationController = require('./controllers/notificationController');

      // Always persist notification (so receiver gets it even if they aren't on Chat/VideoCall page)
      await notificationController.createNotification({
        ownerId: data.to,
        fromId: data.from,
        type: 'call',
        content: data.name || '',
      });

      const targetSocketId = onlineUsers.get(data.to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('incoming_call', data);
      }
    } catch (e) {
      console.error('Error handling call_user', e);
    }
  });



  socket.on('make_answer', (data) => {
    const targetSocketId = onlineUsers.get(data.to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('answer_made', data);
    }
  });

  socket.on('ice_candidate', (data) => {
    const targetSocketId = onlineUsers.get(data.to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice_candidate', data);
    }
  });

  socket.on('end_call', (data) => {
    const targetSocketId = onlineUsers.get(data.to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call_ended', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date() });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
