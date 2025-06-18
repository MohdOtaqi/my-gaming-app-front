import React from 'react';
import { Container } from 'react-bootstrap';
import '../css/TopBar.css';

const TopBar = () => {
  return (
    <div className="topbar-wrapper">
      <Container fluid className="d-flex align-items-center justify-content-center">
        <img src="/MOT.png" alt="App Logo" className="topbar-logo mx-auto" />
      </Container>
    </div>
  );
};

export default TopBar;
