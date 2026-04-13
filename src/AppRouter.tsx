import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { useStore } from './store/useStore';
import ErrorBoundary from './components/ErrorBoundary';

import LoginMock from './pages/LoginMock';
import POS from './pages/POS';
import Creditos from './pages/Creditos';
import Dashboard from './pages/Dashboard';
import Auditoria from './pages/Auditoria';
import Excepciones from './pages/Excepciones';
import Catalogo from './pages/Catalogo';
import NotFound from './pages/NotFound';

// Rutas Privadas: Si el usuario no está logueado, lo redirigen al Login
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const usuarioActual = useStore((state) => state.usuarioActual);
  if (!usuarioActual) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function AppRouter() {
  return (
    // ErrorBoundary envuelve toda la aplicación para atrapar errores de runtime
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginMock />} />

          {/* Rutas protegidas con Layout Principal */}
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/pos" replace />} />
            <Route path="pos" element={<POS />} />
            <Route path="creditos" element={<Creditos />} />
            <Route path="auditoria" element={<Auditoria />} />
            <Route path="excepciones" element={<Excepciones />} />
            <Route path="catalogo" element={<Catalogo />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>

          {/* Página 404 — rutas no existentes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
