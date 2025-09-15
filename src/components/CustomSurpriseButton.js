import React, { useState } from 'react';

const ConfettiExplosion = () => {
  const confetti = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className="confetti-piece"
      style={{
        '--x': Math.random(),
        '--y': Math.random(),
        '--r': Math.random() * 360,
        '--delay': Math.random() * 2 + 's'
      }}
    />
  ));

  return <div className="confetti-container">{confetti}</div>;
};

const CustomSurpriseButton = ({ surprise, onClick }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  const handleClick = () => {
    setShowConfetti(true);
    onClick();
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="surprise-button-container">
      {showConfetti && <ConfettiExplosion />}
      <button 
        className="custom-surprise-btn"
        onClick={handleClick}
      >
        <span className="btn-bg"></span>
        <span className="btn-content">
          <span className="surprise-icon">🎁</span>
          <span className="surprise-text">{surprise?.text}</span>
          <span className="sparkles">✨</span>
        </span>
      </button>
    </div>
  );
};

export default CustomSurpriseButton;
