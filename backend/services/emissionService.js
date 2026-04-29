const EMISSION_FACTORS = {
  transportation: {
    car:          { factor: 0.21,  unit: 'km',   label: 'Car' },
    motorcycle:   { factor: 0.103, unit: 'km',   label: 'Motorcycle' },
    bus:          { factor: 0.089, unit: 'km',   label: 'Bus' },
    train:        { factor: 0.041, unit: 'km',   label: 'Train' },
    flight:       { factor: 0.255, unit: 'km',   label: 'Flight' },
    bike:         { factor: 0.005, unit: 'km',   label: 'Bicycle' },
    walking:      { factor: 0,     unit: 'km',   label: 'Walking' },
    electric_car: { factor: 0.053, unit: 'km',   label: 'Electric Car' }
  },
  electricity: {
    standard: { factor: 0.85,  unit: 'kWh', label: 'Standard Grid' },
    solar:    { factor: 0.041, unit: 'kWh', label: 'Solar' },
    wind:     { factor: 0.011, unit: 'kWh', label: 'Wind Energy' }
  },
  food: {
    beef:     { factor: 6.61, unit: 'meal', label: 'Beef Meal' },
    meat:     { factor: 5.0,  unit: 'meal', label: 'Meat Meal' },
    fish:     { factor: 2.8,  unit: 'meal', label: 'Fish Meal' },
    fastfood: { factor: 3.5,  unit: 'meal', label: 'Fast Food' },
    dairy:    { factor: 2.1,  unit: 'meal', label: 'Dairy-based' },
    veg:      { factor: 1.5,  unit: 'meal', label: 'Vegetarian' },
    vegan:    { factor: 0.9,  unit: 'meal', label: 'Vegan' }
  },
  shopping: {
    'high-impact':  { factor: 5.0, unit: 'item', label: 'High Impact' },
    normal:         { factor: 2.0, unit: 'item', label: 'Normal' },
    'eco-friendly': { factor: 0.5, unit: 'item', label: 'Eco-Friendly' },
    secondhand:     { factor: 0.2, unit: 'item', label: 'Secondhand' }
  }
};

const calculateEmission = (type, category, value) => {
  const typeFactors = EMISSION_FACTORS[type];
  if (!typeFactors) throw new Error(`Unknown activity type: ${type}`);

  const categoryData = typeFactors[category];
  if (!categoryData) throw new Error(`Unknown category '${category}' for type '${type}'`);

  return parseFloat((categoryData.factor * value).toFixed(4));
};

const getEmissionFactors = () => EMISSION_FACTORS;

const getCategoryInfo = (type, category) => EMISSION_FACTORS[type]?.[category] || null;

module.exports = { calculateEmission, getEmissionFactors, getCategoryInfo, EMISSION_FACTORS };
