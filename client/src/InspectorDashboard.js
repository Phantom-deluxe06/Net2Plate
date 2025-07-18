import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Button, Card, CardContent, CardMedia, Grid, Snackbar, Alert, Divider, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, Chip, CircularProgress, Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate } from 'react-router-dom';

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

const IMGBB_API_KEY = '3a3b4f7326b95706e68ed90e472dbd31';
const ROBOFLOW_API_URL = 'http://localhost:9001/infer/workflows/net2plate/detect-count-and-visualize-2';
const ROBOFLOW_API_KEY = 'uJymOgEeq9wJEyyqSsRa';

export default function InspectorDashboard({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');
  const [showJson, setShowJson] = useState(false);
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
  const navigate = useNavigate();
  const handleProfileClick = () => navigate('/inspector/profile');
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

  // AI photo upload and analysis handler
  const handleAiPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAiLoading(true);
    setAiError('');
    setAiResult(null);
    try {
      // 1. Upload to imgbb
      const formData = new FormData();
      formData.append('image', file);
      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });
      const imgbbData = await imgbbRes.json();
      if (!imgbbData.success) throw new Error('Image upload failed');
      const imageUrl = imgbbData.data.url;
      // 2. Send to Roboflow serverless endpoint
      const response = await fetch('https://serverless.roboflow.com/infer/workflows/net2plate-rwp4m/detect-count-and-visualize-3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: 'hI0kL1gwkIQzn6lJlX9R',
          inputs: {
            "image": { "type": "url", "value": imageUrl }
          }
        })
      });
      const result = await response.json();
      setAiResult(result);
      console.log(result);
    } catch (err) {
      setAiError('AI analysis failed. Please try again.');
    }
    setAiLoading(false);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'url(https://source.unsplash.com/random?underwater)', 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <AppBar position="static" sx={{ background: 'rgba(46, 125, 50, 0.8)', backdropFilter: 'blur(10px)' }}>
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
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle} sx={{ '& .MuiDrawer-paper': { background: 'rgba(232, 245, 233, 0.8)', backdropFilter: 'blur(10px)' } }}>
        <Box sx={{ width: 240 }} role="presentation">
          <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(67, 160, 71, 0.2)' }}>
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
      <Box ref={mainRef} sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600, color: '#fff' }}>
            Welcome, Inspector!
          </Typography>
        </Box>
        <Typography ref={assignedRef} variant="h6" sx={{ mb: 2, color: '#fff' }}>
          Assigned Orders
        </Typography>
        <Grid container spacing={3}>
          {mockOrders.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 4, background: 'rgba(225, 245, 254, 0.8)', backdropFilter: 'blur(10px)' }}>
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
        <Box sx={{ mb: 4, mt: 2, p: 2, background: 'rgba(241, 248, 233, 0.8)', backdropFilter: 'blur(10px)', borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2 }}>
            On-Spot AI Freshness Analysis
          </Typography>
          <Button variant="contained" component="label" color="success" sx={{ mb: 2 }}>
            Upload Inspection Photo
            <input type="file" accept="image/*" hidden onChange={handleAiPhotoUpload} />
          </Button>
          {aiLoading && <Box sx={{ mt: 2 }}><CircularProgress /></Box>}
          {aiError && <Typography color="error" sx={{ mt: 2 }}>{aiError}</Typography>}
          {aiResult && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ color: '#388e3c' }}>AI Result:</Typography>
              {(() => {
                let summary = 'No prediction';
                let score = null;
                let predictions = [];
                if (aiResult) {
                  if (Array.isArray(aiResult.outputs) && aiResult.outputs.length > 0) {
                    const output = aiResult.outputs[0];
                    if (output.predictions && Array.isArray(output.predictions.predictions)) {
                      predictions = output.predictions.predictions;
                    }
                  } else if (Array.isArray(aiResult.predictions)) {
                    predictions = aiResult.predictions;
                  } else if (aiResult.predictions && Array.isArray(aiResult.predictions.predictions)) {
                    predictions = aiResult.predictions.predictions;
                  } else if (Array.isArray(aiResult.objects)) {
                    predictions = aiResult.objects;
                  }
                }
                if (predictions.length > 0) {
                  const pred = predictions[0];
                  summary = pred.class || pred.label || 'Unknown';
                  score = pred.confidence || pred.score || null;
                }
                return (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ color: summary.toLowerCase().includes('fresh') ? '#388e3c' : '#d32f2f', fontWeight: 700 }}>
                      AI says: {summary}{score !== null ? ` (Confidence: ${(score * 100).toFixed(1)}%)` : ''}
                    </Typography>
                  </Box>
                );
              })()}
              <Button size="small" onClick={() => setShowJson(v => !v)} startIcon={showJson ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ mb: 1 }}>
                {showJson ? 'Hide Details' : 'Show Full AI JSON'}
              </Button>
              <Collapse in={showJson}>
                <pre style={{ background: 'rgba(232, 245, 233, 0.8)', padding: 10, borderRadius: 6, fontSize: 14, overflowX: 'auto' }}>{JSON.stringify(aiResult, null, 2)}</pre>
              </Collapse>
            </Box>
          )}
        </Box>
      </Box>
      <Dialog open={notificationsOpen} onClose={() => setNotificationsOpen(false)}>
        <DialogTitle>Inspection Notifications</DialogTitle>
        <DialogContent>
          <Typography>No new notifications.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
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
