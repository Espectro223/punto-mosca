import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Creditos() {
  const usuario = useStore(state => state.usuarioActual);
  const solicitudes = useStore(state => state.solicitudesCredito);
  const agregarSolicitud = useStore(state => state.agregarSolicitud);
  const actualizarEstado = useStore(state => state.actualizarEstadoSolicitud);

  // Form state
  const [cliente, setCliente] = useState('');
  const [edad, setEdad] = useState<number | ''>('');
  const [monto, setMonto] = useState<number | ''>('');
  const [error, setError] = useState('');

  const handleNuevaSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!edad || typeof edad !== 'number' || edad < 18) {
      setError('El cliente debe ser mayor de 18 años para solicitar créditos.');
      return;
    }
    
    // Regla de ejemplo: Límite de crédito a sola firma es $100,000 en este prototipo
    if (!monto || typeof monto !== 'number' || monto > 100000) {
      setError('Monto máximo de crédito a sola firma excedido (Límite: $100,000).');
      return;
    }

    agregarSolicitud({ cliente, monto });
    setCliente('');
    setEdad('');
    setMonto('');
    alert('Solicitud enviada con éxito');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* Panel Izquierdo: Nueva Solicitud (Solo visible para Vendedor o Admin) */}
      {(usuario?.rol === 'Vendedor' || usuario?.rol === 'Admin') && (
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="text-indigo-600" /> Nueva Solicitud
            </h2>
            
            <form onSubmit={handleNuevaSolicitud} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
                <input 
                  type="text" required
                  value={cliente} onChange={e => setCliente(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  placeholder="Ej: Juan Perez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                <input 
                  type="number" required
                  value={edad} onChange={e => setEdad(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  placeholder="Debe ser >= 18"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Solicitado ($)</label>
                <input 
                  type="number" required
                  value={monto} onChange={e => setMonto(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  placeholder="Máx: $100000"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors mt-4"
              >
                Ingresar Solicitud
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Panel Derecho: Dashboard de Aprobaciones */}
      <div className="w-full md:w-2/3 flex-1">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
           Dashboard de Evaluación
        </h2>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                
                {/* Controles solo para Encargado/Admin */}
                {(usuario?.rol === 'Encargado' || usuario?.rol === 'Admin') && (
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    No hay solicitudes registradas
                  </td>
                </tr>
              ) : (
                [...solicitudes].reverse().map(sol => (
                  <tr key={sol.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{sol.cliente}</div>
                      <div className="text-xs text-gray-400">{new Date(sol.fecha).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-bold">${sol.monto.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border",
                        sol.estado === 'Pendiente' && "bg-yellow-50 text-yellow-800 border-yellow-200",
                        sol.estado === 'Aprobado' && "bg-green-50 text-green-800 border-green-200",
                        sol.estado === 'Rechazado' && "bg-red-50 text-red-800 border-red-200"
                      )}>
                        {sol.estado === 'Pendiente' && <Clock size={14} className="mr-1 mt-0.5" />}
                        {sol.estado === 'Aprobado' && <CheckCircle size={14} className="mr-1 mt-0.5" />}
                        {sol.estado === 'Rechazado' && <XCircle size={14} className="mr-1 mt-0.5" />}
                        {sol.estado}
                      </span>
                    </td>
                    
                    {(usuario?.rol === 'Encargado' || usuario?.rol === 'Admin') && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {sol.estado === 'Pendiente' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => actualizarEstado(sol.id, 'Aprobado')}
                              className="text-green-600 hover:bg-green-100 px-3 py-1 rounded-md transition-colors border border-green-200"
                            >
                              Aprobar
                            </button>
                            <button 
                              onClick={() => actualizarEstado(sol.id, 'Rechazado')}
                              className="text-red-600 hover:bg-red-100 px-3 py-1 rounded-md transition-colors border border-red-200"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Evaluado</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
