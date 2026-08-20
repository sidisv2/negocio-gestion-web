'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, PackageX, Percent, Calendar, ArrowUpRight, ArrowDownRight, Inbox, PlusCircle, Loader2, Trophy, Award } from 'lucide-react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function DashboardPage() {
  const [period, setPeriod] = useState<'7d' | '1m' | '3m'>('7d');
  const [loading, setLoading] = useState(true);

  const [sales, setSales] = useState<any[]>([]);
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        if (isSupabaseConfigured) {
          const [salesRes, itemsRes, expRes, prodRes] = await Promise.all([
            supabase.from('sales').select('*'),
            supabase.from('sale_items').select('*, products(*)'),
            supabase.from('expenses').select('*'),
            supabase.from('products').select('*'),
          ]);

          if (salesRes.data) setSales(salesRes.data);
          if (itemsRes.data) setSaleItems(itemsRes.data);
          if (expRes.data) setExpenses(expRes.data);
          if (prodRes.data) setProducts(prodRes.data);
        } else {
          const [expRes, prodRes] = await Promise.all([
            fetch('/api/expenses'),
            fetch('/api/inventory'),
          ]);
          const expData = await expRes.json();
          const prodData = await prodRes.json();

          setExpenses(expData.expenses || []);
          setProducts(prodData.products || []);
        }
      } catch (err) {
        console.error('Error cargando métricas en tiempo real:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  // 1. Facturación Total (sum total_amount in sales)
  const totalFacturacion = sales.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);

  // 2. Total Gastos (sum amount in expenses)
  const totalGastos = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  // 3. Ganancia Neta Real (sum (unit_price - unit_cost) * quantity)
  const gananciaNetaReal = saleItems.length > 0
    ? saleItems.reduce((acc, item) => {
        const price = Number(item.unit_price || 0);
        const cost = Number(item.unit_cost || 0);
        const qty = Number(item.quantity || 1);
        return acc + (price - cost) * qty;
      }, 0)
    : Math.max(0, totalFacturacion - totalGastos);

  // 4. Dinero Parado (sum cost_price * stock in products)
  const deadStockValue = products.reduce((acc, p) => {
    const cost = p.cost_price ?? p.cost ?? 0;
    return acc + cost * (p.stock || 0);
  }, 0);

  // Margen Promedio Real (%)
  const margenPromedio = totalFacturacion > 0
    ? ((gananciaNetaReal / totalFacturacion) * 100).toFixed(1)
    : '0.0';

  // 5. Comparador Semana Actual vs. Semana Anterior
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const currentWeekSales = sales
    .filter((s) => new Date(s.created_at) >= sevenDaysAgo)
    .reduce((acc, s) => acc + Number(s.total_amount || 0), 0);

  const previousWeekSales = sales
    .filter((s) => {
      const date = new Date(s.created_at);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    })
    .reduce((acc, s) => acc + Number(s.total_amount || 0), 0);

  let weeklyGrowthPercentage = 0;
  if (previousWeekSales > 0) {
    weeklyGrowthPercentage = Number((((currentWeekSales - previousWeekSales) / previousWeekSales) * 100).toFixed(1));
  } else if (currentWeekSales > 0) {
    weeklyGrowthPercentage = 100;
  }

  // 6. Podio Top 3 Productos Más Rentables
  const profitByProductMap: Record<string, { name: string; quantity: number; totalProfit: number }> = {};

  saleItems.forEach((item) => {
    const prodName = item.products?.name || 'Producto';
    const price = Number(item.unit_price || 0);
    const cost = Number(item.unit_cost || 0);
    const qty = Number(item.quantity || 1);
    const profit = (price - cost) * qty;

    if (!profitByProductMap[prodName]) {
      profitByProductMap[prodName] = { name: prodName, quantity: 0, totalProfit: 0 };
    }

    profitByProductMap[prodName].quantity += qty;
    profitByProductMap[prodName].totalProfit += profit;
  });

  const top3ProfitableProducts = Object.values(profitByProductMap)
    .sort((a, b) => b.totalProfit - a.totalProfit)
    .slice(0, 3);

  const hasData = sales.length > 0 || expenses.length > 0 || products.length > 0;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Dashboard & Métricas</h1>
          <p className="text-slate-400 text-sm mt-1">Rentabilidad, crecimiento semanal y productos más valiosos (ARS, $)</p>
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
      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main 4 KPIs */}
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
                <ArrowUpRight className="w-4 h-4" /> Suma total de ventas
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Ganancia Neta Real</span>
                <div className="bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">${gananciaNetaReal.toLocaleString('es-AR')}</div>
              <p className="text-xs text-emerald-400/80 font-medium">Margen real (Venta - Costo)</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Gastos / Egresos</span>
                <div className="bg-amber-500/10 p-2.5 rounded-2xl text-amber-400">
                  <TrendingUp className="w-5 h-5 rotate-180" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-amber-400">${totalGastos.toLocaleString('es-AR')}</div>
              <p className="text-xs text-amber-400/80 font-medium">Salidas de caja registradas</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Dinero Parado (Stock)</span>
                <div className="bg-rose-500/10 p-2.5 rounded-2xl text-rose-400">
                  <PackageX className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-rose-400">${deadStockValue.toLocaleString('es-AR')}</div>
              <p className="text-xs text-rose-400/80 font-medium">Valor invertido en inventario</p>
            </div>
          </div>

          {/* New Highlighted Visual Metrics: Weekly Growth & Top 3 Profitable Products */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Weekly Growth Comparison */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Semana Actual vs. Anterior</span>
                <span className="text-xs font-medium text-slate-500">Últimos 7 días</span>
              </div>

              <div className="flex items-center justify-between bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Ventas esta semana</span>
                  <span className="text-2xl font-extrabold text-white">${currentWeekSales.toLocaleString('es-AR')}</span>
                </div>

                <div
                  className={`flex items-center gap-1 font-extrabold text-sm px-3 py-1.5 rounded-xl border ${
                    weeklyGrowthPercentage >= 0
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {weeklyGrowthPercentage >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {weeklyGrowthPercentage >= 0 ? `+${weeklyGrowthPercentage}%` : `${weeklyGrowthPercentage}%`}
                </div>
              </div>

              <p className="text-xs text-slate-400 font-medium">
                Ventas semana previa: <span className="text-slate-200 font-bold">${previousWeekSales.toLocaleString('es-AR')}</span>
              </p>
            </div>

            {/* Top 3 Profitable Products Podium */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Top 3 Productos Más Rentables</h3>
              </div>

              {top3ProfitableProducts.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">Aún no hay ventas registradas para calcular el podio de rentabilidad.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {top3ProfitableProducts.map((prod, index) => {
                    const badgeColors = [
                      'bg-amber-500/20 border-amber-500/40 text-amber-300',
                      'bg-slate-400/20 border-slate-400/40 text-slate-300',
                      'bg-amber-700/20 border-amber-700/40 text-amber-500',
                    ];

                    return (
                      <div key={prod.name} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 space-y-2 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase ${badgeColors[index]}`}>
                            #{index + 1} Podio
                          </span>
                          <Award className="w-4 h-4 text-amber-400" />
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-sm truncate">{prod.name}</h4>
                          <span className="text-xs text-slate-400 font-medium">{prod.quantity} u. vendidas</span>
                        </div>

                        <div className="pt-1 border-t border-slate-700/50">
                          <span className="text-xs text-slate-400 block">Ganancia limpia</span>
                          <span className="text-lg font-extrabold text-emerald-400">+${prod.totalProfit.toLocaleString('es-AR')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !hasData && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">Sin movimientos registrados aún</h3>
            <p className="text-slate-400 text-sm">
              Carga tu primer producto en inventario o registra un movimiento en caja para calcular tus métricas en tiempo real.
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
      )}
    </div>
  );
}
