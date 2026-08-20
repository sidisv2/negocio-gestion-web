'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, PackageX, Percent, Calendar, ArrowUpRight, ArrowDownRight, Inbox, PlusCircle, Loader2, Trophy, Award, Sparkles, Clock, CalendarDays, CalendarRange } from 'lucide-react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Formatter for ARS currency without decimals
const formatARS = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

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
            supabase.from('sales').select('*').order('created_at', { ascending: false }),
            supabase.from('sale_items').select('*, products(*)'),
            supabase.from('expenses').select('*').order('created_at', { ascending: false }),
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

  // Today's Date
  const now = new Date();
  const todayDateStr = now.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const todayStrISO = now.toISOString().split('T')[0];

  // Helper map for sale_items lookup by sale_id
  const itemsBySaleMap: Record<string, any[]> = {};
  saleItems.forEach((item) => {
    if (!itemsBySaleMap[item.sale_id]) itemsBySaleMap[item.sale_id] = [];
    itemsBySaleMap[item.sale_id].push(item);
  });

  // Calculate profit for a single sale
  const getSaleNetProfit = (sale: any) => {
    const items = itemsBySaleMap[sale.id] || [];
    if (items.length > 0) {
      return items.reduce((acc, item) => {
        const price = Number(item.unit_price || 0);
        const cost = Number(item.unit_cost || 0);
        const qty = Number(item.quantity || 1);
        return acc + (price - cost) * qty;
      }, 0);
    }
    return Number(sale.total_amount || 0) * 0.4; // 40% margin fallback if no items
  };

  // 1. GANANCIA NETA DIARIA (HOY)
  const salesToday = sales.filter((s) => s.created_at && s.created_at.startsWith(todayStrISO));
  const countSalesToday = salesToday.length;
  const salesGrossToday = salesToday.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
  const profitSalesToday = salesToday.reduce((acc, s) => acc + getSaleNetProfit(s), 0);
  const expensesToday = expenses
    .filter((e) => e.created_at && e.created_at.startsWith(todayStrISO))
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const netProfitToday = profitSalesToday - expensesToday;

  // 2. GANANCIA NETA SEMANAL (ÚLTIMOS 7 DÍAS)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const salesWeek = sales.filter((s) => new Date(s.created_at) >= sevenDaysAgo);
  const grossSalesWeek = salesWeek.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
  const profitSalesWeek = salesWeek.reduce((acc, s) => acc + getSaleNetProfit(s), 0);
  const expensesWeek = expenses
    .filter((e) => new Date(e.created_at) >= sevenDaysAgo)
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const netProfitWeek = profitSalesWeek - expensesWeek;

  const previousWeekSales = sales
    .filter((s) => {
      const date = new Date(s.created_at);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    })
    .reduce((acc, s) => acc + Number(s.total_amount || 0), 0);

  let weeklyGrowthPercentage = 0;
  if (previousWeekSales > 0) {
    weeklyGrowthPercentage = Number((((grossSalesWeek - previousWeekSales) / previousWeekSales) * 100).toFixed(1));
  } else if (grossSalesWeek > 0) {
    weeklyGrowthPercentage = 100;
  }

  // 3. GANANCIA NETA MENSUAL (MES EN CURSO)
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const salesMonth = sales.filter((s) => {
    const d = new Date(s.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const grossSalesMonth = salesMonth.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
  const profitSalesMonth = salesMonth.reduce((acc, s) => acc + getSaleNetProfit(s), 0);

  const expensesMonth = expenses
    .filter((e) => {
      const d = new Date(e.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const netProfitMonth = profitSalesMonth - expensesMonth;

  // General KPIs
  const totalFacturacion = sales.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
  const totalGastos = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const gananciaNetaTotal = saleItems.length > 0
    ? saleItems.reduce((acc, item) => {
        const price = Number(item.unit_price || 0);
        const cost = Number(item.unit_cost || 0);
        const qty = Number(item.quantity || 1);
        return acc + (price - cost) * qty;
      }, 0)
    : Math.max(0, totalFacturacion - totalGastos);

  const deadStockValue = products.reduce((acc, p) => {
    const cost = p.cost_price ?? p.cost ?? 0;
    return acc + cost * (p.stock || 0);
  }, 0);

  const margenPromedio = totalFacturacion > 0
    ? ((gananciaNetaTotal / totalFacturacion) * 100).toFixed(1)
    : '0.0';

  // Top 3 Profitable Products
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
      {/* Dynamic Header with Greeting & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20 flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3.5 h-3.5" /> Atuel Celulares | Gestión
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">¡Hola Paola! 👋</h1>
          <p className="text-slate-400 text-xs sm:text-sm capitalize">{todayDateStr}</p>
        </div>

        <div className="flex items-center bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl gap-1 self-start sm:self-auto backdrop-blur-md">
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

      {/* NEW FEATURE: 3 Highlighted Cards for Temporal Net Profit (Diaria, Semanal, Mensual) */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 🟢 GANANCIA HOY */}
          <div className="bg-slate-900/75 border border-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Ganancia Hoy</span>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[11px] font-extrabold px-2.5 py-1 rounded-xl border border-emerald-500/20">
                {countSalesToday} {countSalesToday === 1 ? 'venta' : 'ventas'} hoy
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
              {formatARS(netProfitToday)}
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Ventas brutas: <strong className="text-white">{formatARS(salesGrossToday)}</strong></span>
              <span>Gastos: <strong className="text-rose-400">-{formatARS(expensesToday)}</strong></span>
            </div>
          </div>

          {/* 🔵 GANANCIA ESTA SEMANA (7d) */}
          <div className="bg-slate-900/75 border border-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-sky-400" />
                <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Ganancia Esta Semana (7d)</span>
              </div>
              <div
                className={`flex items-center gap-1 font-extrabold text-xs px-2.5 py-1 rounded-xl border ${
                  weeklyGrowthPercentage >= 0
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}
              >
                {weeklyGrowthPercentage >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {weeklyGrowthPercentage >= 0 ? `+${weeklyGrowthPercentage}%` : `${weeklyGrowthPercentage}%`}
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-sky-400 tracking-tight">
              {formatARS(netProfitWeek)}
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Ventas brutas: <strong className="text-white">{formatARS(grossSalesWeek)}</strong></span>
              <span>Gastos: <strong className="text-rose-400">-{formatARS(expensesWeek)}</strong></span>
            </div>
          </div>

          {/* 🟣 GANANCIA ESTE MES */}
          <div className="bg-slate-900/75 border border-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Ganancia Este Mes</span>
              </div>
              <span className="bg-purple-500/10 text-purple-400 text-[11px] font-extrabold px-2.5 py-1 rounded-xl border border-purple-500/20 uppercase">
                Mes en curso
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 tracking-tight">
              {formatARS(netProfitMonth)}
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Facturación: <strong className="text-white">{formatARS(grossSalesMonth)}</strong></span>
              <span>Gastos: <strong className="text-rose-400">-{formatARS(expensesMonth)}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* General KPI Cards Section */}
      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main 4 KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Facturación Historica</span>
                <div className="bg-indigo-500/10 p-2.5 rounded-2xl text-indigo-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white">{formatARS(totalFacturacion)}</div>
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" /> Suma total de ventas
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Ganancia Neta Total</span>
                <div className="bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">{formatARS(gananciaNetaTotal)}</div>
              <p className="text-xs text-emerald-400/80 font-medium">Margen real (Ventas - Costos)</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Gastos / Egresos</span>
                <div className="bg-amber-500/10 p-2.5 rounded-2xl text-amber-400">
                  <TrendingUp className="w-5 h-5 rotate-180" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-amber-400">{formatARS(totalGastos)}</div>
              <p className="text-xs text-amber-400/80 font-medium">Salidas de caja registradas</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Dinero Parado (Stock)</span>
                <div className="bg-rose-500/10 p-2.5 rounded-2xl text-rose-400">
                  <PackageX className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-rose-400">{formatARS(deadStockValue)}</div>
              <p className="text-xs text-rose-400/80 font-medium">Valor invertido en inventario</p>
            </div>
          </div>

          {/* Highlighted Visual Metrics: Weekly Growth & Top 3 Profitable Products */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Weekly Growth Comparison */}
            <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Semana Actual vs. Anterior</span>
                <span className="text-xs font-medium text-slate-500">Últimos 7 días</span>
              </div>

              <div className="flex items-center justify-between bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Ventas esta semana</span>
                  <span className="text-2xl font-extrabold text-white">{formatARS(grossSalesWeek)}</span>
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
                Ventas semana previa: <span className="text-slate-200 font-bold">{formatARS(previousWeekSales)}</span>
              </p>
            </div>

            {/* Top 3 Profitable Products Podium */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl space-y-4">
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
                          <span className="text-lg font-extrabold text-emerald-400">+{formatARS(prod.totalProfit)}</span>
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
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-3xl p-10 text-center shadow-xl space-y-4">
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-violet-500/25 transition-all text-sm"
            >
              <PlusCircle className="w-5 h-5" /> Cargar Tu Primer Producto
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
