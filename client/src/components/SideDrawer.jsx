import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  IconButton,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import '../css/sidedrawer.css';

const drawerWidth = 240;

const SideDrawer = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isAdmin = user.role === 'admin';

  const adminMenuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/admin' },
  ];

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Chats', icon: <ChatIcon />, path: '/chats' },
    { text: 'Looking for Member', icon: <GroupAddIcon />, path: '/looking-for-member' },
  ];

  const handleToggleDrawer = () => {
    setOpen(prev => !prev); // 🔁 Toggle drawer open/close
  };

  const handleNavigate = (path) => {
    setTimeout(() => {
      setOpen(false);
      navigate(path);
    }, 100);
  };

  const handleSignOut = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/auth');
  };

  return (
    <>
      {/* Hamburger menu toggle */}
      <IconButton
        color="inherit"
        aria-label="toggle drawer"
        onClick={handleToggleDrawer}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1400,
          backgroundColor: '#222',
          p: 1,
          '&:hover': { backgroundColor: '#333' }
        }}
      >
        <MenuIcon sx={{ color: '#ffc107' }} />
      </IconButton>

      {/* Drawer panel */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#111',
            color: '#fff',
          }
        }}
      >
        <Toolbar /> {/* ⛔ Removed Gaming App Title */}
        <Divider />
        <List>
          {(isAdmin ? adminMenuItems : menuItems).map(({ text, icon, path }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={() => handleNavigate(path)}>
                <ListItemIcon className="drawer-icon">{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleSignOut}>
              <ListItemIcon className="drawer-icon">
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default SideDrawer;
