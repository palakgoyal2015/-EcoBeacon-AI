const calculateEcoScore = (activities) => {
  if (!activities || activities.length === 0) return 50;

  const totalEmission = activities.reduce((sum, a) => sum + a.emission, 0);
  const days = getUniqueDays(activities);
  const dailyAvg = totalEmission / Math.max(days, 1);

  let baseScore;
  if (dailyAvg <= 2) baseScore = 95;
  else if (dailyAvg <= 4) baseScore = 88;
  else if (dailyAvg <= 6) baseScore = 78;
  else if (dailyAvg <= 10) baseScore = 65;
  else if (dailyAvg <= 15) baseScore = 50;
  else if (dailyAvg <= 20) baseScore = 35;
  else if (dailyAvg <= 30) baseScore = 20;
  else baseScore = 10;

  const ecoFriendlyCount = activities.filter(a =>
    (a.type === 'transportation' && ['walking', 'bike', 'train'].includes(a.category)) ||
    (a.type === 'food' && ['veg', 'vegan'].includes(a.category)) ||
    (a.type === 'shopping' && ['eco-friendly', 'secondhand'].includes(a.category))
  ).length;

  const consistencyBonus = Math.min(10, Math.floor((ecoFriendlyCount / activities.length) * 15));

  return Math.min(100, Math.max(0, Math.round(baseScore + consistencyBonus)));
};

const getUniqueDays = (activities) => {
  const days = new Set(activities.map(a => new Date(a.date).toDateString()));
  return days.size;
};

const getScoreLabel = (score) => {
  if (score >= 80) return { label: 'Excellent', color: '#10b981', emoji: '🌟' };
  if (score >= 50) return { label: 'Moderate', color: '#f59e0b', emoji: '🌿' };
  return { label: 'Needs Improvement', color: '#ef4444', emoji: '⚠️' };
};

const getBadges = (ecoScore, streak, totalActivities) => {
  const badges = [];

  if (totalActivities >= 1) badges.push({ id: 'getting_started', name: 'Getting Started', icon: '✨', desc: 'Logged first activity' });
  if (totalActivities >= 10) badges.push({ id: 'active_tracker', name: 'Active Tracker', icon: '📊', desc: 'Logged 10+ activities' });
  if (totalActivities >= 50) badges.push({ id: 'dedicated', name: 'Dedicated Tracker', icon: '🏅', desc: 'Logged 50+ activities' });
  if (ecoScore >= 60) badges.push({ id: 'eco_aware', name: 'Eco Aware', icon: '🌿', desc: 'Score 60+' });
  if (ecoScore >= 80) badges.push({ id: 'eco_warrior', name: 'Eco Warrior', icon: '🌱', desc: 'Score 80+' });
  if (ecoScore >= 90) badges.push({ id: 'green_hero', name: 'Green Hero', icon: '🦸', desc: 'Score 90+' });
  if (streak >= 3) badges.push({ id: 'streak_3', name: '3-Day Streak', icon: '🔥', desc: '3 consecutive days' });
  if (streak >= 7) badges.push({ id: 'week_streak', name: 'Week Warrior', icon: '⚡', desc: '7-day streak' });
  if (streak >= 30) badges.push({ id: 'month_streak', name: 'Eco Champion', icon: '🏆', desc: '30-day streak' });

  return badges;
};

const updateStreak = (user) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!user.lastLogDate) {
    return { streak: 1, lastLogDate: today };
  }

  const lastLog = new Date(user.lastLogDate);
  const lastLogDay = new Date(lastLog.getFullYear(), lastLog.getMonth(), lastLog.getDate());
  const diffDays = Math.floor((today - lastLogDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { streak: user.streak, lastLogDate: user.lastLogDate };
  if (diffDays === 1) return { streak: user.streak + 1, lastLogDate: today };
  return { streak: 1, lastLogDate: today };
};

module.exports = { calculateEcoScore, getScoreLabel, getBadges, updateStreak };
