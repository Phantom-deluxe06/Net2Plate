import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, InputAdornment, IconButton, CircularProgress, Link, MenuItem } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const roles = [
  { value: 'Customer', label: 'Customer' },
  { value: 'Fisherman', label: 'Fisherman' },
  { value: 'Inspector', label: 'Inspector' },
];

export default function Login({ onLogin, onSwitchToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Mock login
    setTimeout(() => {
      if (email && password) {
        onLogin && onLogin({ email, role });
      } else {
        setError('Please enter email and password.');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ maxWidth: 380, width: '100%', p: 2, boxShadow: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" sx={{ color: '#0277bd', fontWeight: 900, mb: 1, textAlign: 'center', letterSpacing: 2 }}>
            Net2Plate
          </Typography>
          <Typography variant="h5" sx={{ color: '#0277bd', fontWeight: 700, mb: 2, textAlign: 'center' }}>
            Login
          </Typography>
          <form onSubmit={handleLogin}>
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
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <Typography variant="body2" align="center">
            Don't have an account?{' '}
            <Link component="button" onClick={onSwitchToSignUp} sx={{ color: '#0277bd', fontWeight: 600 }}>
              Sign Up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
