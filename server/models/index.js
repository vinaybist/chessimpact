const sequelize = require('../config/database');
const User = require('./User');

// Define any model relationships here
// Example: User.hasMany(Event)

// Sync all models with the database
const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  syncDatabase,
  User
};