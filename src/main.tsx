import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { RegisterPage } from '@/pages/RegisterPage';
import App from './App';
import { DashboardPage } from './pages/DashboardPage';
import { ScoreboardPage } from './pages/ScoreboardPage';
import { ProfilePage } from './pages/shared/ProfilePage';
import { UserListPage } from './pages/admin/UserListPage';
import { FieldManagementPage } from './pages/admin/FieldManagementPage';
import { CreateMatchPage } from './pages/coach/CreateMatchPage';
import { MatchDetailPage } from './pages/coach/MatchDetailPage';
import { ScoreMatchPage } from './pages/coach/ScoreMatchPage';
import { SearchMatchPage } from './pages/player/SearchMatchPage';
import { MatchListPage } from './pages/shared/MatchListPage';
import { PastMatchesPage } from './pages/shared/PastMatchesPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/app",
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "scoreboard", element: <ScoreboardPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "matches", element: <MatchListPage /> },
      { path: "past-matches", element: <PastMatchesPage /> },
      // Admin Routes
      { path: "admin/users", element: <UserListPage /> },
      { path: "admin/fields", element: <FieldManagementPage /> },
      // Coach Routes
      { path: "coach/create-match", element: <CreateMatchPage /> },
      { path: "coach/match/:matchId", element: <MatchDetailPage /> },
      { path: "coach/score-match/:matchId", element: <ScoreMatchPage /> },
      // Player Routes
      { path: "player/search-match", element: <SearchMatchPage /> },
      // Redirect any other /app path to dashboard
      { path: "*", element: <Navigate to="/app" replace /> },
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)