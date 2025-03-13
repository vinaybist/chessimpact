// auth.js - Cleaned up and streamlined version

// Configuration
const USE_BACKEND = true; // Set to true since your backend is ready

// Initialize Google Sign-In when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth system initialized');
    updateAuthUI();
    setupUserMenu();
    setupProfileDropdown();
    handleSignupPageForLoggedInUser(); 
    protectLessonsSection(); // for members only
    
});

// User menu functionality
function setupUserMenu() {
    const userMenu = document.getElementById('user-menu');
    const loginButton = document.getElementById('login-button');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-button');
    const profileContainer = document.getElementById('profile-container');
    
    // If we're using the simple profile icon approach
    if (profileContainer) {
        profileContainer.addEventListener('click', function() {
            // You can add dropdown functionality here or redirect to profile page
            console.log('Profile icon clicked');
        });
    }
    
    // Toggle user dropdown when clicking the user menu (if it exists)
    if (userMenu) {
        userMenu.addEventListener('click', function(e) {
            if (!e.target.closest('a')) { // Don't toggle if clicking a link
                this.classList.toggle('open');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (userMenu && userMenu.classList.contains('open') && !e.target.closest('#user-menu')) {
                userMenu.classList.remove('open');
            }
        });
    }
    
    // Setup logout button (if it exists)
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}
function setupProfileDropdown() {
    const profileContainer = document.getElementById('profile-container');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const logoutButton = document.getElementById('logout-button');
    
    if (profileContainer) {
        // Update user info in dropdown
        const userJson = localStorage.getItem('user');
        if (userJson) {
            const user = JSON.parse(userJson);
            if (userName) userName.textContent = user.name || 'User';
            if (userEmail) userEmail.textContent = user.email || '';
        }
        
        // Toggle dropdown on click
        profileContainer.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('open');
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener('click', function() {
            profileContainer.classList.remove('open');
        });
        
        // Handle logout
        if (logoutButton) {
            logoutButton.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    }
}
// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update UI
    updateAuthUI();
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = 'You have been logged out';
    notification.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; border-radius: 4px; z-index: 1000;';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
    
    // Redirect to home if needed
    window.location.href = 'index.html';
}

// Update UI based on authentication status
function updateAuthUI() {
    const userMenu = document.getElementById('user-menu');
    const loginButton = document.getElementById('login-button');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const profileContainer = document.getElementById('profile-container');
    const profileImage = document.getElementById('profile-image');
    const googleSignIn = document.querySelector('.g_id_signin');
    const userEmail = document.getElementById('user-email');

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && (user.id || user.email)) {
        // User is logged in
        console.log('User is logged in:', user.name || user.email);
        
        // Handle profile icon (simplified approach)
        if (profileContainer && profileImage) {
            if (user.picture) {
                profileImage.src = user.picture;
            } else {
                profileImage.src = 'images/default-avatar.png';
            }
            profileContainer.style.display = 'block';
        }
        
        // Handle detailed user menu (if it exists)
        if (userMenu) userMenu.style.display = 'block';
        if (loginButton) loginButton.style.display = 'none';
        if (userAvatar) userAvatar.src = user.picture || 'images/default-avatar.png';
        if (userName) userName.textContent = user.name || user.email;

        // Update user info in dropdown
        if (userEmail) userEmail.textContent = user.email || '';        
        
        // Hide Google Sign-In button if it exists
        if (googleSignIn) googleSignIn.style.display = 'none';
        
    } else {
        // User is not logged in
        console.log('User is not logged in');
        
        // Handle profile icon (simplified approach)
        if (profileContainer) profileContainer.style.display = 'none';
        
        // Handle detailed user menu (if it exists)
        if (userMenu) userMenu.style.display = 'none';
        if (loginButton) loginButton.style.display = 'block';
        
        // Show Google Sign-In button if it exists
        if (googleSignIn) googleSignIn.style.display = 'block';
    }
}

// Show login success message
function showLoginSuccess(user) {
    const notification = document.createElement('div');
    notification.className = 'login-notification';
    notification.textContent = `Welcome, ${user.name || user.email}!`;
    notification.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; border-radius: 4px; z-index: 1000;';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Handle the credential response from Google
async function handleCredentialResponse(response) {
    console.log("Received Google token, sending to server...");
    
    try {
        const result = await fetch('/api/auth/google-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: response.credential })
        });
        
        if (!result.ok) {
            throw new Error(`Server responded with status: ${result.status}`);
        }
        
        const data = await result.json();
        
        if (data.success) {
            // Store the token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            console.log('Successfully authenticated with server');
            
            // Update UI
            updateAuthUI();
            showLoginSuccess(data.user);
            // Restore lesson section if on the same page
            //restoreTacticsSection();            
            protectLessonsSection();
        } else {
            console.error('Login failed:', data.message);
            alert('Login failed: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        alert('Error communicating with the server. Please try again later.');
    }
}

// Function to restore tactics section after login
function restoreTacticsSection() {
    const tacticsSection = document.getElementById('tactics');
    if (!tacticsSection) return;
    
    // Check if login message exists (which means we previously hid the tactics)
    const loginMessage = tacticsSection.querySelector('.login-required-message');
    if (loginMessage) {
        // Create the iframe again
        const iframe = document.createElement('iframe');
        iframe.src = 'https://livetactics.chessbase.com';
        iframe.width = '400';
        iframe.height = '440';
        
        // Replace login message with iframe
        loginMessage.parentNode.replaceChild(iframe, loginMessage);
    }
}

// Function to decode JWT tokens (utility function)
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error decoding JWT:', e);
        return {};
    }
}

