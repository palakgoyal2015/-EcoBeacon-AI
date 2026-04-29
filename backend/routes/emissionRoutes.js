const express = require('express');
const router = express.Router();
const { getEmissionSummary } = require('../controllers/emissionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary/:id', protect, getEmissionSummary);

module.exports = router;
