const generateRecommendations = (activities, ecoScore) => {
  if (!activities || activities.length === 0) return getDefaultRecommendations();

  const byType = groupByType(activities);
  const suggestions = [];

  // Transportation analysis
  const transport = byType.transportation || [];
  if (transport.length > 0) {
    const carTrips = transport.filter(a => a.category === 'car');
    const flights = transport.filter(a => a.category === 'flight');
    const ecoTrips = transport.filter(a => ['walking', 'bike', 'train'].includes(a.category));

    if (carTrips.length >= 3) {
      const potentialSaving = (carTrips.reduce((s, a) => s + a.emission, 0) * 0.6).toFixed(1);
      suggestions.push({
        id: 'transport_car',
        type: 'transportation',
        priority: 'high',
        title: 'Switch to Public Transport',
        description: `You've taken ${carTrips.length} car trips recently. Using public transport or carpooling 3 days/week could save ~${potentialSaving} kg CO2.`,
        impact: 'high',
        icon: '🚌',
        savings: potentialSaving
      });
    }

    if (flights.length > 0) {
      const flightEmission = flights.reduce((s, a) => s + a.emission, 0);
      suggestions.push({
        id: 'transport_flight',
        type: 'transportation',
        priority: 'high',
        title: 'Reduce Air Travel',
        description: `Flights generated ${flightEmission.toFixed(1)} kg CO2. Consider trains for trips under 500km — they can be 80% less polluting.`,
        impact: 'high',
        icon: '🚂',
        savings: (flightEmission * 0.8).toFixed(1)
      });
    }

    if (ecoTrips.length === 0 && transport.length >= 2) {
      suggestions.push({
        id: 'transport_eco',
        type: 'transportation',
        priority: 'medium',
        title: 'Try Walking or Cycling',
        description: "For trips under 5km, walking or cycling generates zero emissions and improves your health. Give it a try this week!",
        impact: 'medium',
        icon: '🚴',
        savings: '2-5'
      });
    }
  }

  // Electricity analysis
  const electricity = byType.electricity || [];
  if (electricity.length > 0) {
    const totalKwh = electricity.reduce((s, a) => s + a.value, 0);
    const totalEmission = electricity.reduce((s, a) => s + a.emission, 0);

    if (totalKwh > 15) {
      suggestions.push({
        id: 'electricity_peak',
        type: 'electricity',
        priority: 'high',
        title: 'Reduce Peak Hour Usage',
        description: `You've used ${totalKwh.toFixed(1)} kWh recently. Shifting energy-heavy tasks (laundry, dishwasher) to off-peak hours (10pm–7am) can reduce grid strain.`,
        impact: 'medium',
        icon: '⚡',
        savings: (totalEmission * 0.12).toFixed(1)
      });
    }

    suggestions.push({
      id: 'electricity_solar',
      type: 'electricity',
      priority: 'medium',
      title: 'Explore Renewable Energy',
      description: 'Switching to a green energy tariff or installing solar panels can cut electricity emissions by up to 90%.',
      impact: 'high',
      icon: '☀️',
      savings: (totalEmission * 0.9).toFixed(1)
    });
  }

  // Food analysis
  const food = byType.food || [];
  if (food.length > 0) {
    const meatMeals = food.filter(a => ['meat', 'beef', 'fastfood'].includes(a.category));
    const vegMeals = food.filter(a => ['veg', 'vegan'].includes(a.category));

    if (meatMeals.length > vegMeals.length) {
      const potentialSaving = (meatMeals.reduce((s, a) => s + a.emission, 0) * 0.65).toFixed(1);
      suggestions.push({
        id: 'food_meat',
        type: 'food',
        priority: 'high',
        title: 'Reduce Meat Consumption',
        description: `${meatMeals.length} meat meals logged. Replacing 3 meat meals per week with plant-based options could save ~${potentialSaving} kg CO2.`,
        impact: 'high',
        icon: '🥗',
        savings: potentialSaving
      });
    }

    const fastFoods = food.filter(a => a.category === 'fastfood');
    if (fastFoods.length >= 3) {
      suggestions.push({
        id: 'food_cooking',
        type: 'food',
        priority: 'medium',
        title: 'Cook More at Home',
        description: "Home-cooked vegetarian meals can have 60% lower emissions than fast food. Try batch cooking on Sundays!",
        impact: 'medium',
        icon: '🍳',
        savings: (fastFoods.reduce((s, a) => s + a.emission * 0.6, 0)).toFixed(1)
      });
    }
  }

  // Shopping analysis
  const shopping = byType.shopping || [];
  if (shopping.length > 0) {
    const highImpact = shopping.filter(a => a.category === 'high-impact');
    const normalItems = shopping.filter(a => a.category === 'normal');

    if (highImpact.length > 0) {
      suggestions.push({
        id: 'shopping_eco',
        type: 'shopping',
        priority: 'medium',
        title: 'Choose Eco-Friendly Products',
        description: `${highImpact.length} high-impact purchases detected. Choosing eco-friendly or secondhand alternatives can cut shopping emissions by 70%.`,
        impact: 'medium',
        icon: '♻️',
        savings: (highImpact.reduce((s, a) => s + a.emission * 0.7, 0)).toFixed(1)
      });
    }

    if (normalItems.length >= 3) {
      suggestions.push({
        id: 'shopping_secondhand',
        type: 'shopping',
        priority: 'low',
        title: 'Try Secondhand Shopping',
        description: "Buying secondhand reduces emissions by ~90% per item. Check local thrift stores, Vinted, or eBay for great finds.",
        impact: 'high',
        icon: '🛍️',
        savings: (normalItems.reduce((s, a) => s + a.emission * 0.8, 0)).toFixed(1)
      });
    }
  }

  // Score-based general advice
  if (ecoScore < 40) {
    suggestions.unshift({
      id: 'general_improve',
      type: 'general',
      priority: 'high',
      title: 'Start Small — Big Impact',
      description: "Your score has room to grow! Focus on your single biggest emission source first. Small, consistent changes create lasting habits.",
      impact: 'high',
      icon: '🌱',
      savings: '0'
    });
  }

  if (ecoScore >= 80) {
    suggestions.push({
      id: 'general_inspire',
      type: 'general',
      priority: 'low',
      title: 'Inspire Your Community',
      description: "You're leading by example! Share your eco journey with friends and family to multiply your positive impact.",
      impact: 'community',
      icon: '🌍',
      savings: '∞'
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return suggestions
    .sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3))
    .slice(0, 6);
};

const groupByType = (activities) => {
  return activities.reduce((acc, a) => {
    if (!acc[a.type]) acc[a.type] = [];
    acc[a.type].push(a);
    return acc;
  }, {});
};

const getDefaultRecommendations = () => [
  {
    id: 'default_transport',
    type: 'transportation',
    priority: 'high',
    title: 'Log Your Commute',
    description: "Transportation is typically the largest source of personal emissions. Start by logging your daily commute to understand your impact.",
    impact: 'high',
    icon: '🚗',
    savings: '0'
  },
  {
    id: 'default_food',
    type: 'food',
    priority: 'high',
    title: 'Track Your Meals',
    description: "Food choices account for ~25% of personal emissions. Log your meals daily to identify opportunities to eat more sustainably.",
    impact: 'high',
    icon: '🍽️',
    savings: '0'
  },
  {
    id: 'default_electricity',
    type: 'electricity',
    priority: 'medium',
    title: 'Monitor Energy Usage',
    description: "Tracking your electricity consumption helps you identify peak usage periods and find ways to save both money and carbon.",
    impact: 'medium',
    icon: '💡',
    savings: '0'
  }
];

// ── Forecast: predict daily emissions for the next N days ──────────────────
const forecastEmissions = (activities, days = 7) => {
  if (!activities || activities.length === 0) {
    return Array.from({ length: days }, (_, i) => ({
      date: dayOffset(i + 1),
      predicted: 0,
      confidence: 'low',
    }));
  }

  // Build a map of date → total emission
  const byDate = {};
  activities.forEach(a => {
    const d = new Date(a.date).toISOString().split('T')[0];
    byDate[d] = (byDate[d] || 0) + (a.emission || 0);
  });

  const dailyValues = Object.values(byDate);
  const avg = dailyValues.reduce((s, v) => s + v, 0) / dailyValues.length;

  // Simple linear trend from first half → second half
  const half = Math.floor(dailyValues.length / 2);
  const firstHalf = dailyValues.slice(0, half);
  const secondHalf = dailyValues.slice(half);
  const firstAvg = firstHalf.length ? firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length : avg;
  const secondAvg = secondHalf.length ? secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length : avg;
  const trendDelta = (secondAvg - firstAvg) / Math.max(half, 1);

  const confidence = dailyValues.length >= 14 ? 'high' : dailyValues.length >= 7 ? 'medium' : 'low';

  return Array.from({ length: days }, (_, i) => ({
    date: dayOffset(i + 1),
    predicted: Math.max(0, parseFloat((avg + trendDelta * (i + 1)).toFixed(2))),
    confidence,
    trend: trendDelta > 0.1 ? 'increasing' : trendDelta < -0.1 ? 'decreasing' : 'stable',
  }));
};

// ── Anomaly detection: flag activities significantly above normal ───────────
const detectAnomalies = (activities) => {
  if (!activities || activities.length < 5) return [];

  const byType = groupByType(activities);
  const anomalies = [];

  Object.entries(byType).forEach(([type, acts]) => {
    const emissions = acts.map(a => a.emission || 0);
    const mean = emissions.reduce((s, v) => s + v, 0) / emissions.length;
    const variance = emissions.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / emissions.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + 2 * stdDev;

    acts.forEach(a => {
      if ((a.emission || 0) > threshold && (a.emission || 0) > mean * 2) {
        anomalies.push({
          activityId: a.id || a._id,
          type,
          category: a.category,
          emission: a.emission,
          average: parseFloat(mean.toFixed(2)),
          multiplier: parseFloat((a.emission / mean).toFixed(1)),
          date: a.date,
          message: `This ${type} activity emitted ${(a.emission || 0).toFixed(2)} kg CO₂ — ${(a.emission / mean).toFixed(1)}× your usual average of ${mean.toFixed(2)} kg.`,
        });
      }
    });
  });

  return anomalies.slice(0, 5);
};

// ── Weekly goal generator ───────────────────────────────────────────────────
const generateWeeklyGoals = (activities, ecoScore) => {
  const byType = groupByType(activities);
  const goals = [];

  const transport = byType.transportation || [];
  const carTrips = transport.filter(a => a.category === 'car');
  if (carTrips.length > 0) {
    const weeklyCarKm = carTrips.reduce((s, a) => s + a.value, 0) / 4;
    goals.push({
      id: 'goal_car_km',
      title: 'Reduce Car Distance',
      target: Math.round(weeklyCarKm * 0.8),
      unit: 'km by car this week',
      current: Math.round(weeklyCarKm),
      saving: parseFloat((weeklyCarKm * 0.2 * 0.21).toFixed(1)),
      icon: '🚗',
    });
  }

  const food = byType.food || [];
  const meatMeals = food.filter(a => ['beef', 'meat', 'fastfood'].includes(a.category));
  if (meatMeals.length > 0) {
    const weeklyMeat = Math.round(meatMeals.length / 4);
    goals.push({
      id: 'goal_meat_meals',
      title: 'Meat-Free Days',
      target: Math.min(weeklyMeat - 1, 3),
      unit: 'fewer meat meals this week',
      current: weeklyMeat,
      saving: parseFloat((meatMeals.reduce((s, a) => s + a.emission, 0) / 4 * 0.25).toFixed(1)),
      icon: '🥗',
    });
  }

  const electricity = byType.electricity || [];
  if (electricity.length > 0) {
    const weeklyKwh = electricity.reduce((s, a) => s + a.value, 0) / 4;
    goals.push({
      id: 'goal_electricity',
      title: 'Cut Electricity Use',
      target: Math.round(weeklyKwh * 0.9),
      unit: 'kWh this week',
      current: Math.round(weeklyKwh),
      saving: parseFloat((weeklyKwh * 0.1 * 0.85).toFixed(1)),
      icon: '⚡',
    });
  }

  if (ecoScore < 60) {
    goals.push({
      id: 'goal_eco_score',
      title: 'Boost Eco Score',
      target: Math.min(ecoScore + 10, 100),
      unit: 'eco score target',
      current: ecoScore,
      saving: 0,
      icon: '🌿',
    });
  }

  return goals.slice(0, 3);
};

const dayOffset = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

module.exports = { generateRecommendations, forecastEmissions, detectAnomalies, generateWeeklyGoals };
