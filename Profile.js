import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Divider } from '@mui/material';

export default function Profile({ user }) {
  // Default user data if none is provided
  const defaultUser = {
    username: 'Guest',
    email: 'guest@example.com',
    role: 'User',
    mobile: 'N/A',
  };

  const currentUser = user || defaultUser;

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
              {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : ''}
            </Avatar>
            <Box>
              <Typography variant="h5">{currentUser.username}</Typography>
              <Typography variant="body1" color="text.secondary">
                {currentUser.email}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1">
            <strong>Role:</strong> {currentUser.role}
          </Typography>
          <Typography variant="body1">
            <strong>Mobile:</strong> {currentUser.mobile}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
