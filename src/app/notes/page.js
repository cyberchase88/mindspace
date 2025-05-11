'use client';

import { ViewModeProvider } from '@/lib/context/ViewModeContext';
import ViewSwitcher from '@/components/common/ViewSwitcher';
import SidebarView from '@/components/features/SidebarView';
import CardView from '@/components/features/CardView';
import GraphView from '@/components/features/GraphView';
import { useViewMode } from '@/lib/context/ViewModeContext';
import styles from './notes.module.scss';
import BackgroundEffects from '@/components/BackgroundEffects';
import '@/styles/garden-theme.css';

function NotesContent() {
  const { viewMode, VIEW_MODES } = useViewMode();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notes</h1>
        <div className={styles.viewSwitcherRight}>
          <ViewSwitcher />
        </div>
      </div>
      <div className={styles.content}>
        {viewMode === VIEW_MODES.SIDEBAR && <SidebarView />}
        {viewMode === VIEW_MODES.CARD && <CardView />}
        {viewMode === VIEW_MODES.GRAPH && <GraphView />}
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <ViewModeProvider>
      <BackgroundEffects />
      <NotesContent />
    </ViewModeProvider>
  );
} 