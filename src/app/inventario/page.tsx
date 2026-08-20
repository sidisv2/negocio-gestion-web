'use client';

import { useState, useEffect } from 'react';
import { Product, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Plus, Search, Loader2, Inbox, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form state
  const [newProduct, setNewProduct] = useState({
    barcode: '',
    name: '',
    category: 'Accesorios',
    cost_price: '',
    sale_price: '',
    stock: '',
    min_stock: '5',
  });

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) setCurrentUser(data.user);
      });
    }
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const url = currentUser?.id
        ? `/api/inventory?category=${categoryFilter}&search=${search}&userId=${currentUser.id}`
        : `/api/inventory?category=${categoryFilter}&search=${search}`;

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error cargando inventario:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [categoryFilter, search, currentUser]);

  const handleStockAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p)));
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sale_price || submitting) return;

    setToastMessage(null);
    setSubmitting(true);

    try {
      const payload = {
        barcode: newProduct.barcode || undefined,
        name: newProduct.name.trim(),
        category: newProduct.category,
        cost_price: parseFloat(newProduct.cost_price || '0'),
        sale_price: parseFloat(newProduct.sale_price || '0'),
        stock: parseInt(newProduct.stock || '0', 10),
        min_stock: parseInt(newProduct.min_stock || '5', 10),
        user_id: currentUser?.id || undefined,
      };

      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'No se pudo crear el producto.');
      }

      // Success
      setShowAddModal(false);
      setToastMessage({ type: 'success', text: '✅ Producto agregado correctamente' });
      setNewProduct({
        barcode: '',
        name: '',
        category: 'Accesorios',
        cost_price: '',
        sale_price: '',
        stock: '',
        min_stock: '5',
      });

      await fetchInventory();
    } catch (err: any) {
      console.error('Error creando producto:', err);
      setToastMessage({ type: 'error', text: `❌ ${err.message || 'Error al guardar producto'}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Inventario de Productos</h1>
          <p className="text-slate-400 text-sm mt-1">Control de stock, precios de costo y precios de venta</p>
        </div>

        <button
          onClick={() => {
            setToastMessage(null);
            setShowAddModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all self-start sm:self-auto text-sm"
        >
          <Plus className="w-5 h-5" /> Agregar Tu Primer Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar producto por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="Todas">Todas las Categorías</option>
          <option value="Accesorios">Accesorios Celular</option>
          <option value="Librería">Librería</option>
          <option value="Golosinas">Chucherías / Golosinas</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-white text-lg">No hay productos en inventario</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Carga tus productos con costo y precio para que el sistema calcule tus ganancias automáticamente.
            </p>
            <button
              onClick={() => {
                setToastMessage(null);
                setShowAddModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 text-xs inline-flex items-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" /> Cargar Producto
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5">Producto</th>
                  <th className="py-4 px-5">Categoría</th>
                  <th className="py-4 px-5">Costo</th>
                  <th className="py-4 px-5">Precio Venta</th>
                  <th className="py-4 px-5 text-center">Stock Actual</th>
                  <th className="py-4 px-5 text-center">Cuadrar Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((p) => {
                  const isLowStock = p.stock <= p.min_stock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5 font-semibold text-white">{p.name}</td>
                      <td className="py-4 px-5">
                        <span className="bg-slate-800 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/20">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-400">${(p.cost_price ?? p.cost ?? 0).toLocaleString('es-AR')}</td>
                      <td className="py-4 px-5 font-bold text-emerald-400">${(p.sale_price ?? p.price ?? 0).toLocaleString('es-AR')}</td>
                      <td className="py-4 px-5 text-center font-bold text-white">
                        <span className={isLowStock ? 'text-rose-400 font-extrabold' : 'text-white'}>
                          {p.stock} u.
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                          <button
                            onClick={() => handleStockAdjust(p, -1)}
                            className="w-7 h-7 bg-slate-900 hover:bg-rose-600/30 hover:text-rose-400 text-slate-300 rounded-lg font-bold flex items-center justify-center transition-all"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs text-slate-400">Cuadrar</span>
                          <button
                            onClick={() => handleStockAdjust(p, 1)}
                            className="w-7 h-7 bg-slate-900 hover:bg-emerald-600/30 hover:text-emerald-400 text-slate-300 rounded-lg font-bold flex items-center justify-center transition-all"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <h2 className="text-xl font-bold text-white">Cargar Nuevo Producto</h2>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Funda Silicona iPhone"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Código de Barras</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Categoría *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Accesorios">Accesorios</option>
                    <option value="Librería">Librería</option>
                    <option value="Golosinas">Golosinas</option>
                    <option value="Varios">Varios</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Costo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Precio Venta ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0"
                    value={newProduct.sale_price}
                    onChange={(e) => setNewProduct({ ...newProduct, sale_price: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newProduct.name || !newProduct.sale_price}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
