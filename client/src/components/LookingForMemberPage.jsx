import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner, ListGroup, Modal } from 'react-bootstrap';
import TopBar from './TopBar';
import SideDrawer from './SideDrawer';
import '../css/LookingForMember.css';
import { gamesAPI, userAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 5;

const LookingForMemberPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedGame, setSelectedGame] = useState('');
  const [loadingGames, setLoadingGames] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchGames = async () => {
      setLoadingGames(true);
      try {
        const res = await gamesAPI.getAllGames();
        setGames(res.data);
      } catch {
        setError('Failed to load games.');
      } finally {
        setLoadingGames(false);
      }
    };
    fetchGames();
  }, []);

  const handleNav = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGames.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const currentGames = filteredGames.slice(startIndex, startIndex + PAGE_SIZE);

  const handleShowUsers = async (gameName) => {
    // Add to recentGames in localStorage
    let recentGames = JSON.parse(localStorage.getItem('recentGames') || '[]');
    recentGames = [gameName, ...recentGames.filter(g => g !== gameName)].slice(0, 5);
    localStorage.setItem('recentGames', JSON.stringify(recentGames));
    setSelectedGame(gameName);
    setShowUsersModal(true);
    setLoadingUsers(true);
    setError('');
    try {
      const res = await userAPI.getActiveMembers(gameName);
      setActiveUsers(res.data);
    } catch (err) {
      setError('Failed to load active users.');
      if (err.response) {
        console.error('Error response:', err.response);
      } else {
        console.error('Error:', err);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <div className="looking-wrapper">
      <TopBar onMenuClick={() => setDrawerOpen(true)} />
      <SideDrawer show={drawerOpen} handleClose={() => setDrawerOpen(false)} handleNavigate={handleNav} />

      <Container className="mt-4">
        <Form className="mb-4">
          <Form.Control
            type="text"
            placeholder="Search games..."
            className="search-box"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </Form>
        {loadingGames ? (
          <Spinner animation="border" />
        ) : (
          <>
            <Row>
              {currentGames.map((game) => (
                <Col xs={12} key={game._id} className="game-row">
                  <div className="game-icon"></div>
                  <span className="game-title">{game.name}</span>
                  <Button className="member-btn" onClick={() => handleShowUsers(game.name)}>
                    Look for a member
                  </Button>
                </Col>
              ))}
            </Row>
            <div className="pagination-bar">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Back
              </Button>
              <span>Page {page} of {totalPages}</span>
              <Button
                className="member-btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </>
        )}
        <Modal show={showUsersModal} onHide={() => setShowUsersModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Active Members for {selectedGame}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loadingUsers ? (
              <Spinner animation="border" />
            ) : error ? (
              <div className="text-danger">{error}</div>
            ) : (
              <ListGroup>
                {activeUsers.length === 0 && <div>No active users for this game.</div>}
                {activeUsers.filter(u => u._id !== user.id).map((user) => (
                  <ListGroup.Item key={user._id} className="d-flex justify-content-between align-items-center bg-dark text-white">
                    <div>
                      <img src={user.avatar || '/default-avatar.png'} alt={user.name} width={40} height={40} style={{ borderRadius: '50%', marginRight: 10 }} />
                      {user.name} ({user.gamertag})
                    </div>
                    <Button variant="warning" onClick={() => { setShowUsersModal(false); navigate(`/chats/${user._id}`); }}>
                      Chat
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default LookingForMemberPage;
