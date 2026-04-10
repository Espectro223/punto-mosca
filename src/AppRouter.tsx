import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { useStore } from './store/useStore';

// Lazy loading could be used here, but for prototyping standard imports are fine
import LoginMock from './pages/LoginMock';
import POS from './pages/POS';
import Creditos from './pages/Creditos';
import Dashboard from './pages/Dashboard';

// Rutas Privadas: Si el usuario no está logueado, lo devuelven al Login
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const usuarioActual = useStore((state) => state.usuarioActual);
  if (!usuarioActual) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginMock />} />
        
        {/* Rutas protegidas que utilizan el Layout Principal */}
        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/pos" replace />} />
          <Route path="pos" element={<POS />} />
          <Route path="creditos" element={<Creditos />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
