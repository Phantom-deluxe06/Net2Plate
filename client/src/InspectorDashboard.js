import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Button, Card, CardContent, CardMedia, Grid, Snackbar, Alert, Divider, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';

const mockOrders = [
  {
    id: 1,
    fishType: 'Red Snapper',
    fisherman: 'John',
    status: 'Pending',
    photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    fishType: 'Salmon',
    fisherman: 'Mike',
    status: 'Inspected',
    photo: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  },
];

export default function InspectorDashboard({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const theme = useTheme();
  const mainRef = React.useRef(null);
  const assignedRef = React.useRef(null);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleMenuClick = (item) => {
    setDrawerOpen(false);
    if (item === 'dashboard') {
      mainRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (item === 'assigned') {
      assignedRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (item === 'notifications') {
      setNotificationsOpen(true);
    } else if (item === 'logout') {
      setLogoutDialogOpen(true);
    }
  };
  const handleNotificationClick = () => setNotificationsOpen(true);
  const handleProfileClick = () => setProfileOpen(true);
  const handleSnackbarClose = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const handleInspect = (fish) => {
    setSnackbar({ open: true, message: `Inspected ${fish}!`, severity: 'success' });
  };
  const handleAccept = (fish) => {
    setSnackbar({ open: true, message: `Accepted ${fish}!`, severity: 'success' });
  };
  const handleReject = (fish) => {
    setSnackbar({ open: true, message: `Rejected ${fish}!`, severity: 'error' });
  };

  return (
    <Box sx={{ bgcolor: '#e3f2fd', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#2e7d32' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <AssignmentIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Net2Plate
          </Typography>
          <Chip label="Inspector" color="primary" sx={{ ml: 2, bgcolor: '#43a047', color: '#fff', fontWeight: 700 }} />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleNotificationClick}>
            <NotificationsIcon />
          </IconButton>
          <Avatar sx={{ ml: 2, bgcolor: '#43a047', color: '#fff', cursor: 'pointer' }} onClick={handleProfileClick}>
            I
          </Avatar>
        </Toolbar>
      </AppBar>
      {/* Drawer Navigation */}
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 240 }} role="presentation">
          <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Chip label="Inspector" color="primary" sx={{ bgcolor: '#43a047', color: '#fff', fontWeight: 700 }} />
          </Box>
          <List>
            <ListItem button onClick={() => handleMenuClick('dashboard')}>
              <ListItemIcon><AssignmentIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => handleMenuClick('assigned')}>
              <ListItemIcon><CatchingPokemonIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Assigned Orders" />
            </ListItem>
            <ListItem button onClick={() => handleMenuClick('notifications')}>
              <ListItemIcon><ListAltIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Inspections" />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => handleMenuClick('logout')}>
              <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box ref={mainRef} sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600, color: '#01579b' }}>
            Welcome, Inspector!
          </Typography>
        </Box>
        <Typography ref={assignedRef} variant="h6" sx={{ mb: 2, color: '#0277bd' }}>
          Assigned Orders
        </Typography>
        <Grid container spacing={3}>
          {mockOrders.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 4, bgcolor: '#e1f5fe' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={item.photo}
                  alt={item.fishType}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#01579b', fontWeight: 600 }}>
                    {item.fishType}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0277bd' }}>
                    Fisherman: {item.fisherman}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0277bd' }}>
                    Status: {item.status}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button variant="contained" color="primary" size="small" sx={{ bgcolor: '#0277bd' }} onClick={() => handleInspect(item.fishType)}>
                      Inspect
                    </Button>
                    <Button variant="outlined" color="success" size="small" onClick={() => handleAccept(item.fishType)}>
                      Accept
                    </Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleReject(item.fishType)}>
                      Reject
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Notifications Modal */}
      <Dialog open={notificationsOpen} onClose={() => setNotificationsOpen(false)}>
        <DialogTitle>Inspection Notifications</DialogTitle>
        <DialogContent>
          <Typography>No new notifications.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Profile Modal */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)}>
        <DialogTitle>Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: '#43a047', width: 56, height: 56, mx: 'auto', mb: 1 }}>I</Avatar>
            <Typography variant="h6">Inspector Name</Typography>
            <Typography variant="body2" color="text.secondary">inspector@email.com</Typography>
          </Box>
          <Typography variant="subtitle2">Role: Inspector</Typography>
          <Typography variant="subtitle2">Inspector ID: INSP789</Typography>
          <Typography variant="subtitle2">Location: City</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for feedback */}
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
      {/* Confirmation Dialog for Logout */}
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
    </Box>
  );
}
