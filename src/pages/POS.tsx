
import { useStore } from '../store/useStore';
import { useConfigStore } from '../store/useConfigStore';
import CarritoSideBar from '../components/CarritoSideBar';
import { Plus, Package, Layers, Building2, AlertCircle, Tag } from 'lucide-react';

export default function POS() {
  const productos = useStore(state => state.productosMock);
  const combos = useStore(state => state.combosMock);
  const agregarAlCarrito = useStore(state => state.agregarAlCarrito);
  const usuario = useStore(state => state.usuarioActual);
  const sucursales = useStore(state => state.sucursales);
  const sucursalActivaId = useStore(state => state.sucursalActivaId);
  const taxes = useConfigStore(state => state.taxes);
  const categorias = useStore(state => state.categoriasMock);

  const sucursalActiva = sucursales.find(s => s.id === sucursalActivaId) ?? null;

  // Admin en modo "Todas" no puede operar el POS directamente
  const adminSinSucursal = usuario?.rol === 'Admin' && sucursalActivaId === null;

  return (
    <div className="flex h-full">
      <div className="flex-1 pr-96 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Catálogo de Venta</h1>
            {sucursalActiva && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-blue-600 font-medium">
                <Building2 size={15} /> {sucursalActiva.nombre}
              </div>
            )}
          </div>
        </div>

        {/* Aviso Admin sin sucursal seleccionada */}
        {adminSinSucursal && (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-xl">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Seleccioná una sucursal para operar</p>
              <p className="text-sm text-amber-700 mt-0.5">Estás viendo "Todas las sucursales". Usá el selector del header para elegir una sucursal antes de confirmar ventas.</p>
            </div>
          </div>
        )}

        {/* Combos */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
            <Layers className="text-blue-600" /> Combos Especiales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {combos.map(combo => (
              <div key={combo.id} className="bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden border border-blue-400 group relative">
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-bl-lg text-sm">
                  -{combo.porcentajeDescuento}% OFF
                </div>
                <div className="p-6 text-white pb-20">
                  <h3 className="font-bold text-xl mb-2">{combo.nombre}</h3>
                  <div className="space-y-1 mb-4">
                    {combo.productos.map(p => (
                      <div key={p.id} className="text-sm text-blue-100 flex items-center justify-between bg-white/10 px-2 py-1 rounded">
                        <span>{p.nombre}</span>
                        <span className="font-mono">${p.precioBase}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => agregarAlCarrito({ type: 'combo', item: combo, cantidad: 1 })}
                  className="absolute bottom-4 left-4 right-4 bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2"
                >
                  <Plus size={18} /> Agregar al Carrito
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Productos individuales */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
            <Package className="text-blue-600" /> Productos Individuales
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map(producto => (
              <div key={producto.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 p-5 flex flex-col group">
                <div className="bg-slate-100 rounded-xl h-32 mb-4 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 transition-colors">
                  <Package size={48} />
                </div>
                <div className="flex items-center gap-1 text-xs text-teal-600 font-semibold mb-1">
                  <Tag size={12} /> {categorias.find(c => c.id === producto.categoriaId)?.nombre || 'General'}
                </div>
                <h3 className="font-bold text-gray-800 mb-1 leading-tight">{producto.nombre}</h3>
                <div className="flex justify-between items-end mb-4">
                  <span className="font-extrabold text-xl text-blue-600">${producto.precioBase}</span>
                  <span className="text-xs text-gray-400 font-medium capitalize">IVA {taxes[producto.tipoIVA]}%</span>
                </div>
                <button
                  onClick={() => agregarAlCarrito({ type: 'producto', item: producto, cantidad: 1 })}
                  className="mt-auto w-full border-2 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
                >
                  <Plus size={18} /> Agregar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CarritoSideBar adminSinSucursal={adminSinSucursal} />
    </div>
  );
}
