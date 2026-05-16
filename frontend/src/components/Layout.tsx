import { Link } from "react-router-dom";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden />
          <span className="brand-text">Transcode Studio</span>
        </Link>
        <nav className="top-nav">
          <Link to="/" className="nav-link">
            Library
          </Link>
        </nav>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <span>HLS transcoding dashboard</span>
      </footer>
    </div>
  );
}
