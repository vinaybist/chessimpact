const { Sequelize } = require('sequelize');
const path = require('path');

// Define the database file path
const dbPath = path.resolve(__dirname, '../../chessimpact.sqlite');

// Create a new Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false // Set to console.log to see SQL queries
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = sequelize;