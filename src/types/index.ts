export type Rol = 'Admin' | 'Encargado' | 'Vendedor';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  sucursalId: string | null; // null = Admin con acceso global
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
  encargadoId: string;        // ID del usuario Encargado asignado
  habilitaCreditos: boolean;  // false = módulo de créditos deshabilitado
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
}

export type TipoIVA = 'general' | 'reducido';

export interface Producto {
  id: string;
  nombre: string;
  precioBase: number;
  tipoIVA: TipoIVA;
  categoriaId: string;
}

export interface Combo {
  id: string;
  nombre: string;
  productos: Producto[];
  porcentajeDescuento: number;
}

export type TipoFactura = 'A' | 'B' | 'C';

export interface Factura {
  id: string;
  tipo: TipoFactura;
  totalBruto: number;
  totalIVA: number;
  totalNeto: number;
  fecha: string;
}

// Estados de la Máquina de Estados (FSM) para Solicitudes de Crédito
// Flujo: DRAFT → VALIDATING_PHONE → CHECKING_VERAZ → PENDING_APPROVAL → ACEPTADO|RECHAZADO
export type EstadoCreditoFSM =
  | 'DRAFT'              // Formulario completado, pendiente de envío
  | 'VALIDATING_PHONE'   // Validando número de teléfono (async ~1.5s)
  | 'CHECKING_VERAZ'     // Consultando bureau de crédito Veraz (async ~2s)
  | 'PENDING_APPROVAL'   // Esperando aprobación manual del Encargado/Admin
  | 'AUDIT_REQUIRED'     // Se detectaron banderas rojas, requiere supervisión estricta
  | 'ACEPTADO'           // Crédito aprobado
  | 'RECHAZADO';         // Crédito rechazado (en cualquier etapa)

export type EstadoExcepcionEnum = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';

export type MotivoRechazoFSM = 'PHONE_INVALID' | 'VERAZ_FAILED' | 'MANUAL';

export interface SolicitudCredito {
  id: string;
  cliente: string;
  telefono: string;                    // Requerido para VALIDATING_PHONE
  monto: number;
  estado: EstadoCreditoFSM;
  validacionVeraz?: 'pending' | 'approved' | 'flagged';
  resolucionExcepcion?: EstadoExcepcionEnum;
  motivoRechazo?: MotivoRechazoFSM;   // Solo presente si estado === 'RECHAZADO'
  alertasRiesgo?: string[];           // Banderas de la FSM si proviene de un flujo anómalo
  fecha: string;
  sucursalId: string;
}

export interface CalculoLinea {
  productoId: string;
  nombre: string;
  precioBaseOriginal: number;
  descuentoAplicado: number;
  precioBaseConDescuento: number;
  porcentajeIVA: number; // Porcentaje resuelto en runtime
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

export interface DetalleVenta {
  referenciaId: string;
  tipo: 'producto' | 'combo';
  nombreSnapshot: string;
  precioBaseSnapshot: number;
  porcentajeIVASnapshot: number;
  cantidad: number;
}

export interface Venta {
  id: string;
  fecha: string;
  vendedor: string;
  sucursalId: string; // Sucursal donde se realizó la venta
  detalles: DetalleVenta[]; // Snapshot estático de la venta
  totales: TotalesCarrito;
  tipoFactura: TipoFactura;
}
