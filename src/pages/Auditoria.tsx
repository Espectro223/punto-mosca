import { useStore } from '../store/useStore';
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle, Building2, User, Phone, DollarSign, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auditoria() {
  const usuario = useStore(state => state.usuarioActual);
  const sucursales = useStore(state => state.sucursales);
  const sucursalActivaId = useStore(state => state.sucursalActivaId);
  const todasLasSolicitudes = useStore(state => state.solicitudesCredito);
  const actualizarEstado = useStore(state => state.actualizarEstadoSolicitud);

  const esAdmin = usuario?.rol === 'Admin';
  const esEncargado = usuario?.rol === 'Encargado';

  // Seguridad: Solo Encargado y Admin tienen acceso a esta página
  if (!esAdmin && !esEncargado) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="bg-red-100 p-6 rounded-full inline-flex mb-6">
            <ShieldAlert size={48} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Acceso Denegado</h1>
          <p className="text-gray-500 mb-2">
            No tienes los permisos suficientes para acceder a la bandeja de auditoría.
          </p>
        </div>
      </div>
    );
  }

  // Filtrar solicitudes según sucursal activa
  const solicitudesContexto = sucursalActivaId
    ? todasLasSolicitudes.filter(s => s.sucursalId === sucursalActivaId)
    : todasLasSolicitudes;

  // Separamos en dos listas
  const solicitudesRiesgo = solicitudesContexto.filter(s => s.estado === 'AUDIT_REQUIRED');
  const solicitudesLimpias = solicitudesContexto.filter(s => s.estado === 'PENDING_APPROVAL');

  const sucursalActiva = sucursales.find(s => s.id === sucursalActivaId) ?? null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <ShieldAlert className="text-indigo-600" size={32} /> Bandeja de Auditoría
        </h1>
        {esAdmin && !sucursalActivaId ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200">
            <Building2 size={13} /> Vista global — todas las sucursales
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200">
            <Building2 size={13} /> {sucursalActiva?.nombre}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* PARTE 1: EXCEPCIONES DE ALTO RIESGO */}
        <section>
          <div className="bg-red-50 border border-red-200 rounded-t-xl px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
              <AlertTriangle className="text-red-600" /> Excepciones de Alto Riesgo ({solicitudesRiesgo.length})
            </h2>
            <span className="text-sm font-medium text-red-700 bg-red-100 px-2.5 py-1 rounded-full">Atención Prioritaria</span>
          </div>
          <div className="bg-white border-x border-b border-gray-200 rounded-b-xl shadow-sm overflow-hidden min-h-[150px]">
             {solicitudesRiesgo.length === 0 ? (
               <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-2">
                 <CheckCircle size={32} className="text-green-300" />
                 <p>No hay excepciones pendientes de auditoría.</p>
               </div>
             ) : (
               <ul className="divide-y divide-gray-100">
                 <AnimatePresence>
                   {solicitudesRiesgo.map(sol => (
                     <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={sol.id} className="p-6 hover:bg-slate-50 transition-colors">
                       <div className="flex flex-col md:flex-row justify-between gap-6">
                         <div className="space-y-3 flex-1">
                           <div className="flex items-center gap-3">
                             <div className="bg-gray-100 p-2 rounded-lg text-gray-500"><User size={20} /></div>
                             <div>
                               <h3 className="font-bold text-gray-900 text-lg">{sol.cliente}</h3>
                               <p className="text-xs text-gray-500 flex items-center gap-3">
                                 <span className="flex items-center gap-1"><Clock size={12} /> {new Date(sol.fecha).toLocaleDateString()}</span>
                                 <span className="flex items-center gap-1"><Phone size={12} /> {sol.telefono}</span>
                                 {esAdmin && !sucursalActivaId && (
                                   <span className="flex items-center gap-1 font-medium text-indigo-600">
                                     <Building2 size={12} /> {sucursales.find(s => s.id === sol.sucursalId)?.nombre}
                                   </span>
                                 )}
                               </p>
                             </div>
                           </div>
                           
                           <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                             <h4 className="text-xs font-bold text-amber-800 uppercase mb-1">Banderas Detectadas (Veraz)</h4>
                             <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                               {sol.alertasRiesgo?.map((alerta, idx) => (
                                 <li key={idx}>{alerta}</li>
                               ))}
                             </ul>
                           </div>
                         </div>

                         <div className="flex flex-col items-end justify-center gap-4 min-w-[200px]">
                           <div className="text-right">
                             <p className="text-xs text-gray-500 font-medium mb-1">Monto Solicitado</p>
                             <p className="text-3xl font-black text-gray-900 flex items-center justify-end gap-1">
                               <DollarSign size={24} className="text-gray-400" />
                               {sol.monto.toLocaleString()}
                             </p>
                           </div>
                           <div className="flex gap-2 w-full">
                             <button onClick={() => actualizarEstado(sol.id, 'RECHAZADO', 'MANUAL')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 rounded-lg transition-colors border border-red-200 flex items-center justify-center gap-1 text-sm">
                               <XCircle size={16} /> Rechazar
                             </button>
                             <button onClick={() => actualizarEstado(sol.id, 'ACEPTADO')} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1 text-sm">
                               <CheckCircle size={16} /> Forzar Ok
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
        </section>

        {/* PARTE 2: CRÉDITOS NORMALES (PENDING APPROVAL) */}
        <section>
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl mt-8">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
               Créditos Regulares ({solicitudesLimpias.length})
            </h2>
            <span className="text-sm font-medium text-gray-500">Pasaron Veraz Automático</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto</th>
                  {esAdmin && !sucursalActivaId && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sucursal</th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Resolución</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 relative">
                <AnimatePresence>
                  {solicitudesLimpias.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No hay créditos regulares pendientes de aprobación.</td>
                    </tr>
                  ) : (
                    solicitudesLimpias.map(sol => (
                      <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={sol.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{sol.cliente}</div>
                          <div className="text-xs text-gray-400">{new Date(sol.fecha).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {sol.telefono}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                          ${sol.monto.toLocaleString()}
                        </td>
                        {esAdmin && !sucursalActivaId && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                              {sucursales.find(s => s.id === sol.sucursalId)?.nombre ?? sol.sucursalId}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                           <div className="flex justify-end gap-2">
                             <button onClick={() => actualizarEstado(sol.id, 'ACEPTADO')} className="text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors border border-green-200 text-sm font-semibold flex items-center gap-1">Aprobar</button>
                             <button onClick={() => actualizarEstado(sol.id, 'RECHAZADO', 'MANUAL')} className="text-gray-600 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors border border-gray-200 hover:border-red-200 hover:text-red-700 text-sm font-semibold flex items-center gap-1">Rechazar</button>
                           </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
