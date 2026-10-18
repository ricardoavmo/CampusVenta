import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Ficha from './pages/Ficha';
import MisPedidos from './pages/MisPedidos';
import Panel from './pages/Panel';
import NuevoEmprendimiento from './pages/NuevoEmprendimiento';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Configuracion from './pages/Configuracion';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import BottomNav from './components/BottomNav';
import InstallPrompt from './components/InstallPrompt';

// Componente para garantizar que la vista principal en cargar al ingresar
// al sistema sin sesión activa sea el Login.
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-bg gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-heading font-bold text-xs text-text-secondary tracking-wide uppercase">
          Verificando sesión UTP...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

// Componente para restringir acceso exclusivo a Administradores del sistema
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-bg gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-heading font-bold text-xs text-text-secondary tracking-wide uppercase">
          Verificando credenciales de administración...
        </span>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Vista de acceso estudiantil */}
        <Route path="/login" element={<Login />} />

        {/* Portal exclusivo de administración */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        {/* Vistas internas del sistema - protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explorar"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute>
              <MisPedidos />
            </ProtectedRoute>
          }
        />
        <Route path="/favoritos" element={<Navigate to="/pedidos" replace />} />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <Panel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracion"
          element={
            <ProtectedRoute>
              <Configuracion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nuevo-emprendimiento"
          element={
            <ProtectedRoute>
              <NuevoEmprendimiento />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emprendimiento/:id"
          element={
            <ProtectedRoute>
              <Ficha />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Global PWA Install Notification Bar */}
      <InstallPrompt />

      {/* Mobile-only Persistent Bottom Navigation Bar */}
      <BottomNav />
    </AuthProvider>
  );
}
