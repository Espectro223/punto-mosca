import { useState } from 'react';
import { Package, Layers, Pencil, Trash2, Tag, Percent } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useConfigStore } from '../store/useConfigStore';
import ModalProducto from '../components/ModalProducto';
import ModalCategoria from '../components/ModalCategoria';

export default function Catalogo() {
  const { productosMock, categoriasMock, eliminarProducto, eliminarCategoria } = useStore();
  const taxes = useConfigStore(state => state.taxes);

  const [activeTab, setActiveTab] = useState<'productos' | 'categorias'>('productos');
  
  // Modals state
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  
  // Edit IDs
  const [editProductoId, setEditProductoId] = useState<string | undefined>(undefined);
  const [editCategoriaId, setEditCategoriaId] = useState<string | undefined>(undefined);

  const handleCreateProducto = () => {
    setEditProductoId(undefined);
    setShowProductoModal(true);
  };

  const handleEditProducto = (id: string) => {
    setEditProductoId(id);
    setShowProductoModal(true);
  };

  const handleCreateCategoria = () => {
    setEditCategoriaId(undefined);
    setShowCategoriaModal(true);
  };

  const handleEditCategoria = (id: string) => {
    setEditCategoriaId(id);
    setShowCategoriaModal(true);
  };

  const getNombreCategoria = (id: string) => {
    const c = categoriasMock.find(x => x.id === id);
    return c ? c.nombre : 'Sin Categoría';
  };

  return (
    <div className="flex h-full flex-col p-8 overflow-y-auto w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestión de Catálogo</h1>
          <p className="text-gray-500 mt-1 font-medium">Administra tu inventario y rubros</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateCategoria}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
          >
            <Layers size={18} /> Nueva Categoría
          </button>
          <button
            onClick={handleCreateProducto}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
          >
            <Package size={18} /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b px-6 pt-4 gap-6 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('productos')}
            className={`pb-4 px-2 font-bold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'productos' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Package size={18} /> Productos
          </button>
          <button
            onClick={() => setActiveTab('categorias')}
            className={`pb-4 px-2 font-bold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'categorias' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Layers size={18} /> Categorías
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-white">
          {activeTab === 'productos' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productosMock.map(p => (
                <div key={p.id} className="bg-white border rounded-2xl p-5 hover:shadow-lg transition-shadow relative group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Package size={24} />
                    </div>
                    <div className="flex bg-white shadow-sm border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditProducto(p.id)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                        <Pencil size={16} />
                      </button>
                      <div className="w-px bg-gray-100"></div>
                      <button onClick={() => eliminarProducto(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{p.nombre}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 mb-4 bg-teal-50 w-max px-2 py-1 rounded-md">
                    <Tag size={12} /> {getNombreCategoria(p.categoriaId)}
                  </div>
                  <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-50">
                    <span className="font-black text-2xl text-blue-700">${p.precioBase}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                      <Percent size={12} /> {taxes[p.tipoIVA]}% IVA
                    </span>
                  </div>
                </div>
              ))}
              {productosMock.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400">No hay productos registrados.</div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriasMock.map(c => (
                <div key={c.id} className="bg-gradient-to-br from-slate-50 to-white border rounded-2xl p-6 hover:shadow-md transition-shadow relative group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                      <Layers className="text-teal-500" size={20} /> {c.nombre}
                    </h3>
                    <div className="flex bg-white shadow-sm border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditCategoria(c.id)} className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors" title="Editar">
                        <Pencil size={16} />
                      </button>
                      <div className="w-px bg-gray-100"></div>
                      <button onClick={() => eliminarCategoria(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{c.descripcion || 'Sin descripción adicional.'}</p>
                </div>
              ))}
              {categoriasMock.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400">No hay categorías registradas.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {showProductoModal && <ModalProducto id={editProductoId} onClose={() => setShowProductoModal(false)} />}
      {showCategoriaModal && <ModalCategoria id={editCategoriaId} onClose={() => setShowCategoriaModal(false)} />}
    </div>
  );
}
