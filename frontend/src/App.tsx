import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NexusAuthProvider } from './components/nexus/NexusAuthProvider';
import { useVisitorTracking } from './hooks/useVisitorTracking';
import PortfolioPage from './pages/PortfolioPage';
import SpotifyAuthRedirect from './pages/SpotifyAuthRedirect';
import NexusLogin from './pages/NexusLogin';
import NexusHomePage from './pages/NexusHomePage';
import NexusAnalyticsPage from './pages/NexusAnalyticsPage';
import NexusSpotifyPage from './pages/NexusSpotifyPage';
import NexusGoalsPage from './pages/NexusGoalsPage';
import NexusGoalsOnboardingPage from './pages/NexusGoalsOnboardingPage';
import NexusGoalsDashboardPage from './pages/NexusGoalsDashboardPage';
import NexusGoalsMeasuresPage from './pages/NexusGoalsMeasuresPage';
import NexusGoalsProfilePage from './pages/NexusGoalsProfilePage';
import GoalsProfileGuard from './components/goals/GoalsProfileGuard';
import NexusProtectedRoute from './components/NexusProtectedRoute';
import NexusDashboardLayout from './components/nexus/NexusDashboardLayout';

function VisitorTracker() {
  useVisitorTracking();
  return null;
}

function App() {
  return (
    <Router>
      <NexusAuthProvider>
        <VisitorTracker />
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/spotify-auth" element={<SpotifyAuthRedirect />} />
          <Route path="/nexus/login" element={<NexusLogin />} />
          <Route element={<NexusProtectedRoute />}>
            <Route element={<NexusDashboardLayout />}>
              <Route path="/nexus" element={<NexusHomePage />} />
              <Route path="/nexus/analytics" element={<NexusAnalyticsPage />} />
              <Route path="/nexus/spotify" element={<NexusSpotifyPage />} />
              <Route path="/nexus/goals/onboarding" element={<NexusGoalsOnboardingPage />} />
              <Route element={<GoalsProfileGuard />}>
                <Route path="/nexus/goals/dashboard" element={<NexusGoalsDashboardPage />} />
                <Route path="/nexus/goals/measures" element={<NexusGoalsMeasuresPage />} />
                <Route path="/nexus/goals/profile" element={<NexusGoalsProfilePage />} />
                <Route path="/nexus/goals" element={<NexusGoalsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </NexusAuthProvider>
    </Router>
  );
}

export default App;
