import React, { useState } from 'react';
import {
  Tabs,
  Tab,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import '../css/Auth.css';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirm: '',
    gamertag: '',
    description: '',
    favoriteGames: [],
    platforms: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login(loginData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirm) {
      setError("Passwords don't match");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { confirm, ...signupDataWithoutConfirm } = signupData;
      const response = await authAPI.register(signupDataWithoutConfirm);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-wrapper">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Paper elevation={6} className="auth-card">
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            textColor="inherit"
            indicatorColor="secondary"
            variant="fullWidth"
            className="auth-tabs"
          >
            <Tab label="Login" value="login" />
            <Tab label="Sign Up" value="signup" />
          </Tabs>

          {error && (
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            </Snackbar>
          )}

          {activeTab === 'login' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Box component="form" mt={3} onSubmit={handleLogin}>
                <TextField
                  label="Email"
                  variant="filled"
                  fullWidth
                  type="email"
                  margin="normal"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="auth-input"
                  required
                />
                <TextField
                  label="Password"
                  variant="filled"
                  fullWidth
                  type="password"
                  margin="normal"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="auth-input"
                  required
                />

                <div className="forgot-password-container">
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => alert('Reset password functionality coming soon.')}
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  className="auth-button login"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Box>
            </motion.div>
          )}

          {activeTab === 'signup' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Box component="form" mt={3} onSubmit={handleSignup}>
                <TextField
                  label="Full Name"
                  variant="filled"
                  fullWidth
                  margin="normal"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  className="auth-input"
                  required
                />
                <TextField
                  label="Email"
                  variant="filled"
                  fullWidth
                  type="email"
                  margin="normal"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="auth-input"
                  required
                />
                <TextField
                  label="Gamertag"
                  variant="filled"
                  fullWidth
                  margin="normal"
                  value={signupData.gamertag}
                  onChange={(e) => setSignupData({ ...signupData, gamertag: e.target.value })}
                  className="auth-input"
                />
                <TextField
                  label="Password"
                  variant="filled"
                  fullWidth
                  type="password"
                  margin="normal"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="auth-input"
                  required
                />
                <TextField
                  label="Confirm Password"
                  variant="filled"
                  fullWidth
                  type="password"
                  margin="normal"
                  value={signupData.confirm}
                  onChange={(e) => setSignupData({ ...signupData, confirm: e.target.value })}
                  className="auth-input"
                  required
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  className="auth-button signup"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </Box>
            </motion.div>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default AuthPage;
