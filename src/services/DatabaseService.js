export class DatabaseService {
    // Save user response to localStorage
    static async saveResponse(userId, type, data, mood) {
      try {
        const response = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          timestamp: new Date().toISOString(),
          type, // 'mood_selection', 'ai_chat', 'photo_upload', 'surprise_click', etc.
          mood,
          data,
          sessionId: sessionStorage.getItem('cosmic_session') || 'unknown',
          userAgent: navigator.userAgent,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language
        };
  
        // Store in localStorage
        const storageKey = `cosmic_responses_${userId}`;
        const existingResponses = this.getFromLocalStorage(userId);
        existingResponses.push(response);
        
        // Keep only last 1000 responses per user
        if (existingResponses.length > 1000) {
          existingResponses.splice(0, existingResponses.length - 1000);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(existingResponses));
        
        console.log(`✅ Response saved for ${userId}:`, response);
        return response.id;
      } catch (error) {
        console.error('❌ Error saving response:', error);
        return null;
      }
    }
  
    // Get user responses from localStorage
    static async getUserResponses(userId, limitCount = 100) {
      try {
        const responses = this.getFromLocalStorage(userId);
        
        // Sort by timestamp (newest first) and limit
        return responses
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limitCount);
      } catch (error) {
        console.error('❌ Error fetching responses:', error);
        return [];
      }
    }
  
    // Get detailed analytics for a user
    static async getMoodAnalytics(userId, days = 30) {
      try {
        const responses = await this.getUserResponses(userId, 2000);
        const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
        
        // Filter responses within the time range
        const recentResponses = responses.filter(r => 
          new Date(r.timestamp) > cutoffDate
        );
  
        const analytics = {
          totalInteractions: recentResponses.length,
          moodCounts: this.countMoods(recentResponses),
          dailyActivity: this.calculateDailyActivity(recentResponses),
          hourlyActivity: this.calculateHourlyActivity(recentResponses),
          sessionAnalytics: this.calculateSessionAnalytics(recentResponses),
          typeBreakdown: this.calculateTypeBreakdown(recentResponses),
          weeklyTrends: this.calculateWeeklyTrends(recentResponses),
          moodTransitions: this.calculateMoodTransitions(recentResponses)
        };
  
        console.log(`📊 Analytics calculated for ${userId}:`, analytics);
        return analytics;
      } catch (error) {
        console.error('❌ Error calculating analytics:', error);
        return {
          totalInteractions: 0,
          moodCounts: {},
          dailyActivity: {},
          hourlyActivity: new Array(24).fill(0),
          sessionAnalytics: { totalSessions: 0, avgInteractionsPerSession: 0, avgMoodsPerSession: 0 }
        };
      }
    }
  
    // Count mood selections
    static countMoods(responses) {
      return responses
        .filter(r => r.type === 'mood_selection' && r.mood)
        .reduce((acc, r) => {
          acc[r.mood] = (acc[r.mood] || 0) + 1;
          return acc;
        }, {});
    }
  
    // Calculate daily activity
    static calculateDailyActivity(responses) {
      return responses.reduce((acc, r) => {
        const date = new Date(r.timestamp).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
    }
  
    // Calculate hourly activity
    static calculateHourlyActivity(responses) {
      const hours = new Array(24).fill(0);
      responses.forEach(r => {
        const hour = new Date(r.timestamp).getHours();
        hours[hour]++;
      });
      return hours;
    }
  
    // Calculate session analytics
    static calculateSessionAnalytics(responses) {
      const sessions = {};
      
      responses.forEach(r => {
        if (!sessions[r.sessionId]) {
          sessions[r.sessionId] = { 
            count: 0, 
            moods: new Set(),
            startTime: r.timestamp,
            endTime: r.timestamp
          };
        }
        
        sessions[r.sessionId].count++;
        if (r.mood) {
          sessions[r.sessionId].moods.add(r.mood);
        }
        
        // Update session time bounds
        if (new Date(r.timestamp) < new Date(sessions[r.sessionId].startTime)) {
          sessions[r.sessionId].startTime = r.timestamp;
        }
        if (new Date(r.timestamp) > new Date(sessions[r.sessionId].endTime)) {
          sessions[r.sessionId].endTime = r.timestamp;
        }
      });
  
      const sessionValues = Object.values(sessions);
      const totalSessions = sessionValues.length;
  
      if (totalSessions === 0) {
        return { totalSessions: 0, avgInteractionsPerSession: 0, avgMoodsPerSession: 0 };
      }
  
      return {
        totalSessions,
        avgInteractionsPerSession: sessionValues.reduce((sum, s) => sum + s.count, 0) / totalSessions,
        avgMoodsPerSession: sessionValues.reduce((sum, s) => sum + s.moods.size, 0) / totalSessions,
        avgSessionDuration: this.calculateAvgSessionDuration(sessionValues)
      };
    }
  
    // Calculate average session duration
    static calculateAvgSessionDuration(sessionValues) {
      if (sessionValues.length === 0) return 0;
      
      const totalDuration = sessionValues.reduce((sum, session) => {
        const duration = new Date(session.endTime) - new Date(session.startTime);
        return sum + duration;
      }, 0);
      
      return totalDuration / sessionValues.length; // milliseconds
    }
  
    // Calculate breakdown by interaction type
    static calculateTypeBreakdown(responses) {
      return responses.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {});
    }
  
    // Calculate weekly trends
    static calculateWeeklyTrends(responses) {
      const weeks = {};
      
      responses.forEach(r => {
        const date = new Date(r.timestamp);
        const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeks[weekKey]) {
          weeks[weekKey] = { count: 0, moods: {} };
        }
        
        weeks[weekKey].count++;
        if (r.mood) {
          weeks[weekKey].moods[r.mood] = (weeks[weekKey].moods[r.mood] || 0) + 1;
        }
      });
  
      return weeks;
    }
  
    // Calculate mood transitions
    static calculateMoodTransitions(responses) {
      const moodResponses = responses
        .filter(r => r.type === 'mood_selection' && r.mood)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
      const transitions = [];
      
      for (let i = 1; i < moodResponses.length; i++) {
        const from = moodResponses[i - 1].mood;
        const to = moodResponses[i].mood;
        
        if (from !== to) {
          transitions.push({
            from,
            to,
            timestamp: moodResponses[i].timestamp,
            timeDiff: new Date(moodResponses[i].timestamp) - new Date(moodResponses[i - 1].timestamp)
          });
        }
      }
  
      return transitions;
    }
  
    // Helper method to get data from localStorage
    static getFromLocalStorage(userId) {
      const storageKey = `cosmic_responses_${userId}`;
      try {
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('❌ Error reading from localStorage:', error);
        return [];
      }
    }
  
    // Export user data
    static async exportUserData(userId) {
      try {
        const responses = await this.getUserResponses(userId, 5000);
        const analytics = await this.getMoodAnalytics(userId, 365);
        
        return {
          userId,
          exportTimestamp: new Date().toISOString(),
          totalResponses: responses.length,
          responses,
          analytics,
          metadata: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            userAgent: navigator.userAgent
          }
        };
      } catch (error) {
        console.error('❌ Error exporting data:', error);
        return null;
      }
    }
  
    // Clear all data for a user (admin function)
    static async clearUserData(userId) {
      try {
        const storageKey = `cosmic_responses_${userId}`;
        localStorage.removeItem(storageKey);
        console.log(`🗑️ All data cleared for user: ${userId}`);
        return true;
      } catch (error) {
        console.error('❌ Error clearing data:', error);
        return false;
      }
    }
  }
  