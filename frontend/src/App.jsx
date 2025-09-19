import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import TypingBox from './TypingBox'; // Import our new component
import './App.css';

function App() {
  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    const getPrompts = async () => {
      const { data } = await supabase.from('prompts').select();
      if (data) {
        setPrompts(data);
      }
    };
    getPrompts();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Typing & Coding Practice</h1>
        {/* We only render the TypingBox if we have at least one prompt */}
        {prompts.length > 0 ? (
          <TypingBox prompt={prompts[0].text} />
        ) : (
          <p>Loading prompts...</p>
        )}
      </header>
    </div>
  );
}

export default App;