const { Op } = require('sequelize');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { calculateEmission } = require('../services/emissionService');
const { calculateEcoScore, getBadges, updateStreak } = require('../utils/ecoScore');

const addActivity = async (req, res) => {
  try {
    const { type, category, value, notes, date } = req.body;
    const userId = req.user.id;

    if (!type || !category || value === undefined) {
      return res.status(400).json({ message: 'Type, category, and value are required' });
    }
    if (parseFloat(value) < 0) {
      return res.status(400).json({ message: 'Value cannot be negative' });
    }

    let emission;
    try {
      emission = calculateEmission(type, category, parseFloat(value));
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const activity = await Activity.create({
      userId,
      type,
      category,
      value: parseFloat(value),
      emission,
      notes: notes || '',
      date: date ? new Date(date) : new Date()
    });

    const allActivities = await Activity.findAll({ where: { userId } });
    const newEcoScore = calculateEcoScore(allActivities);
    const badges = getBadges(newEcoScore, req.user.streak, allActivities.length);
    const streakUpdate = updateStreak(req.user);
    const totalEmission = allActivities.reduce((sum, a) => sum + a.emission, 0);

    await User.update({
      ecoScore: newEcoScore,
      totalEmission: parseFloat(totalEmission.toFixed(2)),
      badges: badges.map(b => b.name),
      streak: streakUpdate.streak,
      lastLogDate: streakUpdate.lastLogDate
    }, { where: { id: userId } });

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      activity,
      stats: {
        emission,
        newEcoScore,
        streak: streakUpdate.streak,
        badgesEarned: badges.map(b => b.name)
      }
    });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ message: 'Error adding activity', error: error.message });
  }
};

const getUserActivities = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to access this data' });
    }

    const { limit = 50, page = 1, type, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId };
    if (type) where.type = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    const [activities, total] = await Promise.all([
      Activity.findAll({
        where,
        order: [['date', 'DESC']],
        offset: skip,
        limit: parseInt(limit)
      }),
      Activity.count({ where })
    ]);

    res.json({
      success: true,
      activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities', error: error.message });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);

    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    if (activity.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this activity' });
    }

    await activity.destroy();

    const allActivities = await Activity.findAll({ where: { userId: req.user.id } });
    const newEcoScore = calculateEcoScore(allActivities);
    const totalEmission = allActivities.reduce((sum, a) => sum + a.emission, 0);

    await User.update({
      ecoScore: newEcoScore,
      totalEmission: parseFloat(totalEmission.toFixed(2))
    }, { where: { id: req.user.id } });

    res.json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting activity', error: error.message });
  }
};

module.exports = { addActivity, getUserActivities, deleteActivity };
