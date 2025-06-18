import React from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import TopBar from './TopBar';
import SideDrawer from './SideDrawer';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <div className="dashboard-wrapper bg-dark text-white" style={{ minHeight: '100vh' }}>
      <TopBar onMenuClick={() => setDrawerOpen(true)} />
      <SideDrawer show={drawerOpen} handleClose={() => setDrawerOpen(false)} handleNavigate={navigate} />
      <Container className="py-5">
        <h2 className="mb-4 text-warning">Admin Dashboard</h2>
        <Row className="g-4 justify-content-center">
          <Col xs={12} md={6} lg={4}>
            <Card className="bg-secondary text-white h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <Card.Title>Manage Games</Card.Title>
                <Card.Text>View, add, or delete games in the system.</Card.Text>
                <Button variant="warning" onClick={() => navigate('/admin/games')}>
                  Go to Manage Games
                </Button>
              </Card.Body>
            </Card>
          </Col>
          {/* Add more admin features here as needed */}
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard; 