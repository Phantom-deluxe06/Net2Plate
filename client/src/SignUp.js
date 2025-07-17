import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, InputAdornment, IconButton, CircularProgress, Link, MenuItem } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const roles = [
  { value: 'Customer', label: 'Customer' },
  { value: 'Fisherman', label: 'Fisherman' },
  { value: 'Inspector', label: 'Inspector' },
];

export default function SignUp({ onSignUp, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!email || !password || !confirmPassword || !username || !mobile || (role === 'Customer' && !address) || (role === 'Fisherman' && !shopAddress)) {
      setError('Please fill all fields.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Save user data in Firestore
      const userData = {
        username,
        email,
        role,
        mobile,
      };
      if (role === 'Customer') {
        userData.address = address;
      }
      if (role === 'Fisherman') {
        userData.shopAddress = shopAddress;
      }
      await setDoc(doc(db, 'users', user.uid), userData);
      onSignUp && onSignUp({ email, role, username, mobile, address: userData.address, shopAddress: userData.shopAddress });
    } catch (err) {
      setError(err.message || 'Sign up failed.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ maxWidth: 400, width: '100%', p: 2, boxShadow: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" sx={{ color: '#0277bd', fontWeight: 900, mb: 1, textAlign: 'center', letterSpacing: 2 }}>
            Net2Plate
          </Typography>
          <Typography variant="h5" sx={{ color: '#0277bd', fontWeight: 700, mb: 2, textAlign: 'center' }}>
            Sign Up
          </Typography>
          <form onSubmit={handleSignUp}>
            <TextField
              label="Username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Mobile Number"
              type="tel"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            {role === 'Customer' && (
              <TextField
                label="Address"
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                fullWidth
                required
                multiline
                minRows={2}
                sx={{ mb: 2 }}
              />
            )}
            {role === 'Fisherman' && (
              <TextField
                label="Shop Address"
                type="text"
                value={shopAddress}
                onChange={e => setShopAddress(e.target.value)}
                fullWidth
                required
                multiline
                minRows={2}
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              select
              label="Role"
              value={role}
              onChange={e => setRole(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              {roles.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mb: 2, bgcolor: '#0277bd' }}
              startIcon={loading && <CircularProgress size={18} color="inherit" />}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <Link component="button" onClick={onSwitchToLogin} sx={{ color: '#0277bd', fontWeight: 600 }}>
              Login
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
