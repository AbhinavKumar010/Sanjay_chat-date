# GitHub Copilot Customization Instructions

This is a MERN (MongoDB, Express, React, Node.js) full-stack application for dating and real-time chatting.

## Project Structure

- `/server` - Node.js/Express backend with MongoDB
- `/client` - React frontend application

## Technology Stack

- **Backend**: Node.js, Express, MongoDB, Socket.IO, JWT
- **Frontend**: React, React Router, Axios, Socket.IO Client

## Key Features

- User authentication with JWT
- Real-time messaging with Socket.IO
- Dating matching system
- User profiles and search
- Online status tracking

## Development

### Backend

- Located in `/server`
- Start with: `cd server && npm run dev`
- Runs on port 5000
- Uses MongoDB for data storage

### Frontend

- Located in `/client`
- Start with: `cd client && npm start`
- Runs on port 3000
- Built with React 18

## Environment Setup

1. Configure MongoDB URI in `server/.env`
2. Set JWT_SECRET in `server/.env`
3. Update API URLs in `client/.env`

## API Integration

- Backend API runs on `http://localhost:5000/api`
- Frontend connects via Axios with JWT authentication
- Socket.IO enables real-time features
