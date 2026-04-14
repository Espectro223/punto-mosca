import { useStore } from '../store/useStore';
import { AlertTriangle, ShieldCheck, User, Phone, DollarSign, Clock, Building2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Excepciones() {
  const usuario = useStore(state => state.usuarioActual);
  const sucursales = useStore(state => state.sucursales);
  const sucursalActivaId = useStore(state => state.sucursalActivaId);
  const todasLasSolicitudes = useStore(state => state.solicitudesCredito);
  const resolverExcepcion = useStore(state => state.resolverExcepcion);

  const esAdmin = usuario?.rol === 'Admin';
  const esEncargado = usuario?.rol === 'Encargado';

  // Seguridad: Solo Encargado y Admin tienen acceso a esta página
  if (!esAdmin && !esEncargado) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="bg-red-100 p-6 rounded-full inline-flex mb-6">
            <AlertTriangle size={48} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Acceso Protegido</h1>
          <p className="text-gray-500 font-medium">
            Solo un Encargado o Administrador puede resolver apelaciones de crédito.
          </p>
        </div>
      </div>
    );
  }

  // Filtrar solicitudes según sucursal activa
  const solicitudesContexto = sucursalActivaId
    ? todasLasSolicitudes.filter(s => s.sucursalId === sucursalActivaId)
    : todasLasSolicitudes;

  // Filtrar únicamente aquellas que fueron rechazadas pero pidieron excepción
  const excepcionesPendientes = solicitudesContexto.filter(
    s => s.estado === 'RECHAZADO' && s.resolucionExcepcion === 'PENDIENTE'
  );

  const sucursalActiva = sucursales.find(s => s.id === sucursalActivaId) ?? null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <ShieldCheck className="text-amber-500" size={32} /> Mesa de Excepciones
        </h1>
        {esAdmin && !sucursalActivaId ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
            <Building2 size={13} /> Todas las sucursales
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200">
            <Building2 size={13} /> {sucursalActiva?.nombre}
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="text-amber-600" /> Solicitudes de Apelación
            </h2>
            <p className="text-sm text-amber-700 mt-0.5">Créditos rechazados que los vendedores enviaron a revisión manual</p>
          </div>
          <span className="text-sm font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            {excepcionesPendientes.length} Casos
          </span>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50/50 p-6">
          {excepcionesPendientes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-12">
              <CheckCircle size={48} className="text-green-300/50 mb-2" />
              <p className="text-xl font-bold text-gray-400">Bandeja al día</p>
              <p className="text-sm">No existen excepciones pendientes de resolución por parte de los vendedores.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {excepcionesPendientes.map(sol => (
                  <motion.li 
                    layout 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    key={sol.id} 
                    className="bg-white border border-gray-200 hover:border-amber-300 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                            <User size={24} />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-gray-900 text-xl tracking-tight">{sol.cliente}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium mt-1">
                              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"><Clock size={12} /> {new Date(sol.fecha).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"><Phone size={12} /> {sol.telefono}</span>
                              {esAdmin && !sucursalActivaId && (
                                <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                                  <Building2 size={12} /> {sucursales.find(s => s.id === sol.sucursalId)?.nombre}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {sol.motivoRechazo && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Motivo FSM Original del Rechazo Automático</h4>
                            <div className="flex items-start gap-2 text-sm font-medium text-slate-700">
                              <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                              <p>
                                {sol.motivoRechazo === 'VERAZ_FAILED' && 'El cliente presentó un historial severo en el Veraz.'}
                                {sol.motivoRechazo === 'PHONE_INVALID' && 'Verificación de seguridad telefónica fallida en el sistema de validación.'}
                                {sol.motivoRechazo === 'MANUAL' && 'El crédito fue rechazado explícitamente de antemano.'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end justify-between gap-4 min-w-[220px] bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <div className="text-right w-full">
                          <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Monto Requerido</p>
                          <p className="text-3xl font-black text-gray-900 flex items-center justify-end gap-1">
                            <DollarSign size={20} className="text-amber-500 -mt-1" />
                            {sol.monto.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 w-full pt-4 border-t border-gray-200">
                          <button 
                            onClick={() => resolverExcepcion(sol.id, 'RECHAZADO')} 
                            className="flex-1 bg-white hover:bg-red-50 text-red-600 font-bold py-2.5 rounded-lg transition-colors border border-red-200 flex items-center justify-center gap-1.5 text-sm"
                          >
                            <XCircle size={16} /> Mantener Rechazo
                          </button>
                          <button 
                            onClick={() => resolverExcepcion(sol.id, 'ACEPTADO')} 
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5 text-sm"
                          >
                            <CheckCircle size={16} /> Avalar Riesgo
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
