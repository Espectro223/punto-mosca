import { useRef } from 'react';
import { X, Printer, Building2 } from 'lucide-react';
import type { Venta } from '../types';

interface Props {
  venta: Venta;
  onClose: () => void;
}

export default function ModalFactura({ venta, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => window.print();

  const fechaFormateada = new Date(venta.fecha).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <>
      {/* Estilos de impresión: solo muestra el recibo, oculta todo lo demás */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #factura-print-area { display: block !important; position: fixed; inset: 0; padding: 24px; background: white; }
          #factura-print-area * { color: black !important; background: white !important; border-color: #999 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm no-print"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header modal */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white no-print shrink-0">
            <span className="font-bold text-lg flex items-center gap-2">
              <Printer size={20} /> Vista Previa de Factura
            </span>
            <button onClick={onClose} className="hover:bg-gray-700 p-1.5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Cuerpo scrollable */}
          <div className="overflow-y-auto flex-1">
            {/* Área que se imprime */}
            <div id="factura-print-area" ref={printRef} className="p-6 font-mono text-sm text-gray-800">
              {/* Encabezado fiscal */}
              <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
                <div className="flex justify-center mb-2">
                  <Building2 size={28} className="text-gray-600" />
                </div>
                <p className="font-bold text-lg uppercase tracking-widest">Punto Mosca</p>
                <p className="text-xs text-gray-500">Grupo N&N — Sistema de Ventas</p>
                <p className="text-xs text-gray-500">CUIT: 30-12345678-9</p>
                <p className="text-xs text-gray-500">Av. Salta 1234, Córdoba</p>
              </div>

              {/* Tipo de factura */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="border-2 border-gray-800 w-14 h-14 flex items-center justify-center text-3xl font-black">
                    {venta.tipoFactura}
                  </div>
                  <p className="text-xs mt-1 text-gray-500">Tipo de Comprobante</p>
                </div>
                <div className="text-right text-xs text-gray-600 space-y-0.5">
                  <p><span className="font-bold">N° Factura:</span> {venta.id.toUpperCase()}</p>
                  <p><span className="font-bold">Fecha:</span> {fechaFormateada}</p>
                  <p><span className="font-bold">Vendedor:</span> {venta.vendedor}</p>
                </div>
              </div>

              {/* Líneas de detalle */}
              <div className="border-t border-b border-dashed border-gray-400 py-3 mb-3">
                <div className="grid grid-cols-12 text-xs font-bold text-gray-500 uppercase mb-2 px-1">
                  <span className="col-span-5">Concepto</span>
                  <span className="col-span-2 text-right">Base</span>
                  <span className="col-span-2 text-right">Desc.</span>
                  <span className="col-span-1 text-right">IVA</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>
                {venta.totales.lineas.map((linea, i) => (
                  <div key={i} className="grid grid-cols-12 text-xs py-1 px-1 odd:bg-gray-50">
                    <span className="col-span-5 truncate">{linea.nombre}</span>
                    <span className="col-span-2 text-right">${linea.precioBaseOriginal.toFixed(2)}</span>
                    <span className="col-span-2 text-right text-gray-500">
                      {linea.descuentoAplicado > 0 ? `-$${linea.descuentoAplicado.toFixed(2)}` : '—'}
                    </span>
                    <span className="col-span-1 text-right text-gray-500">{linea.porcentajeIVA}%</span>
                    <span className="col-span-2 text-right font-semibold">${linea.subtotalNeto.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="space-y-1 px-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal Bruto</span>
                  <span>${venta.totales.totalBruto.toFixed(2)}</span>
                </div>
                {venta.totales.descuentoTotal > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Descuentos</span>
                    <span>-${venta.totales.descuentoTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>IVA (Multi-alícuota)</span>
                  <span>${venta.totales.totalIVA.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-base border-t-2 border-gray-800 pt-2 mt-1">
                  <span>TOTAL</span>
                  <span>${venta.totales.totalNeto.toFixed(2)}</span>
                </div>
              </div>

              {/* Pie del recibo */}
              <div className="text-center mt-6 border-t border-dashed border-gray-400 pt-4 text-xs text-gray-400">
                <p>Este comprobante es válido como factura {venta.tipoFactura}.</p>
                <p className="mt-1">¡Gracias por su compra!</p>
              </div>
            </div>
          </div>

          {/* Botón imprimir */}
          <div className="px-6 py-4 border-t bg-gray-50 no-print shrink-0">
            <button
              onClick={handlePrint}
              className="w-full flex justify-center items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-xl shadow transition-colors"
            >
              <Printer size={18} /> Imprimir Factura
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
