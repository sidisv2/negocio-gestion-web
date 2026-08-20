'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/supabase';
import { Plus, Search, AlertTriangle, CheckCircle2, Loader2, ShoppingBag, Truck, Inbox } from 'lucide-react';

export default function InventarioGestionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [activeTab, setActiveTab] = useState<'inventario' | 'registrar_venta' | 'registrar_compra'>('inventario');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form Venta Lote
  const [selectedProductId, setSelectedProductId] = useState('');
  const [saleQuantity, setSaleQuantity] = useState(1);

  // Form Compra Mercadería / Gasto
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCat, setExpenseCat] = useState('Mercadería');

  // Form Nuevo Producto Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    barcode: '',
    name: '',
    category: 'Accesorios',
    cost: 0,
    price: 0,
    stock: 0,
    min_stock: 5,
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/inventory?category=${categoryFilter}&search=${search}`);
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
  }, [categoryFilter, search]);

  const handleQuickSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === selectedProductId);
    if (!product || submitting) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: 'Efectivo',
          items: [{ product_id: product.id, quantity: Number(saleQuantity), unit_price: product.price }],
        }),
      });

      if (res.ok) {
        setSuccessMsg(`¡Venta de ${saleQuantity}x ${product.name} registrada correctamente!`);
        setSelectedProductId('');
        setSaleQuantity(1);
        fetchInventory();
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      console.error('Error registrando venta:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount || submitting) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: expenseDesc, amount: Number(expenseAmount), category: expenseCat }),
      });

      if (res.ok) {
        setSuccessMsg(`¡Compra/Gasto de $${expenseAmount} registrado exitosamente!`);
        setExpenseDesc('');
        setExpenseAmount('');
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      console.error('Error registrando gasto:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p)));
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || submitting) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewProduct({ barcode: '', name: '', category: 'Accesorios', cost: 0, price: 0, stock: 0, min_stock: 5 });
        fetchInventory();
      }
    } catch (err) {
      console.error('Error creando producto:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Inventario & Control</h1>
          <p className="text-slate-400 text-sm mt-1">Carga sencilla de productos, compras a proveedores y ajuste de stock</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all self-start sm:self-auto text-sm"
        >
          <Plus className="w-5 h-5" /> Agregar Tu Primer Producto
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('inventario')}
          className={`pb-3 px-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'inventario'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📦 Control de Stock & Precios
        </button>
        <button
          onClick={() => setActiveTab('registrar_venta')}
          className={`pb-3 px-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'registrar_venta'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Cargar Venta Diaria
        </button>
        <button
          onClick={() => setActiveTab('registrar_compra')}
          className={`pb-3 px-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'registrar_compra'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" /> Cargar Compra / Gasto
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 font-semibold animate-pulse text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* TAB 1: INVENTARIO */}
      {activeTab === 'inventario' && (
        <div className="space-y-4">
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
                <h3 className="font-bold text-white text-lg">No hay productos registrados</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  Agrega tu primer producto para llevar el control del stock y calcular tus ganancias reales.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 text-xs inline-flex items-center gap-2 mt-2"
                >
                  <Plus className="w-4 h-4" /> Agregar Tu Primer Producto
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
                      <th className="py-4 px-5 text-center">Ajustar 1-Clic</th>
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
                          <td className="py-4 px-5 text-slate-400">${p.cost.toLocaleString('es-AR')}</td>
                          <td className="py-4 px-5 font-bold text-emerald-400">${p.price.toLocaleString('es-AR')}</td>
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
        </div>
      )}

      {/* TAB 2: CARGAR VENTA */}
      {activeTab === 'registrar_venta' && (
        <div className="max-w-xl bg-slate-900 border border-slate-800 p-7 rounded-3xl shadow-2xl space-y-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" /> Registrar Venta Rápida del Día
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              Primero debes agregar productos en el inventario para poder cargar ventas.
            </div>
          ) : (
            <form onSubmit={handleQuickSaleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Seleccionar Producto</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Elige un producto --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.price.toLocaleString('es-AR')}) - Stock: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Cantidad Vendida</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={saleQuantity}
                  onChange={(e) => setSaleQuantity(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedProductId}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all text-base flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {submitting ? 'Guardando Venta...' : 'Confirmar & Descontar Stock'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: CARGAR COMPRA / GASTO */}
      {activeTab === 'registrar_compra' && (
        <div className="max-w-xl bg-slate-900 border border-slate-800 p-7 rounded-3xl shadow-2xl space-y-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" /> Registrar Compra o Gasto
          </h2>

          <form onSubmit={handleQuickExpenseSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Concepto / Proveedor</label>
              <input
                type="text"
                placeholder="Ej. Reposición Alfajores Arcor..."
                required
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Monto ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Categoría</label>
                <select
                  value={expenseCat}
                  onChange={(e) => setExpenseCat(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Mercadería">Mercadería</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Alquiler">Alquiler</option>
                  <option value="Varios">Varios</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-amber-600/30 transition-all text-base flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {submitting ? 'Guardando Compra...' : 'Registrar Egreso'}
            </button>
          </form>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <h2 className="text-xl font-bold text-white">Cargar Nuevo Producto</h2>
            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nombre del Producto</label>
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
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Categoría</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Accesorios">Accesorios</option>
                    <option value="Librería">Librería</option>
                    <option value="Golosinas">Golosinas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Costo ($)</label>
                  <input
                    type="number"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({ ...newProduct, cost: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Precio ($)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
