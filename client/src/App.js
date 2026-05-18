import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import BrowsePage from './pages/BrowsePage';
import ChatPage from './pages/ChatPage';
import MatchesPage from './pages/MatchesPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import VideoCallPage from './pages/VideoCallPage';
import AdminDashboard from './pages/AdminDashboard';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import './App.css';




const PrivateRoute = ({ children }) => {

  const { token, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  
  return token ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/browse"
        element={
          <PrivateRoute>
            <BrowsePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/video-call/:userId"
        element={
          <PrivateRoute>
            <VideoCallPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/matches"
        element={
          <PrivateRoute>
            <MatchesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <NotificationsPage />
          </PrivateRoute>
        }
      />
      <Route path="/chat/:userId" element={<ChatPage />} />


      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/terms"
        element={
          <PrivateRoute>
            <TermsAndConditionsPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/subscription"
        element={
          <PrivateRoute>
            <SubscriptionPage />
          </PrivateRoute>
        }
      />
    </Routes>

    
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
