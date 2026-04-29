require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');
const sequelize = require('../config/sequelize');
const User = require('../models/User');
const Activity = require('../models/Activity');

const getRandomDate = (daysBack) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
};

const seedData = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✅ Connected to SQLite, tables reset');

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.bulkCreate([
      { name: 'Alex Green', email: 'alex@ecobeacon.com', password: hashedPassword, ecoScore: 72, streak: 5 },
      { name: 'Sam Earth', email: 'sam@ecobeacon.com', password: hashedPassword, ecoScore: 85, streak: 12 },
      { name: 'Jordan Blue', email: 'jordan@ecobeacon.com', password: hashedPassword, ecoScore: 43, streak: 2 }
    ]);

    console.log(`✅ Created ${users.length} users`);

    const activityTemplates = [
      { type: 'transportation', category: 'car',          value: 25,  emission: 5.25,  unit: 'km' },
      { type: 'transportation', category: 'bus',          value: 15,  emission: 1.335, unit: 'km' },
      { type: 'transportation', category: 'train',        value: 40,  emission: 1.64,  unit: 'km' },
      { type: 'transportation', category: 'bike',         value: 8,   emission: 0.04,  unit: 'km' },
      { type: 'transportation', category: 'walking',      value: 3,   emission: 0,     unit: 'km' },
      { type: 'transportation', category: 'flight',       value: 800, emission: 204,   unit: 'km' },
      { type: 'electricity',    category: 'standard',     value: 8,   emission: 6.8,   unit: 'kWh' },
      { type: 'electricity',    category: 'standard',     value: 12,  emission: 10.2,  unit: 'kWh' },
      { type: 'electricity',    category: 'solar',        value: 10,  emission: 0.41,  unit: 'kWh' },
      { type: 'food',           category: 'meat',         value: 1,   emission: 5.0,   unit: 'meal' },
      { type: 'food',           category: 'veg',          value: 1,   emission: 1.5,   unit: 'meal' },
      { type: 'food',           category: 'fastfood',     value: 1,   emission: 3.5,   unit: 'meal' },
      { type: 'food',           category: 'vegan',        value: 1,   emission: 0.9,   unit: 'meal' },
      { type: 'food',           category: 'beef',         value: 1,   emission: 6.61,  unit: 'meal' },
      { type: 'shopping',       category: 'normal',       value: 2,   emission: 4.0,   unit: 'item' },
      { type: 'shopping',       category: 'eco-friendly', value: 3,   emission: 1.5,   unit: 'item' },
      { type: 'shopping',       category: 'high-impact',  value: 1,   emission: 5.0,   unit: 'item' },
      { type: 'shopping',       category: 'secondhand',   value: 2,   emission: 0.4,   unit: 'item' }
    ];

    const activities = [];
    users.forEach(user => {
      for (let i = 0; i < 30; i++) {
        const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
        activities.push({
          userId: user.id,
          ...template,
          notes: '',
          date: getRandomDate(30)
        });
      }
    });

    await Activity.bulkCreate(activities);
    console.log(`✅ Created ${activities.length} activities`);

    console.log('\n🌱 Seed complete! Test credentials:');
    console.log('   Email: alex@ecobeacon.com | Password: password123');
    console.log('   Email: sam@ecobeacon.com  | Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
