import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from './ProtectedRoute'

import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'

import EmployeeListPage from '../pages/EmployeeListPage'
import EmployeeDetailPage from '../pages/EmployeeDetailPage'

import ProjectListPage from '../pages/ProjectListPage'
import ProjectDetailPage from '../pages/ProjectDetailPage'

import SeatManagementPage from '../pages/SeatManagementPage'
import SeatAvailabilityPage from '../pages/SeatAvailabilityPage'
import NewJoinerAllocationPage from '../pages/NewJoinerAllocationPage'

import SearchPage from '../pages/SearchPage'
import AiAssistantPage from '../pages/AiAssistantPage'

import UnauthorizedPage from '../pages/UnauthorizedPage'
import NotFoundPage from '../pages/NotFoundPage'

import { MANAGER_ROLES } from '../utils/constants'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect */}

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Public */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Employees */}

        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <EmployeeListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute>
              <EmployeeDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Projects */}

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Seat Management (Admin + HR) */}

        <Route
          path="/seats"
          element={
            <ProtectedRoute roles={MANAGER_ROLES}>
              <SeatManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-joiner"
          element={
            <ProtectedRoute roles={MANAGER_ROLES}>
              <NewJoinerAllocationPage />
            </ProtectedRoute>
          }
        />

        {/* Seat Availability */}

        <Route
          path="/seats/availability"
          element={
            <ProtectedRoute>
              <SeatAvailabilityPage />
            </ProtectedRoute>
          }
        />

        {/* Search */}

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />

        {/* AI Assistant */}

        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <AiAssistantPage />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized */}

        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />

        {/* 404 */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />

      </Routes>
    </BrowserRouter>
  )
}