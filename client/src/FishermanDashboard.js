import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  Divider,
  Avatar,
  Fab,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FishingIcon from '@mui/icons-material/Anchor';
import { db } from './firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';

const mockCatches = [
  {
    id: 1,
    fishType: 'Red Snapper',
    weight: 5,
    price: 20,
    freshness: ['Clear Eyes', 'Firm Flesh'],
    photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    status: 'Available',
    fishermanEmail: 'fisherman1@email.com',
  },
  {
    id: 2,
    fishType: 'Salmon',
    weight: 3,
    price: 25,
    freshness: ['Bright Scales', 'Mild Smell'],
    photo: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    status: 'Ordered',
    fishermanEmail: 'fisherman2@email.com',
  },
];

const freshnessOptions = [
  'Clear Eyes',
  'Bright Scales',
  'Firm Flesh',
  'Mild Smell',
  'Red Gills',
];

export default function FishermanDashboard({ onLogout, user }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [catchForm, setCatchForm] = useState({
    fishType: '',
    weight: '',
    price: '',
    freshness: [],
    photos: [], // array of image URLs
    photoFiles: [], // array of File objects
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [catchToEdit, setCatchToEdit] = useState(null);
  const [catchToDelete, setCatchToDelete] = useState(null);
  const [myCatches, setMyCatches] = useState([]);
  const [loadingCatches, setLoadingCatches] = useState(true);

  // Refs for scrolling
  const mainRef = React.useRef(null);
  const catchesRef = React.useRef(null);

  // Mock orders
  const mockOrders = [
    { id: 1, customer: 'Alice', fish: 'Red Snapper', status: 'Pending Inspection' },
    { id: 2, customer: 'Bob', fish: 'Salmon', status: 'Delivered' },
  ];

  const theme = useTheme();

  useEffect(() => {
    if (!user?.email) return;
    setLoadingCatches(true);
    const q = query(collection(db, 'catches'), where('fishermanEmail', '==', user.email));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const catchesArr = [];
      querySnapshot.forEach((doc) => {
        catchesArr.push({ id: doc.id, ...doc.data() });
      });
      setMyCatches(catchesArr);
      setLoadingCatches(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleUploadOpen = () => setUploadOpen(true);
  const handleUploadClose = () => setUploadOpen(false);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'freshness') {
      setCatchForm((prev) => ({
        ...prev,
        freshness: checked
          ? [...prev.freshness, value]
          : prev.freshness.filter((item) => item !== value),
      }));
    } else if (name === 'photos') {
      const files = Array.from(e.target.files);
      setCatchForm(prev => ({ ...prev, photoFiles: files }));
      // For preview, use FileReader for each file
      Promise.all(files.map(file => new Promise(res => {
        const reader = new FileReader();
        reader.onload = ev => res(ev.target.result);
        reader.readAsDataURL(file);
      }))).then(urls => setCatchForm(prev => ({ ...prev, photos: urls })));
    } else {
      setCatchForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'catches'), {
        fishType: catchForm.fishType,
        weight: catchForm.weight,
        price: catchForm.price,
        freshness: catchForm.freshness,
        photos: catchForm.photos, // array of URLs
        status: 'Available',
        fishermanEmail: user?.email || 'unknown',
        createdAt: new Date(),
      });
      setSnackbar({ open: true, message: 'Catch uploaded successfully!', severity: 'success' });
      setCatchForm({ fishType: '', weight: '', price: '', freshness: [], photos: [], photoFiles: [] });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error uploading catch', severity: 'error' });
    }
    setLoading(false);
    setUploadOpen(false);
  };

  const handleSnackbarClose = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // Handlers for navigation
  const handleMenuClick = (item) => {
    setDrawerOpen(false);
    if (item === 'dashboard') {
      mainRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (item === 'catches') {
      catchesRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (item === 'orders') {
      setOrdersOpen(true);
    } else if (item === 'logout') {
      setLogoutDialogOpen(true);
    }
  };

  const handleNotificationClick = () => setOrdersOpen(true);
  const handleProfileClick = () => setProfileOpen(true);

  // Edit handlers
  const handleEditClick = (item) => {
    setCatchToEdit({ ...item });
    setEditDialogOpen(true);
  };
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'freshness') {
      setCatchToEdit((prev) => ({
        ...prev,
        freshness: checked
          ? [...prev.freshness, value]
          : prev.freshness.filter((item) => item !== value),
      }));
    } else {
      setCatchToEdit((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleEditSave = () => {
    // This part needs to be updated to use Firestore updateDoc
    setMyCatches((prev) => prev.map((c) => c.id === catchToEdit.id ? { ...catchToEdit } : c));
    setSnackbar({ open: true, message: 'Catch updated!', severity: 'success' });
    setEditDialogOpen(false);
    setCatchToEdit(null);
  };
  // Delete handlers
  const handleDeleteClick = (item) => {
    setCatchToDelete(item);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = () => {
    // This part needs to be updated to use Firestore deleteDoc
    setMyCatches((prev) => prev.filter((c) => c.id !== catchToDelete.id));
    setSnackbar({ open: true, message: 'Catch deleted!', severity: 'info' });
    setDeleteDialogOpen(false);
    setCatchToDelete(null);
  };

  return (
    <Box sx={{ bgcolor: '#e3f2fd', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ bgcolor: '#01579b' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <FishingIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Net2Plate
          </Typography>
          <Chip label="Fisherman" color="primary" sx={{ ml: 2, bgcolor: '#0288d1', color: '#fff', fontWeight: 700 }} />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleNotificationClick}>
            <NotificationsIcon />
          </IconButton>
          <Avatar sx={{ ml: 2, bgcolor: '#0288d1', color: '#fff', cursor: 'pointer' }} onClick={handleProfileClick}>
            F
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Drawer Navigation */}
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 240 }} role="presentation">
          <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#e1f5fe' }}>
            <Chip label="Fisherman" color="primary" sx={{ bgcolor: '#0288d1', color: '#fff', fontWeight: 700 }} />
          </Box>
          <List>
            <ListItem button onClick={() => handleMenuClick('dashboard')}>
              <ListItemIcon><CatchingPokemonIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => handleMenuClick('catches')}>
              <ListItemIcon><ListAltIcon color="primary" /></ListItemIcon>
              <ListItemText primary="My Catches" />
            </ListItem>
            <ListItem button onClick={() => handleMenuClick('orders')}>
              <ListItemIcon><NotificationsIcon color="primary" /></ListItemIcon>
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

      {/* Main Content */}
      <Box ref={mainRef} sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600, color: '#01579b' }}>
            Welcome, Fisherman!
          </Typography>
          <Fab color="primary" aria-label="add" onClick={handleUploadOpen}>
            <AddIcon />
          </Fab>
        </Box>

        {/* Upload Form Modal/Section */}
        {uploadOpen && (
          <Box
            component="form"
            onSubmit={handleFormSubmit}
            sx={{
              bgcolor: '#ffffff',
              p: 3,
              borderRadius: 3,
              boxShadow: 3,
              mb: 4,
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#0277bd' }}>
              Upload New Catch
            </Typography>
            <TextField
              label="Fish Type"
              name="fishType"
              value={catchForm.fishType}
              onChange={handleFormChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Weight (kg)"
              name="weight"
              type="number"
              value={catchForm.weight}
              onChange={handleFormChange}
              fullWidth
              required
              sx={{ mb: 2 }}
              inputProps={{ min: 0, step: 0.1 }}
            />
            <TextField
              label="Price per kg ($)"
              name="price"
              type="number"
              value={catchForm.price}
              onChange={handleFormChange}
              fullWidth
              required
              sx={{ mb: 2 }}
              inputProps={{ min: 0, step: 0.1 }}
            />
            <Typography variant="subtitle1" sx={{ mb: 1, color: '#0288d1' }}>
              Freshness Checklist
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
              {freshnessOptions.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={catchForm.freshness.includes(option)}
                      onChange={handleFormChange}
                      name="freshness"
                      value={option}
                    />
                  }
                  label={option}
                  sx={{ mr: 2 }}
                />
              ))}
            </Box>
            <Button
              variant="contained"
              component="label"
              sx={{ mb: 2, bgcolor: '#0288d1' }}
            >
              Upload Photos
              <input
                type="file"
                accept="image/*"
                hidden
                name="photos"
                multiple
                onChange={e => {
                  const files = Array.from(e.target.files);
                  setCatchForm(prev => ({ ...prev, photoFiles: files }));
                  // For preview, use FileReader for each file
                  Promise.all(files.map(file => new Promise(res => {
                    const reader = new FileReader();
                    reader.onload = ev => res(ev.target.result);
                    reader.readAsDataURL(file);
                  }))).then(urls => setCatchForm(prev => ({ ...prev, photos: urls })));
                }}
                required={!catchForm.photos.length}
              />
            </Button>
            {catchForm.photos.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {catchForm.photos.map((url, idx) => (
                  <img key={idx} src={url} alt={`Preview ${idx + 1}`} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                ))}
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={handleUploadClose} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading && <CircularProgress size={18} color="inherit" />}
              >
                {loading ? 'Uploading...' : 'Submit'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Catches List */}
        <Typography ref={catchesRef} variant="h6" sx={{ mb: 2, color: '#0277bd' }}>
          My Catches
        </Typography>
        {loadingCatches ? (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : myCatches.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
              alt="No catches"
              width={100}
              style={{ opacity: 0.5 }}
            />
            <Typography variant="subtitle1" sx={{ mt: 2, color: '#90caf9' }}>
              No catches uploaded yet. Click the + button to add your first catch!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {myCatches.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ borderRadius: 3, boxShadow: 4, bgcolor: '#e1f5fe', position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : item.photo}
                    alt={item.fishType}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#01579b', fontWeight: 600 }}>
                      {item.fishType}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0277bd' }}>
                      {item.weight} kg &bull; ${item.price}/kg
                    </Typography>
                    <Box sx={{ mt: 1, mb: 1 }}>
                      {item.freshness.map((f) => (
                        <Box
                          key={f}
                          component="span"
                          sx={{
                            bgcolor: '#b3e5fc',
                            color: '#0277bd',
                            px: 1,
                            py: 0.3,
                            borderRadius: 1,
                            fontSize: 12,
                            mr: 1,
                          }}
                        >
                          {f}
                        </Box>
                      ))}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: item.status === 'Available' ? '#388e3c' : '#fbc02d',
                        fontWeight: 700,
                      }}
                    >
                      {item.status}
                    </Typography>
                    {Array.isArray(item.photos) && item.photos.length > 1 && (
                      <Typography variant="caption" sx={{ color: '#0288d1' }}>{item.photos.length} photos</Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button size="small" variant="outlined" color="primary" onClick={() => handleEditClick(item)}>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteClick(item)}>
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      {/* Edit Catch Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Catch</DialogTitle>
        <DialogContent>
          {catchToEdit && (
            <Box component="form" sx={{ mt: 1, minWidth: 300 }}>
              <TextField
                label="Fish Type"
                name="fishType"
                value={catchToEdit.fishType}
                onChange={handleEditChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Weight (kg)"
                name="weight"
                type="number"
                value={catchToEdit.weight}
                onChange={handleEditChange}
                fullWidth
                required
                sx={{ mb: 2 }}
                inputProps={{ min: 0, step: 0.1 }}
              />
              <TextField
                label="Price per kg ($)"
                name="price"
                type="number"
                value={catchToEdit.price}
                onChange={handleEditChange}
                fullWidth
                required
                sx={{ mb: 2 }}
                inputProps={{ min: 0, step: 0.1 }}
              />
              <Typography variant="subtitle1" sx={{ mb: 1, color: '#0288d1' }}>
                Freshness Checklist
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                {freshnessOptions.map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={catchToEdit.freshness.includes(option)}
                        onChange={handleEditChange}
                        name="freshness"
                        value={option}
                      />
                    }
                    label={option}
                    sx={{ mr: 2 }}
                  />
                ))}
              </Box>
              <Typography variant="subtitle1" sx={{ mb: 1, color: '#0288d1' }}>
                Photos
              </Typography>
              {catchToEdit.photos && catchToEdit.photos.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {catchToEdit.photos.map((url, idx) => (
                    <img key={idx} src={url} alt={`Edit Preview ${idx + 1}`} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                  ))}
                </Box>
              )}
              <Button
                variant="contained"
                component="label"
                sx={{ mb: 2, bgcolor: '#0288d1' }}
              >
                Upload New Photos
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  name="photos"
                  multiple
                  onChange={e => {
                    const files = Array.from(e.target.files);
                    setCatchToEdit(prev => ({ ...prev, photoFiles: files }));
                    // For preview, use FileReader for each file
                    Promise.all(files.map(file => new Promise(res => {
                      const reader = new FileReader();
                      reader.onload = ev => res(ev.target.result);
                      reader.readAsDataURL(file);
                    }))).then(urls => setCatchToEdit(prev => ({ ...prev, photos: urls })));
                  }}
                />
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button color="primary" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Catch Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Catch</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this catch?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>
      </Box>

      {/* Orders Modal */}
      <Dialog open={ordersOpen} onClose={() => setOrdersOpen(false)}>
        <DialogTitle>Order Notifications</DialogTitle>
        <DialogContent>
          {mockOrders.length === 0 ? (
            <Typography>No orders yet.</Typography>
          ) : (
            mockOrders.map((order) => (
              <Box key={order.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">{order.customer} ordered {order.fish}</Typography>
                <Typography variant="body2" color="text.secondary">Status: {order.status}</Typography>
                <Divider sx={{ my: 1 }} />
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrdersOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)}>
        <DialogTitle>Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: '#0288d1', width: 56, height: 56, mx: 'auto', mb: 1 }}>F</Avatar>
            <Typography variant="h6">Fisherman Name</Typography>
            <Typography variant="body2" color="text.secondary">fisherman@email.com</Typography>
          </Box>
          <Typography variant="subtitle2">Role: Fisherman</Typography>
          <Typography variant="subtitle2">Fisherman ID: FISH123</Typography>
          <Typography variant="subtitle2">Location: Coastal Village</Typography>
          {/* Add more profile info or edit form here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}
