import React, { useEffect, useState } from 'react';

export default function NoteSelection({ onStartReview, userId }) {
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all notes for the user (customize as needed)
  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      const res = await fetch(`/api/spaced-repetition/due?userId=${userId}`);
      const data = await res.json();
      setNotes(data.due?.map(item => item.note) || []);
      setLoading(false);
    }
    fetchNotes();
  }, [userId]);

  function toggleNote(id) {
    setSelected(sel =>
      sel.includes(id) ? sel.filter(nid => nid !== id) : [...sel, id]
    );
  }

  function handleStart() {
    if (selected.length > 0) onStartReview(selected);
  }

  if (loading) return <div style={{ color: '#207520', fontSize: 13, fontStyle: 'italic' }}>Loading notes...</div>;
  if (!notes.length) return <div>No notes available for review.</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, color: '#222' }}>
      <h2 style={{ color: '#222' }}>Select Notes for Review</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notes.map(note => (
          <li key={note.id} style={{ marginBottom: 8 }}>
            <label style={{ color: '#222' }}>
              <input
                type="checkbox"
                checked={selected.includes(note.id)}
                onChange={() => toggleNote(note.id)}
              />
              <span style={{ marginLeft: 8 }}>{note.title}</span>
            </label>
          </li>
        ))}
      </ul>
      <button
        onClick={handleStart}
        disabled={selected.length === 0}
        style={{ marginTop: 16 }}
      >
        Start Review Session
      </button>
    </div>
  );
}