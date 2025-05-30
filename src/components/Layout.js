import '@styles/globals.scss';
import { useChat } from '@/components/features/ChatProvider';

export default function Layout({ children }) {
  const { isOpen, setIsOpen } = useChat();
  return (
    <div className="layout">
      <header
        className="header"
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '2.5rem',
          zIndex: 2000,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          pointerEvents: 'none',
        }}
      >
        <button
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Close Companion Mode' : 'Open Companion Mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(90deg, #b7e4c7 0%, #95d5b2 100%)',
            color: '#207520',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            padding: '0.5rem 1.1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px 0 rgba(120,200,180,0.08)',
            transition: 'all 0.2s',
            pointerEvents: 'auto',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>💬</span>
          <span>Companion Mode</span>
        </button>
      </header>

      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Mindspace. All rights reserved.</p>
          <p style={{ fontSize: '0.9em', color: '#888', marginTop: 8 }}>
            Running in: <b>{process.env.NODE_ENV}</b>
          </p>
        </div>
      </footer>
    </div>
  );
} 