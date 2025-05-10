import NotesList from '@/components/features/NotesList';
import styles from './page.module.scss';

export default function Home() {
  return (
    <div className={styles.homePage}>
      <NotesList />
    </div>
  );
}
