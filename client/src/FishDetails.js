import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, Button, Chip, CircularProgress } from '@mui/material';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function FishDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fish, setFish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);

  useEffect(() => {
    async function fetchFish() {
      setLoading(true);
      setNotFound(false);
      try {
        const docRef = doc(db, 'catches', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFish({ id: docSnap.id, ...docSnap.data() });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        setNotFound(true);
      }
      setLoading(false);
    }
    if (id) fetchFish();
  }, [id]);

  if (loading) {
    return <Box sx={{ textAlign: 'center', mt: 6 }}><CircularProgress /></Box>;
  }
  if (notFound || !fish) {
    return <Typography variant="h6" color="error" sx={{ textAlign: 'center', mt: 6 }}>Fish not found.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>&larr; Back</Button>
      <Card sx={{ borderRadius: 3, boxShadow: 6, bgcolor: '#e1f5fe' }}>
        <CardMedia
          component="img"
          height="320"
          image={Array.isArray(fish.photos) && fish.photos.length > 0 ? fish.photos[0] : fish.photo}
          alt={fish.fishType}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Typography variant="h5" sx={{ color: '#01579b', fontWeight: 700, mb: 1 }}>{fish.fishType}</Typography>
          <Typography variant="body1" sx={{ color: '#0277bd', mb: 1 }}>
            {fish.weight} kg &bull; ₹{fish.price}/kg
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#0288d1', mb: 1 }}>Freshness Checklist:</Typography>
          <Box sx={{ mb: 2 }}>
            {Array.isArray(fish.freshness) && fish.freshness.map(fresh => (
              <Chip key={fresh} label={fresh} sx={{ bgcolor: '#b3e5fc', color: '#0277bd', mr: 1, mb: 1 }} />
            ))}
          </Box>
          <Typography variant="body2" sx={{ color: fish.status === 'Available' ? '#388e3c' : '#fbc02d', fontWeight: 700, mb: 2 }}>
            Status: {fish.status}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="contained" color="primary">Order</Button>
            <Button variant="outlined" color="primary">Bargain</Button>
            <Button variant="text" color="primary" onClick={() => setImageModalOpen(true)}>
              View Image
            </Button>
          </Box>
        </CardContent>
      </Card>
      {/* Image Modal */}
      <Dialog open={imageModalOpen} onClose={() => setImageModalOpen(false)} maxWidth="md">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Fish Image
          <IconButton onClick={() => setImageModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 2 }}>
          {Array.isArray(fish.photos) && fish.photos.length > 0 ? (
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={fish.photos[imageIdx]}
                alt={`Fish ${imageIdx + 1}`}
                style={{ maxWidth: 500, maxHeight: 400, borderRadius: 8 }}
              />
              {fish.photos.length > 1 && (
                <>
                  <IconButton
                    sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
                    onClick={() => setImageIdx((prev) => (prev === 0 ? fish.photos.length - 1 : prev - 1))}
                  >
                    <ArrowBackIosNewIcon />
                  </IconButton>
                  <IconButton
                    sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
                    onClick={() => setImageIdx((prev) => (prev === fish.photos.length - 1 ? 0 : prev + 1))}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </>
              )}
            </Box>
          ) : (
            <img
              src={fish.photo}
              alt={fish.fishType}
              style={{ maxWidth: 500, maxHeight: 400, borderRadius: 8 }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
} 