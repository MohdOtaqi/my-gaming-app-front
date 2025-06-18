import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Button,
  Row,
  Col,
  Carousel,
  Modal,
  Form
} from 'react-bootstrap';
import SideDrawer from './SideDrawer';
import TopBar from './TopBar';
import '../css/NewsDashboard.css';
import { userAPI, gamesAPI } from '../services/api';

const NewsDashboard = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [activeLoading, setActiveLoading] = useState(false);
  const [activeError, setActiveError] = useState('');
  const [showGameModal, setShowGameModal] = useState(false);
  const [games, setGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch games on mount or when location changes
    const fetchGames = async () => {
      try {
        const res = await gamesAPI.getAllGames();
        setGames(res.data);
      } catch {
        setActiveError('Failed to load games.');
      }
    };
    fetchGames();
    // Fetch user profile to get active games
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getProfile();
        setUserProfile(res.data);
        setIsActive(res.data.isActive);
        setSelectedGames(res.data.activeGames || (res.data.activeGame ? [res.data.activeGame] : []));
      } catch {}
    };
    fetchProfile();
  }, [location]);

  const handleNav = (path) => {
    navigate(path);
    setShowDrawer(false);
  };

  const handleActiveToggle = async () => {
    setActiveError('');
    if (!isActive) {
      // Going active: allow selecting a game from the grid
      setSelectedGames([]);
    } else {
      // Going inactive
      setActiveLoading(true);
      try {
        await userAPI.setInactive();
        setIsActive(false);
        setSelectedGames([]);
        setUserProfile((prev) => prev ? { ...prev, isActive: false, activeGames: [] } : prev);
      } catch (err) {
        setActiveError('Failed to update active status.');
      } finally {
        setActiveLoading(false);
      }
    }
  };

  const handleGameBoxClick = async (gameName) => {
    let newSelectedGames;
    if (selectedGames.includes(gameName)) {
      // Deactivate this game
      newSelectedGames = selectedGames.filter(g => g !== gameName);
    } else {
      // Activate this game
      newSelectedGames = [...selectedGames, gameName];
    }
    setSelectedGames(newSelectedGames);
    setActiveLoading(true);
    setActiveError('');
    try {
      if (newSelectedGames.length === 0) {
        await userAPI.setInactive();
        setIsActive(false);
        setUserProfile((prev) => prev ? { ...prev, isActive: false, activeGames: [] } : prev);
      } else {
        await userAPI.setActive(newSelectedGames); // Update backend with all active games
      setIsActive(true);
        setUserProfile((prev) => prev ? { ...prev, isActive: true, activeGames: newSelectedGames } : prev);
      }
    } catch (err) {
      setActiveError('Failed to update active games.');
    } finally {
      setActiveLoading(false);
    }
  };

  // Get recent games from localStorage and match with games list
  const recentGameNames = JSON.parse(localStorage.getItem('recentGames') || '[]');
  const recentGames = games.filter(g => recentGameNames.includes(g.name));

  return (
    <div className="dashboard-wrapper">
      <TopBar onMenuClick={() => setShowDrawer(true)} />
      <SideDrawer show={showDrawer} handleClose={() => setShowDrawer(false)} handleNavigate={handleNav} />

      <Container className="text-center dashboard-container mt-4">
        <Carousel variant="dark" className="mb-5 custom-carousel">
          <Carousel.Item>
            <img className="d-block w-100 news-image" src="Riot.avif" alt="Riot podcast" />
            <Carousel.Caption className="carousel-caption-custom">
              <h5>Riot cancels podcast episode amid LCS walkout</h5>
              <a href="https://www.dexerto.com/league-of-legends/riot-cancels-podcast-episode-with-executive-amid-lcs-walkout-talks-2164548/" target="_blank" rel="noopener noreferrer">
                <Button className="dashboard-button mt-2">Read More</Button>
              </a>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item>
            <img className="d-block w-100 news-image" src="R9.webp" alt="Resident Evil 9" />
            <Carousel.Caption className="carousel-caption-custom">
              <h5>Resident Evil Requiem: Everything we know</h5>
              <a href="https://www.gamesradar.com/resident-evil-9-requiem/" target="_blank" rel="noopener noreferrer">
                <Button className="dashboard-button mt-2">Read More</Button>
              </a>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>

        <div className="mb-4">
          <h4 className="dashboard-subtitle">Recent Games</h4>
          {recentGames.length === 0 ? (
          <p className="text-secondary">No recent games</p>
          ) : (
            <div className="dashboard-grid mb-3" style={{ maxWidth: 500, margin: '0 auto' }}>
              {recentGames.map(game => (
                <div key={game._id} className="dashboard-box" style={{ cursor: 'default' }}>
                  {game.imageUrl && (
                    <img
                      src={game.imageUrl}
                      alt={game.name}
                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                    />
                  )}
                  <span>{game.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Row className="justify-content-center mb-4 g-2">
          {/* <Col xs="auto">
            <Button className="dashboard-button">Look For a Team</Button>
          </Col> */}
          <Col xs="auto">
            <Button
              className="dashboard-button"
              onClick={() => navigate('/looking-for-member')} // ✅ Add this
            >
              Look For a Member
            </Button>
          </Col>
        </Row>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <span className="fw-semibold">Active</span>
          <div className="form-check form-switch">
            <input
              className="form-check-input bg-dark"
              type="checkbox"
              checked={isActive}
              onChange={handleActiveToggle}
            />
          </div>
          {activeError && <div className="text-danger ms-2">{activeError}</div>}
        </div>

        {/* Add instruction text */}
        <div className="mb-2" style={{ color: '#FFD700', fontWeight: 'bold' }}>
          Select the games you want to be active in.
        </div>
        {/* Always show the grid, highlight all active games */}
        <div className="dashboard-grid mb-5">
          {games.map((game) => (
            <div
              key={game._id}
              className={`dashboard-box${selectedGames.includes(game.name) ? ' active' : ''}`}
              onClick={() => handleGameBoxClick(game.name)}
              style={{ cursor: 'pointer' }}
            >
              {game.imageUrl && (
                <img
                  src={game.imageUrl}
                  alt={game.name}
                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                />
              )}
              <span>{game.name}</span>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default NewsDashboard;
