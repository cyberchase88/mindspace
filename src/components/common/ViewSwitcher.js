'use client';

import { useViewMode } from '@/lib/context/ViewModeContext';
import styles from './ViewSwitcher.module.scss';

export default function ViewSwitcher() {
  const { viewMode, changeViewMode, VIEW_MODES } = useViewMode();

  return (
    <div className={styles.viewSwitcher}>
      <button
        className={`${styles.viewButton} ${viewMode === VIEW_MODES.SIDEBAR ? styles.active : ''}`}
        onClick={() => changeViewMode(VIEW_MODES.SIDEBAR)}
        title="Sidebar View"
      >
        <span className={styles.icon}>🗂️</span>
        <span className={styles.label}>Sidebar</span>
      </button>
      <button
        className={`${styles.viewButton} ${viewMode === VIEW_MODES.CARD ? styles.active : ''}`}
        onClick={() => changeViewMode(VIEW_MODES.CARD)}
        title="Card View"
      >
        <span className={styles.icon}>🃏</span>
        <span className={styles.label}>Cards</span>
      </button>
      <button
        className={`${styles.viewButton} ${viewMode === VIEW_MODES.GRAPH ? styles.active : ''}`}
        onClick={() => changeViewMode(VIEW_MODES.GRAPH)}
        title="Graph View"
      >
        <span className={styles.icon}>🌐</span>
        <span className={styles.label}>Graph</span>
      </button>
    </div>
  );
} 