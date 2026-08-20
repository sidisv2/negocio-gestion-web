'use client';

import { useState } from 'react';
import { Expense } from '@/lib/supabase';
import { Wallet, Plus, ArrowDownCircle, ArrowUpCircle, Calendar, Tag } from 'lucide-react';

const INITIAL_EXPENSES: Expense[] = [
  { id: '1', description: 'Pago Proveedor Golosinas (Arcor)', amount: 18500, category: 'Proveedor', created_at: '2026-08-20T10:15:00' },
  { id: '2', description: 'Factura Luz & Internet Local', amount: 9200, category: 'Servicios', created_at: '2026-08-19T16:30:00' },
  { id: '3', description: 'Retiro de Caja Personal', amount: 15000, category: 'Retiro de Caja', created_at: '2026-08-18T19:00:00' },
];

export default function CajaPage() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Gasto General');

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newExp: Expense = {
      id: Date.now().toString(),
      description,
      amount: Number(amount),
      category,
      created_at: new Date().toISOString(),
    };

    setExpenses([newExp, ...expenses]);
    setDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Control de Caja & Gastos</h1>
        <p className="text-slate-400 text-sm mt-1">Registra egresos diarios, pagos a proveedores y retiros de caja</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Registration */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" /> Registrar Nuevo Gasto
          </h2>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Descripción del Gasto</label>
              <input
                type="text"
                placeholder="Ej. Pago reposición accesorios..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Monto ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Proveedor">Proveedor</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Retiro de Caja">Retiro de Caja</option>
                  <option value="Gasto General">Gasto General</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-600/30 transition-all text-base mt-2"
            >
              Registrar Egreo en Caja
            </button>
          </form>
        </div>

        {/* Expenses List & Summary */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase">Total Egresos Registrados</span>
              <div className="text-3xl font-extrabold text-white mt-1">${totalExpenses.toLocaleString('es-AR')}</div>
            </div>
            <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-400">
              <ArrowDownCircle className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-lg">Historial de Salidas</h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {expenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-white text-sm">{exp.description}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="bg-slate-800 text-amber-300 px-2.5 py-0.5 rounded-md font-medium border border-amber-500/20">
                        {exp.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(exp.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>

                  <span className="font-extrabold text-amber-400 text-lg">
                    -${exp.amount.toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
