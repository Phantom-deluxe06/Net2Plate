import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Avatar, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, useTheme, Button, Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import { Outlet, useNavigate } from 'react-router-dom';

export default function CustomerDashboard({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleMenuClick = (item) => {
    setDrawerOpen(false);
    if (item === 'dashboard') {
      navigate('/customer');
    } else if (item === 'browse') {
      navigate('/customer/browse');
    } else if (item === 'orders') {
      setOrdersOpen(true);
    } else if (item === 'logout') {
      setLogoutDialogOpen(true);
    }
  };
  const handleNotificationClick = () => setOrdersOpen(true);
  const handleProfileClick = () => navigate('/customer/profile');
  const handleSnackbarClose = () => setSnackbar((prev) => ({ ...prev, open: false }));

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'url(https://source.unsplash.com/random?fish)', 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <AppBar position="static" sx={{ background: 'rgba(0, 131, 143, 0.8)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <ShoppingCartIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Net2Plate
          </Typography>
          <Chip label="Customer" color="primary" sx={{ ml: 2, bgcolor: '#00bcd4', color: '#fff', fontWeight: 700 }} />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleNotificationClick}>
            <NotificationsIcon />
          </IconButton>
          <Avatar sx={{ ml: 2, bgcolor: '#00bcd4', color: '#fff', cursor: 'pointer' }} onClick={handleProfileClick}>
            C
          </Avatar>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle} sx={{ '& .MuiDrawer-paper': { background: 'rgba(224, 247, 250, 0.8)', backdropFilter: 'blur(10px)' } }}>
        <Box sx={{ width: 240 }} role="presentation">
          <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(0, 188, 212, 0.2)' }}>
            <Chip label="Customer" color="primary" sx={{ bgcolor: '#00bcd4', color: '#fff', fontWeight: 700 }} />
          </Box>
          <List>
            <ListItem button onClick={() => handleMenuClick('dashboard')}>
              <ListItemIcon><ShoppingCartIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => handleMenuClick('browse')}>
              <ListItemIcon><CatchingPokemonIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Browse Fish" />
            </ListItem>
            <ListItem button onClick={() => handleMenuClick('orders')}>
              <ListItemIcon><ListAltIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => handleMenuClick('logout')}>
              <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Dialog open={ordersOpen} onClose={() => setOrdersOpen(false)}>
        <DialogTitle>My Orders</DialogTitle>
        <DialogContent>
          <Typography>Order details go here (move logic to new page/component if needed).</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrdersOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)}>
        <DialogTitle>Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: '#00bcd4', width: 56, height: 56, mx: 'auto', mb: 1 }}>C</Avatar>
            <Typography variant="h6">Customer Name</Typography>
            <Typography variant="body2" color="text.secondary">customer@email.com</Typography>
          </Box>
          <Typography variant="subtitle2">Role: Customer</Typography>
          <Typography variant="subtitle2">Customer ID: CUST456</Typography>
          <Typography variant="subtitle2">Location: City</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={() => { setLogoutDialogOpen(false); if (onLogout) onLogout(); }}>Logout</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
