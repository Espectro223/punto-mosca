export type Rol = 'Admin' | 'Encargado' | 'Vendedor';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface Organizacion {
  cuit: string;
  nombre: string;
  logo: string;
}

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  encargado: string; // Referencia al ID del Usuario encargado
}

export type PorcentajeIVA = 21 | 10.5;

export interface Producto {
  id: string;
  nombre: string;
  precioBase: number;
  porcentajeIVA: PorcentajeIVA;
}

export interface Combo {
  id: string;
  nombre: string;
  productos: Producto[]; // Lista de productos incluidos en el combo
  porcentajeDescuento: number; // Porcentaje de descuento entero, ej. 10 para 10%
}

export type TipoFactura = 'A' | 'B' | 'C';

export interface Factura {
  id: string;
  tipo: TipoFactura;
  totalBruto: number;
  totalIVA: number;
  totalNeto: number;
  fecha: string; // ISO date string
}

export type EstadoSolicitud = 'Pendiente' | 'Aprobado' | 'Rechazado';

export interface SolicitudCredito {
  id: string;
  cliente: string; 
  monto: number;
  estado: EstadoSolicitud;
  fecha: string; // ISO date string
}

export interface CalculoLinea {
  productoId: string;
  nombre: string;
  precioBaseOriginal: number;
  descuentoAplicado: number;
  precioBaseConDescuento: number;
  porcentajeIVA: PorcentajeIVA;
  montoIVA: number;
  subtotalNeto: number;
}

export interface TotalesCarrito {
  totalBruto: number;
  descuentoTotal: number;
  totalIVA: number;
  totalNeto: number;
  lineas: CalculoLinea[];
}

export type ElementoCarrito = 
  | { type: 'producto'; item: Producto; cantidad: number }
  | { type: 'combo'; item: Combo; cantidad: number };
