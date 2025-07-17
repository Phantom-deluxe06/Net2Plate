import React, { useState } from 'react';
import { Card, Grid, Typography, Box, Button } from '@mui/material';

const mockOrders = [
  { id: 1, fish: 'Red Snapper', status: 'Pending', price: 100 },
  { id: 2, fish: 'Salmon', status: 'Delivered', price: 75 },
];

export default function CustomerDashboardHome() {
  const [orders] = useState(mockOrders);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#01579b', mb: 2 }}>
        Dashboard
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#b3e5fc', p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Orders</Typography>
            <Typography variant="h6" sx={{ color: '#0277bd', fontWeight: 700 }}>{totalOrders}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#ffe082', p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
            <Typography variant="h6" sx={{ color: '#fbc02d', fontWeight: 700 }}>{pendingOrders}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#c8e6c9', p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Delivered</Typography>
            <Typography variant="h6" sx={{ color: '#388e3c', fontWeight: 700 }}>{deliveredOrders}</Typography>
          </Card>
        </Grid>
      </Grid>
      <Typography variant="subtitle1" sx={{ color: '#0277bd', mb: 1 }}>
        Recent Orders
      </Typography>
      {orders.length === 0 ? (
        <Typography color="text.secondary">No recent orders.</Typography>
      ) : (
        <Grid container spacing={2}>
          {orders.slice(0, 3).map(order => (
            <Grid item xs={12} sm={6} md={4} key={order.id}>
              <Card sx={{ p: 2, bgcolor: '#e1f5fe' }}>
                <Typography variant="subtitle2">{order.fish}</Typography>
                <Typography variant="body2" color="text.secondary">Status: {order.status}</Typography>
                <Typography variant="body2" color="text.secondary">Price: ₹{order.price}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
} 