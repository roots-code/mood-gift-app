import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import AIChatbot from './components/AIChatbot';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { DatabaseService } from './services/DatabaseService';

// SVG Icons
const HeartIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={`heart-icon ${className}`} fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const FlowerIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={`flower-icon ${className}`} fill="currentColor">
    <g>
      <circle cx="12" cy="8" r="3" opacity="0.9"/>
      <circle cx="8" cy="12" r="2.5" opacity="0.8"/>
      <circle cx="16" cy="12" r="2.5" opacity="0.8"/>
      <circle cx="12" cy="16" r="2" opacity="0.7"/>
      <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" opacity="0.9"/>
    </g>
  </svg>
);

const StarIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={`star-icon ${className}`} fill="currentColor">
    <path d="M12,1L15.09,8.26L22,9L17,14L18.18,21L12,17.77L5.82,21L7,14L2,9L8.91,8.26L12,1Z"/>
  </svg>
);

// Authentication Configuration
const AUTH_CONFIG = {
  ADMIN_PASSWORDS: ["AdminLove2025", "CosmicAdmin123", "SuhasiniAdmin"],
  USER_PASSWORD: "LoveYouForever",
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

// Mood Data
const moodData = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: '#FFB700' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: '#00D4FF' },
  { id: 'excited', label: 'Excited', emoji: '🤩', color: '#FF006E' },
  { id: 'calm', label: 'Calm', emoji: '😌', color: '#00F5A0' },
  { id: 'romantic', label: 'Romantic', emoji: '😍', color: '#FF006E' },
  { id: 'confused', label: 'Confused', emoji: '😕', color: '#9D4EDD' }
];

// Mood Colors Map
const moodColors = {
  happy: '#FFB700',
  sad: '#00D4FF', 
  excited: '#FF006E',
  calm: '#00F5A0',
  romantic: '#FF006E',
  confused: '#9D4EDD'
};

// Default Mood Content
const defaultMoodContent = {
  happy: {
    messages: [
      "🌟 Your light radiates across galaxies, bringing joy to every corner of the universe!",
      "✨ Like a supernova of happiness, your energy illuminates the cosmic dance of life!",
      "🌈 You are the aurora borealis of emotions, painting the sky with pure bliss!"
    ],
    tasks: [
      "🌟 Step outside and let the sunlight charge your cosmic energy for 10 minutes!",
      "🎵 Create a playlist that makes your soul dance like planets in orbit!",
      "📸 Capture a moment of beauty and imagine it as a new constellation!"
    ],
    surprises: [
      { text: "🌌 Cosmic Dance Playlist", icon: "💃", url: "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd" }
    ]
  },
  sad: {
    messages: [
      "🌙 Even in cosmic storms, you are protected by the gentle embrace of starlight.",
      "💙 Like the moon's phases, your emotions are natural cycles of cosmic beauty.",
      "🌊 Let the tears flow like meteor showers - they cleanse your soul's atmosphere."
    ],
    tasks: [
      "🛁 Take a cosmic bath and imagine floating peacefully in warm starlight.",
      "🫖 Sip tea slowly while watching clouds drift like distant galaxies.",
      "📝 Write your feelings on paper, then release them to the cosmic winds."
    ],
    surprises: [
      { text: "🌙 Healing Moon Meditation", icon: "🧘‍♀️", url: "https://www.youtube.com/watch?v=92i5m3tV5XY" }
    ]
  },
  excited: {
    messages: [
      "🚀 Your excitement propels you through space faster than light itself!",
      "⚡ You are a cosmic lightning bolt of pure energy and infinite possibility!",
      "🌟 Like a pulsar radiating joy, your enthusiasm reaches across galaxies!"
    ],
    tasks: [
      "🎉 Do a victory dance that could be seen from the International Space Station!",
      "📱 Record a voice message to your future self about this cosmic excitement!",
      "🎯 Create a vision board of your most stellar dreams and goals!"
    ],
    surprises: [
      { text: "🚀 Launch Your Dream Planner", icon: "🎯", url: "https://www.pinterest.com/search/pins/?q=vision%20board" }
    ]
  },
  calm: {
    messages: [
      "🌊 Your peace flows like cosmic rivers through infinite dimensions of serenity.",
      "🧘‍♀️ In the stillness of space, your soul finds its perfect orbital rhythm.",
      "🌙 You are the calm eye in the center of swirling galactic storms."
    ],
    tasks: [
      "🧘‍♀️ Float in meditation for 10 minutes, imagining yourself in peaceful space.",
      "🫖 Prepare tea mindfully, as if brewing elixir from distant star systems.",
      "🌿 Spend time with nature and feel your connection to the living cosmos."
    ],
    surprises: [
      { text: "🌊 Cosmic Ocean Meditation", icon: "🧘‍♀️", url: "https://www.calm.com/" }
    ]
  },
  romantic: {
    messages: [
      "💕 Your love creates binary star systems - two hearts orbiting in perfect harmony!",
      "💖 Like cosmic radiation, your love reaches every corner of the universe!",
      "🌹 You are Venus and Mars dancing together in the cosmic ballet of romance!"
    ],
    tasks: [
      "💌 Write a love letter to someone special using cosmic metaphors!",
      "🌟 Look at the night sky and send loving thoughts to your favorite constellation!",
      "💝 Do something kind that spreads love like light across the universe!"
    ],
    surprises: [
      { text: "💕 Cosmic Love Poetry Generator", icon: "💌", url: "https://www.theknot.com/content/love-letter-examples" }
    ]
  },
  confused: {
    messages: [
      "🌫️ In cosmic fog, new stars are being born - your confusion is creating clarity!",
      "🧭 Like a space explorer, you're navigating uncharted territories of understanding!",
      "🌀 Your questioning mind is a cosmic compass, always seeking true north!"
    ],
    tasks: [
      "📝 Write down what's puzzling you - sometimes Earth-words help cosmic thoughts!",
      "🚶‍♀️ Take a gentle walk and let your thoughts orbit freely around the question.",
      "☕ Sip something warm while your mind floats in comfortable cosmic uncertainty."
    ],
    surprises: [
      { text: "🧘‍♀️ Clarity Through Cosmic Meditation", icon: "🌟", url: "https://www.youtube.com/watch?v=inpok4MKVLM" }
    ]
  }
};

