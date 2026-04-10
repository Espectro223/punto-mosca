import { create } from 'zustand';
import type { 
  Usuario, 
  ElementoCarrito, 
  SolicitudCredito,
  Rol,
  Producto,
  Combo,
  EstadoSolicitud
} from '../types';

interface StoreState {
  // Auth
  usuarioActual: Usuario | null;
  login: (rol: Rol) => void;
  logout: () => void;

  // POS
  carrito: ElementoCarrito[];
  agregarAlCarrito: (elemento: ElementoCarrito) => void;
  limpiarCarrito: () => void;

  // Créditos
  solicitudesCredito: SolicitudCredito[];
  agregarSolicitud: (solicitud: Omit<SolicitudCredito, 'id' | 'estado' | 'fecha'>) => void;
  actualizarEstadoSolicitud: (id: string, estado: EstadoSolicitud) => void;

  // Mocks Globales (Solo para prototipo - reemplazará un fetching al backend)
  productosMock: Producto[];
  combosMock: Combo[];
}

// Datos Mockeados
const MOCK_PRODUCTOS: Producto[] = [
  { id: 'p1', nombre: 'Smartphone XYZ', precioBase: 500, porcentajeIVA: 21 },
  { id: 'p2', nombre: 'Smartwatch Lite', precioBase: 150, porcentajeIVA: 10.5 },
  { id: 'p3', nombre: 'Auriculares Pro', precioBase: 80, porcentajeIVA: 21 },
];

const MOCK_COMBOS: Combo[] = [
  { 
    id: 'c1', 
    nombre: 'Combo Tech Básico', 
    productos: [MOCK_PRODUCTOS[0], MOCK_PRODUCTOS[2]], 
    porcentajeDescuento: 10 
  }
];

export const useStore = create<StoreState>((set) => ({
  // Auth
  usuarioActual: null,
  login: (rol) => {
    const usuariosPorRol: Record<Rol, Usuario> = {
      Admin: { id: 'u1', nombre: 'Administrador Principal', email: 'admin@puntomosca.com', rol: 'Admin' },
      Encargado: { id: 'u2', nombre: 'Carlos Encargado', email: 'carlos@puntomosca.com', rol: 'Encargado' },
      Vendedor: { id: 'u3', nombre: 'Ana Vendedora', email: 'ana@puntomosca.com', rol: 'Vendedor' }
    };
    set({ usuarioActual: usuariosPorRol[rol] });
  },
  logout: () => set({ usuarioActual: null }),

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

  // Créditos
  solicitudesCredito: [
    { id: 'sc1', cliente: 'Juan Perez', monto: 1500, estado: 'Pendiente', fecha: new Date().toISOString() },
    { id: 'sc2', cliente: 'Maria Gomez', monto: 300, estado: 'Aprobado', fecha: new Date(Date.now() - 86400000).toISOString() }
  ],
  agregarSolicitud: (solicitud) => set((state) => ({
    solicitudesCredito: [
      ...state.solicitudesCredito,
      {
        id: `sc${Math.random().toString(36).substr(2, 9)}`,
        ...solicitud,
        estado: 'Pendiente',
        fecha: new Date().toISOString()
      }
    ]
  })),
  actualizarEstadoSolicitud: (id, estado) => set((state) => ({
    solicitudesCredito: state.solicitudesCredito.map(s => 
      s.id === id ? { ...s, estado } : s
    )
  })),

  productosMock: MOCK_PRODUCTOS,
  combosMock: MOCK_COMBOS
}));
