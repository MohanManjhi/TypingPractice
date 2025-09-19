// File: frontend/src/App.jsx
// Description: Manages the overall application state for settings and prompts.

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import TypingBox from './TypingBox';
import Settings from './Settings';
import './App.css';

function App() {
  // State for all available prompts matching the current category
  const [allPrompts, setAllPrompts] = useState([]); 
  // State for the currently visible prompt
  const [currentPrompt, setCurrentPrompt] = useState(null); 
  
  // State for user settings, with 60s and 'js' as defaults
  const [testDuration, setTestDuration] = useState(60);
  const [category, setCategory] = useState('js');

  // This effect fetches new prompts from Supabase whenever the category changes
  useEffect(() => {
    const getPrompts = async () => {
      setCurrentPrompt(null); // Show a loading state
      const { data } = await supabase
        .from('prompts')
        .select('text')
        .eq('language', category);
      
      if (data) {
        setAllPrompts(data);
        // Pick a random prompt to start
        setCurrentPrompt(data[Math.floor(Math.random() * data.length)]);
      }
    };
    getPrompts();
  }, [category]);

  // This function is called when a test is completed to load a new prompt
  const handleTestComplete = () => {
    if (allPrompts.length > 0) {
      setCurrentPrompt(allPrompts[Math.floor(Math.random() * allPrompts.length)]);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Typing & Coding Practice</h1>
        
        <Settings
          duration={testDuration}
          onDurationChange={setTestDuration}
          category={category}
          onCategoryChange={setCategory}
        />

        {currentPrompt ? (
          <TypingBox
            key={currentPrompt.text} 
            prompt={currentPrompt.text}
            duration={testDuration} // Pass the dynamic duration here
            onComplete={handleTestComplete}
          />
        ) : (
          <p>Loading prompt...</p>
        )}
      </header>
    </div>
  );
}

export default App;