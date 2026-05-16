# MERN Dating & Chat Application - Setup & Running Guide

## 🎨 Modern UI Features

This application features:

- **Tailwind CSS** - Utility-first CSS framework for modern, responsive design
- **Framer Motion** - Advanced animations and transitions
- **React Icons** - Beautiful icon library
- **React Hot Toast** - Elegant notifications
- **Gradient backgrounds** - Modern gradient color schemes
- **Smooth animations** - Page transitions and interactive elements
- **Responsive design** - Works perfectly on mobile, tablet, and desktop

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🚀 Installation & Setup

### Step 1: Clone/Navigate to Project

```bash
cd sanjj
```

### Step 2: Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

**Configure `server/.env`:**

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://sanjaybhai:sanjay7543@sanjay.qchcxvg.mongodb.net/sanjay?retryWrites=true&w=majority
JWT_SECRET=secret123
```

### Step 3: Frontend Setup

```bash
cd ../client
npm install
cp .env.example .env
```

**Configure `client/.env`:**

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 4: Start the Application

**Terminal 1 - Backend (from `/server` directory):**

```bash
npm run dev
```

Server will run on `http://localhost:5000`

**Terminal 2 - Frontend (from `/client` directory):**

```bash
npm start
```

Frontend will open at `http://localhost:3000`

## 📁 Project Structure

```
sanjj/
├── server/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── controllers/      # Business logic
│   ├── middleware/      # Auth & custom middleware
│   ├── utils/           # Utilities (JWT, etc)
│   ├── server.js        # Entry point
│   └── package.json
│
├── client/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API client
│   │   ├── context/     # React Context
│   │   ├── App.js       # Main component
│   │   └── index.js     # Entry point
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── README.md
```

## 🎯 Key Features

### Authentication

- User registration with validation
- JWT-based login system
- Protected routes
- Secure password hashing

### Dating Features

- Browse user profiles
- Like/Pass functionality
- Instant match detection
- Match history

### Messaging

- Real-time chat with Socket.IO
- Peer-to-peer video calling
- Message history
- Conversation management
- Online status tracking

### User Profiles

- Upload profile images
- Update bio, interests, and location
- Save preferences and visible profile settings

- Create detailed profiles
- Add interests and preferences
- Set dating preferences
- Update profile information

## 🔐 API Endpoints

### Auth Routes (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update profile (protected)

### User Routes (`/api/users`)

- `GET /browse` - Browse available users (protected)
- `GET /list` - Get all registered users for chat (protected)
- `POST /like` - Like a user (protected)
- `GET /matches` - Get user matches (protected)

### Message Routes (`/api/messages`)

- `POST /send` - Send message (protected)
- `GET /conversation/:userId` - Get conversation (protected)
- `PUT /:messageId/read` - Mark as read (protected)
- `GET /conversations` - Get all conversations (protected)

## 🎨 UI Components

### Pages

- **Home** - Landing page with call-to-action
- **Login** - User login form
- **Register** - User registration form
- **Dashboard** - Main hub with quick links
- **Browse** - Swipe through profiles
- **Matches** - View matches
- **Chat** - Real-time messaging

## 🔧 Environment Variables

### Backend

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

### Frontend

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🚨 Troubleshooting

### MongoDB Connection Issues

- Verify `MONGO_URI` is correct in `.env`
- Check MongoDB Atlas credentials
- Ensure IP address is whitelisted in MongoDB Atlas

### API Connection Issues

- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`
- Verify CORS settings in backend

### Styling Not Loading

- Delete `node_modules` in client: `rm -rf node_modules`
- Reinstall: `npm install`
- Clear browser cache

## 📦 Dependencies Overview

### Backend

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **socket.io** - Real-time communication
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

### Frontend

- **react** - UI library
- **react-router-dom** - Routing
- **axios** - HTTP client
- **framer-motion** - Animations
- **tailwindcss** - Styling
- **react-hot-toast** - Notifications
- **react-icons** - Icons

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Express.js](https://expressjs.com)
- [MongoDB](https://docs.mongodb.com)
- [Socket.IO](https://socket.io/docs/)

## 🤝 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review error messages in console
3. Verify all environment variables are set correctly
4. Ensure all ports (3000, 5000) are available

## 📄 License

This project is licensed under the ISC License.

---

**Happy coding! 🚀**
