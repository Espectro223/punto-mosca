import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, FileText, BarChart3, LogOut, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import clsx from 'clsx';
import rataImg from '../assets/rata-al-404.jpg';

export default function MainLayout() {
  const usuario = useStore((state) => state.usuarioActual);
  const logoutUsuario = useStore((state) => state.logout);
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(false);

  const handleLogout = () => {
    logoutUsuario();
    navigate('/login');
  };

  if (!usuario) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Navbar Superior */}
      <nav className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-white p-1 rounded">
                  <ShoppingCart className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="font-bold text-xl tracking-tight leading-none text-white drop-shadow-sm">Punto Mosca</span>
              </div>
              
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <NavLink 
                  to="/pos" 
                  className={({ isActive }) => clsx(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2"><ShoppingCart size={18} /> Caja POS</div>
                </NavLink>
                
                <NavLink 
                  to="/creditos" 
                  className={({ isActive }) => clsx(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2"><FileText size={18} /> Créditos</div>
                </NavLink>

                {/* Sólo Encargado y Admin ven Reportes */}
                {(usuario.rol === 'Encargado' || usuario.rol === 'Admin') && (
                  <NavLink 
                    to="/dashboard" 
                    className={({ isActive }) => clsx(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2"><BarChart3 size={18} /> Reportes</div>
                  </NavLink>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Botón secreto — solo visible para Vendedor */}
              {usuario.rol === 'Vendedor' && (
                <button
                  onClick={() => setModalAbierto(true)}
                  title="¿Quién es la rata?"
                  className="text-2xl hover:scale-125 transition-transform duration-150 select-none"
                >
                  🐭
                </button>
              )}

              <div className="text-sm flex flex-col items-end">
                <span className="font-medium text-white">{usuario.nombre}</span>
                <span className="text-indigo-200 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-700/50 block">Rol: {usuario.rol}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-indigo-500 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Modal — Rata al 404 */}
      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full mx-4 animate-[fadeInScale_0.2s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-3 right-3 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
            >
              <X size={18} />
            </button>

            <img
              src={rataImg}
              alt="Rata al 404"
              className="w-full object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
