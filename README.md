# ♟️ Chess Impact - Complete Setup & Deployment Guide

## 📋 Project Overview

Chess Impact is a full-stack chess club website featuring Google OAuth authentication, event management, photo galleries, and member-only features like lesson booking and chess tactics training.

### 🔧 Technology Stack:
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite with Sequelize ORM
- **Authentication**: Google OAuth 2.0
- **Deployment**: AWS with Caddy for HTTPS

---

## 📂 Project Structure

```
chess-impact/
├── client/                          # Frontend Application
│   ├── index.html                   # Main homepage (all sections)
│   ├── events.html                  # Events listing page
│   ├── gallery.html                 # Photo gallery with modal
│   ├── css/
│   │   └── styles.css               # Complete responsive styling
│   ├── js/
│   │   └── auth.js                  # Frontend authentication logic
│   └── images/                      # Static assets
│       ├── logo.jpg                 # Club logo
│       ├── team/                    # Team member photos
│       ├── gallery/                 # Event photos
│       └── background/              # Background images
│
├── server/                          # Backend Application
│   ├── index.js                     # Main Express server
│   ├── config/
│   │   └── database.js              # SQLite/Sequelize configuration
│   ├── models/
│   │   ├── index.js                 # Model exports & DB sync
│   │   └── User.js                  # User data model with visit tracking
│   ├── controllers/
│   │   └── authController.js        # Google OAuth verification logic
│   └── routes/
│       └── auth.js                  # Authentication API endpoints
│
├── .env                             # Environment variables (create this)
├── package.json                     # Node.js dependencies
├── chessimpact.sqlite               # SQLite database (auto-created)
└── README.md                        # Project documentation
```

---

## 🚀 Step-by-Step Setup Instructions

### **Step 1: Prerequisites**

Ensure you have these installed:
```bash
# Check versions
node --version    # Should be v14 or higher
npm --version     # Should be v6 or higher
git --version     # Optional, for version control
```

