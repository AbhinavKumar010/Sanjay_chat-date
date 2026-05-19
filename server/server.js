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

const server =
  http.createServer(app);

/* ======================================================
   SOCKET.IO
====================================================== */

const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: [
      'GET',
      'POST',
    ],
    credentials: true,
  },

  transports: [
    'websocket',
    'polling',
  ],
});

/* ======================================================
   MIDDLEWARE
====================================================== */

app.use(cors({
  origin: '*',
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
  ],
  credentials: true,
}));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  '/uploads',
  express.static(
    path.join(
      __dirname,
      'uploads'
    )
  )
);

/* ======================================================
   DATABASE
====================================================== */

mongoose
  .connect(
    process.env.MONGO_URI ||
      'mongodb://localhost:27017/dating-app'
  )
  .then(() => {

    console.log(
      'MongoDB connected'
    );

  })
  .catch((err) => {

    console.log(err);

  });

/* ======================================================
   ONLINE USERS
   userId -> Set(socketIds)
====================================================== */

const onlineUsers =
  new Map();

/* ======================================================
   SOCKET CONNECTION
====================================================== */

io.on(
  'connection',
  (socket) => {

    console.log(
      'New socket:',
      socket.id
    );

    /* =========================
       JOIN
    ========================= */

    socket.on(
      'join',
      (userId) => {

        if (!userId)
          return;

        const id =
          String(userId);

        socket.userId =
          id;

        if (
          !onlineUsers.has(
            id
          )
        ) {

          onlineUsers.set(
            id,
            new Set()
          );

        }

        onlineUsers
          .get(id)
          .add(socket.id);

        console.log(
          'JOINED:',
          id,
          socket.id
        );

        io.emit(
          'online_users',
          Array.from(
            onlineUsers.keys()
          )
        );
      }
    );

    /* =========================
       TYPING
    ========================= */

    socket.on(
      'typing',
      (data) => {

        const receivers =
          onlineUsers.get(
            String(
              data.receiverId
            )
          );

        if (receivers) {

          receivers.forEach(
            (id) => {

              io.to(id).emit(
                'typing',
                {
                  senderId:
                    data.senderId,
                }
              );

            }
          );
        }
      }
    );

    socket.on(
      'stop_typing',
      (data) => {

        const receivers =
          onlineUsers.get(
            String(
              data.receiverId
            )
          );

        if (receivers) {

          receivers.forEach(
            (id) => {

              io.to(id).emit(
                'stop_typing',
                {
                  senderId:
                    data.senderId,
                }
              );

            }
          );
        }
      }
    );

    /* =========================
       SEND MESSAGE
    ========================= */

    socket.on(
      'send_message',
      async (data) => {

        try {

          // SAVE MESSAGE

          const message =
            await Message.create(
              {
                sender:
                  data.senderId,
                receiver:
                  data.receiverId,
                content:
                  data.content,
              }
            );

          // POPULATE

          const populatedMessage =
            await Message.findById(
              message._id
            )
              .populate(
                'sender',
                'name profilePhoto'
              )
              .populate(
                'receiver',
                'name profilePhoto'
              );

          // CREATE NOTIFICATION

          try {

            const notificationController =
              require('./controllers/notificationController');

            await notificationController.createNotification(
              {
                ownerId:
                  data.receiverId,
                fromId:
                  data.senderId,
                type:
                  'message',
                content:
                  data.content,
              }
            );

          } catch (e) {

            console.log(
              'notification error',
              e.message
            );

          }

          // RECEIVER SOCKETS

          const receiverSockets =
            onlineUsers.get(
              String(
                data.receiverId
              )
            );

          if (
            receiverSockets
          ) {

            receiverSockets.forEach(
              (id) => {

                io.to(id).emit(
                  'receive_message',
                  populatedMessage
                );

              }
            );
          }

          // SENDER SOCKETS

          const senderSockets =
            onlineUsers.get(
              String(
                data.senderId
              )
            );

          if (
            senderSockets
          ) {

            senderSockets.forEach(
              (id) => {

                // PREVENT DUPLICATE

                if (
                  String(
                    data.receiverId
                  ) ===
                    String(
                      data.senderId
                    ) &&
                  receiverSockets?.has(
                    id
                  )
                ) {

                  return;

                }

                io.to(id).emit(
                  'receive_message',
                  populatedMessage
                );

              }
            );
          }

        } catch (err) {

          console.error(
            'message error:',
            err
          );

        }
      }
    );

    /* =========================
       VIDEO CALL
    ========================= */

    socket.on(
      'call_user',
      async (data) => {

        try {

          const receivers =
            onlineUsers.get(
              String(
                data.to
              )
            );

          if (
            receivers
          ) {

            receivers.forEach(
              (id) => {

                io.to(id).emit(
                  'incoming_call',
                  data
                );

              }
            );

          } else {

            console.log(
              'user offline:',
              data.to
            );

          }

        } catch (err) {

          console.error(err);

        }
      }
    );

    /* =========================
       ANSWER
    ========================= */

    socket.on(
      'make_answer',
      (data) => {

        const receivers =
          onlineUsers.get(
            String(data.to)
          );

        if (receivers) {

          receivers.forEach(
            (id) => {

              io.to(id).emit(
                'answer_made',
                data
              );

            }
          );
        }
      }
    );

    /* =========================
       ICE CANDIDATE
    ========================= */

    socket.on(
      'ice_candidate',
      (data) => {

        const receivers =
          onlineUsers.get(
            String(data.to)
          );

        if (receivers) {

          receivers.forEach(
            (id) => {

              io.to(id).emit(
                'ice_candidate',
                data
              );

            }
          );
        }
      }
    );

    /* =========================
       END CALL
    ========================= */

    socket.on(
      'end_call',
      (data) => {

        const receivers =
          onlineUsers.get(
            String(data.to)
          );

        if (receivers) {

          receivers.forEach(
            (id) => {

              io.to(id).emit(
                'call_ended',
                data
              );

            }
          );
        }
      }
    );

    /* =========================
       SOCKET ERROR
    ========================= */

    socket.on(
      'connect_error',
      (err) => {

        console.log(
          'socket error:',
          err
        );

      }
    );

    /* =========================
       DISCONNECT
    ========================= */

    socket.on(
      'disconnect',
      () => {

        console.log(
          'Disconnected:',
          socket.id
        );

        const userId =
          socket.userId;

        if (
          userId &&
          onlineUsers.has(
            userId
          )
        ) {

          const set =
            onlineUsers.get(
              userId
            );

          set.delete(
            socket.id
          );

          if (
            set.size === 0
          ) {

            onlineUsers.delete(
              userId
            );

          }
        }

        io.emit(
          'online_users',
          Array.from(
            onlineUsers.keys()
          )
        );
      }
    );
  }
);

/* ======================================================
   ROUTES
====================================================== */

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/users',
  userRoutes
);

app.use(
  '/api/messages',
  messageRoutes
);

app.use(
  '/api/notifications',
  notificationRoutes
);

app.use(
  '/api/admin',
  adminRoutes
);

app.use(
  '/api/subscriptions',
  subscriptionRoutes
);

/* ======================================================
   HEALTH
====================================================== */

app.get(
  '/api/health',
  (req, res) => {

    res.json({
      status: 'ok',
    });

  }
);

/* ======================================================
   START SERVER
====================================================== */

const PORT =
  process.env.PORT ||
  5000;

server.listen(
  PORT,
  () => {

    console.log(
      `Server running on ${PORT}`
    );

  }
);