'use client';

import { useState, useEffect } from 'react';
import { Product, Expense, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { PlusCircle, MinusCircle, Trash2, Calendar, Loader2, CheckCircle2, Wallet, ShoppingBag, PackagePlus, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type UnifiedMovement = {
  id: string;
  type: 'ingreso' | 'egreso';
  description: string;
  amount: number;
  category: string;
  created_at: string;
};

export default function CajaPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeType, setActiveType] = useState<'ingreso' | 'egreso'>('ingreso');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Venta Rápida (Ingreso)
  const [saleProductId, setSaleProductId] = useState('');
  const [saleQty, setSaleQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'MercadoPago' | 'Tarjeta'>('Efectivo');

  // Egreso (Compra de stock o Gastos)
  const [expenseCategory, setExpenseCategory] = useState<'mercaderia' | 'servicios' | 'alquiler' | 'varios'>('mercaderia');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [purchaseProductId, setPurchaseProductId] = useState('');
  const [purchaseQty, setPurchaseQty] = useState(1);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      if (isSupabaseConfigured) {
        const [expRes, salesRes, prodRes] = await Promise.all([
          supabase.from('expenses').select('*').order('created_at', { ascending: false }),
          supabase.from('sales').select('*, sale_items(*, products(*))').order('created_at', { ascending: false }),
          supabase.from('products').select('*').order('name', { ascending: true }),
        ]);

        if (expRes.data) setExpenses(expRes.data as any);
        if (salesRes.data) setSales(salesRes.data as any);
        if (prodRes.data) setProducts(prodRes.data as any);
      } else {
        const [expRes, prodRes] = await Promise.all([fetch('/api/expenses'), fetch('/api/inventory')]);
        const expData = await expRes.json();
        const prodData = await prodRes.json();

        setExpenses(expData.expenses || []);
        setProducts(prodData.products || []);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Selected product stock calculation for sale validation
  const selectedSaleProduct = products.find((p) => p.id === saleProductId);
  const availableStock = selectedSaleProduct?.stock ?? 0;
  const isStockInsufficient = Boolean(selectedSaleProduct && saleQty > availableStock);

  // Build unified movements timeline (Sales + Expenses)
  const unifiedMovements: UnifiedMovement[] = [
    ...sales.map((s) => {
      const firstItem = s.sale_items?.[0];
      const prodName = firstItem?.products?.name || 'Venta de Producto';
      const qty = firstItem?.quantity || 1;
      const extraItems = (s.sale_items?.length || 1) - 1;
      const desc = extraItems > 0 ? `Venta: ${qty}x ${prodName} + ${extraItems} más` : `Venta: ${qty}x ${prodName}`;

      return {
        id: s.id,
        type: 'ingreso' as const,
        description: desc,
        amount: Number(s.total_amount || 0),
        category: s.payment_method || 'Venta',
        created_at: s.created_at,
      };
    }),
    ...expenses.map((e) => ({
      id: e.id,
      type: 'egreso' as const,
      description: e.description,
      amount: Number(e.amount || 0),
      category: e.category,
      created_at: e.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleQuickSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleProduct || isStockInsufficient || submitting) return;

    setToastMessage(null);
    setSubmitting(true);

    const unitPrice = selectedSaleProduct.sale_price ?? selectedSaleProduct.price ?? 0;
    const unitCost = selectedSaleProduct.cost_price ?? selectedSaleProduct.cost ?? 0;

    try {
      const payload = {
        payment_method: paymentMethod,
        items: [
          {
            product_id: selectedSaleProduct.id,
            quantity: Number(saleQty),
            unit_price: unitPrice,
            unit_cost: unitCost,
          },
        ],
      };

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'No se pudo completar la venta.');
      }

      setToastMessage({ type: 'success', text: `✅ Venta registrada y stock actualizado (-${saleQty} u. en ${selectedSaleProduct.name})` });
      setSaleProductId('');
      setSaleQty(1);

      await fetchInitialData();
    } catch (err: any) {
      console.error('Error registrando venta:', err);
      setToastMessage({ type: 'error', text: `❌ ${err.message || 'Error al procesar la venta'}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount || submitting) return;

    setToastMessage(null);
    setSubmitting(true);

    try {
      const payload = {
        description: expenseDesc.trim(),
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        product_id: expenseCategory === 'mercaderia' ? purchaseProductId || undefined : undefined,
        quantity_purchased: expenseCategory === 'mercaderia' ? Number(purchaseQty) : undefined,
      };

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'No se pudo guardar el egreso.');
      }

      const selectedProd = products.find((p) => p.id === purchaseProductId);
      const stockMsg = expenseCategory === 'mercaderia' && selectedProd && purchaseQty > 0
        ? ` (+${purchaseQty} u. sumadas a ${selectedProd.name})`
        : '';

      setToastMessage({ type: 'success', text: `✅ Egreso de $${Number(expenseAmount).toLocaleString('es-AR')} guardado${stockMsg}` });
      setExpenseDesc('');
      setExpenseAmount('');
      setPurchaseProductId('');
      setPurchaseQty(1);

      await fetchInitialData();
    } catch (err: any) {
      console.error('Error registrando egreso:', err);
      setToastMessage({ type: 'error', text: `❌ ${err.message || 'Error al guardar el egreso'}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      setToastMessage({ type: 'success', text: '✅ Registro eliminado correctamente' });
    } catch (err) {
      console.error('Error eliminando registro:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-sm font-bold shadow-xl animate-pulse ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            Cerrar
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Wallet className="w-8 h-8 text-indigo-400" /> Registro Unificado de Caja & Stock
        </h1>
        <p className="text-slate-400 text-sm mt-1">Todas las cifras expresadas en Pesos Argentinos (ARS, $)</p>
      </div>

      {/* Top Giant Action Selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setToastMessage(null);
            setActiveType('ingreso');
          }}
          className={`p-5 rounded-3xl border text-left transition-all flex flex-col justify-between shadow-xl ${
            activeType === 'ingreso'
              ? 'bg-emerald-600/20 border-emerald-500 text-white ring-2 ring-emerald-500/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <div className="bg-emerald-500/20 p-3 rounded-2xl text-emerald-400 w-fit mb-2">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">🟢 Ingreso / Venta</span>
            <span className="text-base sm:text-lg font-bold text-white leading-tight">Cobro & Descuento de Stock</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setToastMessage(null);
            setActiveType('egreso');
          }}
          className={`p-5 rounded-3xl border text-left transition-all flex flex-col justify-between shadow-xl ${
            activeType === 'egreso'
              ? 'bg-rose-600/20 border-rose-500 text-white ring-2 ring-rose-500/50'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <div className="bg-rose-500/20 p-3 rounded-2xl text-rose-400 w-fit mb-2">
            <MinusCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">🔴 Egreso / Compra</span>
            <span className="text-base sm:text-lg font-bold text-white leading-tight">Gastos & Reposición de Stock</span>
          </div>
        </button>
      </div>

      {/* INGRESO: VENTA RÁPIDA */}
      {activeType === 'ingreso' && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" /> Registrar Venta (Descuenta Stock)
          </h2>

          <form onSubmit={handleQuickSaleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                1. Seleccionar Producto *
              </label>

              {products.length === 0 ? (
                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl text-slate-400 text-sm">
                  ⚠️ No tienes productos cargados aún. Agrega uno primero en la sección <span className="text-indigo-400 font-bold">Inventario</span>.
                </div>
              ) : (
                <select
                  required
                  value={saleProductId}
                  onChange={(e) => setSaleProductId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Selecciona producto vendido --</option>
                  {products.map((p) => {
                    const price = p.sale_price ?? p.price ?? 0;
                    const isOutOfStock = p.stock <= 0;
                    return (
                      <option key={p.id} value={p.id} disabled={isOutOfStock}>
                        {p.name} - ${price.toLocaleString('es-AR')} {isOutOfStock ? '(Agotado)' : `(Stock: ${p.stock} u.)`}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  2. Cantidad Vendida *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={saleQty}
                  onChange={(e) => setSaleQty(Number(e.target.value))}
                  className={`w-full bg-slate-800 border rounded-2xl px-4 py-3.5 text-xl font-bold text-white focus:outline-none focus:ring-2 ${
                    isStockInsufficient ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:ring-emerald-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  3. Método de Cobro *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="MercadoPago">MercadoPago</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>
            </div>

            {/* Strict Stock Validation Message */}
            {isStockInsufficient && selectedSaleProduct && (
              <div className="bg-rose-500/20 border border-rose-500 text-rose-300 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                ❌ Stock insuficiente. Solo dispones de {availableStock} unidades para vender de "{selectedSaleProduct.name}".
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !saleProductId || isStockInsufficient}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-emerald-600/30 text-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {submitting ? 'Procesando venta...' : 'CONFIRMAR VENTA Y DESCONTAR STOCK'}
            </button>
          </form>
        </div>
      )}

      {/* EGRESO: COMPRA DE STOCK O GASTO GENERAL */}
      {activeType === 'egreso' && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-rose-400" /> Registrar Egreso de Caja / Compra
          </h2>

          <form onSubmit={handleExpenseSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                1. Tipo de Egreso *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'mercaderia', label: '📦 Stock / Mercadería' },
                  { id: 'servicios', label: '💡 Servicios' },
                  { id: 'alquiler', label: '🏠 Alquiler' },
                  { id: 'varios', label: '📑 Varios' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExpenseCategory(item.id as any)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all border ${
                      expenseCategory === item.id
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md scale-[1.02]'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {expenseCategory === 'mercaderia' && (
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 space-y-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  Sumar Stock a Producto Existente (Opcional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      value={purchaseProductId}
                      onChange={(e) => setPurchaseProductId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-medium focus:outline-none"
                    >
                      <option value="">-- No vincular / Solo registrar costo --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock actual: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      min="1"
                      placeholder="Cant. comprada"
                      value={purchaseQty}
                      onChange={(e) => setPurchaseQty(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                2. Concepto / Detalle *
              </label>
              <input
                type="text"
                placeholder='Ej. "Reposición fundas proveedor Arcor", "Luz local"'
                required
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-base font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                3. Monto Total Pagado ($ ARS) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                required
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-2xl font-extrabold text-rose-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !expenseDesc || !expenseAmount}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-rose-600/30 text-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {submitting ? 'Guardando egreso...' : 'GUARDAR EGRESO & REPONER STOCK'}
            </button>
          </form>
        </div>
      )}

      {/* Unified Movimientos Timeline List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <h3 className="font-bold text-white text-xl border-b border-slate-800 pb-3 flex items-center justify-between">
          <span>Historial de Movimientos de Caja (ARS)</span>
          <span className="text-xs font-medium text-slate-400">Ingresos (+) y Egresos (-)</span>
        </h3>

        {loading ? (
          <div className="flex justify-center py-8 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : unifiedMovements.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No hay movimientos de caja registrados aún.</div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {unifiedMovements.map((mov) => (
              <div key={mov.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl text-white ${
                      mov.type === 'ingreso' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {mov.type === 'ingreso' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="font-bold text-white text-base">{mov.description}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md font-semibold border border-slate-700 uppercase">
                        {mov.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(mov.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`font-extrabold text-lg ${mov.type === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {mov.type === 'ingreso' ? '+' : '-'}$ {mov.amount.toLocaleString('es-AR')}
                  </span>
                  {mov.type === 'egreso' && (
                    <button onClick={() => handleDeleteExpense(mov.id)} className="text-slate-500 hover:text-rose-400 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
