import React, { useState, useRef } from 'react';

const CustomMoodWheel = ({ moods, onMoodSelect }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const wheelRef = useRef(null);

  const handleMoodClick = (mood, index) => {
    setSelectedMood(mood);
    onMoodSelect(mood.id);
    
    // Add ripple effect
    const wheel = wheelRef.current;
    const ripple = document.createElement('div');
    ripple.className = 'mood-ripple';
    wheel.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <div className="mood-wheel-container">
      <div className="mood-wheel" ref={wheelRef}>
        <div className="center-heart">💕</div>
        {moods.map((mood, index) => {
          const angle = (360 / moods.length) * index;
          return (
            <button
              key={mood.id}
              className={`mood-bubble ${selectedMood?.id === mood.id ? 'active' : ''}`}
              style={{
                '--angle': `${angle}deg`,
                '--mood-color': mood.accent
              }}
              onClick={() => handleMoodClick(mood, index)}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomMoodWheel;
