const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const scenicRoutes = require('./routes/scenic');
const noteRoutes = require('./routes/note');
const planRoutes = require('./routes/plan');
const smartTravelRoutes = require('./routes/smartTravel');
const outfitRoutes = require('./routes/outfit');
const galleryRoutes = require('./routes/gallery');
const favoritesRoutes = require('./routes/favorites');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

app.use('/api/scenic', scenicRoutes);
app.use('/api/note', noteRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/smart-travel', smartTravelRoutes);
app.use('/api/outfit', outfitRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: '巡旅游API服务器运行中' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});