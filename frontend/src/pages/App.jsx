// File: frontend/src/App.jsx
// Description: This file now correctly manages user authentication and renders the appropriate view.

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; // Assuming this is your correct path
import TypingBox from '../components/TypingBox';
import Settings from '../components/Settings';
import AuthPage from '../components/AuthPage'; // Fixed import path
import ProfilePage from '../components/ProfilePage';
import '../styles/App.css'; // Assuming this is your correct path

// --- Main App Component ---
// This component's ONLY job is to manage the user's session.
// It decides whether to show the login page or the main typing application.
function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session when the app first loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for authentication state changes (e.g., SIGNED_IN, SIGNED_OUT)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // The cleanup function unsubscribes from the listener
    return () => subscription.unsubscribe();
  }, []);

  // Show a loading indicator while checking for the session
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // If there's no session, show the login/signup page.
  // Otherwise, show the main application.
  return (
    <>
      {!session ? <AuthPage /> : <TypingApp session={session} />}
    </>
  );
}


// --- Typing App Component ---
// This component contains all the logic for the actual typing practice experience.
// It is only rendered when a user is logged in.
function TypingApp({ session }) {
     // --- NEW: State to manage the current view ---
  const [view, setView] = useState('typing'); // 'typing' or 'profile'
  const [allPrompts, setAllPrompts] = useState([]); 
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [testDuration, setTestDuration] = useState(60);
  const [category, setCategory] = useState('js');

  // Fetches prompts from the database whenever the category changes
  useEffect(() => {
    const getPrompts = async () => {
      setAllPrompts([]); // Clear old prompts
      const { data } = await supabase.from('prompts').select('text').eq('language', category);
      if (data && data.length > 0) {
        setAllPrompts(data);
        setCurrentPromptIndex(Math.floor(Math.random() * data.length));
      }
    };
    getPrompts();
  }, [category]);

  // Signs the user out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Selects a new, different prompt after a test is completed
  const handleTestComplete = () => {
    if (allPrompts.length <= 1) return;
    let nextPromptIndex;
    do {
      nextPromptIndex = Math.floor(Math.random() * allPrompts.length);
    } while (nextPromptIndex === currentPromptIndex);
    setCurrentPromptIndex(nextPromptIndex);
  };

  const currentPrompt = allPrompts[currentPromptIndex];

  return (
    <div className="App">
      <header className="App-header">
        <div className="user-info">
          <span>Logged in as: <strong>{session.user.email}</strong></span>
          <button onClick={() => setView('typing')} className="nav-button">Practice</button>
          <button onClick={() => setView('profile')} className="nav-button">Profile</button>
          <button onClick={handleSignOut} className="signout-button">Sign Out</button>
        </div>
        <h1>Typing & Coding Practice</h1>
        <Settings
          duration={testDuration}
          onDurationChange={setTestDuration}
          category={category}
          onCategoryChange={setCategory}
        />
        {currentPrompt ? (
          <TypingBox
            key={currentPrompt.text} // Use key to force reset on new prompt
            prompt={currentPrompt.text}
            duration={testDuration}
            onComplete={handleTestComplete}
            session={session}
             category={category}
            onCategoryChange={setCategory}
          />
        ) : (
          <p>Loading prompts for category: {category}...</p>
        )}
        {view === 'profile' && <ProfilePage />}
      </header>
    </div>
  );
}

export default App;