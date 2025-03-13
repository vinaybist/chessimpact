// server/models/User.js
// This is a placeholder model until you set up a database

// Simple in-memory user store for testing
// const users = [];

// module.exports = {
//   findOne: async (filter) => {
//     // Simple implementation that mimics a database query
//     return users.find(user => user.email === filter.email);
//   },
  
//   create: async (userData) => {
//     // Create a new user
//     const newUser = {
//       _id: Date.now().toString(),
//       ...userData
//     };
//     users.push(newUser);
//     return newUser;
//   },
  
//   // Method to generate a fake auth token
//   generateAuthToken: function() {
//     return 'fake-auth-token-' + Date.now();
//   }
// };

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  // Basic user info
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Auth-related fields
  googleId: {
    type: DataTypes.STRING,
    unique: true
  },
  
  // User role
  role: {
    type: DataTypes.STRING,
    defaultValue: 'member',
    allowNull: false
  },
  
  // Profile info
  picture: {
    type: DataTypes.STRING
  },
  memberSince: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  // Chess-specific info
  chessRating: {
    type: DataTypes.INTEGER
  },
  visitCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastVisit: {
    type: DataTypes.DATE
  },
  firstVisit: {
    type: DataTypes.DATE
  }
});
                                
User.sync();

module.exports = User;