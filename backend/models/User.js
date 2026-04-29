const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ecoScore: {
    type: DataTypes.FLOAT,
    defaultValue: 50
  },
  totalEmission: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  badges: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('badges');
      try { return JSON.parse(val || '[]'); } catch { return []; }
    },
    set(val) {
      this.setDataValue('badges', JSON.stringify(Array.isArray(val) ? val : []));
    }
  },
  streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastLogDate: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() { return this.id; }
  }
}, { timestamps: true });

module.exports = User;
