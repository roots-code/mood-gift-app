import React, { useState } from 'react';

const CustomMessageCard = ({ message, task, mood }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div className="message-card-container">
      <div 
        className={`message-card ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="card-front">
          <div className="card-header">
            <div className="mood-indicator" style={{'--mood-color': mood?.accent}}>
              {mood?.emoji}
            </div>
            <div className="shimmer-effect"></div>
          </div>
          <div className="message-content">
            <p>{message}</p>
          </div>
          <div className="flip-hint">Tap to see your task 💫</div>
        </div>
        
        <div className="card-back">
          <div className="task-content">
            <h3>Your Special Task</h3>
            <p>{task}</p>
          </div>
          <div className="particle-effect"></div>
        </div>
      </div>
    </div>
  );
};

export default CustomMessageCard;
