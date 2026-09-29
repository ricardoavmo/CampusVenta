import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Ficha from './pages/Ficha';
import MisPedidos from './pages/MisPedidos';
import Panel from './pages/Panel';
import NuevoEmprendimiento from './pages/NuevoEmprendimiento';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Configuracion from './pages/Configuracion';
import BottomNav from './components/BottomNav';
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pedidos" element={<MisPedidos />} />
        <Route path="/favoritos" element={<Navigate to="/pedidos" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/nuevo-emprendimiento" element={<NuevoEmprendimiento />} />
        <Route path="/emprendimiento/:id" element={<Ficha />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global PWA Install Notification Bar */}
      <InstallPrompt />

      {/* Mobile-only Persistent Bottom Navigation Bar */}
      <BottomNav />
    </AuthProvider>
  );
}
