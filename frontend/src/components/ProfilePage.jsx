// File: frontend/src/components/ProfilePage.jsx
// Description: Displays the logged-in user's typing session history.

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

function ProfilePage() {
  // State to hold the list of sessions fetched from the database
  const [sessions, setSessions] = useState([]);
  // State to manage loading indicators
  const [loading, setLoading] = useState(true);

  // This effect runs once when the component loads to fetch the data
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      
      // Query the 'sessions' table.
      // RLS ensures we only get rows for the currently logged-in user.
      const { data, error } = await supabase
        .from('sessions')
        .select('id, wpm, accuracy, completed_at')
        .order('completed_at', { ascending: false }); // Show most recent first

      if (error) {
        console.error('Error fetching sessions:', error);
      } else {
        setSessions(data);
      }
      setLoading(false);
    };

    fetchSessions();
  }, []);

  if (loading) {
    return <p>Loading history...</p>;
  }

  return (
    <div className="profile-container">
      <h2>Typing Practice History</h2>
      <div className="session-list">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div key={session.id} className="session-item">
              <div className="session-stat">
                <span className="stat-value">{session.wpm}</span>
                <span className="stat-label">WPM</span>
              </div>
              <div className="session-stat">
                <span className="stat-value">{session.accuracy.toFixed(1)}%</span>
                <span className="stat-label">Accuracy</span>
              </div>
              <div className="session-date">
                {/* Format the date to be more readable */}
                {new Date(session.completed_at).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <p>No sessions recorded yet. Go complete a test!</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;