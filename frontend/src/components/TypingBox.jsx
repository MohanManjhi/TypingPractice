// File: frontend/src/TypingBox.jsx
// This is the complete and final version with the state update bug fixed.

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

function TypingBox({ prompt, duration, onComplete, session, category, onCategoryChange }) {
  // --- STATE MANAGEMENT ---
  const [status, setStatus] = useState('waiting');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [userInput, setUserInput] = useState('');
  const [totalErrors, setTotalErrors] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const textareaRef = useRef(null);

  // --- SIDE EFFECTS (useEffect Hooks) ---

  // Resets the test completely when the duration is changed from settings
  useEffect(() => {
    resetTest(false);
  }, [duration]);

  // Handles receiving a new prompt for continuous typing
  useEffect(() => {
    if (status === 'inProgress') {
      setUserInput('');
    }
  }, [prompt]);

  // Manages the countdown timer
  useEffect(() => {
    let interval;
    if (status === 'inProgress' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && status === 'inProgress') {
      setStatus('finished');
      calculateResults();
    }
    return () => clearInterval(interval);
  }, [status, timeLeft]);
  
  // Focuses the textarea when the test is ready
  useEffect(() => {
    if (status === 'waiting') {
      textareaRef.current.focus();
    }
  }, [status, prompt]);

  // --- INPUT HANDLING ---

  // A single, unified function to handle all keyboard input
  const handleKeyDown = (e) => {
    e.preventDefault();
    const { key } = e;
    
    if (key === 'Backspace') {
      setUserInput(userInput.slice(0, -1));
      return;
    }
    if (key === 'Tab') {
      setUserInput(userInput + "  ");
      updateStats(' ');
      updateStats(' ');
      return;
    }
    if (key === 'Enter') {
      setUserInput(userInput + '\n');
      updateStats('\n');
      return;
    }
    if (key.length === 1) {
      // Auto-skip logic for tab characters
      const currentIndex = userInput.length;
      const remainingPrompt = prompt.substring(currentIndex);
      const tabMatch = remainingPrompt.match(/^\t+/);
      if (tabMatch) {
        const leadingTabs = tabMatch[0];
        const charAfterTabs = prompt[currentIndex + leadingTabs.length];
        if (key === charAfterTabs) {
          const textToAdd = leadingTabs + key;
          setUserInput(userInput + textToAdd);
          textToAdd.split('').forEach(char => updateStats(char));
          return;
        }
      }
      // Normal typing
      setUserInput(userInput + key);
      updateStats(key);
    }
  };

  // --- CORRECTED HELPER FUNCTIONS ---
  const updateStats = (typedChar) => {
    if (status === 'waiting') {
      setStatus('inProgress');
    }
    if (typedChar !== prompt[userInput.length]) {
      setTotalErrors((prev) => prev + 1);
    }
    setTotalTyped((prev) => prev + 1);

    // --- THIS IS THE OTHER KEY FIX ---
    // Check if the user has finished the CURRENT prompt.
    if (userInput.length + 1 === prompt.length) {
      // Instantly call onComplete to get a new prompt from the parent.
      setUserInput(''); // Reset input for next prompt
      if (onComplete) onComplete();
      // Do NOT set status to 'finished' here, let timer control that
    }
  };
  const saveProgress = async (wpm, accuracy, totalTyped, totalErrors, duration, session, category) => {
    if (!session) return; // Only save if user is logged in
    await supabase.from('sessions').insert([
      {
        user_id: session.user.id,
        wpm,
        accuracy,
        total_typed: totalTyped,
        total_errors: totalErrors,
        duration_seconds: duration,
        category,
        completed_at: new Date().toISOString(),
      },
    ]);
  };

  const calculateResults = async () => {
    const timeElapsedInMinutes = (duration - timeLeft) / 60;
    const newAccuracy = totalTyped > 0 ? ((totalTyped - totalErrors) / totalTyped) * 100 : 100;
    setAccuracy(newAccuracy);
    if (timeElapsedInMinutes > 0) {
      const grossWpm = (totalTyped / 5) / timeElapsedInMinutes;
      setWpm(Math.round(grossWpm));
      // Save progress to DB with all required fields
      await saveProgress(
        Math.round(grossWpm),
        newAccuracy,
        totalTyped,
        totalErrors,
        duration,
        session,
        category
      );
    }
  };
  
  // This is for a full reset (e.g., from results screen or duration change)
  const resetTest = (shouldCallOnComplete = true) => {
    setStatus('waiting');
    setTimeLeft(duration);
    setUserInput('');
    setWpm(0);
    setAccuracy(0);
    setTotalErrors(0);
    setTotalTyped(0);
    if (shouldCallOnComplete && onComplete) {
      onComplete();
    }
    if (textareaRef.current) textareaRef.current.focus();
  };


  // --- RENDER LOGIC ---

  const renderPrompt = () => {
    return prompt.split('').map((char, index) => {
      let className = 'default';
      if (index < userInput.length) {
        className = char === userInput[index] ? 'correct' : 'incorrect';
      }
      if (index === userInput.length) className += ' cursor';
      if (char === ' ' && className.includes('incorrect')) className = 'incorrect-space';
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  if (status === 'finished') {
    return (
      <div className="results-screen">
        <h2>Test Completed!</h2>
        <div className="stat">WPM: {wpm}</div>
        <div className="stat">Accuracy: {accuracy.toFixed(1)}%</div>
        <button onClick={resetTest} className="reset-button">Try Again</button>
      </div>
    );
  }





  return (
    <div className="typing-box-container" onClick={() => textareaRef.current.focus()}>
      <div className="stats-display">
        <div className="stat-timer">Time: {timeLeft}s</div>
      </div>
      <div className="prompt-display">
        {renderPrompt()}
      </div>
      <textarea
        ref={textareaRef}
        className="typing-input"
        value={userInput}
        onKeyDown={handleKeyDown}
        onChange={() => {}} // Empty handler to prevent React read-only warning
        autoFocus
      />
    </div>
  );
}

export default TypingBox;