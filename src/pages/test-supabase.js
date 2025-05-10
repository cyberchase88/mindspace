import React from 'react';
import { createNote } from '../lib/supabase';

export default function TestSupabase() {
  const handleAddNote = async () => {
    try {
      const note = await createNote('Test Note', 'This is a test note created from the browser.');
      console.log('Note created:', note);
      alert('Note created! Check the console for details.');
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Error creating note. Check the console for details.');
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Test Supabase Note Creation</h1>
      <button onClick={handleAddNote}>Add Test Note</button>
    </div>
  );
} 