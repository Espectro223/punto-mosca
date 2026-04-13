import { useState } from 'react';
import { ShoppingCart, Trash2, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { calcularTotalCarrito } from '../utils/calculations';
import type { TipoFactura, Venta } from '../types';
import ModalFactura from './ModalFactura';

interface Props {
  adminSinSucursal?: boolean;
}

export default function CarritoSideBar({ adminSinSucursal = false }: Props) {
  const carrito = useStore(state => state.carrito);
  const limpiarCarrito = useStore(state => state.limpiarCarrito);
  const confirmarVenta = useStore(state => state.confirmarVenta);

  const [tipoFactura, setTipoFactura] = useState<TipoFactura>('B');
  const [ventaConfirmada, setVentaConfirmada] = useState<Venta | null>(null);

  const totales = calcularTotalCarrito(carrito);

  const handleConfirmar = () => {
    const venta = confirmarVenta(tipoFactura);
    if (venta) setVentaConfirmada(venta);
  };

  return (
    <>
      <div className="w-96 bg-white border-l shadow-2xl flex flex-col h-[calc(100vh-64px)] fixed right-0 top-16">
        <div className="p-5 bg-indigo-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
            <ShoppingCart size={20} /> Carrito de Compra
          </h2>
          {carrito.length > 0 && (
            <button onClick={limpiarCarrito} className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors flex items-center gap-1 text-xs font-semibold">
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
              <div key={`${elem.type}-${elem.item.id}-${idx}`} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{elem.item.nombre}</h4>
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

        <div className="border-t bg-gray-50 p-5 text-sm">
          <h3 className="font-bold text-gray-700 mb-3 uppercase tracking-wider text-xs">Resumen de Factura</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal Bruto</span>
              <span className="font-medium">${totales.totalBruto.toFixed(2)}</span>
            </div>
            {totales.descuentoTotal > 0 && (
              <div className="flex justify-between text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                <span>Descuento</span><span>-${totales.descuentoTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>IVA (Multi-Alícuota)</span>
              <span className="font-medium">${totales.totalIVA.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t pt-3 flex justify-between items-center mb-4">
            <span className="text-xl font-bold text-gray-900">Total Neto</span>
            <span className="text-2xl font-extrabold text-indigo-600">${totales.totalNeto.toFixed(2)}</span>
          </div>

          {/* Selector tipo de factura */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Tipo de Factura</label>
            <div className="grid grid-cols-3 gap-2">
              {(['A', 'B', 'C'] as TipoFactura[]).map(tipo => (
                <button key={tipo} onClick={() => setTipoFactura(tipo)}
                  className={`py-2 rounded-lg border-2 font-bold text-sm transition-all ${
                    tipoFactura === tipo ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                  Fctura {tipo}
                </button>
              ))}
            </div>
          </div>

          {adminSinSucursal ? (
            <div className="w-full flex items-center justify-center gap-2 bg-amber-100 text-amber-700 font-semibold py-3 rounded-xl text-sm border border-amber-200">
              <Lock size={16} /> Seleccioná una sucursal para vender
            </div>
          ) : (
            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={carrito.length === 0}
              onClick={handleConfirmar}
            >
              Confirmar Venta
            </button>
          )}
        </div>
      </div>

      {ventaConfirmada && (
        <ModalFactura venta={ventaConfirmada} onClose={() => setVentaConfirmada(null)} />
      )}
    </>
  );
}
