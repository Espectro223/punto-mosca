import type { Producto, Combo, CalculoLinea, TotalesCarrito, ElementoCarrito } from '../types';

/**
 * Redondea un número exactamente a 2 decimales
 * usando el método de redondeo estándar para transacciones contables.
 */
export const roundToTwo = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Calcula los importes de un producto individual.
 * Contempla un descuento porcentual opcional que se aplica al precio base (para los combos).
 */
export const calcularItemProducto = (
  producto: Producto,
  porcentajeDescuento: number = 0
): CalculoLinea => {
  // 1. Calcular el monto de descuento sobre el precio base
  const descuentoAplicado = roundToTwo(producto.precioBase * (porcentajeDescuento / 100));
  
  // 2. Aplicar descuento al precio base (Regla de Prorrateo: antes del IVA)
  const precioBaseConDescuento = roundToTwo(producto.precioBase - descuentoAplicado);
  
  // 3. Calcular el IVA sobre el nuevo precio base (Regla de Multi-alícuota: a nivel línea)
  const montoIVA = roundToTwo(precioBaseConDescuento * (producto.porcentajeIVA / 100));
  
  // 4. Sumar ambos para el subtotal neto de este producto
  const subtotalNeto = roundToTwo(precioBaseConDescuento + montoIVA);

  return {
    productoId: producto.id,
    nombre: producto.nombre,
    precioBaseOriginal: producto.precioBase,
    descuentoAplicado,
    precioBaseConDescuento,
    porcentajeIVA: producto.porcentajeIVA,
    montoIVA,
    subtotalNeto
  };
};

/**
 * Calcula los importes de un combo aplicando la regla de prorrateo.
 * El descuento del combo se aplica proporcionalmente a cada uno de sus 
 * productos internos de forma exacta, ANTES de aplicarles su propio IVA.
 */
export const calcularItemCombo = (combo: Combo): CalculoLinea[] => {
  return combo.productos.map(producto => 
    calcularItemProducto(producto, combo.porcentajeDescuento)
  );
};

/**
 * Toma los elementos del carrito y genera el desglose de totales 
 * sumando de manera estricta los subtotales calculados de cada línea.
 */
export const calcularTotalCarrito = (elementos: ElementoCarrito[]): TotalesCarrito => {
  const lineas: CalculoLinea[] = [];

  // Aplanar el carrito para que los combos se traten como múltiples líneas de producto
  elementos.forEach(elemento => {
    for (let i = 0; i < elemento.cantidad; i++) {
        if (elemento.type === 'producto') {
            lineas.push(calcularItemProducto(elemento.item));
        } else if (elemento.type === 'combo') {
            lineas.push(...calcularItemCombo(elemento.item));
        }
    }
  });

  // Agrupar los totales forzando el redondeo a 2 decimales para evitar basura flotante (ej: 0.1 + 0.2 = 0.30000000000000004)
  const descuentoTotal = roundToTwo(lineas.reduce((acc, curr) => acc + curr.descuentoAplicado, 0));
  const totalBruto = roundToTwo(lineas.reduce((acc, curr) => acc + curr.precioBaseConDescuento, 0));
  const totalIVA = roundToTwo(lineas.reduce((acc, curr) => acc + curr.montoIVA, 0));
  const totalNeto = roundToTwo(lineas.reduce((acc, curr) => acc + curr.subtotalNeto, 0));

  return {
    totalBruto,
    descuentoTotal,
    totalIVA,
    totalNeto,
    lineas
  };
};
