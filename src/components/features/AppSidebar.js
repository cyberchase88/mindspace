"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SidebarView.module.scss';

const navLinks = [
  {
    label: 'Dashboard',
    href: '/notes',
    subLinks: [
      { label: 'New Note', href: '/notes/new' },
    ],
  },
  {
    label: 'Review',
    href: '/review',
    subLinks: [
      { label: 'Forecast', href: '/review/forecast' },
      { label: 'Schedule', href: '/review/schedule' },
    ],
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--garden-primary)' }}>Mindspace</span>
      </div>
      <nav style={{ padding: '16px 0', flex: 1 }}>
        {navLinks.map((link) => (
          <div key={link.href}>
            <Link
              href={link.href}
              className={
                pathname === link.href || (link.subLinks && link.subLinks.some(sub => pathname.startsWith(sub.href)))
                  ? `${styles.noteItem} ${styles.selected}`
                  : styles.noteItem
              }
              style={{ display: 'block', textDecoration: 'none', marginBottom: 8 }}
            >
              {link.label}
            </Link>
            {link.subLinks && (
              <div style={{ marginLeft: 24 }}>
                {link.subLinks.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={
                      pathname === sub.href
                        ? `${styles.noteItem} ${styles.selected}`
                        : styles.noteItem
                    }
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      marginBottom: 6,
                      fontSize: 15,
                      paddingLeft: 16,
                    }}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
} 