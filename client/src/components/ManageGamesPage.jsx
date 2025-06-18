import React, { useEffect, useState } from 'react';
import { Container, Button, Form, ListGroup, Spinner, Row, Col, Modal } from 'react-bootstrap';
import TopBar from './TopBar';
import SideDrawer from './SideDrawer';
import { gamesAPI } from '../services/api';

const ManageGamesPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newGame, setNewGame] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState('');
  const [newGameImage, setNewGameImage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await gamesAPI.getAllGames();
      setGames(res.data);
    } catch {
      setError('Failed to load games.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewGameImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    if (!newGame.trim()) return;
    setAdding(true);
    setError('');
    try {
      await gamesAPI.createGame({ name: newGame, imageUrl: newGameImage });
      setNewGame('');
      setNewGameImage('');
      fetchGames();
    } catch {
      setError('Failed to add game.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteClick = (id) => {
    setGameToDelete(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    if (gameToDelete) {
      await handleDeleteGame(gameToDelete);
      setGameToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setGameToDelete(null);
  };

  const handleDeleteGame = async (id) => {
    setDeleting(id);
    setError('');
    try {
      await gamesAPI.deleteGame(id);
      fetchGames();
    } catch {
      setError('Failed to delete game.');
    } finally {
      setDeleting('');
    }
  };

  return (
    <div className="dashboard-wrapper bg-dark text-white" style={{ minHeight: '100vh' }}>
      <TopBar onMenuClick={() => setDrawerOpen(true)} />
      <SideDrawer show={drawerOpen} handleClose={() => setDrawerOpen(false)} handleNavigate={() => {}} />
      <Container className="py-5">
        <h2 className="mb-4 text-warning">Manage Games</h2>
        <Form onSubmit={handleAddGame} className="mb-4 d-flex align-items-center">
          <Form.Control
            type="text"
            placeholder="New game name"
            value={newGame}
            onChange={e => setNewGame(e.target.value)}
            className="me-2"
          />
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="me-2"
            style={{ maxWidth: 200 }}
          />
          <Button type="submit" variant="warning" disabled={adding}>
            {adding ? 'Adding...' : 'Add Game'}
          </Button>
        </Form>
        {error && <div className="text-danger mb-3">{error}</div>}
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <ListGroup>
            {games.map(game => (
              <ListGroup.Item key={game._id} className="d-flex justify-content-between align-items-center bg-dark text-white">
                <span>
                  {game.imageUrl && (
                    <img src={game.imageUrl} alt={game.name} style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 10, borderRadius: 6 }} />
                  )}
                  {game.name}
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(game._id)}
                  disabled={deleting === game._id}
                >
                  {deleting === game._id ? 'Deleting...' : 'Delete'}
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Container>
      {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={handleCancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this game?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageGamesPage; 