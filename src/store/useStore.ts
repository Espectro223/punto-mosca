import { create } from 'zustand';
import type { 
  Usuario, 
  ElementoCarrito, 
  SolicitudCredito,
  Producto,
  Combo,
  EstadoSolicitud
} from '../types';

// Usuarios mockeados con credenciales (en producción esto vendría del backend)
interface UsuarioCredencial extends Usuario {
  password: string;
}

const MOCK_USUARIOS: UsuarioCredencial[] = [
  { id: 'u1', nombre: 'Juana.R', email: 'Juana.R@puntomosca.com', rol: 'Admin',      password: 'admin123' },
  { id: 'u2', nombre: 'Facu.GG',        email: 'Facu.GG@puntomosca.com', rol: 'Encargado', password: 'encargado123' },
  { id: 'u3', nombre: 'Edgar.K',           email: 'Edgar.K@puntomosca.com',    rol: 'Vendedor',  password: 'vendedor123' },
];

interface StoreState {
  // Auth
  usuarioActual: Usuario | null;
  loginError: string | null;
  login: (email: string, password: string) => boolean;
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
  loginError: null,
  login: (email, password) => {
    const usuario = MOCK_USUARIOS.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (usuario) {
      const { password: _pwd, ...usuarioSinPassword } = usuario;
      set({ usuarioActual: usuarioSinPassword, loginError: null });
      return true;
    }
    set({ loginError: 'Credenciales inválidas. Verificá tu email y contraseña.' });
    return false;
  },
  logout: () => set({ usuarioActual: null, loginError: null }),

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
