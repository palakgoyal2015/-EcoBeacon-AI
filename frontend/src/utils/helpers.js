export const formatEmission = (value) => {
  if (value === null || value === undefined) return '0.00';
  return Number(value).toFixed(2);
};

export const getScoreColor = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
};

export const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 50) return 'Moderate';
  return 'Needs Improvement';
};

export const getScoreEmoji = (score) => {
  if (score >= 80) return '🌟';
  if (score >= 50) return '🌿';
  return '⚠️';
};

export const getCategoryColor = (category) => {
  const colors = {
    transportation: '#3b82f6',
    electricity:    '#f59e0b',
    food:           '#10b981',
    shopping:       '#8b5cf6'
  };
  return colors[category] || '#64748b';
};

export const getCategoryIcon = (category) => {
  const icons = {
    transportation: '🚗',
    electricity:    '⚡',
    food:           '🍽️',
    shopping:       '🛍️',
    general:        '🌍'
  };
  return icons[category] || '📊';
};

export const ACTIVITY_CONFIG = {
  transportation: {
    label: 'Transportation',
    icon: '🚗',
    color: '#3b82f6',
    categories: [
      { value: 'car',          label: 'Car',          unit: 'km',   icon: '🚗' },
      { value: 'motorcycle',   label: 'Motorcycle',   unit: 'km',   icon: '🏍️' },
      { value: 'bus',          label: 'Bus',          unit: 'km',   icon: '🚌' },
      { value: 'train',        label: 'Train',        unit: 'km',   icon: '🚂' },
      { value: 'flight',       label: 'Flight',       unit: 'km',   icon: '✈️' },
      { value: 'bike',         label: 'Bicycle',      unit: 'km',   icon: '🚴' },
      { value: 'walking',      label: 'Walking',      unit: 'km',   icon: '🚶' },
      { value: 'electric_car', label: 'Electric Car', unit: 'km',   icon: '⚡🚗' }
    ]
  },
  electricity: {
    label: 'Electricity',
    icon: '⚡',
    color: '#f59e0b',
    categories: [
      { value: 'standard', label: 'Standard Grid', unit: 'kWh', icon: '💡' },
      { value: 'solar',    label: 'Solar',         unit: 'kWh', icon: '☀️' },
      { value: 'wind',     label: 'Wind Energy',   unit: 'kWh', icon: '💨' }
    ]
  },
  food: {
    label: 'Food',
    icon: '🍽️',
    color: '#10b981',
    categories: [
      { value: 'beef',     label: 'Beef Meal',    unit: 'meals', icon: '🥩' },
      { value: 'meat',     label: 'Meat Meal',    unit: 'meals', icon: '🍖' },
      { value: 'fish',     label: 'Fish Meal',    unit: 'meals', icon: '🐟' },
      { value: 'fastfood', label: 'Fast Food',    unit: 'meals', icon: '🍔' },
      { value: 'dairy',    label: 'Dairy-based',  unit: 'meals', icon: '🧀' },
      { value: 'veg',      label: 'Vegetarian',   unit: 'meals', icon: '🥗' },
      { value: 'vegan',    label: 'Vegan',        unit: 'meals', icon: '🌱' }
    ]
  },
  shopping: {
    label: 'Shopping',
    icon: '🛍️',
    color: '#8b5cf6',
    categories: [
      { value: 'high-impact',  label: 'High Impact',   unit: 'items', icon: '📦' },
      { value: 'normal',       label: 'Normal',        unit: 'items', icon: '🛒' },
      { value: 'eco-friendly', label: 'Eco-Friendly',  unit: 'items', icon: '♻️' },
      { value: 'secondhand',   label: 'Secondhand',    unit: 'items', icon: '🔄' }
    ]
  }
};

export const EMISSION_FACTORS = {
  transportation: { car: 0.21, motorcycle: 0.103, bus: 0.089, train: 0.041, flight: 0.255, bike: 0.005, walking: 0, electric_car: 0.053 },
  electricity:    { standard: 0.85, solar: 0.041, wind: 0.011 },
  food:           { beef: 6.61, meat: 5.0, fish: 2.8, fastfood: 3.5, dairy: 2.1, veg: 1.5, vegan: 0.9 },
  shopping:       { 'high-impact': 5.0, normal: 2.0, 'eco-friendly': 0.5, secondhand: 0.2 }
};

export const estimateEmission = (type, category, value) => {
  const factor = EMISSION_FACTORS[type]?.[category] ?? 0;
  return parseFloat((factor * value).toFixed(4));
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
