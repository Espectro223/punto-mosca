import { create } from 'zustand';
import type {
  Usuario,
  Sucursal,
  ElementoCarrito,
  SolicitudCredito,
  Producto,
  Combo,
  EstadoCreditoFSM,
  MotivoRechazoFSM,
  Venta,
  TipoFactura,
  DetalleVenta,
  Categoria,
} from '../types';
import { useConfigStore } from './useConfigStore';
import { calcularTotalCarrito } from '../utils/calculations';
import { validarTelefonoMock, consultarVerazMock } from '../services/mockApis';

// ─── Credenciales mockeadas ──────────────────────────────────────────────────
interface UsuarioCredencial extends Usuario {
  password: string;
}

const MOCK_SUCURSALES: Sucursal[] = [
  { id: 's1', nombre: 'Sucursal Centro', direccion: 'Av. Colón 1234, Córdoba',          encargadoId: 'u2', habilitaCreditos: true  },
  { id: 's2', nombre: 'Sucursal Norte',  direccion: 'Av. Vélez Sársfield 987, Córdoba', encargadoId: 'u5', habilitaCreditos: false },
];

const MOCK_USUARIOS: UsuarioCredencial[] = [
  { id: 'u1', nombre: 'Juana.R',   email: 'Juana.R@puntomosca.com',   rol: 'Admin',     sucursalId: null, password: 'admin123'      },
  { id: 'u2', nombre: 'Facu.GG',   email: 'Facu.GG@puntomosca.com',   rol: 'Encargado', sucursalId: 's1', password: 'encargado123'  },
  { id: 'u3', nombre: 'Edgar.K',   email: 'Edgar.K@puntomosca.com',    rol: 'Vendedor',  sucursalId: 's1', password: 'vendedor123'   },
  { id: 'u4', nombre: 'Luca.V',    email: 'Luca.V@puntomosca.com',     rol: 'Vendedor',  sucursalId: 's1', password: 'vendedor456'   },
  { id: 'u5', nombre: 'Carlos.M',  email: 'Carlos.M@puntomosca.com',   rol: 'Encargado', sucursalId: 's2', password: 'encargado456'  },
  { id: 'u6', nombre: 'Maria.P',   email: 'Maria.P@puntomosca.com',    rol: 'Vendedor',  sucursalId: 's2', password: 'vendedor789'   },
];

// ─── Store ───────────────────────────────────────────────────────────────────
interface StoreState {
  // Auth
  usuarioActual: Usuario | null;
  loginError: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Sucursales
  sucursales: Sucursal[];
  sucursalActivaId: string | null; // null = Admin viendo "todas"
  setSucursalActiva: (id: string | null) => void;

  // POS
  carrito: ElementoCarrito[];
  agregarAlCarrito: (elemento: ElementoCarrito) => void;
  limpiarCarrito: () => void;
  // Catálogo: Productos y Categorías
  productosMock: Producto[];
  categoriasMock: Categoria[];
  combosMock: Combo[];

  agregarProducto: (producto: Omit<Producto, 'id'>) => void;
  editarProducto: (id: string, producto: Omit<Producto, 'id'>) => void;
  eliminarProducto: (id: string) => void;

  agregarCategoria: (categoria: Omit<Categoria, 'id'>) => void;
  editarCategoria: (id: string, categoria: Omit<Categoria, 'id'>) => void;
  eliminarCategoria: (id: string) => void;

  // Ventas / Facturas
  ventas: Venta[];
  confirmarVenta: (tipoFactura: TipoFactura) => Venta | null;

  // Créditos
  solicitudesCredito: SolicitudCredito[];
  iniciarSolicitudCredito: (draft: Omit<SolicitudCredito, 'id' | 'estado' | 'fecha' | 'sucursalId' | 'motivoRechazo'>) => void;
  actualizarEstadoSolicitud: (id: string, estado: EstadoCreditoFSM, motivoRechazo?: MotivoRechazoFSM) => void;
  solicitarExcepcion: (id: string) => void;
  resolverExcepcion: (id: string, resultado: 'ACEPTADO' | 'RECHAZADO') => void;
}

