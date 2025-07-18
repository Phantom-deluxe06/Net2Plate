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

  const backgroundStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `url(${process.env.PUBLIC_URL}/underwater-bg.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#1976d2', // fallback color
  };

  return (
    <Box style={backgroundStyle}>
      <Card sx={{
        maxWidth: 420,
        width: '100%',
        p: 4,
        boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
        backdropFilter: 'blur(8px)',
        borderRadius: '12px',
        border: '1px solid rgba( 255, 255, 255, 0.18 )',
        background: 'rgba(255, 255, 255, 0.7)', // more opaque
      }}>
        <CardContent>
          <Typography variant="h4" sx={{ color: '#222', fontWeight: 'bold', mb: 2, textAlign: 'center', letterSpacing: 2 }}>
            Net2Plate
          </Typography>
          <Typography variant="h6" sx={{ color: '#333', fontWeight: 500, mb: 4, textAlign: 'center' }}>
            Welcome Back
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
              variant="filled"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              required
              sx={{ mb: 3, input: { color: '#222' }, label: { color: '#333' } }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="filled"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 3, input: { color: '#222' }, label: { color: '#333' } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end" sx={{ color: '#333' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              select
              label="Role"
              variant="filled"
              value={role}
              onChange={e => setRole(e.target.value)}
              fullWidth
              required
              sx={{ mb: 3, input: { color: '#222' }, label: { color: '#333' } }}
            >
              {roles.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            {error && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Typography>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5, mb: 2, bgcolor: '#0277bd', '&:hover': { bgcolor: '#01579b' } }}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <Typography variant="body2" align="center" sx={{ color: '#333' }}>
            Don't have an account?{' '}
            <Link component="button" onClick={onSwitchToSignUp} sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Sign Up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
