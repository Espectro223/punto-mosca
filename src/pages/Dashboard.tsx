
import { useStore } from '../store/useStore';
import { BarChart3, TrendingUp, Award, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const usuario = useStore(state => state.usuarioActual);
  const solicitudes = useStore(state => state.solicitudesCredito);

  // KPIs Simulados para el prototipo
  const metricasSimuladas = {
    ventasTotalesSucursal: 154200.50,
    ventasPropiasVendedor: 85000.00,
  };

  // Cálculos Condicionales por Rol
  const creditosAprobadosVendedor = solicitudes.filter(s => s.estado === 'Aprobado').length;
  
  // Regla: Bono Vendedor = 10% ventas propias + 3% de monto de creditos aprobados
  const montoCreditosAprobados = solicitudes.filter(s => s.estado === 'Aprobado').reduce((acc, curr) => acc + curr.monto, 0);
  const bonoVendedor = (metricasSimuladas.ventasPropiasVendedor * 0.10) + (montoCreditosAprobados * 0.03);

  // Regla: Bono Encargado = 15% sobre total sucursal
  const bonoEncargado = metricasSimuladas.ventasTotalesSucursal * 0.15;

  if (usuario?.rol === 'Vendedor') {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <Award className="text-indigo-600" size={32} /> Reporte de Bonificaciones (Vendedor)
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow border-t-4 border-indigo-500">
            <h3 className="text-gray-500 font-medium mb-1">Ventas Personales</h3>
            <div className="text-3xl font-black text-gray-800">${metricasSimuladas.ventasPropiasVendedor.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-2">10% de comisión base</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow border-t-4 border-purple-500">
            <h3 className="text-gray-500 font-medium mb-1">Créditos Aprobados</h3>
            <div className="text-3xl font-black text-gray-800">{creditosAprobadosVendedor} <span className="text-lg text-gray-400">clientes</span></div>
            <p className="text-xs text-gray-400 mt-2">Monto total colocado: ${montoCreditosAprobados.toLocaleString()}</p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl shadow text-white transform hover:scale-105 transition-transform">
            <h3 className="text-indigo-100 font-medium mb-1 flex items-center gap-2"><DollarSign size={18} /> Bono Generado</h3>
            <div className="text-4xl font-black">${bonoVendedor.toLocaleString()}</div>
            <p className="text-xs text-indigo-200 mt-2 font-medium bg-white/20 inline-block px-2 py-1 rounded">Listo para cobro</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
        <BarChart3 className="text-indigo-600" size={32} /> Análisis de Sucursal
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Volumen Sucursal</h3>
              <div className="text-4xl font-black text-gray-900">${metricasSimuladas.ventasTotalesSucursal.toLocaleString()}</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-full">
              <TrendingUp className="text-indigo-600 h-8 w-8" />
            </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-6 rounded-2xl shadow-xl flex items-center justify-between text-white">
            <div>
              <h3 className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-1">Bono Gerencial (15%)</h3>
              <div className="text-4xl font-black">${bonoEncargado.toLocaleString()}</div>
            </div>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <Award className="text-white h-8 w-8" />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
         <h2 className="text-lg font-bold text-gray-800 mb-4">Métricas de Créditos de la Sucursal</h2>
         <div className="flex justify-around text-center divide-x">
            <div className="px-4">
              <div className="text-sm font-medium text-gray-500">Total Solicitudes</div>
              <div className="text-2xl font-bold mt-1 text-gray-800">{solicitudes.length}</div>
            </div>
            <div className="px-4">
              <div className="text-sm font-medium text-gray-500">Aprobados</div>
              <div className="text-2xl font-bold mt-1 text-green-600">{solicitudes.filter(s=>s.estado==='Aprobado').length}</div>
            </div>
            <div className="px-4">
              <div className="text-sm font-medium text-gray-500">Rechazados</div>
              <div className="text-2xl font-bold mt-1 text-red-600">{solicitudes.filter(s=>s.estado==='Rechazado').length}</div>
            </div>
         </div>
      </div>
    </div>
  );
}
