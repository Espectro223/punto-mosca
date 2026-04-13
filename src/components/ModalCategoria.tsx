import { useState, useEffect } from 'react';
import { X, Layers, AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Props {
  id?: string;
  onClose: () => void;
}

export default function ModalCategoria({ id, onClose }: Props) {
  const { categoriasMock, agregarCategoria, editarCategoria } = useStore();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const esEdicion = Boolean(id);

  useEffect(() => {
    if (esEdicion) {
      const c = categoriasMock.find(x => x.id === id);
      if (c) {
        setNombre(c.nombre);
        setDescripcion(c.descripcion);
      }
    }
  }, [id, esEdicion, categoriasMock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }

    const payload = { 
      nombre: nombre.trim(), 
      descripcion: descripcion.trim()
    };

    if (esEdicion) {
      editarCategoria(id!, payload);
    } else {
      agregarCategoria(payload);
    }
    
    setExito(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 bg-teal-600 text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            {esEdicion ? <Save size={22} /> : <Layers size={22} />}
            {esEdicion ? 'Editar Categoría' : 'Nueva Categoría'}
          </div>
          <button onClick={onClose} className="hover:bg-teal-500 p-1.5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {exito ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-green-600">
              <CheckCircle2 size={52} className="animate-bounce" />
              <p className="text-lg font-bold">{esEdicion ? '¡Categoría actualizada!' : '¡Categoría agregada!'}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Accesorios"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Detalles sobre la clasificación..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors">
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
