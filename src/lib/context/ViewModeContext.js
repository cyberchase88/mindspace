'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ViewModeContext = createContext({});

const VIEW_MODES = {
  SIDEBAR: 'sidebar',
  CARD: 'card',
  GRAPH: 'graph',
};

export function ViewModeProvider({ children }) {
  const [viewMode, setViewMode] = useState(VIEW_MODES.SIDEBAR);

  useEffect(() => {
    // Load saved view mode from localStorage
    const savedMode = localStorage.getItem('viewMode');
    if (savedMode && Object.values(VIEW_MODES).includes(savedMode)) {
      setViewMode(savedMode);
    }
  }, []);

  const changeViewMode = (mode) => {
    if (Object.values(VIEW_MODES).includes(mode)) {
      setViewMode(mode);
      localStorage.setItem('viewMode', mode);
    }
  };

  const value = {
    viewMode,
    changeViewMode,
    VIEW_MODES,
  };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
} 