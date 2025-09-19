// File: frontend/src/components/AuthPage.jsx
// Description: A valid React component that renders the Supabase Auth UI.

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../utils/supabaseClient'; // Make sure this path is correct

// This is a standard React function component. It must be a function
// that returns JSX (the HTML-like syntax).
function AuthPage() {
  return (
    <div className="auth-container">
      <div className="auth-box">
        {/* The Auth component from Supabase handles the entire form */}
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['github', 'google']} // Optional: you can remove this line
        />
      </div>
    </div>
  );
}

// This line is crucial. It makes the component available to be imported in other files.
export default AuthPage;