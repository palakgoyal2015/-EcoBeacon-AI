const { Op } = require('sequelize');
const Activity = require('../models/Activity');
const {
  generateRecommendations,
  forecastEmissions,
  detectAnomalies,
  generateWeeklyGoals,
} = require('../services/aiService');

const getSuggestions = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (req.user.id !== userId) return res.status(403).json({ message: 'Not authorized' });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await Activity.findAll({
      where: { userId, date: { [Op.gte]: thirtyDaysAgo } },
      order: [['date', 'DESC']],
    });

    const suggestions = generateRecommendations(activities, req.user.ecoScore || 50);

    res.json({ success: true, suggestions, analysisDate: new Date(), activitiesAnalyzed: activities.length });
  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({ message: 'Error generating suggestions', error: error.message });
  }
};

const getForecast = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (req.user.id !== userId) return res.status(403).json({ message: 'Not authorized' });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await Activity.findAll({
      where: { userId, date: { [Op.gte]: thirtyDaysAgo } },
      order: [['date', 'ASC']],
    });

    const forecast = forecastEmissions(activities, 7);
    const goals = generateWeeklyGoals(activities, req.user.ecoScore || 50);

    res.json({ success: true, forecast, goals, generatedAt: new Date() });
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ message: 'Error generating forecast', error: error.message });
  }
};

const getAnomalies = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (req.user.id !== userId) return res.status(403).json({ message: 'Not authorized' });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await Activity.findAll({
      where: { userId, date: { [Op.gte]: thirtyDaysAgo } },
      order: [['date', 'DESC']],
    });

    const anomalies = detectAnomalies(activities);

    res.json({ success: true, anomalies, scanned: activities.length });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ message: 'Error detecting anomalies', error: error.message });
  }
};

const chatResponse = (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message required' });

  const msg = message.toLowerCase();
  let reply = '';

  if (/biggest|largest|most emission/.test(msg)) {
    reply = "Transportation is typically the largest source of personal emissions (avg 45%), followed by food (25%), electricity (20%), and shopping (10%). Check your Activity Breakdown chart on the Dashboard for your personal split.";
  } else if (/reduce|lower|cut|improve/.test(msg) && /transport|car|driv/.test(msg)) {
    reply = "To cut transport emissions: switch to public transit or cycling for trips under 10 km, carpool when driving is unavoidable, and consider an electric vehicle for longer commutes. This alone can save 1–3 kg CO₂ per day.";
  } else if (/reduce|lower|cut/.test(msg) && /food|eat|diet/.test(msg)) {
    reply = "A plant-based diet is one of the most impactful changes you can make. Replacing 3 beef meals/week with vegetarian options saves ~15 kg CO₂ per month. Try 'Meatless Mondays' as a start!";
  } else if (/electricity|energy|power/.test(msg)) {
    reply = "Shift heavy appliances (washing machine, dishwasher) to off-peak hours (10 pm–7 am). Switch to LED bulbs, unplug standby devices, and consider a green energy tariff. Solar panels can cut home electricity emissions by up to 90%.";
  } else if (/score|eco score/.test(msg)) {
    reply = "Your Eco Score (0–100) reflects your emission efficiency. A score above 80 = Excellent, 50–79 = Moderate, below 50 = Needs Improvement. Log consistently and focus on high-impact changes to raise your score.";
  } else if (/badge|streak|achievement/.test(msg)) {
    reply = "Badges are awarded for milestones: first log, activity count, eco score thresholds, and streak length. Maintain daily logging streaks to unlock 'Eco Warrior' and 'Streak Master' badges!";
  } else if (/paris|climate|global|target/.test(msg)) {
    reply = "The Paris Agreement targets limiting warming to 1.5°C. This requires each person to emit no more than ~2.5 kg CO₂/day by 2030 — compared to the current world average of ~7.5 kg/day. You can track your progress against this target in the Impact Analysis panel.";
  } else if (/hello|hi|hey|help/.test(msg)) {
    reply = "Hello! I'm your EcoBeacon AI assistant. I can answer questions about reducing your carbon footprint, understanding your eco score, climate targets, and more. What would you like to know?";
  } else if (/flight|fly|travel|air/.test(msg)) {
    reply = "Aviation is one of the most carbon-intensive activities. A single long-haul flight can emit more CO₂ than months of driving. Consider trains for trips under 500 km — they're up to 80% cleaner. If you must fly, choose direct routes and economy class.";
  } else if (/shopping|buy|purchase/.test(msg)) {
    reply = "Manufacturing goods accounts for a major share of global emissions. Tips: buy secondhand (90% less CO₂ per item), choose quality over quantity, repair before replacing, and favour brands with sustainability certifications.";
  } else {
    reply = "Great question! I can help with topics like: reducing transport emissions, sustainable food choices, energy saving at home, understanding your eco score, climate targets, and more. Try asking me something specific!";
  }

  res.json({ success: true, reply, timestamp: new Date() });
};

module.exports = { getSuggestions, getForecast, getAnomalies, chatResponse };
