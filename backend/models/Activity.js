const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Activity = sequelize.define('Activity', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['transportation', 'electricity', 'food', 'shopping']]
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  emission: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  notes: {
    type: DataTypes.STRING(200),
    defaultValue: ''
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() { return this.id; }
  }
}, { timestamps: true });

module.exports = Activity;
