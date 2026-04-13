import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, FileText, BarChart3, LogOut, X, ChevronDown, Building2, ShieldAlert, Package, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import clsx from 'clsx';
import rataImg from '../assets/rata-al-404.jpg';

export default function MainLayout() {
  const usuario = useStore(state => state.usuarioActual);
  const sucursales = useStore(state => state.sucursales);
  const sucursalActivaId = useStore(state => state.sucursalActivaId);
  const setSucursalActiva = useStore(state => state.setSucursalActiva);
  const logoutUsuario = useStore(state => state.logout);
  const navigate = useNavigate();

  const [modalRata, setModalRata] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);

  const handleLogout = () => { logoutUsuario(); navigate('/login'); };

  if (!usuario) return null;

  const sucursalActiva = sucursales.find(s => s.id === sucursalActivaId) ?? null;
  const esAdmin = usuario.rol === 'Admin';

  // El link de Créditos se muestra si:
  // - El usuario es Admin (ve todo)
  // - La sucursal activa tiene créditos habilitados
  const mostrarCreditos = esAdmin || sucursalActiva?.habilitaCreditos === true;

  const labelSucursal = esAdmin
    ? (sucursalActiva ? sucursalActiva.nombre : 'Todas las sucursales')
    : (sucursalActiva?.nombre ?? '—');

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <nav className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">

            {/* Izquierda: logo + links */}
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-white p-1 rounded">
                  <ShoppingCart className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">Punto Mosca</span>
              </div>

              <div className="hidden md:flex md:space-x-2">
                <NavLink to="/pos" className={({ isActive }) => clsx(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                  isActive ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-500"
                )}>
                  <ShoppingCart size={16} /> Caja POS
                </NavLink>

                {mostrarCreditos && (
                  <NavLink to="/creditos" className={({ isActive }) => clsx(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                    isActive ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-500"
                  )}>
                    <FileText size={16} /> Créditos
                  </NavLink>
                )}

                {(usuario.rol === 'Encargado' || esAdmin) && (
                  <>
                    <NavLink to="/auditoria" className={({ isActive }) => clsx(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                      isActive ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-500"
                    )}>
                      <ShieldAlert size={16} /> Auditoría
                    </NavLink>
                    <NavLink to="/excepciones" className={({ isActive }) => clsx(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                      isActive ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-500"
                    )}>
                      <AlertTriangle size={16} /> Excepciones
                    </NavLink>
                    <NavLink to="/catalogo" className={({ isActive }) => clsx(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                      isActive ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-500"
                    )}>
                      <Package size={16} /> Catálogo
                    </NavLink>
                    <NavLink to="/dashboard" className={({ isActive }) => clsx(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                      isActive ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-500"
                    )}>
                      <BarChart3 size={16} /> Reportes
                    </NavLink>
                  </>
                )}
              </div>
            </div>

            {/* Derecha: sucursal + usuario + acciones */}
            <div className="flex items-center gap-3">

              {/* Selector de sucursal (Admin) o badge (otros) */}
              {esAdmin ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownAbierto(v => !v)}
                    className="flex items-center gap-2 bg-indigo-700/50 hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    <Building2 size={15} />
                    <span className="font-medium max-w-[160px] truncate">{labelSucursal}</span>
                    <ChevronDown size={14} className={clsx("transition-transform", dropdownAbierto && "rotate-180")} />
                  </button>

                  {dropdownAbierto && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                      <button
                        onClick={() => { setSucursalActiva(null); setDropdownAbierto(false); }}
                        className={clsx(
                          "w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2",
                          sucursalActivaId === null ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <Building2 size={14} /> Todas las sucursales
                      </button>
                      {sucursales.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setSucursalActiva(s.id); setDropdownAbierto(false); }}
                          className={clsx(
                            "w-full text-left px-4 py-2.5 text-sm transition-colors flex flex-col gap-0.5",
                            sucursalActivaId === s.id ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <span>{s.nombre}</span>
                          {!s.habilitaCreditos && (
                            <span className="text-xs text-amber-500 font-normal">Sin módulo de créditos</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-indigo-700/40 px-3 py-1.5 rounded-lg text-xs">
                  <Building2 size={13} />
                  <span className="font-medium">{labelSucursal}</span>
                </div>
              )}

              {/* Botón rata — solo Vendedor */}
              {usuario.rol === 'Vendedor' && (
                <button onClick={() => setModalRata(true)} title="¿Quién es la rata?"
                  className="text-xl hover:scale-125 transition-transform select-none">
                  🐭
                </button>
              )}

              <div className="text-sm flex flex-col items-end">
                <span className="font-medium">{usuario.nombre}</span>
                <span className="text-indigo-200 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-700/50">
                  {usuario.rol}
                </span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-full hover:bg-indigo-500 transition-colors" title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Click fuera cierra dropdown */}
      {dropdownAbierto && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownAbierto(false)} />
      )}

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Modal rata */}
      {modalRata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setModalRata(false)}>
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalRata(false)} className="absolute top-3 right-3 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors">
              <X size={18} />
            </button>
            <img src={rataImg} alt="Rata al 404" className="w-full object-contain max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
