// File: frontend/src/TypingBox.jsx

import React, { useState, useEffect, useRef } from 'react';

const TEST_DURATION = 60;

function TypingBox({ prompt, onComplete }) {
  const [status, setStatus] = useState('waiting');
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [userInput, setUserInput] = useState('');
  const [totalErrors, setTotalErrors] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    let interval;
    if (status === 'inProgress' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && status === 'inProgress') {
      setStatus('finished');
      calculateResults();
    }
    return () => clearInterval(interval);
  }, [status, timeLeft]);

  // --- UPDATED KEYDOWN HANDLER with TAB-ONLY AUTO-SKIP ---
  const handleKeyDown = (e) => {
    e.preventDefault();
    const { key } = e;
    
    if (key === 'Backspace') {
      setUserInput(userInput.slice(0, -1));
      return;
    }

    if (key === 'Tab') {
      const newText = userInput + "  ";
      setUserInput(newText);
      updateStats(' '); updateStats(' ');
      return;
    }

    if (key === 'Enter') {
      const newText = userInput + '\n';
      setUserInput(newText);
      updateStats('\n');
      return;
    }

    if (key.length === 1) {
      const currentIndex = userInput.length;
      const remainingPrompt = prompt.substring(currentIndex);
      
      // --- THIS IS THE CHANGE ---
      // Instead of looking for any whitespace (\s+),
      // we now look specifically for one or more tab characters (\t+).
      const tabMatch = remainingPrompt.match(/^\t+/);
      
      if (tabMatch) {
        const leadingTabs = tabMatch[0];
        const charAfterTabs = prompt[currentIndex + leadingTabs.length];

        if (key === charAfterTabs) {
          const textToAdd = leadingTabs + key;
          setUserInput(userInput + textToAdd);

          for (const char of textToAdd) {
            updateStats(char, true);
<h3> The Updated `TypingBox.jsx` </h3>
          }
          checkCompletion(userInput + textToAdd);
          return;
        }
      }
      
      setUserInput(userInput + key);
      updateStats(key);
    }
  };


  const calculateResults = (finalInput = userInput) => {
    const newAccuracy = totalTyped > 0 ? ((totalTyped - totalErrors) / totalTyped) * 100 : 100;
    setAccuracy(newAccuracy);
    const timeElapsedInMinutes = (TEST_DURATION - timeLeft) / 60;
    if (timeElapsedInMinutes > 0) {
      const grossWpm = (finalInput.length / 5) / timeElapsedInMinutes;
      setWpm(Math.round(grossWpm));
    }
  };
  
  const resetTest = () => {
    setStatus('waiting');
    setTimeLeft(TEST_DURATION);
    setUserInput('');
    setWpm(0);
    setAccuracy(0);
    setTotalErrors(0);
    setTotalTyped(0);
    if (onComplete) onComplete();
    textareaRef.current.focus();
  };

  useEffect(() => {
    if (status === 'waiting') textareaRef.current.focus();
  }, [status, prompt]);

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
        <button onClick={resetTest} className="reset-button">Try Again & Next Prompt</button>
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
      {/* We now ONLY use onKeyDown and remove onChange to prevent conflicts */}
      <textarea
        ref={textareaRef}
        className="typing-input"
        value={userInput}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    </div>
  );
}

export default TypingBox;