// ─── Datos mockeados ─────────────────────────────────────────────────────────

const MOCK_CATEGORIAS: Categoria[] = [
  { id: 'cat1', nombre: 'Smartphones', descripcion: 'Teléfonos inteligentes y accesorios' },
  { id: 'cat2', nombre: 'Wearables', descripcion: 'Relojes y bandas inteligentes' },
  { id: 'cat3', nombre: 'Audio', descripcion: 'Auriculares y parlantes' },
];

const MOCK_PRODUCTOS: Producto[] = [
  { id: 'p1', nombre: 'Smartphone XYZ', precioBase: 500, tipoIVA: 'general', categoriaId: 'cat1' },
  { id: 'p2', nombre: 'Smartwatch Lite', precioBase: 150, tipoIVA: 'reducido', categoriaId: 'cat2' },
  { id: 'p3', nombre: 'Auriculares Pro', precioBase: 80,  tipoIVA: 'general', categoriaId: 'cat3' },
];

const MOCK_COMBOS: Combo[] = [
  { id: 'c1', nombre: 'Combo Tech Básico', productos: [MOCK_PRODUCTOS[0], MOCK_PRODUCTOS[2]], porcentajeDescuento: 10 },
];

// Utilidad para extraer los snapshots inmutables definidos en RNF04
const mapearADetalleVenta = (elementos: ElementoCarrito[]): DetalleVenta[] => {
  return elementos.map(e => {
    if (e.type === 'producto') {
      const iva = useConfigStore.getState().taxes[e.item.tipoIVA];
      return {
        referenciaId: e.item.id,
        tipo: 'producto',
        nombreSnapshot: e.item.nombre,
        precioBaseSnapshot: e.item.precioBase,
        porcentajeIVASnapshot: iva,
        cantidad: e.cantidad,
      };
    } else {
      const pBase = e.item.productos.reduce((acc, p) => acc + p.precioBase, 0);
      return {
        referenciaId: e.item.id,
        tipo: 'combo',
        nombreSnapshot: e.item.nombre,
        precioBaseSnapshot: pBase,
        porcentajeIVASnapshot: 21, // IVA estandar referencial para combo mix
        cantidad: e.cantidad,
      };
    }
  });
};

// Genera ventas de los últimos 7 días distribuidas entre sucursales
const generarVentasMock = (): Venta[] => {
  const config: { sucursalId: string; vendedores: string[] }[] = [
    { sucursalId: 's1', vendedores: ['Edgar.K', 'Luca.V',  'Facu.GG'] },
    { sucursalId: 's2', vendedores: ['Maria.P', 'Carlos.M'] },
  ];
  const tipos: TipoFactura[] = ['A', 'B', 'C'];
  const ventas: Venta[] = [];

  config.forEach(({ sucursalId, vendedores }) => {
    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const cantidadVentas = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < cantidadVentas; i++) {
        const producto = MOCK_PRODUCTOS[Math.floor(Math.random() * MOCK_PRODUCTOS.length)];
        const cantidad = Math.floor(Math.random() * 3) + 1;
        const elementos: ElementoCarrito[] = [{ type: 'producto', item: producto, cantidad }];
        const fecha = new Date(Date.now() - daysAgo * 86400000 - i * 3600000).toISOString();
        ventas.push({
          id: `v-${sucursalId}-${daysAgo}-${i}`,
          fecha,
          vendedor: vendedores[Math.floor(Math.random() * vendedores.length)],
          sucursalId,
          detalles: mapearADetalleVenta(elementos),
          totales: calcularTotalCarrito(elementos),
          tipoFactura: tipos[Math.floor(Math.random() * tipos.length)],
        });
      }
    }
  });
  return ventas;
};

