import { useState } from 'react';
import { useStore } from '../store/useStore';
import { FileText, CheckCircle, XCircle, Clock, AlertCircle, AlertTriangle, Lock, Building2, User, Phone, DollarSign, ChevronRight, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const FSM_BADGE_CONFIG = {
  DRAFT: { label: 'Borrador', style: 'bg-gray-50 text-gray-800 border-gray-200', icon: <FileText size={12} className="mr-1" /> },
  VALIDATING_PHONE: { label: 'Validando Tel...', style: 'bg-blue-50 text-blue-800 border-blue-200', icon: <Clock size={12} className="mr-1 animate-spin" /> },
  CHECKING_VERAZ: { label: 'Consultando Buró...', style: 'bg-orange-50 text-orange-800 border-orange-200', icon: <Clock size={12} className="mr-1 animate-spin" /> },
  PENDING_APPROVAL: { label: 'Pendiente Manual', style: 'bg-yellow-50 text-yellow-800 border-yellow-200', icon: <AlertCircle size={12} className="mr-1" /> },
  AUDIT_REQUIRED: { label: 'Revisión Especial', style: 'bg-red-50 text-red-700 border-red-200', icon: <AlertCircle size={12} className="mr-1" /> },
  ACEPTADO: { label: 'Aprobado', style: 'bg-green-50 text-green-800 border-green-200', icon: <CheckCircle size={12} className="mr-1" /> },
  RECHAZADO: { label: 'Rechazado', style: 'bg-gray-100 text-gray-500 border-gray-200', icon: <XCircle size={12} className="mr-1" /> },
};

export default function Creditos() {
  const usuario = useStore(state => state.usuarioActual);
  const sucursales = useStore(state => state.sucursales);
  const sucursalActivaId = useStore(state => state.sucursalActivaId);
  const todasLasSolicitudes = useStore(state => state.solicitudesCredito);
  const iniciarSolicitud = useStore(state => state.iniciarSolicitudCredito);
  const solicitarExcepcion = useStore(state => state.solicitarExcepcion);

  // Formulario Multi-paso
  const [step, setStep] = useState(1);
  const [cliente, setCliente] = useState('');
  const [edad, setEdad] = useState<number | ''>('');
  const [telefono, setTelefono] = useState('');
  const [monto, setMonto] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const sucursalActiva = sucursales.find(s => s.id === sucursalActivaId) ?? null;
  const esAdmin = usuario?.rol === 'Admin';
  const accesoBloqueado = !esAdmin && sucursalActiva !== null && !sucursalActiva.habilitaCreditos;

  if (accesoBloqueado) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="bg-amber-100 p-6 rounded-full inline-flex mb-6">
            <Lock size={48} className="text-amber-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Módulo no disponible</h1>
          <p className="text-gray-500 mb-2">La <strong>{sucursalActiva?.nombre}</strong> no tiene habilitado el módulo de créditos.</p>
          <p className="text-sm text-gray-400">Contactá al administrador si considerás que esto es un error.</p>
        </div>
      </div>
    );
  }

  const solicitudes = sucursalActivaId
    ? todasLasSolicitudes.filter(s => s.sucursalId === sucursalActivaId)
    : todasLasSolicitudes;

  const handleNextStep = () => {
    setError('');
    if (step === 1 && (!cliente || !edad || typeof edad !== 'number' || edad < 18)) {
      setError('Completá el nombre y verificá que la edad sea ≥ 18.');
      return;
    }
    if (step === 2 && (!telefono || telefono.length < 8)) {
      setError('Ingresá un teléfono válido (min. 8 dígitos numéricos).');
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleNuevaSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!monto || typeof monto !== 'number' || monto > 100000) {
      setError('Monto máximo de crédito es $100,000.');
      return;
    }

    iniciarSolicitud({ cliente, telefono, monto });
    setCliente(''); setEdad(''); setTelefono(''); setMonto('');
    setStep(1);
    setExito(true);
    setTimeout(() => setExito(false), 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Panel Izquierdo: Formulario Multi-paso */}
      {(usuario?.rol === 'Vendedor' || usuario?.rol === 'Admin') && (
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 overflow-hidden">
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <FileText className="text-blue-600" /> Nueva Solicitud
            </h2>
            {sucursalActiva && (
              <p className="text-xs text-blue-500 mb-5 flex items-center gap-1">
                <Building2 size={12} /> {sucursalActiva.nombre}
              </p>
            )}

            {esAdmin && !sucursalActivaId && (
              <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2.5 rounded-lg text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>Seleccioná una sucursal para ingresar.</span>
              </div>
            )}

            {exito && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 rounded-lg text-sm transition-all">
                <CheckCircle size={16} /> Solicitud ingresada (FSM iniciada).
              </div>
            )}

            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-6 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
              {[1, 2, 3].map(i => (
                <div key={i} className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors bg-white",
                  step === i ? "border-blue-600 text-blue-600" : step > i ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 text-gray-300"
                )}>
                  {step > i ? <CheckCircle size={16} /> : i}
                </div>
              ))}
            </div>

            <form onSubmit={handleNuevaSolicitud} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2 animate-pulse">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><User size={14} /> Cliente</label>
                        <input type="text" value={cliente} onChange={e => setCliente(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Ej: Juan Perez" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                        <input type="number" value={edad} onChange={e => setEdad(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Debe ser ≥ 18" />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Phone size={14} /> Teléfono</label>
                        <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Ej: 3512345678" />
                        <p className="text-xs text-gray-400 mt-1">Requerido para la validación de identidad.</p>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><DollarSign size={14} /> Monto Solicitado</label>
                        <input type="number" value={monto} onChange={e => setMonto(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Máx: $100,000" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-2 pt-4 border-t mt-4">
                {step > 1 && (
                  <button type="button" onClick={handlePrevStep} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center">
                    <ChevronLeft size={16} /> Atrás
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" onClick={handleNextStep} disabled={esAdmin && !sucursalActivaId} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1">
                    Siguiente <ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="submit" disabled={esAdmin && !sucursalActivaId} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-2 rounded-lg shadow-sm transition-colors flex items-center justify-center">
                    <CheckCircle size={16} className="mr-1" /> Enviar y Validar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Panel Derecho: Tabla de evaluación (Dashboard) */}
      <div className="w-full md:w-2/3 flex-1">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Dashboard de Evaluación</h2>
        {esAdmin && !sucursalActivaId && (
          <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
            <Building2 size={16} /> Mostrando solicitudes de <strong>todas las sucursales</strong>.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                {esAdmin && !sucursalActivaId && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sucursal</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado de Evaluación</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 relative">
              <AnimatePresence>
                {solicitudes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No hay solicitudes registradas</td>
                  </tr>
                ) : (
                  [...solicitudes].reverse().map(sol => {
                    let badge = FSM_BADGE_CONFIG[sol.estado] || FSM_BADGE_CONFIG['DRAFT'];
                    if (sol.resolucionExcepcion === 'PENDIENTE') {
                      badge = { label: 'Revisión de Excepción', icon: <AlertTriangle size={14} />, style: 'bg-amber-100 text-amber-800 border-amber-200' };
                    } else if (sol.resolucionExcepcion === 'RECHAZADO') {
                      badge = { label: 'Excepción Denegada', icon: <XCircle size={14} />, style: 'bg-red-200 text-red-900 border-red-300' };
                    }

                    return (
                      <motion.tr layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} key={sol.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{sol.cliente}</div>
                          <div className="text-xs text-gray-400">{new Date(sol.fecha).toLocaleDateString()} &middot; {sol.telefono}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">${sol.monto.toFixed(2)}</td>
                        {esAdmin && !sucursalActivaId && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                              {sucursales.find(s => s.id === sol.sucursalId)?.nombre ?? sol.sucursalId}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap flex flex-col items-start justify-center gap-1">
                          <span className={clsx("px-2.5 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border", badge.style)}>
                            {badge.icon} {badge.label}
                          </span>
                            {sol.estado === 'RECHAZADO' && sol.motivoRechazo && (
                            <span className="text-[10px] text-red-500 font-medium">Motivo: {sol.motivoRechazo}</span>
                          )}
                          {sol.estado === 'RECHAZADO' && !sol.resolucionExcepcion && (
                            <button 
                              onClick={() => solicitarExcepcion(sol.id)}
                              className="mt-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded transition-colors border border-amber-200"
                            >
                              Solicitar Excepción
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