**Download if needed**: [Node.js](https://nodejs.org/)

### **Step 2: Project Setup**

```bash
# 1. Navigate to your project directory
cd path/to/chess-impact

# 2. Install dependencies
npm install express cors sequelize sqlite3 google-auth-library

# 3. Install development dependencies (optional)
npm install --save-dev nodemon
```

### **Step 3: Create Environment File**

Create `.env` file in project root:
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=279266786470-l7b0kd59d4g3de0s8isrs3qknl2q4gi7.apps.googleusercontent.com

# Server Configuration
PORT=3000
NODE_ENV=development

# Development Testing (optional)
DEV_USER_EMAIL=test@example.com
DEV_USER_NAME=Test User
```

### **Step 4: Create package.json Scripts**

Add these scripts to your `package.json`:
```json
{
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### **Step 5: Local Testing Setup (Solution 4: Comment Out OAuth)**

For local development, temporarily modify `server/controllers/authController.js`:

```javascript
exports.googleLogin = async (req, res) => {
  try {
    // 🧪 TEMPORARY: Comment out Google verification for local testing
    /*
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    */
    
    // 🧪 TEMPORARY: Use fake data for local testing
    const email = 'test@example.com';
    const name = 'Test User';
    const picture = 'images/default-avatar.png';
    const googleId = 'fake-google-id-123';
    
    console.log('🧪 LOCAL TESTING: Using fake OAuth data');
    
    // Rest of the authentication logic remains unchanged
    try {
      let user = await User.findOne({ where: { email: email } });

      if (!user) {
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
        console.log('Created test user:', email);
      } else {
        user.googleId = googleId;
        user.name = name;
        user.picture = picture;
        user.lastVisit = new Date();
        user.visitCount = (user.visitCount || 0) + 1;
        await user.save();
        console.log('Updated test user:', email, 'Visit count:', user.visitCount);
      }

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

    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({
        success: false,
        message: 'Error accessing user database',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};
```

**⚠️ IMPORTANT**: Remember to uncomment the real OAuth code before deploying to production!

### **Step 6: Run the Application**

Choose your preferred method:

#### **Option 1: Development Mode (Recommended for coding)**
```bash
npm run dev
```
- ✅ Auto-restarts on file changes
- ✅ Detailed error messages
- ✅ Perfect for development

#### **Option 2: Production Mode**
```bash
npm start
```
- ✅ Optimized performance
- ✅ Production-ready
- ✅ Use for final testing

#### **Option 3: Direct Node Command**
```bash
node server/index.js
```
- ✅ Simple and direct
- ✅ Good for quick testing

### **Step 7: Access Your Application**

Open your browser and navigate to:
- **Homepage**: http://localhost:3000
- **Events**: http://localhost:3000/events.html
- **Gallery**: http://localhost:3000/gallery.html
- **API Test**: http://localhost:3000/api/test

### **Step 8: Test Authentication**

1. Click "Sign Up" or "Sign In with Google"
2. With the temporary OAuth bypass, you'll be automatically logged in as "Test User"
3. Verify features:
   - ✅ Profile dropdown appears
   - ✅ Lessons section unlocks
   - ✅ Protected content is accessible
   - ✅ User data saves to database

---

## 🌐 HTTPS and Production Deployment

### **Why HTTPS is Required:**

Google OAuth **requires HTTPS** in production for security. You cannot use Google Sign-In with HTTP on a live domain.

### **Caddy Server Solution:**

We'll use **Caddy** as a reverse proxy on AWS to automatically handle HTTPS:

```bash
# Caddy will automatically:
✅ Obtain SSL certificates from Let's Encrypt
✅ Handle HTTPS redirects
✅ Proxy requests to your Node.js app
✅ Renew certificates automatically
```

### **Deployment Architecture:**
```
Internet → Caddy (HTTPS) → Your Node.js App (HTTP on localhost:3000)
```

### **Why This Approach:**
- **Automatic HTTPS**: Caddy handles SSL certificates
- **Easy Setup**: Minimal configuration required
- **Reliable**: Let's Encrypt integration
- **Performance**: Efficient reverse proxy
- **Security**: Your app runs on localhost, Caddy handles public traffic

### **Before Deployment Checklist:**

1. **Uncomment Real OAuth Code** in `authController.js`
2. **Update Google Console** with your domain:
   ```
   Authorized JavaScript Origins:
   https://yourdomain.com
   
   Authorized Redirect URIs:
   https://yourdomain.com/
   ```
3. **Set Production Environment**:
   ```env
   NODE_ENV=production
   PORT=3000
   GOOGLE_CLIENT_ID=your-client-id
   ```

---

## 🐛 Troubleshooting

### **Common Issues:**

#### **1. Port Already in Use**
```bash
Error: listen EADDRINUSE :::3000
```
**Solution**:
```bash
# Kill existing process
npx kill-port 3000
# Or use different port
PORT=3001 npm start
```

#### **2. Database Permission Error**
```bash
SQLITE_CANTOPEN: unable to open database file
```
**Solution**:
```bash
# Ensure directory exists and has proper permissions
mkdir -p data
chmod 755 data
```

#### **3. Google Auth Error (Local)**
```bash
Invalid authentication token
```
**Solution**: This is expected with the temporary OAuth bypass. The fake authentication should work for local testing.

#### **4. Module Not Found**
```bash
Cannot find module 'express'
```
**Solution**:
```bash
npm install
```

#### **5. Static Files Not Loading**
**Solution**: Verify this line exists in `server/index.js`:
```javascript
app.use(express.static(path.join(__dirname, '../client')));
```

---

## 📊 Success Verification

After setup, verify these features work:

### **Frontend Features:**
- [ ] Homepage loads with all sections
- [ ] Navigation works (mobile menu)
- [ ] Gallery modal opens and closes
- [ ] Events page displays properly
- [ ] Responsive design on mobile

### **Authentication Features:**
- [ ] Google Sign-In button appears
- [ ] Login process completes (with test user)
- [ ] Profile dropdown shows user info
- [ ] Logout functionality works

### **Protected Content:**
- [ ] Lessons section unlocks after login
- [ ] Tactics section shows for members
- [ ] Calendly integration loads

### **Database Features:**
- [ ] User data saves to SQLite
- [ ] Visit count increments
- [ ] User profile persists between sessions

---

## 🚀 Next Steps

Once your local setup is working:

1. **Prepare for Production**:
   - Uncomment real OAuth code
   - Set up domain and SSL
   - Configure Caddy reverse proxy

2. **Add Advanced Features**:
   - Event registration system
   - Tournament management
   - Member leaderboards
   - Admin dashboard

3. **Deploy to AWS**:
   - Set up EC2 instance
   - Configure Caddy for HTTPS
   - Update Google OAuth settings
   - Launch your chess club website!

---

****NOTE****

# 🧪 Local Testing Setup Guide

## 📁 Step 1: Create auth_local.js

1. **Save the provided code as `client/js/auth_local.js`**
2. **Keep your original `client/js/auth.js` unchanged**

## 📝 Step 2: Modify HTML Files for Local Testing

### For `index.html`:

Replace this line in the `<head>` section:
```html
<!-- PRODUCTION VERSION -->
<script src="js/auth.js"></script>
```

With this line for local testing:
```html
<!-- LOCAL TESTING VERSION -->
<script src="js/auth_local.js"></script>
```

### For `events.html` and `gallery.html`:

If they include auth.js, make the same change:
```html
<!-- Change from: -->
<script src="js/auth.js"></script>

<!-- To: -->
<script src="js/auth_local.js"></script>
```

## 🔧 Step 3: Quick Switching Method

### Option A: Manual File Switching

**For Local Development:**
```html
<script src="js/auth_local.js"></script>
```

**For Production:**
```html
<script src="js/auth.js"></script>
```



## 🎯 Step 4: Test Your Setup

### 1. Start your server:
```bash
npm run dev
```

### 2. Open browser:
```
http://localhost:3000
```

### 3. Look for indicators:
- ✅ **"🧪 LOCAL TESTING MODE"** indicator in top-right corner
- ✅ **No Google Sign-In buttons** visible
- ✅ **Test login buttons** in signup section

### 4. Test authentication:
- Click **"🧪 Test Login as Member"** - logs in as regular user
- Click **"👑 Test Login as Admin"** - logs in as admin user
- Both should show profile dropdown and unlock protected content

## 🔍 What You'll See

### Local Testing Features:
- **🧪 Visual Indicator**: Red badge showing "LOCAL TESTING MODE"
- **No Google OAuth**: Google sign-in buttons are hidden
- **Test Buttons**: Two colorful buttons for different user types
- **Fake Data**: Test users with realistic data
- **Full Functionality**: All features work without real authentication

### Test Users Created:

#### Regular Member:
```
Name: Test User
Email: test@example.com
Role: member
Visit Count: Random (1-50)
```

#### Admin User:
```
Name: Admin User  
Email: admin@chessimpact.org
Role: admin
Visit Count: Random (1-50)
```

## 📂 File Structure After Setup

```
client/
├── js/
│   ├── auth.js          ← Original (for production)
│   └── auth.js.local    ← New (for local testing)
├── index.html           ← Modified to use auth.js.local
├── events.html          ← Modified to use auth.js.local
└── gallery.html         ← Modified to use auth.js.local
```

## 🔄 Switching Between Environments

### For Local Development:
```html
<script src="js/auth.js.local"></script>
```
- No Google OAuth
- Test login buttons
- Fake user data
- All features work

### For Production Deployment:
```html
<script src="js/auth.js"></script>
```
- Real Google OAuth
- Actual user database
- Production-ready

## 💡 Pro Tips

### 1. **Use Git Ignore**
Add to `.gitignore` if you don't want to commit local testing files:
```
client/js/auth.js.local
```

### 2. **Quick Environment Switch**
Create a simple script to switch environments:

**switch-to-local.sh:**
```bash
#!/bin/bash
sed -i 's/auth\.js/auth.js.local/g' client/*.html
echo "🧪 Switched to LOCAL testing mode"
```

**switch-to-prod.sh:**
```bash
#!/bin/bash
sed -i 's/auth\.js\.local/auth.js/g' client/*.html
echo "🌐 Switched to PRODUCTION mode"
```

### 3. **Environment Variable Method**
If using a build system, you could use environment variables:
```html
<script src="js/auth<%= process.env.NODE_ENV === 'development' ? '.local' : '' %>.js"></script>
```

## 🚨 Important

- **Always use `auth.js` for production**
- **Never deploy with `auth.js.local`**
- **Test both environments before deploying**
- **Keep your Google OAuth credentials secure**

