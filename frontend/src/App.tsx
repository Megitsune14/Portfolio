import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useVisitorTracking } from './hooks/useVisitorTracking';
import PortfolioPage from './pages/PortfolioPage';
import SpotifyAuthRedirect from './pages/SpotifyAuthRedirect';
import NexusLogin from './pages/NexusLogin';
import NexusHub from './pages/NexusHub';
import NexusAnalyticsPage from './pages/NexusAnalyticsPage';
import NexusSpotifyPage from './pages/NexusSpotifyPage';
import NexusGoalsPage from './pages/NexusGoalsPage';
import NexusGoalsOnboardingPage from './pages/NexusGoalsOnboardingPage';
import NexusGoalsDashboardPage from './pages/NexusGoalsDashboardPage';
import NexusGoalsMeasuresPage from './pages/NexusGoalsMeasuresPage';
import NexusGoalsProfilePage from './pages/NexusGoalsProfilePage';
import GoalsQueryLayout from './components/goals/GoalsQueryLayout';
import GoalsProfileGuard from './components/goals/GoalsProfileGuard';
import NexusProtectedRoute from './components/NexusProtectedRoute';
import SpotifyQueryLayout from './components/spotify/SpotifyQueryLayout';

function VisitorTracker() {
  useVisitorTracking();
  return null;
}

function App() {
  return (
    <Router>
      <VisitorTracker />
      <Routes>
        <Route path="/" element={<PortfolioPage />} />
        <Route path="/spotify-auth" element={<SpotifyAuthRedirect />} />
        <Route path="/nexus/login" element={<NexusLogin />} />
        <Route element={<NexusProtectedRoute />}>
          <Route path="/nexus" element={<NexusHub />} />
          <Route path="/nexus/analytics" element={<NexusAnalyticsPage />} />
          <Route element={<SpotifyQueryLayout />}>
            <Route path="/nexus/spotify" element={<NexusSpotifyPage />} />
          </Route>
          <Route element={<GoalsQueryLayout />}>
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
    </Router>
  );
}

export default App;
