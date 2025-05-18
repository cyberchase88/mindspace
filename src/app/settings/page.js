"use client";
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const email = params.get('email');
      const returnTo = params.get('returnTo');
      if (email) {
        window.sessionStorage.setItem('googleEmail', email);
        setGoogleConnected(true);
        setSuccessMsg('Google Calendar connected! 🎉');
        // Remove query params from URL for cleanliness
        window.history.replaceState({}, document.title, '/settings');
        // If we just connected, redirect back if returnTo is set
        const storedReturnTo = window.sessionStorage.getItem('returnTo');
        if (storedReturnTo) {
          window.sessionStorage.removeItem('returnTo');
          window.location.href = storedReturnTo;
        }
      } else {
        // Check if already connected
        const storedEmail = window.sessionStorage.getItem('googleEmail');
        if (storedEmail) {
          setGoogleConnected(true);
          setSuccessMsg('Google Calendar connected! 🎉');
        }
        if (returnTo) {
          window.sessionStorage.setItem('returnTo', returnTo);
        }
      }
    }
  }, []);

  const handleConnectGoogle = () => {
    let url = '/api/auth/google';
    if (typeof window !== 'undefined') {
      const returnTo = window.sessionStorage.getItem('returnTo');
      if (returnTo) {
        url += `?returnTo=${encodeURIComponent(returnTo)}`;
      }
    }
    window.location.href = url;
  };

  const handleDisconnectGoogle = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('googleEmail');
      setGoogleConnected(false);
      setSuccessMsg('Disconnected Google Calendar.');
    }
  };

  return (
    <div style={{ padding: '2rem', color: 'black' }}>
      <h1>Settings</h1>
      {successMsg && (
        <div style={{ color: 'green', marginBottom: 12 }}>{successMsg}</div>
      )}
      {googleConnected ? (
        <div style={{ marginBottom: 16 }}>
          <button onClick={handleDisconnectGoogle} style={{ marginTop: 8 }}>Disconnect Google Calendar</button>
        </div>
      ) : (
        <button onClick={handleConnectGoogle}>Connect Google Calendar</button>
      )}
    </div>
  );
} 