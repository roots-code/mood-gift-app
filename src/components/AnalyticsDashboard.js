import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/DatabaseService';

const AnalyticsDashboard = ({ userId, isVisible, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(30);
  const [selectedView, setSelectedView] = useState('overview');
  const [error, setError] = useState(null);

  // Helper functions defined inside component
  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊', sad: '😢', excited: '🤩', 
      calm: '😌', romantic: '😍', confused: '😕'
    };
    return emojis[mood] || '💭';
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: '#FFB700', sad: '#00D4FF', excited: '#FF006E',
      calm: '#00F5A0', romantic: '#FF006E', confused: '#9D4EDD'
    };
    return colors[mood] || '#00D4FF';
  };

  const getMostFrequentMood = (moodCounts) => {
    const entries = Object.entries(moodCounts || {});
    if (entries.length === 0) return 'None yet';
    const [mood, count] = entries.sort(([,a], [,b]) => b - a)[0];
    return `${mood} (${count}x)`;
  };

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
  };

  const getMostActiveHour = (hourlyActivity) => {
    if (!hourlyActivity || hourlyActivity.length === 0) return 0;
    return hourlyActivity.indexOf(Math.max(...hourlyActivity));
  };

  useEffect(() => {
    if (isVisible && userId) {
      loadAnalytics();
    }
  }, [isVisible, userId, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await DatabaseService.getMoodAnalytics(userId, timeRange);
      console.log('📊 Analytics loaded:', data);
      setAnalytics(data);
    } catch (error) {
      console.error('❌ Failed to load analytics:', error);
      setError('Failed to load analytics data');
      setAnalytics({
        totalInteractions: 0,
        moodCounts: {},
        dailyActivity: {},
        hourlyActivity: new Array(24).fill(0),
        sessionAnalytics: { totalSessions: 0, avgInteractionsPerSession: 0, avgMoodsPerSession: 0 }
      });
    }
    setLoading(false);
  };

  const exportData = async () => {
    try {
      const responses = await DatabaseService.getUserResponses(userId, 1000);
      const exportData = {
        userId,
        exportDate: new Date().toISOString(),
        totalResponses: responses.length,
        timeRange,
        analytics,
        responses: responses.slice(0, 500) // Limit for file size
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], 
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${userId}_pixel_analytics_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      console.log('✅ Data exported successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const clearAllData = async () => {
    if (window.confirm('⚠️ Are you sure you want to clear ALL user data? This cannot be undone!')) {
      try {
        await DatabaseService.clearUserData(userId);
        setAnalytics({
          totalInteractions: 0,
          moodCounts: {},
          dailyActivity: {},
          hourlyActivity: new Array(24).fill(0),
          sessionAnalytics: { totalSessions: 0, avgInteractionsPerSession: 0, avgMoodsPerSession: 0 }
        });
        alert('✅ All data cleared successfully');
      } catch (error) {
        console.error('❌ Clear data failed:', error);
        alert('❌ Failed to clear data');
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="analytics-dashboard">
      <div className="analytics-overlay" onClick={onClose}></div>
      <div className="analytics-content">
        <div className="analytics-header">
          <h2>🎮 Pixel Analytics Dashboard</h2>
          <div className="analytics-header-controls">
            <button onClick={exportData} className="analytics-export-btn">
              💾 Export Data
            </button>
            <button onClick={clearAllData} className="analytics-export-btn" style={{background: 'var(--pixel-danger)'}}>
              🗑️ Clear Data
            </button>
            <button onClick={onClose} className="analytics-close">✕</button>
          </div>
        </div>

        <div className="analytics-controls">
          <div className="analytics-tabs">
            <button 
              className={`analytics-tab ${selectedView === 'overview' ? 'active' : ''}`}
              onClick={() => setSelectedView('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={`analytics-tab ${selectedView === 'moods' ? 'active' : ''}`}
              onClick={() => setSelectedView('moods')}
            >
              💭 Moods
            </button>
            <button 
              className={`analytics-tab ${selectedView === 'activity' ? 'active' : ''}`}
              onClick={() => setSelectedView('activity')}
            >
              ⚡ Activity
            </button>
            <button 
              className={`analytics-tab ${selectedView === 'insights' ? 'active' : ''}`}
              onClick={() => setSelectedView('insights')}
            >
              🔮 Insights
            </button>
          </div>
          
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="time-range-select"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>

        <div className="analytics-body">
          {loading ? (
            <div className="analytics-loading">
              <div className="cosmic-loader">
                <div className="loader-rings">
                  <div className="loader-ring"></div>
                  <div className="loader-ring"></div>
                  <div className="loader-ring"></div>
                </div>
              </div>
              <p className="loading-text">Analyzing pixel data...</p>
            </div>
          ) : error ? (
            <div className="analytics-empty">
              <div className="empty-state">
                <span className="empty-emoji">❌</span>
                <h3>Error Loading Data</h3>
                <p>{error}</p>
                <button onClick={loadAnalytics} className="cosmic-button" style={{marginTop: '1rem'}}>
                  🔄 Retry
                </button>
              </div>
            </div>
          ) : analytics ? (
            <div className="analytics-grid">
              {selectedView === 'overview' && (
                <>
                  <div className="analytics-card highlight">
                    <h3>🎯 Total Interactions</h3>
                    <div className="analytics-number">{analytics.totalInteractions || 0}</div>
                    <div className="analytics-subtitle">
                      Across {analytics.sessionAnalytics?.totalSessions || 0} sessions
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h3>📈 Session Average</h3>
                    <div className="analytics-number" style={{fontSize: '1.5rem'}}>
                      {Math.round(analytics.sessionAnalytics?.avgInteractionsPerSession || 0)}
                    </div>
                    <div className="analytics-subtitle">Interactions per session</div>
                  </div>

                  <div className="analytics-card">
                    <h3>🎮 Mood Diversity</h3>
                    <div className="analytics-number" style={{fontSize: '1.8rem'}}>
                      {Object.keys(analytics.moodCounts || {}).length}
                    </div>
                    <div className="analytics-subtitle">Different moods explored</div>
                  </div>

                  <div className="analytics-card">
                    <h3>⭐ Most Active</h3>
                    <div className="analytics-subtitle" style={{fontSize: '1rem', fontWeight: 'bold'}}>
                      {getMostFrequentMood(analytics.moodCounts)}
                    </div>
                    <div className="analytics-subtitle">Favorite mood</div>
                  </div>

                  <div className="analytics-card">
                    <h3>⏰ Peak Hour</h3>
                    <div className="analytics-number" style={{fontSize: '1.2rem'}}>
                      {formatHour(getMostActiveHour(analytics.hourlyActivity))}
                    </div>
                    <div className="analytics-subtitle">Most active time</div>
                  </div>

                  <div className="analytics-card">
                    <h3>📅 Active Days</h3>
                    <div className="analytics-number" style={{fontSize: '1.5rem'}}>
                      {Object.keys(analytics.dailyActivity || {}).length}
                    </div>
                    <div className="analytics-subtitle">Days with activity</div>
                  </div>
                </>
              )}

              {selectedView === 'moods' && (
                <>
                  <div className="analytics-card" style={{gridColumn: '1 / -1'}}>
                    <h3>💭 Mood Distribution</h3>
                    <div className="mood-chart">
                      {Object.entries(analytics.moodCounts || {})
                        .sort(([,a], [,b]) => b - a)
                        .map(([mood, count]) => (
                        <div key={mood} className="mood-bar" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem',
                          padding: '1rem',
                          background: 'rgba(0, 212, 255, 0.1)',
                          border: '2px solid var(--pixel-primary)',
                          borderRadius: '8px'
                        }}>
                          <div className="mood-info" style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                            <span className="mood-emoji" style={{fontSize: '1.5rem'}}>{getMoodEmoji(mood)}</span>
                            <span className="mood-label" style={{
                              fontWeight: 600, 
                              textTransform: 'capitalize',
                              fontFamily: 'var(--font-ui)',
                              fontSize: '1rem'
                            }}>{mood}</span>
                          </div>
                          <div className="mood-stats" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                            <div 
                              className="mood-bar-fill" 
                              style={{
                                width: `${Math.max(30, (count / (analytics.totalInteractions || 1)) * 300)}px`,
                                height: '24px',
                                backgroundColor: getMoodColor(mood),
                                border: '2px solid #000000',
                                borderRadius: '4px',
                                position: 'relative'
                              }}
                            >
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#000000',
                                fontWeight: 'bold',
                                fontSize: '0.7rem'
                              }}>
                                {Math.round((count / (analytics.totalInteractions || 1)) * 100)}%
                              </div>
                            </div>
                            <span className="mood-count" style={{
                              fontWeight: 'bold', 
                              minWidth: '80px',
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '0.8rem'
                            }}>
                              {count} times
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedView === 'activity' && (
                <>
                  <div className="analytics-card" style={{gridColumn: '1 / -1'}}>
                    <h3>📅 Daily Activity ({Object.keys(analytics.dailyActivity || {}).length} days)</h3>
                    <div className="activity-chart" style={{
                      display: 'flex',
                      gap: '3px',
                      alignItems: 'flex-end',
                      height: '150px',
                      padding: '1.5rem 0',
                      overflowX: 'auto'
                    }}>
                      {Object.entries(analytics.dailyActivity || {})
                        .slice(-21) // Last 21 days
                        .map(([date, count]) => (
                        <div key={date} className="activity-day" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          minWidth: '40px',
                          gap: '0.5rem'
                        }}>
                          <div 
                            className="activity-bar" 
                            style={{
                              width: '32px',
                              height: `${Math.max(15, (count / Math.max(1, ...Object.values(analytics.dailyActivity || {}))) * 120)}px`,
                              backgroundColor: count > 10 ? '#00F5A0' : count > 5 ? '#FFB700' : count > 2 ? '#FF006E' : '#9D4EDD',
                              border: '2px solid #000000',
                              borderRadius: '4px 4px 0 0',
                              position: 'relative',
                              cursor: 'pointer'
                            }}
                            title={`${new Date(date).toLocaleDateString()}: ${count} interactions`}
                          >
                            <div style={{
                              position: 'absolute',
                              top: '-20px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: '0.6rem',
                              fontWeight: 'bold',
                              color: 'var(--text-primary)'
                            }}>
                              {count}
                            </div>
                          </div>
                          <span className="activity-date" style={{
                            fontSize: '0.6rem', 
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-ui)',
                            textAlign: 'center',
                            writingMode: 'vertical-rl'
                          }}>
                            {new Date(date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h3>🕐 Hourly Pattern</h3>
                    <div className="hourly-chart" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: '4px',
                      marginTop: '1rem'
                    }}>
                      {(analytics.hourlyActivity || []).map((count, hour) => (
                        <div key={hour} style={{
                          padding: '0.5rem',
                          background: count > 0 ? `rgba(${
                            count > 2 ? '0, 245, 160' : '255, 183, 0'
                          }, 0.3)` : 'rgba(157, 78, 221, 0.1)',
                          border: '1px solid var(--pixel-primary)',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontSize: '0.7rem'
                        }}>
                          <div style={{fontWeight: 'bold'}}>{formatHour(hour)}</div>
                          <div style={{fontSize: '0.6rem', opacity: 0.8}}>{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedView === 'insights' && (
                <>
                  <div className="analytics-card" style={{gridColumn: '1 / -1'}}>
                    <h3>🔮 Pixel Insights</h3>
                    <div className="insights-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem',
                      marginTop: '1rem'
                    }}>
                      <div className="insight-card" style={{
                        padding: '1rem',
                        background: 'rgba(0, 245, 160, 0.1)',
                        border: '2px solid var(--pixel-success)',
                        borderRadius: '8px'
                      }}>
                        <h4 style={{color: 'var(--pixel-success)', marginBottom: '0.5rem'}}>🏆 Most Popular</h4>
                        <p>{getMostFrequentMood(analytics.moodCounts)} is your go-to mood!</p>
                      </div>

                      <div className="insight-card" style={{
                        padding: '1rem',
                        background: 'rgba(255, 183, 0, 0.1)',
                        border: '2px solid var(--pixel-accent)',
                        borderRadius: '8px'
                      }}>
                        <h4 style={{color: 'var(--pixel-accent)', marginBottom: '0.5rem'}}>⚡ Activity Level</h4>
                        <p>
                          {analytics.totalInteractions > 50 ? 'Super active user! 🌟' : 
                           analytics.totalInteractions > 20 ? 'Regular user 👍' : 
                           analytics.totalInteractions > 5 ? 'Getting started 🚀' : 
                           'New to the pixel universe 🎮'}
                        </p>
                      </div>

                      <div className="insight-card" style={{
                        padding: '1rem',
                        background: 'rgba(255, 0, 110, 0.1)',
                        border: '2px solid var(--pixel-secondary)',
                        borderRadius: '8px'
                      }}>
                        <h4 style={{color: 'var(--pixel-secondary)', marginBottom: '0.5rem'}}>🌈 Mood Variety</h4>
                        <p>
                          {Object.keys(analytics.moodCounts || {}).length >= 5 ? 'Emotional explorer! 🦋' :
                           Object.keys(analytics.moodCounts || {}).length >= 3 ? 'Good variety 🎨' :
                           Object.keys(analytics.moodCounts || {}).length >= 2 ? 'Finding balance ⚖️' :  
                           'Focused energy 🎯'}
                        </p>
                      </div>

                      <div className="insight-card" style={{
                        padding: '1rem',
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: '2px solid var(--pixel-primary)',
                        borderRadius: '8px'
                      }}>
                        <h4 style={{color: 'var(--pixel-primary)', marginBottom: '0.5rem'}}>⏰ Best Time</h4>
                        <p>
                          You're most active around {formatHour(getMostActiveHour(analytics.hourlyActivity))}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="analytics-empty">
              <div className="empty-state">
                <span className="empty-emoji" style={{fontSize: '4rem', opacity: 0.5}}>🎮</span>
                <h3 style={{
                  fontFamily: 'var(--font-pixel)', 
                  color: 'var(--pixel-primary)', 
                  margin: '1rem 0'
                }}>
                  No Pixel Data Yet
                </h3>
                <p style={{color: 'var(--text-secondary)'}}>
                  Start using the app to see beautiful analytics!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
