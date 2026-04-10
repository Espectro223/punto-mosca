# Punto Mosca — Sistema POS y Gestión de Créditos

> Prototipo funcional de un sistema de **Punto de Venta (POS)** y **Gestión de Créditos a Sola Firma** desarrollado para **Grupo N&N**, construido con React 18, TypeScript y Vite.

---

## 📋 Descripción General

**Punto Mosca** es un prototipo frontend interactivo que simula las reglas de negocio críticas de un sistema comercial completo, incluyendo:

- Gestión de ventas con catálogo de productos y combos.
- Cálculo impositivo multi-alícuota (IVA 21% y 10.5%) con prorrateo correcto de descuentos.
- Flujo de créditos a sola firma con validación de edad y montos límite.
- Control de acceso basado en roles (Admin, Encargado, Vendedor).
- Reportes de bonificaciones y métricas de sucursal.

> ⚠️ Este proyecto opera con **datos mockeados**. No requiere backend real para funcionar.

---

## 🛠️ Stack Tecnológico

| Tecnología | Propósito |
|---|---|
| **React 18 + Vite** | Framework principal y bundler |
| **TypeScript (Strict)** | Tipado fuerte — modelos de dominio UML |
| **Tailwind CSS v4** | Sistema de estilos y diseño |
| **Zustand** | Estado global (carrito, sesión, créditos) |
| **React Router v6** | Navegación y rutas protegidas |
| **Lucide React** | Iconografía |

---

## 🏗️ Arquitectura del Proyecto

```
src/
├── types/
│   └── index.ts              # Interfaces TypeScript del dominio (Fase 1)
├── utils/
│   └── calculations.ts       # Motor de cálculos impositivos (Fase 2)
├── store/
│   └── useStore.ts           # Store global Zustand (Auth + POS + Créditos)
├── layouts/
│   └── MainLayout.tsx        # Layout base con navbar condicional por rol
├── pages/
│   ├── LoginMock.tsx         # Autenticación simulada con selector de rol
│   ├── POS.tsx               # Módulo de Punto de Venta
│   ├── Creditos.tsx          # Módulo de Gestión de Créditos
│   └── Dashboard.tsx         # Reportes y bonificaciones
├── components/
│   └── CarritoSideBar.tsx    # Carrito en tiempo real con desglose impositivo
├── AppRouter.tsx             # Configuración global de rutas
├── App.tsx                   # Entry point del componente raíz
└── index.css                 # Estilos globales (Tailwind v4)
```

---

## ⚙️ Reglas de Negocio Implementadas

### Prorrateo de Descuentos en Combos
El descuento de un combo se aplica **proporcionalmente al precio base de cada producto** que lo integra, **antes** de calcular el IVA de esa línea. Esto garantiza que no se alteren las bases imponibles de manera artificial.

```
Precio con descuento = Precio Base × (1 - %Descuento / 100)
IVA de la línea     = Precio con descuento × (%IVA / 100)
Subtotal neto       = Precio con descuento + IVA de la línea
```

### Multi-Alícuota (IVA por Línea)
Cada producto puede tener su propia alícuota (21% o 10.5%). El IVA se calcula **individualmente por línea de producto**, nunca sobre el subtotal global del ticket.

### Precisión Contable
Todas las operaciones de cálculo aplican redondeo a **exactamente 2 decimales** usando `Math.round((n + Number.EPSILON) * 100) / 100` para eliminar errores de punto flotante en JavaScript.

### Créditos — Validaciones
- El solicitante debe ser **mayor de 18 años**.
- El monto máximo de crédito a sola firma es de **$100,000**.

### Bonificaciones
| Rol | Cálculo del Bono |
|---|---|
| **Vendedor** | 10% del total de ventas propias + 3% del monto total de créditos aprobados |
| **Encargado** | 15% sobre el volumen total de ventas de la sucursal |

---

## 🔐 Control de Acceso por Roles

| Funcionalidad | Vendedor | Encargado | Admin |
|---|:---:|:---:|:---:|
| Acceder al POS | ✅ | ✅ | ✅ |
| Cargar Solicitud de Crédito | ✅ | ✅ | ✅ |
| Aprobar / Rechazar Créditos | ❌ | ✅ | ✅ |
| Ver Reportes Gerenciales | ❌ | ✅ | ✅ |

---

## 🚀 Instalación y Ejecución Local

### Requisitos previos
- **Node.js** v18 o superior
- **npm** v9 o superior

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/<tu-usuario>/punto-mosca.git
cd punto-mosca

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 📦 Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo con HMR
npm run build    # Compila TypeScript y genera el bundle de producción
npm run preview  # Sirve localmente el bundle de producción
npm run lint     # Analiza el código con ESLint
```

---

## 📐 Modelo de Dominio (Tipos TypeScript — Fase 1)

```typescript
// Autenticación
type Rol = 'Admin' | 'Encargado' | 'Vendedor';
interface Usuario { id, nombre, email, rol }

// Productos y combos
type PorcentajeIVA = 21 | 10.5;
interface Producto { id, nombre, precioBase, porcentajeIVA }
interface Combo { id, nombre, productos[], porcentajeDescuento }

// Facturación
type TipoFactura = 'A' | 'B' | 'C';
interface Factura { id, tipo, totalBruto, totalIVA, totalNeto, fecha }

// Créditos
type EstadoSolicitud = 'Pendiente' | 'Aprobado' | 'Rechazado';
interface SolicitudCredito { id, cliente, monto, estado, fecha }
```

---

## 📸 Vistas del Sistema

### Login con Selector de Rol
Pantalla con diseño glassmorphism que permite ingresar al sistema seleccionando el rol a simular.

### Punto de Venta (POS)
Catálogo en grilla de productos y combos con un carrito lateral que muestra en tiempo real el desglose impositivo calculado según las reglas de negocio.

### Gestión de Créditos
Vista dividida: formulario de solicitud (con validación de edad y monto) y tabla de evaluación con acciones de Aprobar / Rechazar para Encargados y Admins.

### Dashboard de Bonificaciones
Tarjetas de KPIs con cálculo automático de bonos por rol, reactivo al estado de los créditos aprobados durante la sesión.

---

## 📁 Contexto del Proyecto

- **Empresa:** Grupo N&N
- **Producto:** Punto Mosca
- **Módulos:** Punto de Venta · Gestión de Créditos · Reportes
- **Asignatura:** Ingeniería de Software II

---

## 📄 Licencia

Este proyecto es un prototipo académico desarrollado con fines educativos.
