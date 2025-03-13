// Add at the top of your file
const { syncDatabase } = require('./models');

// server/index.js
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Add this import

// Initialize express
const app = express();
const PORT = process.env.PORT || 3000;


// Initialize database
syncDatabase().then(() => {
    console.log('Database is ready.');
  });

// Import routes
const authRoutes = require('./routes/auth');
// We'll comment out the routes that don't exist yet
// const eventsRoutes = require('./routes/events');
// const usersRoutes = require('./routes/users');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// API routes
app.use('/api/auth', authRoutes);
// We'll comment out the routes that don't exist yet
// app.use('/api/events', eventsRoutes);
// app.use('/api/users', usersRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Serve the main app for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Check if we have SSL certificates

const sslOptions = {
        // load key
        key: fs.readFileSync(path.join(__dirname, 'cert', 'localhost+2-key.pem')),
        //load cert
        cert: fs.readFileSync(path.join(__dirname, 'cert', 'localhost+2.pem'))
      };

// Start server (either HTTP or HTTPS)
if (sslOptions.key && sslOptions.cert) {
    // HTTPS server
    https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(`HTTPS server running on https://localhost:${PORT}`);
    });
} else {
    // HTTP server
    app.listen(PORT, () => {
        console.log(`HTTP server running on http://localhost:${PORT}`);
    });
}