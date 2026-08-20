'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, Package, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const mockSalesData = [
  { day: 'Lun', ventas: 45000, ganancia: 18000 },
  { day: 'Mar', ventas: 52000, ganancia: 21000 },
  { day: 'Mié', ventas: 38000, ganancia: 14500 },
  { day: 'Jue', ventas: 68000, ganancia: 29000 },
  { day: 'Vie', ventas: 95000, ganancia: 41000 },
  { day: 'Sáb', ventas: 120000, ganancia: 52000 },
  { day: 'Dom', ventas: 85000, ganancia: 36000 },
];

const mockCategoryData = [
  { category: 'Accesorios', total: 210000 },
  { category: 'Librería', total: 145000 },
  { category: 'Golosinas', total: 148000 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard General</h1>
        <p className="text-slate-400 text-sm mt-1">Resumen en tiempo real de ventas, ganancias y estado de stock</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-sm font-medium">Ventas de Hoy</span>
            <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">$95,000</div>
          <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-4 h-4" /> +15.4% vs ayer
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-sm font-medium">Ganancia Estimada</span>
            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400">$41,000</div>
          <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-4 h-4" /> Margen promedio 43%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-sm font-medium">Egresos / Caja</span>
            <div className="bg-amber-500/10 p-2 rounded-lg text-amber-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400">$12,500</div>
          <p className="text-xs text-slate-400 mt-2">3 egresos registrados hoy</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-sm font-medium">Alertas de Stock</span>
            <div className="bg-rose-500/10 p-2 rounded-lg text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-rose-400">3 Productos</div>
          <p className="text-xs text-rose-400 font-medium mt-2">Bajo el límite mínimo</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Ventas & Ganancias de la Semana</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSalesData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="ventas" stroke="#6366f1" fillOpacity={1} fill="url(#colorVentas)" name="Ventas ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Ventas por Categoría</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCategoryData}>
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} name="Total ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
