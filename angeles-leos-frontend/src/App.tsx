import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ComingSoonPage } from '@/pages/ComingSoonPage';
import { UsersListPage } from '@/pages/users/UsersListPage';
import { UserFormPage } from '@/pages/users/UserFormPage';
import { AppointmentsListPage } from '@/pages/appointments/AppointmentsListPage';
import { AppointmentFormPage } from '@/pages/appointments/AppointmentFormPage';

function LoginRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UsersListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/nuevo"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/:id/editar"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citas"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPCION', 'MEDICO']}>
                  <AppointmentsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citas/nueva"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPCION', 'MEDICO']}>
                  <AppointmentFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citas/:id/editar"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPCION', 'MEDICO']}>
                  <AppointmentFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/historial"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MEDICO', 'PACIENTE']}>
                  <ComingSoonPage title="Historial de expedientes" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expedientes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MEDICO', 'PACIENTE']}>
                  <ComingSoonPage title="Expedientes y recetas" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finanzas"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPCION']}>
                  <ComingSoonPage title="Finanzas" />
                </ProtectedRoute>
              }
            />
            <Route path="/perfil" element={<ComingSoonPage title="Mi perfil" />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
