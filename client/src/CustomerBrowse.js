import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardMedia, Grid, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function CustomerBrowse() {
  const navigate = useNavigate();
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'catches'), (querySnapshot) => {
      const allCatches = [];
      querySnapshot.forEach((doc) => {
        allCatches.push({ id: doc.id, ...doc.data() });
      });
      setCatches(allCatches);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#0277bd', mb: 2 }}>
        Browse Fresh Catches
      </Typography>
      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : Array.isArray(catches) && catches.length > 0 ? (
        <Grid container spacing={3}>
          {catches.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                sx={{ borderRadius: 3, boxShadow: 4, bgcolor: '#e1f5fe', cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 8 } }}
                onClick={() => navigate(`/customer/browse/${item.id}`)}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : item.photo}
                  alt={item.fishType}
                  sx={{ objectFit: 'cover' }}
                />
                {Array.isArray(item.photos) && item.photos.length > 1 && (
                  <Typography variant="caption" sx={{ color: '#0288d1' }}>{item.photos.length} photos</Typography>
                )}
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#01579b', fontWeight: 600 }}>
                    {item.fishType}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0277bd' }}>
                    {item.weight} kg • ₹{item.price}/kg
                  </Typography>
                  <Box sx={{ mt: 1, mb: 1 }}>
                    {Array.isArray(item.freshness) && item.freshness.map((f) => (
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
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography sx={{ textAlign: 'center', mt: 6, color: '#90caf9' }}>
          No catches available.
        </Typography>
      )}
    </Box>
  );
} 