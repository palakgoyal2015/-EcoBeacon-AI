const { Op } = require('sequelize');
const Activity = require('../models/Activity');

const getEmissionSummary = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [dailyActs, weeklyActs, monthlyActs, allActs] = await Promise.all([
      Activity.findAll({ where: { userId, date: { [Op.gte]: startOfDay } } }),
      Activity.findAll({ where: { userId, date: { [Op.gte]: startOfWeek } } }),
      Activity.findAll({ where: { userId, date: { [Op.gte]: startOfMonth } } }),
      Activity.findAll({ where: { userId }, order: [['date', 'DESC']] })
    ]);

    const sumEmissions = (acts) => parseFloat(acts.reduce((s, a) => s + a.emission, 0).toFixed(2));

    res.json({
      success: true,
      summary: {
        daily: sumEmissions(dailyActs),
        weekly: sumEmissions(weeklyActs),
        monthly: sumEmissions(monthlyActs),
        total: sumEmissions(allActs)
      },
      dailyBreakdown: getDailyBreakdown(weeklyActs, 7),
      monthlyBreakdown: getDailyBreakdown(monthlyActs, 30),
      categoryBreakdown: getCategoryBreakdown(monthlyActs),
      activityCount: {
        daily: dailyActs.length,
        weekly: weeklyActs.length,
        monthly: monthlyActs.length,
        total: allActs.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emission summary', error: error.message });
  }
};

const getDailyBreakdown = (activities, days) => {
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayActs = activities.filter(a => {
      const d = new Date(a.date);
      return d >= dayStart && d < dayEnd;
    });

    const byType = (type) => parseFloat(
      dayActs.filter(a => a.type === type).reduce((s, a) => s + a.emission, 0).toFixed(2)
    );

    result.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      total: parseFloat(dayActs.reduce((s, a) => s + a.emission, 0).toFixed(2)),
      transportation: byType('transportation'),
      electricity: byType('electricity'),
      food: byType('food'),
      shopping: byType('shopping')
    });
  }

  return result;
};

const getCategoryBreakdown = (activities) => {
  const totals = {};
  let grandTotal = 0;

  activities.forEach(a => {
    totals[a.type] = (totals[a.type] || 0) + a.emission;
    grandTotal += a.emission;
  });

  return Object.entries(totals).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
    percentage: grandTotal > 0 ? parseFloat(((value / grandTotal) * 100).toFixed(1)) : 0
  }));
};

module.exports = { getEmissionSummary };
