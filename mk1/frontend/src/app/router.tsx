import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './AppShell'
import { AgentsPage } from '../features/agents/AgentsPage'
import { ModelsPage } from '../features/models/ModelsPage'
import { TeamsPage } from '../features/teams/TeamsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/agents" replace /> },
      { path: 'agents', element: <AgentsPage /> },
      { path: 'models', element: <ModelsPage /> },
      { path: 'teams', element: <TeamsPage /> },
    ],
  },
])