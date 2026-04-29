const sequelize = require('./sequelize');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    require('../models/User');
    require('../models/Activity');
    await sequelize.sync();
    console.log('✅ SQLite Connected: data/ecobeacon.sqlite');
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
