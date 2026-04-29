const express = require('express');
const router = express.Router();
const { getSuggestions, getForecast, getAnomalies, chatResponse } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/suggestions/:userId', protect, getSuggestions);
router.get('/forecast/:userId',    protect, getForecast);
router.get('/anomalies/:userId',   protect, getAnomalies);
router.post('/chat',               protect, chatResponse);

module.exports = router;
