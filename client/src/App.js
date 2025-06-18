import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SplashScreen from './components/SplashScreen';
import NewsDashboard from './components/NewsDashboard';
import ProfilePage from './components/ProfilePage';
import LookingForMemberPage from './components/LookingForMemberPage';
import AuthPage from './components/Auth';
import ChatListPage from './components/ChatListPage';
import ChatScreen from './components/ChatScreen';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatInterface from './components/ChatInterface';
import AdminDashboard from './components/AdminDashboard';
import ManageGamesPage from './components/ManageGamesPage';

function ProtectedRoute({ children }) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setLoading(false);
  }, []);
  const token = localStorage.getItem('token');
  console.log('ProtectedRoute token:', token);
  if (loading) return null; // or a spinner
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function RoleRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (user && user.role === 'user') {
    return <Navigate to="/dashboard" replace />;
  }
  return <SplashScreen />;
}

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <NewsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/looking-for-member"
          element={
            <ProtectedRoute>
              <LookingForMemberPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<SplashScreen />} />         {/* Fallback */}
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <ChatListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats/:username"
          element={
            <ProtectedRoute>
              <ChatScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatsi"
          element={
            <ProtectedRoute>
              <ChatInterface />
            </ProtectedRoute>
          }
        />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/games"
            element={
              <ProtectedRoute>
              <AdminRoute>
                <ManageGamesPage />
              </AdminRoute>
              </ProtectedRoute>
            }
          />
      </Routes>
    </Router>
  );
}

export default App;