// Utility Functions
const utilityFunctions = {
  getRandomItem: (array) => array[Math.floor(Math.random() * array.length)]
};

// Loading Screen Component
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="cosmic-loader">
      <div className="loader-rings">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
      </div>
      <HeartIcon size={36} className="loading-heart" />
    </div>
    <p className="loading-text">Creating your pixel universe...</p>
  </div>
);

// Main Application Component
export default function CosmicMoodApp() {
  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // App States
  const [currentMood, setCurrentMood] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [moodContent] = useState(defaultMoodContent);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    checkExistingSession();
    initializeSession();
  }, []);

  const checkExistingSession = () => {
    const session = localStorage.getItem('pixel_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const now = Date.now();
        
        if (sessionData.expires > now) {
          setIsAuthenticated(true);
          setIsAdmin(sessionData.isAdmin || false);
          console.log(`✅ Session restored: ${sessionData.isAdmin ? 'Admin' : 'User'} mode`);
          return;
        } else {
          // Session expired
          localStorage.removeItem('pixel_session');
        }
      } catch (error) {
        localStorage.removeItem('pixel_session');
      }
    }
  };

  const initializeSession = () => {
    if (!sessionStorage.getItem('pixel_app_session')) {
      sessionStorage.setItem('pixel_app_session', `session_${Date.now()}`);
    }
  };

  // Single Authentication Handler
  const handleAuth = useCallback(async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setIsLoading(true);
    setErrorMessage("");

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const trimmedPassword = passwordInput.trim();

    // Check if admin password
    if (AUTH_CONFIG.ADMIN_PASSWORDS.includes(trimmedPassword)) {
      const sessionData = {
        isAdmin: true,
        expires: Date.now() + AUTH_CONFIG.SESSION_TIMEOUT,
        loginTime: Date.now()
      };
      
      localStorage.setItem('pixel_session', JSON.stringify(sessionData));
      setIsAuthenticated(true);
      setIsAdmin(true);
      
      // Log admin login
      await DatabaseService.saveResponse('admin', 'admin_login', {
        loginTime: new Date().toISOString(),
        sessionId: sessionStorage.getItem('pixel_app_session')
      }, null);
      
    } else if (trimmedPassword === AUTH_CONFIG.USER_PASSWORD) {
      const sessionData = {
        isAdmin: false,
        expires: Date.now() + AUTH_CONFIG.SESSION_TIMEOUT,
        loginTime: Date.now()
      };
      
      localStorage.setItem('pixel_session', JSON.stringify(sessionData));
      setIsAuthenticated(true);
      setIsAdmin(false);
      
      // Log user login
      await DatabaseService.saveResponse('suhasini', 'user_login', {
        loginTime: new Date().toISOString(),
        sessionId: sessionStorage.getItem('pixel_app_session')
      }, null);
      
    } else {
      setErrorMessage("🔒 Access denied. Invalid cosmic key!");
    }

    setIsLoading(false);
  }, [passwordInput]);

  // Logout Handler
  const handleLogout = useCallback(async () => {
    // Log logout
    if (isAdmin) {
      await DatabaseService.saveResponse('admin', 'admin_logout', {
        logoutTime: new Date().toISOString()
      }, null);
    } else {
      await DatabaseService.saveResponse('suhasini', 'user_logout', {
        logoutTime: new Date().toISOString()
      }, null);
    }

    localStorage.removeItem('pixel_session');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentMood(null);
    setPasswordInput("");
    setShowAnalytics(false);
  }, [isAdmin]);

  // Mood Selection Handler
  const handleMoodSelect = useCallback(async (moodId) => {
    setCurrentMood(moodId);
    setUploadedPhotos([]);
    
    // Save mood selection
    const userId = isAdmin ? 'admin_viewing' : 'suhasini';
    await DatabaseService.saveResponse(userId, 'mood_selection', {
      selectedMood: moodId,
      previousMood: currentMood,
      selectionTime: new Date().toISOString(),
      userType: isAdmin ? 'admin' : 'user'
    }, moodId);
  }, [currentMood, isAdmin]);

  // Photo Upload Handler
  const handlePhotoUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.size <= 10000000);
    
    const photos = validFiles.map((file, i) => ({
      id: Date.now() + i,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setUploadedPhotos(prev => [...prev, ...photos]);
    
    // Save photo upload
    const userId = isAdmin ? 'admin_viewing' : 'suhasini';
    await DatabaseService.saveResponse(userId, 'photo_upload', {
      photoCount: validFiles.length,
      totalSize: validFiles.reduce((sum, f) => sum + f.size, 0),
      fileNames: validFiles.map(f => f.name),
      userType: isAdmin ? 'admin' : 'user'
    }, currentMood);
  }, [currentMood, isAdmin]);

  // Confetti Handler
  const triggerConfetti = useCallback(async () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    
    // Save surprise interaction
    const userId = isAdmin ? 'admin_viewing' : 'suhasini';
    await DatabaseService.saveResponse(userId, 'surprise_click', {
      surpriseType: 'confetti',
      moodContext: currentMood,
      clickTime: new Date().toISOString(),
      userType: isAdmin ? 'admin' : 'user'
    }, currentMood);
  }, [currentMood, isAdmin]);

  // Admin Header (only visible to admin)
  const AdminHeader = () => {
    if (!isAdmin) return null;
    
    return (
      <div className="admin-header-bar">
        <div className="admin-status">
          <span className="admin-indicator">🎮 Pixel Admin Mode</span>
          <div className="admin-controls">
            <button 
              onClick={() => setShowAnalytics(true)}
              className="admin-analytics-btn"
              title="View Analytics"
            >
              📊 Analytics
            </button>
            <button 
              onClick={handleLogout}
              className="admin-logout-btn"
              title="Logout"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    );
  };

  // User Logout Button (only visible to regular users)
  const UserLogoutButton = () => {
    if (isAdmin) return null;
    
    return (
      <button 
        onClick={handleLogout}
        className="user-logout-btn"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 2000,
          background: 'var(--pixel-danger)',
          border: '2px solid var(--text-primary)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.8rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          transition: 'var(--pixel-transition)',
          borderRadius: '4px'
        }}
      >
        🚪 Logout
      </button>
    );
  };

  // Loading Screen
  if (isLoading) return <LoadingScreen />;

  // Authentication Screen (Single Login for Both Admin/User)
  if (!isAuthenticated) {
    return (
      <div className="cosmic-app">
        <div className="cosmic-auth">
          <div className="auth-cosmic-portal">
            <div className="portal-rings">
              <div className="portal-ring"></div>
              <div className="portal-ring"></div>
              <div className="portal-ring"></div>
            </div>
            <FlowerIcon size={60} className="portal-icon" />
          </div>
          
          <div className="auth-content">
            <h1 className="cosmic-title">🎮 Pixel Mood Universe</h1>
            <p className="cosmic-subtitle">Enter your cosmic password to begin the journey</p>
            
            <div className="cosmic-riddle">
              <div className="riddle-scroll">
                <h3 className="riddle-title">🌟 Cosmic Access Portal 🌟</h3>
                <div className="riddle-content">
                  <p className="riddle-verse">
                    <em>"Three words that echo through dimensions of time,<br/>
                    A promise, a feeling, forever sublime.<br/>
                    Speak the phrase that unlocks hearts in space,<br/>
                    The key to this magical, pixelated place."</em>
                  </p>
                  <div className="riddle-divider">✨ ⭐ ✨</div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleAuth} className="cosmic-form">
              <div className="cosmic-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter your cosmic password..."
                  className="cosmic-input"
                  autoFocus
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              {errorMessage && (
                <div className="cosmic-error">
                  <StarIcon size={16} />
                  {errorMessage}
                </div>
              )}
              
              <button type="submit" className="cosmic-button" disabled={!passwordInput.trim()}>
                <span>🚀 Enter Pixel Universe</span>
              </button>
            </form>

            <div className="login-hint" style={{
              textAlign: 'center',
              marginTop: '2rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              opacity: 0.7
            }}>
              <p>💡 Hint: The answer lies in the heart of every cosmic love story...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App (Same UI for Both Admin and User, but with conditional admin features)
  return (
    <>
      <AdminHeader />
      <UserLogoutButton />
      
      <div className="cosmic-app">
        {!currentMood ? (
          // Mood Selection Screen - Using 2D Circular Selector
          <div className="cosmic-mood-selection">
            <div className="cosmic-header">
              <FlowerIcon size={40} className="cosmic-flower" />
              <h1 className="cosmic-main-title" data-text={`Hello ${isAdmin ? 'Admin' : 'Suhasini'}! 🎮`}>
                Hello {isAdmin ? 'Admin' : 'Suhasini'}! 
              </h1>
              <p className="cosmic-main-subtitle">
                {isAdmin 
                  ? 'Viewing the pixel mood universe in admin mode' 
                  : 'What cosmic energy flows through your heart today?'
                }
              </p>
            </div>
            
            {/* 2D Circular Mood Selector */}
            <div className="cosmic-circle-container">
              <div className="cosmic-center">
                <div className="center-orb">
                  <HeartIcon size={48} className="center-heart" />
                </div>
              </div>
              
              <div className="mood-constellation">
                {moodData.map((mood, index) => {
                  const angle = (360 / moodData.length) * index;
                  return (
                    <button
                      key={mood.id}
                      className="mood-planet"
                      style={{
                        '--angle': `${angle}deg`,
                        '--color': mood.color
                      }}
                      onClick={() => handleMoodSelect(mood.id)}
                    >
                      <div className="planet-surface">
                        <span className="planet-emoji">{mood.emoji}</span>
                        <span className="planet-label">{mood.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="cosmic-footer">
              <p>✨ {isAdmin ? 'Admin viewing pixel mood universe' : 'Across infinite pixels, love finds its way'} ✨</p>
            </div>
          </div>
        ) : (
          // Mood Content Screen - Using 2D Cards
          <div className="cosmic-content">
            <div className="cosmic-nav">
              <button className="cosmic-back-btn" onClick={() => setCurrentMood(null)}>
                <StarIcon size={16} />
                <span>Back to Universe</span>
              </button>
              
              <div className="current-mood-badge">
                <span className="badge-emoji">{moodData.find(m => m.id === currentMood)?.emoji}</span>
                <span className="badge-text">
                  {isAdmin ? 'Admin viewing' : 'Feeling'} {moodData.find(m => m.id === currentMood)?.label}
                </span>
              </div>
            </div>
            
            {/* 2D Card Grid */}
            <div className="cosmic-cards-galaxy" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              
              {/* Message Card */}
              <div className="cosmic-card message-card" style={{'--card-index': 0}}>
                <div className="card-constellation">
                  <HeartIcon size={32} className="constellation-icon" />
                </div>
                <h3 className="card-title" data-text="Pixel Message">Pixel Message</h3>
                <p className="card-message">
                  {moodContent[currentMood]?.messages ? 
                    utilityFunctions.getRandomItem(moodContent[currentMood].messages) : 
                    "You are a beautiful soul radiating pixel energy! ✨"
                  }
                </p>
                <div className="card-stars">
                  <StarIcon size={12} />
                  <StarIcon size={12} />
                  <StarIcon size={12} />
                </div>
              </div>
              
              {/* Task Card */}
              <div className="cosmic-card task-card" style={{'--card-index': 1}}>
                <div className="card-constellation">
                  <FlowerIcon size={32} className="constellation-icon" />
                </div>
                <h3 className="card-title" data-text="Soul Mission">Soul Mission</h3>
                <p className="card-message">
                  {moodContent[currentMood]?.tasks ? 
                    utilityFunctions.getRandomItem(moodContent[currentMood].tasks) : 
                    "Take a moment to breathe deeply and appreciate this pixel moment! 🌟"
                  }
                </p>
              </div>
              
              {/* Photo Card */}
              <div className="cosmic-card photo-card" style={{'--card-index': 2}}>
                <div className="card-constellation">
                  <StarIcon size={32} className="constellation-icon" />
                </div>
                <h3 className="card-title" data-text="Capture the Pixels">Capture the Pixels</h3>
                
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="cosmic-file-input"
                  id="pixel-photos"
                />
                <label htmlFor="pixel-photos" className="cosmic-upload-btn">
                  <StarIcon size={16} />
                  <span>Choose Photos</span>
                </label>
                
                {uploadedPhotos.length > 0 && (
                  <div className="cosmic-photo-galaxy">
                    {uploadedPhotos.map((photo, i) => (
                      <div key={photo.id} className="photo-star" style={{'--delay': `${i * 0.1}s`}}>
                        <img src={photo.url} alt={photo.name} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* AI Chat Card */}
              <div className="cosmic-card ai-card" style={{'--card-index': 3}}>
                <div className="card-constellation">
                  <StarIcon size={32} className="constellation-icon" />
                </div>
                <h3 className="card-title" data-text="AI Companion">AI Companion</h3>
                <AIChatbot 
                  currentMood={currentMood} 
                  onMessage={(message) => {
                    const userId = isAdmin ? 'admin_viewing' : 'suhasini';
                    DatabaseService.saveResponse(userId, 'ai_chat', {
                      message: message,
                      mood: currentMood,
                      userType: isAdmin ? 'admin' : 'user',
                      timestamp: new Date().toISOString()
                    }, currentMood);
                  }} 
                />
              </div>
              
              {/* Surprise Card */}
              <div className="cosmic-card cosmic-surprise-card" style={{'--card-index': 4}}>
                <div className="cosmic-surprise-header">
                  <div className="surprise-glow-orb">
                    <StarIcon size={40} className="cosmic-surprise-icon" />
                  </div>
                  <h3 className="surprise-title">✨ Pixel Surprise ✨</h3>
                </div>
                
                {showConfetti && (
                  <div className="cosmic-confetti">
                    {Array.from({ length: 50 }, (_, i) => (
                      <div
                        key={i}
                        className="confetti-star"
                        style={{
                          '--x': Math.random(),
                          '--delay': `${Math.random() * 2}s`,
                          '--color': moodData.find(m => m.id === currentMood)?.color || '#00D4FF'
                        }}
                      />
                    ))}
                  </div>
                )}
                
                <div className="surprise-content">
                  <p className="surprise-description">Something magical awaits in the pixel realm...</p>
                  <button
                    className="cosmic-surprise-button"
                    onClick={() => {
                      triggerConfetti();
                      const surprise = moodContent[currentMood]?.surprises ? 
                        utilityFunctions.getRandomItem(moodContent[currentMood].surprises) : 
                        { text: "✨ Pixel Surprise!", url: "https://example.com", icon: "🎁" };
                      window.open(surprise.url, '_blank');
                    }}
                  >
                    <span className="cosmic-surprise-text">
                      <span className="surprise-icon-large">
                        {moodContent[currentMood]?.surprises ? 
                          utilityFunctions.getRandomItem(moodContent[currentMood].surprises).icon : 
                          "🎁"
                        }
                      </span>
                      <span className="surprise-text-content">
                        {moodContent[currentMood]?.surprises ? 
                          utilityFunctions.getRandomItem(moodContent[currentMood].surprises).text : 
                          "✨ Pixel Surprise!"
                        }
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics Dashboard - Only rendered if admin */}
        {isAdmin && (
          <AnalyticsDashboard 
            userId="suhasini" 
            isVisible={showAnalytics}
            onClose={() => setShowAnalytics(false)} 
          />
        )}
      </div>
    </>
  );
}
