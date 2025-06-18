import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Form,
  Image,
  Button,
  Row,
  Col,
  Alert
} from 'react-bootstrap';
import SideDrawer from './SideDrawer';
import TopBar from './TopBar';
import '../css/profile.css';
import { userAPI } from '../services/api';

const defaultProfile = {
  name: '',
  description: '',
  gamertag: '',
  discord: '',
  platforms: { ps: false, xbox: false, pc: false },
  favoriteGames: '',
  avatar: '',
};

const ProfilePage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const realId = !id || id === "undefined" ? undefined : id;
  const [profileImage, setProfileImage] = useState('');
  const [profileData, setProfileData] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnProfile = !id || id === loggedInUser.id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        let res;
        if (realId) {
          res = await userAPI.getUserById(realId);
        } else {
          res = await userAPI.getProfile();
        }
        const user = res.data;
        setProfileData({
          name: user.name || '',
          description: user.description || '',
          gamertag: user.gamertag || '',
          discord: user.discord || '',
          platforms: {
            ps: user.platforms?.includes('ps') || false,
            xbox: user.platforms?.includes('xbox') || false,
            pc: user.platforms?.includes('pc') || false,
          },
          favoriteGames: user.favoriteGames?.[0] || '',
          avatar: user.avatar || '',
        });
        setProfileImage(user.avatar || '');
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [realId]);

  const togglePlatform = (platform) => {
    setProfileData((prev) => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: !prev.platforms[platform],
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setProfileData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Convert platforms object to array
      const platformsArr = Object.entries(profileData.platforms)
        .filter(([_, checked]) => checked)
        .map(([platform]) => platform);
      const payload = {
        ...profileData,
        platforms: platformsArr,
        favoriteGames: profileData.favoriteGames ? [profileData.favoriteGames] : [],
        avatar: profileImage,
      };
      await userAPI.updateProfile(payload);
      setSuccess('Profile saved!');
    } catch (err) {
      setError('Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleNav = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <div className="profile-wrapper bg-dark text-white">
      <TopBar onMenuClick={() => setDrawerOpen(true)} />
      <SideDrawer show={drawerOpen} handleClose={() => setDrawerOpen(false)} handleNavigate={handleNav} />

      <Container className="text-center py-4 mt-3">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="position-relative d-inline-block mb-3">
              <Image src={profileImage || '/default-avatar.png'} roundedCircle fluid className="profile-picture mb-2 border border-warning" />
              {isOwnProfile && (
                <>
                  <Form.Control type="file" accept="image/*" onChange={handleImageChange} className="form-control-file mt-2" />
                  <p className="change-text mt-1">Change Profile Picture</p>
                </>
              )}
            </div>

            {isOwnProfile ? (
              <Form className="text-start w-100" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control type="text" value={profileData.description} onChange={(e) => setProfileData({ ...profileData, description: e.target.value })} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Gamer Tag</Form.Label>
                  <Form.Control type="text" value={profileData.gamertag} onChange={(e) => setProfileData({ ...profileData, gamertag: e.target.value })} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Discord</Form.Label>
                  <Form.Control type="text" value={profileData.discord} onChange={(e) => setProfileData({ ...profileData, discord: e.target.value })} />
                </Form.Group>

                <div className="platform-section mb-4">
                  <Form.Label>Platforms</Form.Label>
                  <Row className="justify-content-center mt-2">
                    {['ps', 'xbox', 'pc'].map((platform) => (
                      <Col key={platform} xs="auto" className="text-center">
                        <img src={`/${platform}.png`} alt={platform} height={40} className="mb-1" />
                        <Form.Check
                          type="checkbox"
                          checked={profileData.platforms[platform]}
                          onChange={() => togglePlatform(platform)}
                          className="text-warning"
                        />
                      </Col>
                    ))}
                  </Row>
                </div>

                <Form.Group className="mb-4">
                  <Form.Label>Favorite Games</Form.Label>
                  <Form.Select value={profileData.favoriteGames} onChange={(e) => setProfileData({ ...profileData, favoriteGames: e.target.value })}>
                    <option value="">Select favorite games</option>
                    <option>FIFA</option>
                    <option>Valorant</option>
                    <option>League of Legends</option>
                    <option>Minecraft</option>
                  </Form.Select>
                </Form.Group>

                <div className="text-center">
                  <Button variant="warning" className="px-5 py-2 fw-bold rounded-pill" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </Form>
            ) : (
              <div className="profile-readonly text-start w-100" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="mb-3"><strong>Name:</strong> {profileData.name}</div>
                <div className="mb-3"><strong>Description:</strong> {profileData.description}</div>
                <div className="mb-3"><strong>Gamer Tag:</strong> {profileData.gamertag}</div>
                <div className="mb-3"><strong>Discord:</strong> {profileData.discord}</div>
                <div className="mb-3">
                  <strong>Platforms:</strong> {Object.entries(profileData.platforms).filter(([_, checked]) => checked).map(([platform]) => platform.toUpperCase()).join(', ') || 'None'}
                </div>
                <div className="mb-3">
                  <strong>Favorite Games:</strong> {profileData.favoriteGames || 'None'}
                </div>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default ProfilePage;
