import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import SignInPage from './SignInPage';
import SignUpPage from './SignUpPage';
import ProfilePage from './ProfilePage';
import './styles.css';

const clerkPubKey = process.env.CLERK_PUBLISHABLE_KEY!;

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <BrowserRouter>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<SignInPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  </ClerkProvider>
);
