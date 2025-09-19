// File: frontend/src/Settings.jsx
// Description: Adds a manual number input for test duration.

import React from 'react';
import '../styles/Settings.css';

function Settings({ duration, onDurationChange, category, onCategoryChange }) {
  const durationOptions = [15, 30, 60, 120];
  const categoryOptions = ['js', 'py', 'cpp', 'html'];

  return (
    <div className="settings-container">
      <div className="settings-group">
        <span className="settings-label">time:</span>
        {durationOptions.map((time) => (
          <button
            key={time}
            className={`settings-button ${duration === time ? 'active' : ''}`}
            onClick={() => onDurationChange(time)}
          >
            {time}
          </button>
        ))}
        {/* --- NEW: Manual Time Input --- */}
        {/* This input allows users to type a custom duration. */}
        <input
          type="number"
          className="time-input"
          value={duration}
          onChange={(e) => onDurationChange(parseInt(e.target.value, 10) || 0)}
          min="1" // Minimum time of 1 second
        />
      </div>

      <div className="settings-group">
        <span className="settings-label">language:</span>
        {categoryOptions.map((cat) => (
          <button
            key={cat}
            className={`settings-button ${category === cat ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Settings;