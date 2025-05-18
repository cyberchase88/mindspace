'use client';
import React, { createContext, useContext, useState } from 'react';

const NoteContext = createContext();

export function NoteProvider({ children }) {
  const [currentNote, setCurrentNote] = useState(null);
  return (
    <NoteContext.Provider value={{ currentNote, setCurrentNote }}>
      {children}
    </NoteContext.Provider>
  );
}

export function useNote() {
  return useContext(NoteContext);
} 