// File: frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import TypingBox from '../components/TypingBox';
import Settings from '../components/Settings';
import '../styles/App.css';

function App() {
  const [allPrompts, setAllPrompts] = useState([]); 
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [testDuration, setTestDuration] = useState(60);
  const [category, setCategory] = useState('js');

  useEffect(() => {
    const getPrompts = async () => {
      setAllPrompts([]);
      const { data } = await supabase.from('prompts').select('text').eq('language', category);
      if (data && data.length > 0) {
        setAllPrompts(data);
        setCurrentPromptIndex(Math.floor(Math.random() * data.length));
      }
    };
    getPrompts();
  }, [category]);

  // This function guarantees a NEW prompt is selected.
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
        <h1>Typing & Coding Practice</h1>
        <Settings
          duration={testDuration}
          onDurationChange={setTestDuration}
          category={category}
          onCategoryChange={setCategory}
        />
        {currentPrompt ? (
          <TypingBox
            // NOTE: The 'key' prop is removed to allow the timer to persist across prompts.
            prompt={currentPrompt.text}
            duration={testDuration}
            onComplete={handleTestComplete}
          />
        ) : (
          <p>Loading prompts for category: {category}...</p>
        )}
      </header>
    </div>
  );
}

export default App;