# 💕 MERN Dating & Chat Application

A modern, full-stack web application for dating and real-time chatting built with **MERN** stack, featuring beautiful animations and a sleek UI.

## ✨ Features

### 🎨 Modern UI/UX

- **Tailwind CSS** - Utility-first responsive design
- **Framer Motion** - Smooth animations and transitions
- **React Icons** - Beautiful icon library
- **React Hot Toast** - Elegant notifications
- **Gradient backgrounds** - Modern color schemes
- **Mobile responsive** - Perfect on all devices

### 👥 Dating Features

- User registration and authentication
- Upload profile photos and create a visible public profile
- Browse user profiles with detailed information
- Like/Pass functionality with instant match detection
- View all matches
- User preferences and filtering

### 💬 Real-time Messaging & Video

- Socket.IO integration for live chat
- Message history
- Conversation management
- Peer-to-peer video calling
- Online/offline status tracking

### 🔐 Security

- JWT authentication
- Password hashing with bcrypt
- Protected routes
- Secure API endpoints

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend

- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **React Icons** - Icons
- **React Hot Toast** - Notifications

## 📁 Project Structure

```
sanjj/
├── server/
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── controllers/      # Business logic
│   ├── middleware/      # Auth middleware
│   ├── utils/           # JWT utilities
│   ├── server.js        # Entry point
│   └── package.json
│
├── client/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client
│   │   ├── context/     # Auth context
│   │   └── index.js
│   ├── tailwind.config.js
│   └── package.json
│
├── SETUP.md             # Detailed setup guide
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js v14+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and navigate:**

```bash
cd sanjj
```

2. **Backend setup:**

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

3. **Frontend setup (in new terminal):**

```bash
cd client
npm install
npm start
```

App runs at `http://localhost:3000`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Users

- `GET /api/users/browse` - Browse profiles
- `GET /api/users/list` - Get all registered users for chat
- `POST /api/users/like` - Like a user
- `GET /api/users/matches` - Get matches

### Messages

- `POST /api/messages/send` - Send message
- `GET /api/messages/conversation/:userId` - Get chat history
- `GET /api/messages/conversations` - Get all conversations

## 🎨 Pages

- **Home** - Landing page with animations
- **Register** - User registration with validation
- **Login** - User login form
- **Dashboard** - Main navigation hub
- **Browse** - Swipe through profiles
- **Matches** - View matched users
- **Chat** - Real-time messaging and video calls

## 🔧 Configuration

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/db
JWT_SECRET=your_secret_key
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 📖 Documentation

See [SETUP.md](SETUP.md) for detailed setup and troubleshooting

## 🎨 Design Features

- Gradient backgrounds (purple, pink, blue)
- Smooth animations with Framer Motion
- Toast notifications for feedback
- Responsive grid layouts
- Hover and tap interactions
- Animated loading states

## 📝 License

ISC License

---

**Built with ❤️ using MERN stack** 🚀
"# Sanjay_chat-date" 
