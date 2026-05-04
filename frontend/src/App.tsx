import { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Social from './components/Social';
import Stats from './components/Stats';
import Footer from './components/Footer';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/spotify-auth') {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      window.location.href = `${API_BASE}/spotify/auth/login`;
    }
  }, [location]);

  if (location.pathname === '/spotify-auth') {
    return (
      <div className="app-shell flex items-center justify-center px-4">
        <div className="surface-panel w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-(--primary)" />
          <p className="text-lg text-foreground">Redirecting to Spotify...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-backdrop -z-40 bg-background" aria-hidden />

      <div
        className="app-backdrop pointer-events-none -z-30 hidden dark:block"
        aria-hidden
        style={{
          background:
            'linear-gradient(168deg, oklch(0.09 0.08 292) 0%, oklch(0.11 0.09 288) 42%, oklch(0.06 0.055 305) 100%)',
        }}
      />
      <div
        className="app-backdrop pointer-events-none -z-20 hidden opacity-90 dark:block"
        aria-hidden
        style={{
          background:
            'radial-gradient(circle at 85% 18%, oklch(0.48 0.14 303 / 0.38), transparent 52%), radial-gradient(circle at 12% 85%, oklch(0.52 0.18 25 / 0.16), transparent 56%), radial-gradient(circle at 52% 92%, oklch(0.38 0.14 285 / 0.5), transparent 58%)',
        }}
      />
      <div
        className="app-backdrop pointer-events-none -z-10 hidden opacity-40 mix-blend-soft-light dark:block"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cg fill='oklch(0.95 0.03 300 / 0.045)'%3E%3Ccircle cx='14' cy='14' r='1.2'/%3E%3Ccircle cx='70' cy='44' r='0.9'/%3E%3Ccircle cx='112' cy='100' r='1.1'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="app-backdrop pointer-events-none -z-10 hidden dark:block"
        aria-hidden
        style={{
          background:
            'linear-gradient(to bottom, transparent 55%, oklch(0.05 0.07 298 / 0.88) 100%)',
        }}
      />

      <div
        className="app-backdrop pointer-events-none -z-30 dark:hidden"
        aria-hidden
        style={{
          background:
            'linear-gradient(168deg, oklch(0.97 0.02 296) 0%, oklch(0.985 0.013 82) 43%, oklch(0.92 0.05 292) 100%)',
        }}
      />
      <div
        className="app-backdrop pointer-events-none -z-20 opacity-85 dark:hidden"
        aria-hidden
        style={{
          background:
            'radial-gradient(circle at 84% 16%, oklch(0.82 0.12 320 / 0.25), transparent 52%), radial-gradient(circle at 16% 84%, oklch(0.88 0.1 42 / 0.22), transparent 54%), radial-gradient(circle at 54% 90%, oklch(0.74 0.09 286 / 0.3), transparent 58%)',
        }}
      />
      <div
        className="app-backdrop pointer-events-none -z-10 opacity-25 dark:hidden"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='oklch(0.44 0.08 288 / 0.22)'%3E%3Ccircle cx='8' cy='8' r='0.8'/%3E%3Ccircle cx='60' cy='30' r='0.7'/%3E%3Ccircle cx='94' cy='92' r='0.8'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="app-backdrop pointer-events-none -z-10 dark:hidden"
        aria-hidden
        style={{
          background:
            'linear-gradient(to bottom, transparent 58%, oklch(0.74 0.05 286 / 0.24) 100%)',
        }}
      />

      <Navbar />
      <main className="w-full pb-8 pt-24 sm:pt-28">
        <Hero />
        <Projects />
        <Social />
        <Stats />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;