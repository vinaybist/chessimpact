const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

// Your Google Client ID
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// server/controllers/authController.js
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    
    // Get user info from the token
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    
    // Find or create user in database
    try {
      // Check if User has findOrCreate method (depends on Sequelize version)
      if (typeof User.findOrCreate === 'function') {
        // Use built-in method if available
        let [user, created] = await User.findOrCreate({
          where: { email: email },
          defaults: {
            name,
            googleId,
            picture,
            role: 'member',
            visitCount: 1,
            lastVisit: new Date(),
            firstVisit: new Date()
          }
        });
        
      // If user exists, update the timestamps and visit count
      if (!created) {
        user.googleId = googleId;
        user.name = name;
        user.picture = picture;
        user.lastVisit = new Date();
        user.visitCount = (user.visitCount || 0) + 1;
        await user.save();
      }
        
// Generate token
const userToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
        
res.status(200).json({
  success: true,
  token: userToken,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    picture: user.picture,
    visitCount: user.visitCount,
    lastVisit: user.lastVisit
  }
});
} else {
// Manual implementation if findOrCreate is not available
let user = await User.findOne({ where: { email: email } });

if (!user) {
  // Create new user
  user = await User.create({
    email,
    name,
    googleId,
    picture,
    role: 'member',
    visitCount: 1,
    lastVisit: new Date(),
    firstVisit: new Date()
  });
  console.log('Created new user:', email);
} else {
  // Update existing user
  user.googleId = googleId;
  user.name = name;
  user.picture = picture;
  user.lastVisit = new Date();
  user.visitCount = (user.visitCount || 0) + 1;
  await user.save();
  console.log('Updated existing user:', email, 'Visit count:', user.visitCount);
}

// Generate token
const userToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

res.status(200).json({
  success: true,
  token: userToken,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    picture: user.picture,
    visitCount: user.visitCount,
    lastVisit: user.lastVisit
  }
});

}
  } catch (dbError) {
    console.error('Database error:', dbError);
    res.status(500).json({
    success: false,
    message: 'Error accessing user database',
    error: dbError.message
    });
  }
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({
    success: false,
    message: 'Invalid authentication token',
    error: error.message
    });
  }
};