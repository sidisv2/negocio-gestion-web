'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, PackageX, Percent, Calendar, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const timelineData = {
  '7d': [
    { label: 'Lun', ingresos: 45000, egresos: 12000, ganancia: 33000 },
    { label: 'Mar', ingresos: 52000, egresos: 8500, ganancia: 43500 },
    { label: 'Mié', ingresos: 38000, egresos: 14000, ganancia: 24000 },
    { label: 'Jue', ingresos: 68000, egresos: 9000, ganancia: 59000 },
    { label: 'Vie', ingresos: 95000, egresos: 22000, ganancia: 73000 },
    { label: 'Sáb', ingresos: 120000, egresos: 15000, ganancia: 105000 },
    { label: 'Dom', ingresos: 85000, egresos: 5000, ganancia: 80000 },
  ],
  '1m': [
    { label: 'Sem 1', ingresos: 290000, egresos: 65000, ganancia: 225000 },
    { label: 'Sem 2', ingresos: 340000, egresos: 82000, ganancia: 258000 },
    { label: 'Sem 3', ingresos: 410000, egresos: 95000, ganancia: 315000 },
    { label: 'Sem 4', ingresos: 503000, egresos: 85500, ganancia: 417500 },
  ],
  '3m': [
    { label: 'Junio', ingresos: 1250000, egresos: 320000, ganancia: 930000 },
    { label: 'Julio', ingresos: 1480000, egresos: 390000, ganancia: 1090000 },
    { label: 'Agosto', ingresos: 1543000, egresos: 327500, ganancia: 1215500 },
  ],
};

const topVsDeadData = [
  { name: 'Fundas iPhone', tipo: 'Más Vendidos', unidades: 42 },
  { name: 'Alfajor Triple', tipo: 'Más Vendidos', unidades: 38 },
  { name: 'Vidrio Templado', tipo: 'Más Vendidos', unidades: 29 },
  { name: 'Cuaderno A4', tipo: 'Más Vendidos', unidades: 25 },
  { name: 'Bolígrafos BIC', tipo: 'Más Vendidos', unidades: 22 },
  { name: 'Abrochadora', tipo: 'Estancado', unidades: 2 },
  { name: 'Resaltador', tipo: 'Estancado', unidades: 3 },
  { name: 'Caramelos Menta', tipo: 'Estancado', unidades: 4 },
  { name: 'Gomitas Fruta', tipo: 'Estancado', unidades: 5 },
  { name: 'Cargador 20W', tipo: 'Estancado', unidades: 6 },
];

const categoryDistribution = [
  { name: 'Accesorios Celular', value: 210000, color: '#6366f1' },
  { name: 'Librería', value: 145000, color: '#10b981' },
  { name: 'Chucherías / Golosinas', value: 148000, color: '#f59e0b' },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState<'7d' | '1m' | '3m'>('7d');

  const currentTimeline = timelineData[period];
  const totalFacturacion = currentTimeline.reduce((acc, curr) => acc + curr.ingresos, 0);
  const totalGanancia = currentTimeline.reduce((acc, curr) => acc + curr.ganancia, 0);

  return (
    <div className="space-y-7">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard & Analítica de Negocio</h1>
          <p className="text-slate-400 text-sm mt-1">Panel de control financiero, rentabilidad e inventario estancado</p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-2xl gap-1 self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-indigo-400 ml-2 mr-1" />
          <button
            onClick={() => setPeriod('7d')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              period === '7d' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Últimos 7 Días
          </button>
          <button
            onClick={() => setPeriod('1m')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              period === '1m' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setPeriod('3m')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              period === '3m' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Últimos 3 Meses
          </button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Facturación Total</span>
            <div className="bg-indigo-500/10 p-2.5 rounded-2xl text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">${totalFacturacion.toLocaleString('es-AR')}</div>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" /> Ingresos brutos del periodo
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Ganancia Neta Real</span>
            <div className="bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">${totalGanancia.toLocaleString('es-AR')}</div>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" /> Venta menos costo de mercadería
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Dinero Parado (Stock)</span>
            <div className="bg-rose-500/10 p-2.5 rounded-2xl text-rose-400">
              <PackageX className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400">$64,200</div>
          <p className="text-xs text-rose-400 font-semibold">Valor en stock sin movimiento (+15 días)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Margen Promedio</span>
            <div className="bg-amber-500/10 p-2.5 rounded-2xl text-amber-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">42.8%</div>
          <p className="text-xs text-slate-400 font-medium">Promedio ponderado entre categorías</p>
        </div>
      </div>

      {/* Main Income vs Expenses Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Evolución de Ingresos vs. Egresos y Ganancia Neta</h2>
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Flujo Financiero
          </span>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentTimeline}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff' }} />
              <Area type="monotone" dataKey="ingresos" stroke="#6366f1" fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos Brutos ($)" />
              <Area type="monotone" dataKey="ganancia" stroke="#10b981" fillOpacity={1} fill="url(#colorGanancia)" name="Ganancia Neta ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Best Sellers vs Dead Stock Bar Chart */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white">Top 5 Más Vendidos vs. Top 5 Stock Estancado</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVsDeadData} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff' }} />
                <Bar dataKey="unidades" fill="#6366f1" radius={[0, 8, 8, 0]} name="Unidades" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Sales Distribution */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white">Distribución de Ventas por Categoría</h2>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
