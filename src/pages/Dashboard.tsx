import { useStore } from '../store/useStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Award, DollarSign, ShoppingBag, CreditCard, Building2 } from 'lucide-react';

const COLORS_PIE = ['#6366f1', '#a78bfa', '#c4b5fd'];
const COLORS_CREDITOS = ['#fbbf24', '#34d399', '#f87171'];

export default function Dashboard() {
  const usuario = useStore(state => state.usuarioActual);
  const sucursales = useStore(state => state.sucursales);
  const sucursalActivaId = useStore(state => state.sucursalActivaId);
  const todasVentas = useStore(state => state.ventas);
  const todasSolicitudes = useStore(state => state.solicitudesCredito);

  // Filtrar por sucursal activa
  const ventas = sucursalActivaId
    ? todasVentas.filter(v => v.sucursalId === sucursalActivaId)
    : todasVentas;
  const solicitudes = sucursalActivaId
    ? todasSolicitudes.filter(s => s.sucursalId === sucursalActivaId)
    : todasSolicitudes;

  const sucursalActiva = sucursales.find(s => s.id === sucursalActivaId) ?? null;
  const esAdmin = usuario?.rol === 'Admin';
  const viendoTodas = esAdmin && !sucursalActivaId;

  // ── KPIs generales ─────────────────────────────────────────────────
  const totalVentasSucursal = ventas.reduce((acc, v) => acc + v.totales.totalNeto, 0);
  const ventasDelVendedor = ventas.filter(v => v.vendedor === usuario?.nombre);
  const totalVentasVendedor = ventasDelVendedor.reduce((acc, v) => acc + v.totales.totalNeto, 0);
  const creditosAprobados = solicitudes.filter(s => s.estado === 'ACEPTADO');
  const montoCreditosAprobados = creditosAprobados.reduce((acc, c) => acc + c.monto, 0);

  const bonoVendedor = totalVentasVendedor * 0.10 + montoCreditosAprobados * 0.03;
  const bonoEncargado = totalVentasSucursal * 0.15;

  // ── Datos para gráficos ────────────────────────────────────────────

  // 1. Ventas por día (últimos 7 días)
  const ventasPorDia = Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(Date.now() - (6 - i) * 86400000);
    const label = fecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' });
    const total = ventas
      .filter(v => new Date(v.fecha).toDateString() === fecha.toDateString())
      .reduce((acc, v) => acc + v.totales.totalNeto, 0);
    return { dia: label, ventas: parseFloat(total.toFixed(2)) };
  });

  // 2. Distribución IVA (21% vs 10.5%)
  const ivaData = ventas.reduce(
    (acc, v) => {
      v.totales.lineas.forEach(l => {
        if (l.porcentajeIVA === 21) acc[0].valor += l.montoIVA;
        else acc[1].valor += l.montoIVA;
      });
      return acc;
    },
    [{ name: 'IVA 21%', valor: 0 }, { name: 'IVA 10.5%', valor: 0 }]
  ).map(d => ({ ...d, valor: parseFloat(d.valor.toFixed(2)) }));

  // 3. Top 5 productos
  const conteoProductos: Record<string, number> = {};
  ventas.forEach(v =>
    v.detalles.forEach(d => {
      const nombre = d.nombreSnapshot;
      conteoProductos[nombre] = (conteoProductos[nombre] || 0) + d.cantidad;
    })
  );
  const topProductos = Object.entries(conteoProductos)
    .map(([nombre, unidades]) => ({ nombre, unidades }))
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 5);

  // 4. Estado de créditos
  const creditosData = [
    { name: 'En Proceso', valor: solicitudes.filter(s => ['DRAFT', 'VALIDATING_PHONE', 'CHECKING_VERAZ', 'PENDING_APPROVAL'].includes(s.estado)).length },
    { name: 'Aprobado',  valor: solicitudes.filter(s => s.estado === 'ACEPTADO').length },
    { name: 'Rechazado', valor: solicitudes.filter(s => s.estado === 'RECHAZADO').length },
  ].filter(d => d.valor > 0);

  // ── Vista del VENDEDOR ─────────────────────────────────────────────
  if (usuario?.rol === 'Vendedor') {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <Award className="text-indigo-600" size={32} /> Mis Bonificaciones
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<ShoppingBag className="text-indigo-600 h-7 w-7" />} label="Mis Ventas" value={`$${totalVentasVendedor.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} sub="10% de comisión base" color="indigo" />
          <StatCard icon={<CreditCard className="text-purple-600 h-7 w-7" />} label="Créditos Aprobados" value={`${creditosAprobados.length} clientes`} sub={`Monto: $${montoCreditosAprobados.toLocaleString()}`} color="purple" />
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl shadow text-white flex flex-col justify-between">
            <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium mb-2"><DollarSign size={18} /> Bono Generado</div>
            <div className="text-4xl font-black">${bonoVendedor.toFixed(2)}</div>
            <span className="text-xs text-indigo-200 mt-2 bg-white/20 inline-block px-2 py-1 rounded">Listo para cobro</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border p-6">
          <h2 className="font-bold text-gray-700 mb-4">Mis ventas — últimos 7 días</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ventasPorDia.map(d => ({
              ...d,
              ventas: ventasDelVendedor
                .filter(v => new Date(v.fecha).toDateString() === new Date(Date.now() - (6 - ventasPorDia.indexOf(d)) * 86400000).toDateString())
                .reduce((acc, v) => acc + v.totales.totalNeto, 0)
            }))} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Ventas']} />
              <Bar dataKey="ventas" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // ── Vista ADMIN / ENCARGADO ────────────────────────────────────────
  const tituloContexto = viendoTodas
    ? 'Todas las Sucursales'
    : sucursalActiva?.nombre ?? 'Sucursal';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <BarChart3 className="text-indigo-600" size={32} /> {tituloContexto}
        </h1>
        {viendoTodas && (
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200">
            <Building2 size={13} /> Vista global — todas las sucursales
          </span>
        )}
      </div>

      {/* Tabla comparativa entre sucursales (solo Admin en modo Todas) */}
      {viendoTodas && (
        <div className="bg-white rounded-2xl shadow border p-6">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Building2 size={18} className="text-indigo-500" /> Comparación por Sucursal</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                <th className="pb-2 text-left">Sucursal</th>
                <th className="pb-2 text-right">Ventas (Neto)</th>
                <th className="pb-2 text-right">Facturas</th>
                <th className="pb-2 text-right">Créditos</th>
                <th className="pb-2 text-right">Créditos $</th>
                <th className="pb-2 text-center">Módulo Créditos</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sucursales.map(s => {
                const vs = todasVentas.filter(v => v.sucursalId === s.id);
                const ss = todasSolicitudes.filter(c => c.sucursalId === s.id);
                const aprobados = ss.filter(c => c.estado === 'ACEPTADO');
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-gray-800">{s.nombre}</td>
                    <td className="py-3 text-right font-bold text-indigo-700">${vs.reduce((a, v) => a + v.totales.totalNeto, 0).toFixed(2)}</td>
                    <td className="py-3 text-right text-gray-600">{vs.length}</td>
                    <td className="py-3 text-right text-gray-600">{ss.length}</td>
                    <td className="py-3 text-right text-gray-600">${aprobados.reduce((a, c) => a + c.monto, 0).toFixed(2)}</td>
                    <td className="py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        s.habilitaCreditos ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>{s.habilitaCreditos ? 'Habilitado' : 'No habilitado'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<TrendingUp className="text-indigo-600 h-7 w-7" />} label="Volumen Sucursal" value={`$${totalVentasSucursal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} sub={`${ventas.length} facturas emitidas`} color="indigo" />
        <StatCard icon={<CreditCard className="text-purple-600 h-7 w-7" />} label="Créditos Aprobados" value={`$${montoCreditosAprobados.toLocaleString()}`} sub={`${creditosAprobados.length} solicitudes`} color="purple" />
        <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-6 rounded-2xl shadow-xl text-white flex flex-col justify-between">
          <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium mb-2"><Award size={18} /> Bono Gerencial (15%)</div>
          <div className="text-4xl font-black">${bonoEncargado.toFixed(2)}</div>
          <span className="text-xs text-indigo-200 mt-2 bg-white/20 inline-block px-2 py-1 rounded">Sobre ventas de sucursal</span>
        </div>
      </div>

      {/* Gráficos fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ventas por día */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow border p-6">
          <h2 className="font-bold text-gray-700 mb-4">Ventas diarias — últimos 7 días</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ventasPorDia} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Neto']} />
              <Bar dataKey="ventas" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución IVA */}
        <div className="bg-white rounded-2xl shadow border p-6 flex flex-col">
          <h2 className="font-bold text-gray-700 mb-4">Distribución IVA Cobrado</h2>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={ivaData} dataKey="valor" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {ivaData.map((_, i) => <Cell key={i} fill={COLORS_PIE[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráficos fila 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top productos */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow border p-6">
          <h2 className="font-bold text-gray-700 mb-4">Top 5 Productos más Vendidos</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProductos} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={110} />
              <Tooltip formatter={(v) => [`${Number(v)} u.`, 'Unidades']} />
              <Bar dataKey="unidades" fill="#a78bfa" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estado créditos */}
        <div className="bg-white rounded-2xl shadow border p-6 flex flex-col">
          <h2 className="font-bold text-gray-700 mb-4">Estado de Créditos</h2>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={creditosData} dataKey="valor" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                  {creditosData.map((_, i) => <Cell key={i} fill={COLORS_CREDITOS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente auxiliar de tarjeta KPI ────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow border-t-4 border-${color}-500 flex items-center justify-between`}>
      <div>
        <h3 className="text-gray-500 text-sm font-semibold mb-1">{label}</h3>
        <div className="text-3xl font-black text-gray-900">{value}</div>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
      <div className={`bg-${color}-50 p-3 rounded-full`}>{icon}</div>
    </div>
  );
}
