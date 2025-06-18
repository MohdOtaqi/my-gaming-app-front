import React, { useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white"
    >
      <motion.img
        src="/MOT.png"
        alt="Logo"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="mb-3"
        style={{ width: '100px' }}
      />
      <Spinner animation="border" variant="light" />
      <p className="mt-3">Loading your dashboard...</p>
    </Container>
  );
};

export default SplashScreen;
