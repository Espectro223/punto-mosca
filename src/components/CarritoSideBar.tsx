import { ShoppingCart, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { calcularTotalCarrito } from '../utils/calculations';

export default function CarritoSideBar() {
  const carrito = useStore(state => state.carrito);
  const limpiarCarrito = useStore(state => state.limpiarCarrito);

  // El motor de cálculos de la Fase 2!
  const totales = calcularTotalCarrito(carrito);

  return (
    <div className="w-96 bg-white border-l shadow-2xl flex flex-col h-[calc(100vh-64px)] fixed right-0 top-16">
      <div className="p-5 bg-indigo-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
          <ShoppingCart size={20} />
          Carrito de Compra
        </h2>
        {carrito.length > 0 && (
          <button 
            onClick={limpiarCarrito}
            className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors tooltip flex items-center gap-1 text-xs font-semibold"
            title="Vaciar carrito"
          >
            <Trash2 size={16} /> Vaciar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {carrito.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
            <ShoppingCart size={48} className="opacity-50" />
            <p>El carrito está vacío</p>
          </div>
        ) : (
          carrito.map((elem, idx) => (
            <div key={`${elem.type}-${elem.item.id}-${idx}`} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2 relative">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm leading-tight">{elem.item.nombre}</h4>
                  <span className="text-xs text-indigo-600 font-medium px-2 py-0.5 bg-indigo-50 rounded-md inline-block mt-1">
                    {elem.type === 'combo' ? 'Combo' : 'Producto'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 block">
                    ${elem.type === 'combo' 
                        ? elem.item.productos.reduce((acc, p) => acc + p.precioBase, 0)
                        : elem.item.precioBase}
                  </span>
                  <span className="text-xs text-gray-500">Cant: {elem.cantidad}</span>
                </div>
              </div>
              
              {elem.type === 'combo' && (
                <div className="text-xs text-green-600 bg-green-50 p-1.5 rounded border border-green-100">
                  Aplica {elem.item.porcentajeDescuento}% de descuento.
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t bg-gray-50 p-5 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] text-sm">
        <h3 className="font-bold text-gray-700 mb-3 uppercase tracking-wider text-xs">Resumen de Factura</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal Bruto</span>
            <span className="font-medium">${totales.totalBruto.toFixed(2)}</span>
          </div>
          {totales.descuentoTotal > 0 && (
            <div className="flex justify-between text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
              <span>Descuento Aplicado</span>
              <span>-${totales.descuentoTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Total IVA (Multi-Alícuota)</span>
            <span className="font-medium">${totales.totalIVA.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="border-t pt-3 flex justify-between items-center mb-5">
          <span className="text-xl font-bold text-gray-900">Total Neto</span>
          <span className="text-2xl font-extrabold text-indigo-600">
            ${totales.totalNeto.toFixed(2)}
          </span>
        </div>

        <button 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
          disabled={carrito.length === 0}
          onClick={() => {
            alert('Emitiendo Factura...\nTotal: $' + totales.totalNeto.toFixed(2));
            limpiarCarrito();
          }}
        >
          Confirmar Venta
        </button>
      </div>
    </div>
  );
}
