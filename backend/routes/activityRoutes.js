const express = require('express');
const router = express.Router();
const { addActivity, getUserActivities, deleteActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addActivity);
router.get('/user/:id', protect, getUserActivities);
router.delete('/:id', protect, deleteActivity);

module.exports = router;
