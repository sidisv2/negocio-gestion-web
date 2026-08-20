'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, PackageX, Percent, Calendar, ArrowUpRight, Inbox, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [period, setPeriod] = useState<'7d' | '1m' | '3m'>('7d');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const [prodRes, expRes] = await Promise.all([
          fetch('/api/inventory'),
          fetch('/api/expenses'),
        ]);

        const prodData = await prodRes.json();
        const expData = await expRes.json();

        setProducts(prodData.products || []);
        setExpenses(expData.expenses || []);
      } catch (err) {
        console.error('Error cargando métricas:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const totalFacturacion = 0; // Starts clean at $0 if no sales
  const totalEgresos = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const totalGanancia = Math.max(0, totalFacturacion - totalEgresos);

  // Calculate stagnant inventory value (min_stock or low stock)
  const deadStockValue = products
    .filter((p) => p.stock <= p.min_stock)
    .reduce((acc, p) => acc + p.cost * p.stock, 0);

  const hasData = products.length > 0 || expenses.length > 0;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Dashboard & Métricas</h1>
          <p className="text-slate-400 text-sm mt-1">Resumen financiero, control de margen e inventario</p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-2xl gap-1 self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-indigo-400 ml-2 mr-1" />
          <button
            onClick={() => setPeriod('7d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              period === '7d' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Días
          </button>
          <button
            onClick={() => setPeriod('1m')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              period === '1m' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setPeriod('3m')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              period === '3m' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            3 Meses
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
          <p className="text-xs text-slate-400 font-medium">Ingresos brutos del periodo</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Egresos / Gastos</span>
            <div className="bg-amber-500/10 p-2.5 rounded-2xl text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">${totalEgresos.toLocaleString('es-AR')}</div>
          <p className="text-xs text-amber-400/80 font-medium">Registrados en caja</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Dinero Parado (Stock)</span>
            <div className="bg-rose-500/10 p-2.5 rounded-2xl text-rose-400">
              <PackageX className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400">${deadStockValue.toLocaleString('es-AR')}</div>
          <p className="text-xs text-rose-400/80 font-medium">Valor en productos a reponer</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Margen Estimado</span>
            <div className="bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">0.0%</div>
          <p className="text-xs text-slate-400 font-medium">Sin ventas registradas</p>
        </div>
      </div>

      {/* Clean Empty State or Main Chart Container */}
      {!hasData ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">Sin movimientos aún</h3>
            <p className="text-slate-400 text-sm">
              Registra tu primer producto en inventario o carga un movimiento de caja para comenzar a ver gráficos y análisis de tendencia.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/inventario"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all text-sm"
            >
              <PlusCircle className="w-5 h-5" /> Cargar Tu Primer Producto
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center shadow-xl space-y-3">
          <h2 className="text-xl font-bold text-white">Tendencias y Gráficos</h2>
          <p className="text-slate-400 text-sm">
            Registra más ventas para generar curvas comparativas de ingresos y gráficos por categoría.
          </p>
        </div>
      )}
    </div>
  );
}
