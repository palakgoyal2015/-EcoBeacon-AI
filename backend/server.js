const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const startServer = async () => {
  await connectDB();

  const app = express();

  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/activity', require('./routes/activityRoutes'));
  app.use('/api/emissions', require('./routes/emissionRoutes'));
  app.use('/api/ai', require('./routes/aiRoutes'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'EcoBeacon API is running', timestamp: new Date() });
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🌱 EcoBeacon server running on port ${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
  });
};

startServer();