// Check if user is already logged in on the sign-up page
function handleSignupPageForLoggedInUser() {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const signupFormContainer = document.querySelector('.form-container');
    
    // Only proceed if we're on the signup page and there's a form
    if (!signupFormContainer) return;
    
    if (token && userJson) {
        // User is already logged in
        const user = JSON.parse(userJson);
        const userName = user.name || user.email;
        
        // Create a friendly message
        const loggedInMessage = document.createElement('div');
        loggedInMessage.className = 'logged-in-message';
        loggedInMessage.innerHTML = `
            <h3>You're already signed in!</h3>
            <p>You are currently logged in as <strong>${userName}</strong>.</p>
            <p>If you want to use a different account, please <a href="#" id="logout-link">sign out</a> first.</p>
        `;
        
        // Apply some styles
        loggedInMessage.style.textAlign = 'center';
        loggedInMessage.style.padding = '30px';
        loggedInMessage.style.backgroundColor = '#f0f8ff';
        loggedInMessage.style.borderRadius = '8px';
        loggedInMessage.style.border = '1px solid #d1e7ff';
        loggedInMessage.style.marginTop = '20px';
        
        // Replace the form with the message
        signupFormContainer.innerHTML = '';
        signupFormContainer.appendChild(loggedInMessage);
        
        // Add logout functionality
        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            logout();
            window.location.reload(); // Reload the page to show the form again
        });
    }
}

/**
 * Protect the tactics section for logged-in users only
 */
function protectTacticsSection() {
    const tacticsSection = document.getElementById('tactics');
    if (!tacticsSection) return; // Exit if section doesn't exist
    
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    if (!token || !userJson) {
        // Not logged in - replace content with login prompt
        const originalIframe = tacticsSection.querySelector('iframe');
        if (originalIframe) {
            // Save the iframe src if we need it later
            const iframeSrc = originalIframe.src;
            
            // Replace the iframe with a login message
            const loginMessage = document.createElement('div');
            loginMessage.className = 'login-required-message';
            loginMessage.innerHTML = `
                <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0;">
                    <h3 style="margin-bottom: 15px; color: #4a94d0;">Members-Only Content</h3>
                    <p style="margin-bottom: 20px;">Please sign in to access our chess tactics training.</p>
                    <a href="#signup" class="btn" style="display: inline-block; background-color: #4a94d0; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Sign In</a>
                </div>
            `;
            
            // Replace the iframe with our message
            originalIframe.parentNode.replaceChild(loginMessage, originalIframe);
        }
    }
}

/**
 * Protect the lessons section for logged-in users only
 */
function protectLessonsSection() {
    const lessonsContent = document.getElementById('lessons-content');
    if (!lessonsContent) return; // Exit if section doesn't exist
    
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    // Clear loading message
    lessonsContent.innerHTML = '';
    
    if (!token || !userJson) {
        // Not logged in - show login prompt
        lessonsContent.innerHTML = `
            <div class="login-required-message" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0;">
                
                <p style="margin-bottom: 20px;">Please sign in to book chess lessons with our coaches.</p>
                <a href="#signup" class="btn" style="display: inline-block; background-color: #4a94d0; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Sign In</a>
            </div>
        `;
    } else {
        // Logged in - show booking interface
        const user = JSON.parse(userJson);
        lessonsContent.innerHTML = `
            <div class="lessons-booking">
                <div class="coaches-list">
                    <div class="coach-card">
                        <img src="images/team/Atharva.jpg" alt="Atharva Bist" onerror="this.src='images/placeholder.jpg'">
                        <h3>Atharva Bist</h3>
                        <p>Candidate Master</p>
                        <p>Specializes in openings, middlegame, endgames and strategy</p>
                        <button class="book-lesson-btn" data-coach="Atharva">Book a Lesson</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to booking buttons
        const bookButtons = lessonsContent.querySelectorAll('.book-lesson-btn');
        bookButtons.forEach(button => {
            button.addEventListener('click', function() {
                const coach = this.getAttribute('data-coach');
                //alert(`Thank you for your interest in booking a lesson with ${coach === 'david' ? 'David' : 'Maria'}. We will contact you at ${user.email} to schedule your lesson.`);
                alert(`Thank you for your interest in booking a lesson. We will contact you at ${user.email} to schedule your lesson.`);
            });
        });
    }
}