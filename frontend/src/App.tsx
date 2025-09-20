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
    // Handle /spotify-auth route - redirect to backend
    if (location.pathname === '/spotify-auth') {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      window.location.href = `${API_BASE}/spotify/auth/login`;
    }
  }, [location]);

  // If on /spotify-auth, show loading while redirecting
  if (location.pathname === '/spotify-auth') {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-spotify mx-auto mb-4"></div>
          <p className="text-light text-lg">Redirecting to Spotify...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Projects />
      <Social />
      <Stats />
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