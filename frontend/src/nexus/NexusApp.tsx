import { Navigate, Route, Routes } from 'react-router-dom'
import { NexusAuthProvider } from './auth/NexusAuthProvider'
import { NexusLoginPage } from './auth/NexusLoginPage'
import { NexusProtectedRoute } from './auth/NexusProtectedRoute'
import { NexusLayout } from './layout/NexusLayout'
import { NexusHomePage } from './pages/NexusHomePage'
import { NexusAnalyticsPage } from './pages/NexusAnalyticsPage'
import { NexusSpotifyPage } from './pages/NexusSpotifyPage'
import { GoalsConfigurationPage } from './pages/goals/GoalsConfigurationPage'
import { GoalsDashboardPage } from './pages/goals/GoalsDashboardPage'
import { GoalsWeightsPage } from './pages/goals/GoalsWeightsPage'
import { GoalsObjectivesPage } from './pages/goals/GoalsObjectivesPage'
import { GoalsProfilePage } from './pages/goals/GoalsProfilePage'
import { ConfigProjectsPage } from './pages/config/ConfigProjectsPage'
import { ConfigSocialPage } from './pages/config/ConfigSocialPage'
import { GoalsProfileProvider } from './goals/GoalsProfileProvider'
import { GoalsConfiguredRoute } from './goals/GoalsConfiguredRoute'

export function NexusApp() {
  return (
    <NexusAuthProvider>
      <Routes>
        <Route path="login" element={<NexusLoginPage />} />
        <Route element={<NexusProtectedRoute />}>
          <Route element={<GoalsProfileProvider />}>
            <Route element={<NexusLayout />}>
              <Route index element={<NexusHomePage />} />
              <Route path="analytics" element={<NexusAnalyticsPage />} />
              <Route path="goals/configuration" element={<GoalsConfigurationPage />} />
              <Route element={<GoalsConfiguredRoute />}>
                <Route path="goals/dashboard" element={<GoalsDashboardPage />} />
                <Route path="goals/weights" element={<GoalsWeightsPage />} />
                <Route path="goals/objectives" element={<GoalsObjectivesPage />} />
                <Route path="goals/profile" element={<GoalsProfilePage />} />
              </Route>
              <Route path="spotify" element={<NexusSpotifyPage />} />
              <Route path="config/projects" element={<ConfigProjectsPage />} />
              <Route path="config/social" element={<ConfigSocialPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/nexus" replace />} />
      </Routes>
    </NexusAuthProvider>
  )
}
