import { useState, useEffect } from 'react';
import { X, Package, AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useConfigStore } from '../store/useConfigStore';
import type { TipoIVA } from '../types';

interface Props {
  id?: string; // Si se provee, el modal opera en modo EDICIÓN
  onClose: () => void;
}

export default function ModalProducto({ id, onClose }: Props) {
  const { productosMock, categoriasMock, agregarProducto, editarProducto } = useStore();
  const taxes = useConfigStore(state => state.taxes);

  // Estados locales del form
  const [nombre, setNombre] = useState('');
  const [precioBase, setPrecioBase] = useState<number | ''>('');
  const [tipoIVA, setTipoIVA] = useState<TipoIVA>('general');
  const [categoriaId, setCategoriaId] = useState<string>('');
  
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const esEdicion = Boolean(id);

  useEffect(() => {
    if (esEdicion) {
      const p = productosMock.find(x => x.id === id);
      if (p) {
        setNombre(p.nombre);
        setPrecioBase(p.precioBase);
        setTipoIVA(p.tipoIVA);
        setCategoriaId(p.categoriaId);
      }
    } else if (categoriasMock.length > 0) {
      // Default to first category if creating
      setCategoriaId(categoriasMock[0].id);
    }
  }, [id, esEdicion, productosMock, categoriasMock]);

  const porcentaje = taxes[tipoIVA];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre del producto es obligatorio.');
      return;
    }
    if (!precioBase || precioBase <= 0) {
      setError('El precio base debe ser mayor a $0.');
      return;
    }
    if (!categoriaId) {
      setError('Debe seleccionar una categoría.');
      return;
    }

    const payload = { 
      nombre: nombre.trim(), 
      precioBase: Number(precioBase), 
      tipoIVA,
      categoriaId
    };

    if (esEdicion) {
      editarProducto(id!, payload);
    } else {
      agregarProducto(payload);
    }
    
    setExito(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            {esEdicion ? <Save size={22} /> : <Package size={22} />}
            {esEdicion ? 'Editar Producto' : 'Nuevo Producto'}
          </div>
          <button onClick={onClose} className="hover:bg-indigo-500 p-1.5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {exito ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-green-600">
              <CheckCircle2 size={52} className="animate-bounce" />
              <p className="text-lg font-bold">{esEdicion ? '¡Producto actualizado!' : '¡Producto agregado!'}</p>
              <p className="text-sm text-gray-500">El catálogo fue consolidado con éxito.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span>
                </div>
              )}

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría <span className="text-red-500">*</span></label>
                <select
                  value={categoriaId}
                  onChange={e => setCategoriaId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                >
                  <option value="" disabled>Seleccione una categoría</option>
                  {categoriasMock.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Tablet 10 pulgadas"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              {/* Precio Base */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio base ($) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="0.01" step="0.01"
                  value={precioBase}
                  onChange={e => setPrecioBase(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Ej: 299.99"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              {/* Alícuota IVA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alícuota de IVA <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {(['general', 'reducido'] as TipoIVA[]).map(tasa => (
                    <button
                      key={tasa} type="button"
                      onClick={() => setTipoIVA(tasa)}
                      className={`py-2.5 px-4 rounded-xl border-2 text-sm font-semibold capitalize ${
                        tipoIVA === tasa ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {tasa} ({taxes[tasa]}%)
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview del cálculo */}
              {precioBase && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Precio base</span><span>${Number(precioBase).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>IVA ({porcentaje}%)</span><span>+${(Number(precioBase) * porcentaje / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-indigo-700 pt-1 border-t border-slate-200">
                    <span>Precio final</span><span>${(Number(precioBase) * (1 + porcentaje / 100)).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors">
                  {esEdicion ? 'Guardar Cambios' : 'Agregar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
