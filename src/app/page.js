import NotesList from '@/components/features/NotesList';
import styles from './page.module.scss';

export default function Home() {
  return (
    <div className={styles.homePage}>
      <header className={styles.gardenHeader}>
        <h1>
          🌿 Mindspace Garden
        </h1>
        <p className={styles.gardenSubhead}>
          Plant a new thought, or harvest a memory below.
        </p>
      </header>
      <section>
        <NotesList />
      </section>
    </div>
  );
}
