import '@styles/globals.scss';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <h1>Mindspace</h1>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Mindspace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 