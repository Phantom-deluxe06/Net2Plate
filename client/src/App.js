import React, { useState } from 'react';
import FishermanDashboard from './FishermanDashboard';
import CustomerDashboard from './CustomerDashboard';
import InspectorDashboard from './InspectorDashboard';
import Login from './Login';
import SignUp from './SignUp';
import CustomerDashboardHome from './CustomerDashboardHome';
import CustomerBrowse from './CustomerBrowse';
import FishDetails from './FishDetails';
import { Snackbar, Alert } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const initialCatches = [
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
    status: 'Available',
    fishermanEmail: 'fisherman2@email.com',
  },
];

function App() {
  const [user, setUser] = useState(null); // { email, role }
  const [showSignUp, setShowSignUp] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [catches, setCatches] = useState(initialCatches);

  // Handle login (mock)
  const handleLogin = (userObj) => {
    setSnackbar({ open: true, message: 'Login successful! Please select your role.', severity: 'success' });
    setTimeout(() => {
      setUser({ ...userObj, role: userObj.role || 'Customer' });
    }, 800);
  };

  // Handle sign up (mock)
  const handleSignUp = (userObj) => {
    setSnackbar({ open: true, message: 'Sign up successful! Please log in.', severity: 'success' });
    setShowSignUp(false);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setSnackbar({ open: true, message: 'Logged out.', severity: 'info' });
  };

  const dashboardProps = { onLogout: handleLogout };

  return (
    <BrowserRouter>
      {(!user) ? (
        showSignUp ? (
          <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setShowSignUp(false)} />
        ) : (
          <Login onLogin={handleLogin} onSwitchToSignUp={() => setShowSignUp(true)} />
        )
      ) : user.role === 'Customer' ? (
        <Routes>
          <Route path="/customer" element={<CustomerDashboard {...dashboardProps} /> }>
            <Route index element={<CustomerDashboardHome />} />
            <Route path="browse" element={<CustomerBrowse catches={catches} />} />
            <Route path="browse/:id" element={<FishDetails />} />
          </Route>
          <Route path="*" element={<CustomerDashboard {...dashboardProps} /> } />
        </Routes>
      ) : user.role === 'Fisherman' ? (
        <FishermanDashboard {...dashboardProps} user={user} catches={catches} setCatches={setCatches} />
      ) : user.role === 'Inspector' ? (
        <InspectorDashboard {...dashboardProps} />
      ) : (
        <div>Loading dashboard...</div>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </BrowserRouter>
  );
}

export default App;
