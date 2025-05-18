"use client";
import React from 'react';
import NoteCard from './NoteCard';
import '../styles/garden-theme.css';

const GardenGrid = ({ notes }) => {
  return (
    <div className="garden-grid">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
};

export default GardenGrid; 