'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/lib/supabase';
import { PlusCircle, MinusCircle, Trash2, Calendar, Tag, Loader2, CheckCircle2, Wallet } from 'lucide-react';

export default function CajaPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeType, setActiveType] = useState<'ingreso' | 'egreso'>('egreso');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State (Ultra simple 3 fields)
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Expense['category']>('Mercadería');

  const categoriesList: Expense['category'][] = ['Mercadería', 'Servicios', 'Alquiler', 'Varios'];

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/expenses');
      const data = await res.json();
      setExpenses(data.expenses || []);
    } catch (err) {
      console.error('Error cargando movimientos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || submitting) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount: Number(amount),
          category: selectedCategory,
        }),
      });

      if (res.ok) {
        setSuccessMsg(`¡Movimiento de $${Number(amount).toLocaleString('es-AR')} guardado con éxito!`);
        setAmount('');
        setDescription('');
        fetchExpenses();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error registrando movimiento:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error eliminando movimiento:', err);
    }
  };

  const totalEgresos = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Wallet className="w-8 h-8 text-indigo-400" /> Registro de Caja & Gastos
        </h1>
        <p className="text-slate-400 text-sm mt-1">Gestión súper simple para cargar egresos y controlar el efectivo</p>
      </div>

      {/* Top Giant Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setActiveType('ingreso')}
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
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">🟢 Entrada</span>
            <span className="text-base sm:text-lg font-bold text-white leading-tight">Venta Rápida</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveType('egreso')}
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
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">🔴 Salida</span>
            <span className="text-base sm:text-lg font-bold text-white leading-tight">Gasto / Compra</span>
          </div>
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 font-semibold text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Form Container */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5">
        <h2 className="text-xl font-bold text-white">
          {activeType === 'egreso' ? 'Registrar Salida de Dinero' : 'Registrar Ingreso de Caja'}
        </h2>

        <form onSubmit={handleAddExpense} className="space-y-5">
          {/* Field 1: Large Number Keyboard Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              1. Monto ($)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-2xl font-extrabold text-slate-500">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-3.5 text-3xl font-extrabold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Field 2: Concept */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              2. Concepto / Motivo
            </label>
            <input
              type="text"
              placeholder='Ej: "Compra golosinas", "Pago Luz", "Bolsas"'
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-base font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Field 3: Touch Category Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              3. Categoría Rápida
            </label>
            <div className="flex flex-wrap gap-2.5">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md scale-[1.03]'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-rose-600/30 text-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {submitting ? 'GUARDANDO...' : 'GUARDAR MOVIMIENTO'}
          </button>
        </form>
      </div>

      {/* Expenses History List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-white text-xl">Historial de Caja</h3>
            <p className="text-slate-400 text-xs mt-0.5">Egresos totales: ${totalEgresos.toLocaleString('es-AR')}</p>
          </div>
          <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
            {expenses.length} registros
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-10 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No hay movimientos registrados en caja aún.
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between bg-slate-800/50 hover:bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 transition-all group"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base">{exp.description}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="bg-slate-800 text-amber-300 px-2.5 py-0.5 rounded-md font-semibold border border-amber-500/20">
                      {exp.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(exp.created_at).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-rose-400 text-lg">
                    -${Number(exp.amount).toLocaleString('es-AR')}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    title="Eliminar registro"
                    className="text-slate-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