// ─── Store Zustand ───────────────────────────────────────────────────────────
export const useStore = create<StoreState>((set, get) => ({
  // Auth
  usuarioActual: null,
  loginError: null,
  login: (email, password) => {
    const usuario = MOCK_USUARIOS.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (usuario) {
      const { password: _pwd, ...usuarioSinPassword } = usuario;
      set({
        usuarioActual: usuarioSinPassword,
        loginError: null,
        // Admin arranca viendo "todas" (null), los demás fijados a su sucursal
        sucursalActivaId: usuarioSinPassword.sucursalId,
      });
      return true;
    }
    set({ loginError: 'Credenciales inválidas. Verificá tu email y contraseña.' });
    return false;
  },
  logout: () => set({ usuarioActual: null, loginError: null, sucursalActivaId: null, carrito: [] }),

  // Sucursales
  sucursales: MOCK_SUCURSALES,
  sucursalActivaId: null,
  setSucursalActiva: (id) => set({ sucursalActivaId: id }),

  // POS
  carrito: [],
  agregarAlCarrito: (elemento) => set((state) => {
    const idx = state.carrito.findIndex(e => e.item.id === elemento.item.id && e.type === elemento.type);
    if (idx >= 0) {
      const nuevoCarrito = [...state.carrito];
      nuevoCarrito[idx].cantidad += elemento.cantidad;
      return { carrito: nuevoCarrito };
    }
    return { carrito: [...state.carrito, elemento] };
  }),
  limpiarCarrito: () => set({ carrito: [] }),
  agregarProducto: (producto) => set((state) => ({
    productosMock: [...state.productosMock, { id: `p${Date.now()}`, ...producto }],
  })),
  editarProducto: (id, producto) => set((state) => ({
    productosMock: state.productosMock.map(p => p.id === id ? { ...p, ...producto } : p),
  })),
  eliminarProducto: (id) => set((state) => ({
    productosMock: state.productosMock.filter(p => p.id !== id),
  })),

  agregarCategoria: (categoria) => set((state) => ({
    categoriasMock: [...state.categoriasMock, { id: `cat${Date.now()}`, ...categoria }],
  })),
  editarCategoria: (id, categoria) => set((state) => ({
    categoriasMock: state.categoriasMock.map(c => c.id === id ? { ...c, ...categoria } : c),
  })),
  eliminarCategoria: (id) => set((state) => ({
    categoriasMock: state.categoriasMock.filter(c => c.id !== id),
  })),

  // Ventas
  ventas: generarVentasMock(),
  confirmarVenta: (tipoFactura) => {
    const { carrito, usuarioActual, sucursalActivaId } = get();
    if (carrito.length === 0 || !usuarioActual || !sucursalActivaId) return null;

    const totales = calcularTotalCarrito(carrito);
    const nuevaVenta: Venta = {
      id: `v-${Date.now()}`,
      fecha: new Date().toISOString(),
      vendedor: usuarioActual.nombre,
      sucursalId: sucursalActivaId,
      detalles: mapearADetalleVenta(carrito),
      totales,
      tipoFactura,
    };
    set((state) => ({ ventas: [...state.ventas, nuevaVenta], carrito: [] }));
    return nuevaVenta;
  },

  // Créditos
  solicitudesCredito: [
    { id: 'sc1', cliente: 'Juan Perez', telefono: '3511234567', monto: 1500, estado: 'PENDING_APPROVAL', validacionVeraz: 'approved', fecha: new Date().toISOString(),                        sucursalId: 's1' },
    { id: 'sc2', cliente: 'Maria Gomez', telefono: '3511112222', monto: 300,  estado: 'ACEPTADO', validacionVeraz: 'approved',  fecha: new Date(Date.now() - 86400000).toISOString(),   sucursalId: 's1' },
    { id: 'sc3', cliente: 'Luis Torres', telefono: '1154321111', monto: 800,  estado: 'PENDING_APPROVAL', validacionVeraz: 'approved', fecha: new Date(Date.now() - 2 * 86400000).toISOString(), sucursalId: 's1' },
    { id: 'sc4', cliente: 'Carlos Audit', telefono: '3512223333', monto: 600000, estado: 'AUDIT_REQUIRED', validacionVeraz: 'flagged', resolucionExcepcion: 'PENDIENTE', alertasRiesgo: ['Monto excede umbral de seguridad ($500,000)'], fecha: new Date(Date.now() - 3600000).toISOString(), sucursalId: 's1' },
  ],
  iniciarSolicitudCredito: async (draft) => {
    const nuevaSolicitud: SolicitudCredito = {
      id: `sc-${Date.now()}`,
      ...draft,
      estado: 'VALIDATING_PHONE',
      fecha: new Date().toISOString(),
      sucursalId: get().sucursalActivaId ?? 's1',
    };

    // Añadir borrador
    set((state) => ({ solicitudesCredito: [nuevaSolicitud, ...state.solicitudesCredito] }));

    // FASE 1: Validación Telefónica
    const phoneValid = await validarTelefonoMock(draft.telefono);
    if (!phoneValid) {
      get().actualizarEstadoSolicitud(nuevaSolicitud.id, 'RECHAZADO', 'PHONE_INVALID');
      return;
    }

    // Avanzar a FASE 2
    get().actualizarEstadoSolicitud(nuevaSolicitud.id, 'CHECKING_VERAZ');
    set(state => ({ solicitudesCredito: state.solicitudesCredito.map(s => s.id === nuevaSolicitud.id ? { ...s, validacionVeraz: 'pending' } : s) }));

    const veraz = await consultarVerazMock(draft.cliente, draft.monto);

    if (veraz.estado === 'Rechazado') {
      set((state) => ({
        solicitudesCredito: state.solicitudesCredito.map(s => 
          s.id === nuevaSolicitud.id ? { ...s, estado: 'RECHAZADO', motivoRechazo: 'VERAZ_FAILED', validacionVeraz: 'flagged', alertasRiesgo: veraz.banderas } : s
        ),
      }));
      return;
    }

    if (veraz.estado === 'Auditoria') {
      set((state) => ({
        solicitudesCredito: state.solicitudesCredito.map(s => 
          s.id === nuevaSolicitud.id ? { ...s, estado: 'AUDIT_REQUIRED', validacionVeraz: 'flagged', resolucionExcepcion: 'PENDIENTE', alertasRiesgo: veraz.banderas } : s
        ),
      }));
      return;
    }

    // Avanzar a FASE 3 (Pendiente de aprobación manual, flujo limpio)
    set(state => ({ solicitudesCredito: state.solicitudesCredito.map(s => s.id === nuevaSolicitud.id ? { ...s, validacionVeraz: 'approved' } : s) }));
    get().actualizarEstadoSolicitud(nuevaSolicitud.id, 'PENDING_APPROVAL');
  },
  actualizarEstadoSolicitud: (id, estado, motivoRechazo) => set((state) => ({
    solicitudesCredito: state.solicitudesCredito.map(s => {
      if (s.id === id) {
        // Enlazar la resolución de la excepción con el estado de la FSM global para mantener coherencia
        let resolucion = s.resolucionExcepcion;
        if (s.estado === 'AUDIT_REQUIRED' && estado === 'ACEPTADO') resolucion = 'ACEPTADO';
        if (s.estado === 'AUDIT_REQUIRED' && estado === 'RECHAZADO') resolucion = 'RECHAZADO';

        return { ...s, estado, motivoRechazo, resolucionExcepcion: resolucion };
      }
      return s;
    }),
  })),
  solicitarExcepcion: (id) => set((state) => ({
    solicitudesCredito: state.solicitudesCredito.map(s =>
      s.id === id && s.estado === 'RECHAZADO' ? { ...s, resolucionExcepcion: 'PENDIENTE' } : s
    ),
  })),
  resolverExcepcion: (id, resultado) => set((state) => ({
    solicitudesCredito: state.solicitudesCredito.map(s => {
      if (s.id === id) {
        if (resultado === 'ACEPTADO') {
          return { ...s, resolucionExcepcion: 'ACEPTADO', estado: 'ACEPTADO' };
        } else {
          return { ...s, resolucionExcepcion: 'RECHAZADO' }; // Permanece RECHAZADO de base
        }
      }
      return s;
    }),
  })),

  productosMock: MOCK_PRODUCTOS,
  categoriasMock: MOCK_CATEGORIAS,
  combosMock: MOCK_COMBOS,
}));
