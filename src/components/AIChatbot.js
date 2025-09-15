import React, { useState, useRef, useEffect } from 'react';

const AIChatbot = ({ currentMood, onMessage }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const moodResponses = {
    happy: [
      "🌟 Your happiness is contagious! What's bringing you such joy today?",
      "✨ I love seeing you so radiant! Tell me more about what's making you smile!",
      "🎉 Your positive energy is amazing! What adventure should we plan?"
    ],
    sad: [
      "💙 I'm here for you. Sometimes it helps to talk about what's on your mind.",
      "🤗 It's okay to feel sad sometimes. Would you like to share what's bothering you?",
      "🌙 Every storm passes. I'm here to listen and support you."
    ],
    excited: [
      "🚀 Wow! Your excitement is electrifying! What's got you so pumped up?",
      "⚡ I can feel your energy through the screen! Tell me about this amazing thing!",
      "🎯 Your enthusiasm is incredible! Let's channel this energy into something awesome!"
    ],
    calm: [
      "🧘‍♀️ Your peaceful energy is so soothing. How are you finding this tranquility?",
      "🌊 I love your calm vibe. What's helping you feel so centered today?",
      "🍃 Your serenity is beautiful. Would you like to share your secret to staying so peaceful?"
    ],
    romantic: [
      "💕 Love is in the air! Tell me about the special person making your heart flutter.",
      "🌹 Your romantic energy is so sweet! What's making you feel so loved today?",
      "💖 Aww, someone's feeling the love! I'd love to hear your romantic story."
    ],
    confused: [
      "🤔 It's totally normal to feel puzzled sometimes. What's on your mind?",
      "🧭 Let's work through this confusion together. What's got you feeling uncertain?",
      "💭 Sometimes talking helps clarify our thoughts. What's puzzling you?"
    ]
  };

  const generalResponses = [
    "That's really interesting! Tell me more about that.",
    "I understand. How does that make you feel?",
    "That sounds important to you. What do you think about it?",
    "Thanks for sharing that with me. What else is on your mind?",
    "I appreciate you opening up. How can I help you with that?",
    "That's a great point! What made you think of that?",
    "I'm here to listen. Please, continue...",
    "That's fascinating! Can you elaborate on that?"
  ];

  useEffect(() => {
    if (currentMood && messages.length === 0) {
      // Send initial greeting based on mood
      const initialMessage = {
        id: Date.now(),
        text: `Hi there! I can sense you're feeling ${currentMood} today. ${getRandomResponse(moodResponses[currentMood] || generalResponses)}`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [currentMood]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRandomResponse = (responseArray) => {
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Keyword-based responses
    if (lowerMessage.includes('love') || lowerMessage.includes('relationship')) {
      return getRandomResponse([
        "💕 Love is such a beautiful thing! Tell me more about your feelings.",
        "❤️ Relationships can be wonderful and challenging. How are you navigating yours?",
        "💖 It sounds like love is on your mind. What's your heart telling you?"
      ]);
    }
    
    if (lowerMessage.includes('work') || lowerMessage.includes('job')) {
      return getRandomResponse([
        "💼 Work can be both rewarding and stressful. How are things going for you?",
        "🎯 Finding balance in work is so important. What's challenging you right now?",
        "⚡ Career stuff can be tough! What would make your work situation better?"
      ]);
    }
    
    if (lowerMessage.includes('friend') || lowerMessage.includes('family')) {
      return getRandomResponse([
        "👥 Relationships with friends and family are so precious. Tell me about yours!",
        "💫 The people we care about mean everything. What's happening with your loved ones?",
        "🤗 Family and friends shape our world. How are your relationships going?"
      ]);
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
      return getRandomResponse([
        "🌱 Stress is tough, but you're stronger than you know. What's weighing on your mind?",
        "💚 Take a deep breath. I'm here to listen. What's causing you stress?",
        "🧘‍♀️ Anxiety can feel overwhelming. Would it help to talk through what's worrying you?"
      ]);
    }
    
    if (lowerMessage.includes('dream') || lowerMessage.includes('goal')) {
      return getRandomResponse([
        "✨ Dreams and goals give life meaning! What aspirations are lighting up your heart?",
        "🎯 I love hearing about people's dreams. What are you working towards?",
        "🌟 Goals are so important! Tell me about what you're hoping to achieve."
      ]);
    }
    
    // Mood-specific responses if current mood is set
    if (currentMood && moodResponses[currentMood]) {
      return getRandomResponse([...moodResponses[currentMood], ...generalResponses]);
    }
    
    // Default responses
    return getRandomResponse(generalResponses);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Call onMessage callback
    if (onMessage) {
      onMessage(inputMessage);
    }

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: generateAIResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const clearChat = () => {
    setMessages([]);
    if (currentMood) {
      const initialMessage = {
        id: Date.now(),
        text: `Let's start fresh! I can sense you're feeling ${currentMood}. How can I help you today?`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  };

  if (isMinimized) {
    return (
      <div className="ai-chatbot minimized">
        <div className="ai-header" onClick={() => setIsMinimized(false)}>
          <div className="ai-avatar">🤖</div>
          <div className="ai-info">
            <h4>Cosmic AI</h4>
            <p>Click to expand</p>
          </div>
          <div className="ai-expand-btn">⬆️</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-chatbot">
      <div className="ai-header">
        <div className="ai-avatar">🤖</div>
        <div className="ai-info">
          <h4>Cosmic AI Companion</h4>
          <p>Here to listen and chat</p>
          {currentMood && (
            <div className="ai-mood-indicator">
              Sensing: {currentMood} energy ✨
            </div>
          )}
        </div>
        <div className="ai-controls">
          <button 
            onClick={clearChat}
            className="ai-action-btn"
            title="Clear chat"
          >
            🗑️
          </button>
          <button 
            onClick={() => setIsMinimized(true)}
            className="ai-action-btn"
            title="Minimize"
          >
            ⬇️
          </button>
        </div>
      </div>

      <div className="ai-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message-bubble ${message.sender}`}
          >
            <div className="message-content">
              {message.text}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message-bubble ai typing">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="ai-input-container">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Share what's on your mind..."
          className="ai-input"
          disabled={isTyping}
        />
        <button 
          type="submit" 
          className="ai-send-btn"
          disabled={!inputMessage.trim() || isTyping}
        >
          🚀
        </button>
      </form>

      <div className="ai-stats">
        <span>{messages.filter(m => m.sender === 'user').length} messages sent</span>
        <span>•</span>
        <span>Mood: {currentMood || 'neutral'}</span>
      </div>
    </div>
  );
};

export default AIChatbot;
