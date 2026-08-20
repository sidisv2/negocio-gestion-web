'use client';

import { useState, useEffect } from 'react';
import { Product, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Search, Plus, Trash2, Edit, AlertTriangle, Package, Loader2, CheckCircle2, AlertCircle, Percent, PlusCircle, MinusCircle, Smartphone, Zap, BookOpen, Candy, ShieldCheck, Wrench, Box } from 'lucide-react';

const CATEGORIES = [
  'Accesorios Celular',
  'Electrónica & Audio',
  'Librería & Papelería',
  'Chucherías / Golosinas',
  'Fundas & Vidrios Templados',
  'Servicio Técnico / Reparaciones',
  'Varios / Otros',
];

function CategoryBadge({ category }: { category: string }) {
  switch (category) {
    case 'Accesorios Celular':
      return (
        <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 w-fit">
          <Smartphone className="w-3.5 h-3.5" /> Accesorios Celular
        </span>
      );
    case 'Electrónica & Audio':
      return (
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 w-fit">
          <Zap className="w-3.5 h-3.5" /> Electrónica & Audio
        </span>
      );
    case 'Librería & Papelería':
      return (
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 w-fit">
          <BookOpen className="w-3.5 h-3.5" /> Librería & Papelería
        </span>
      );
    case 'Chucherías / Golosinas':
      return (
        <span className="bg-pink-500/10 text-pink-400 border border-pink-500/30 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 w-fit">
          <Candy className="w-3.5 h-3.5" /> Golosinas
        </span>
      );
    case 'Fundas & Vidrios Templados':
      return (
        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 w-fit">
          <ShieldCheck className="w-3.5 h-3.5" /> Fundas & Vidrios
        </span>
      );
    case 'Servicio Técnico / Reparaciones':
      return (
        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 w-fit">
          <Wrench className="w-3.5 h-3.5" /> Servicio Técnico
        </span>
      );
    default:
      return (
        <span className="bg-slate-700/30 text-slate-300 border border-slate-600/30 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 w-fit">
          <Box className="w-3.5 h-3.5" /> {category}
        </span>
      );
  }
}

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Accesorios Celular',
    custom_category: '',
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      } else {
        const res = await fetch('/api/inventory');
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentUser]);

  const handleOpenModal = (product?: Product) => {
    setToastMessage(null);
    if (product) {
      setEditingProduct(product);
      const isCustomCat = !CATEGORIES.includes(product.category);
      setFormData({
        name: product.name,
        category: isCustomCat ? 'Varios / Otros' : product.category,
        custom_category: isCustomCat ? product.category : '',
        cost_price: (product.cost_price ?? product.cost ?? '').toString(),
        sale_price: (product.sale_price ?? product.price ?? '').toString(),
        stock: product.stock.toString(),
        min_stock: product.min_stock.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'Accesorios Celular',
        custom_category: '',
        cost_price: '',
        sale_price: '',
        stock: '',
        min_stock: '5',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(null);
    setSubmitting(true);

    try {
      // 1. Obtain user session guaranteed if using client
      let activeUserId = currentUser?.id;
      if (isSupabaseConfigured && !activeUserId) {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          activeUserId = authData.user.id;
          setCurrentUser(authData.user);
        }
      }

      const parsedCost = parseFloat(formData.cost_price || '0');
      const parsedSale = parseFloat(formData.sale_price || '0');
      const parsedStock = parseInt(formData.stock || '0', 10);
      const parsedMinStock = parseInt(formData.min_stock || '0', 10);

      const finalCategory =
        formData.category === 'Varios / Otros' && formData.custom_category.trim() !== ''
          ? formData.custom_category.trim()
          : formData.category;

      const productPayload: any = {
        name: formData.name.trim(),
        category: finalCategory,
        cost_price: isNaN(parsedCost) ? 0 : parsedCost,
        sale_price: isNaN(parsedSale) ? 0 : parsedSale,
        stock: isNaN(parsedStock) ? 0 : parsedStock,
        min_stock: isNaN(parsedMinStock) ? 5 : parsedMinStock,
      };

      if (activeUserId) {
        productPayload.user_id = activeUserId;
      }

      // Perform insertion/update via Supabase client or API Route with explicit user_id
      if (isSupabaseConfigured && activeUserId) {
        if (editingProduct) {
          const { error } = await supabase
            .from('products')
            .update(productPayload)
            .eq('id', editingProduct.id)
            .eq('user_id', activeUserId);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('products')
            .insert([productPayload]);

          if (error) throw error;
        }
      } else {
        // Fallback API route call
        const payload = editingProduct ? { ...productPayload, id: editingProduct.id } : productPayload;
        const res = await fetch('/api/inventory', {
          method: editingProduct ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'Ocurrió un error al guardar el producto');
      }

      setToastMessage({
        type: 'success',
        text: editingProduct ? '✅ Producto actualizado correctamente' : '✅ Producto agregado correctamente',
      });

      setIsModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setToastMessage({ type: 'error', text: `❌ ${err.message || 'Error al conectar con la base de datos'}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStockAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p)));

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', product.id);
        if (error) throw error;
      } else {
        const res = await fetch('/api/inventory', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...product, stock: newStock }),
        });
        if (!res.ok) throw new Error('Error al actualizar el stock');
      }
    } catch (err) {
      console.error('Error ajustando stock:', err);
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto del inventario?')) return;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
      } else {
        const res = await fetch(`/api/inventory?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'No se pudo eliminar');
      }

      setToastMessage({ type: 'success', text: '✅ Producto eliminado' });
      await fetchProducts();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: `❌ ${err.message}` });
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const modalCostNum = parseFloat(formData.cost_price || '0');
  const modalSaleNum = parseFloat(formData.sale_price || '0');
  const calculatedMargin =
    modalCostNum > 0 && modalSaleNum > 0
      ? (((modalSaleNum - modalCostNum) / modalCostNum) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-sm font-bold shadow-2xl backdrop-blur-md animate-pulse ${
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

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-indigo-400" /> Inventario de Productos
          </h1>
          <p className="text-slate-400 text-sm mt-1">Control visual de catálogo, stock mínimo y márgenes en ARS ($)</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all text-sm"
        >
          <Plus className="w-5 h-5" /> Agregar Producto
        </button>
      </div>

      {/* Instant Search Bar & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-indigo-400" />
          <input
            type="text"
            placeholder="🔍 Búsqueda rápida en vivo por nombre de producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-md"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold backdrop-blur-md"
        >
          <option value="Todas">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Products Glassmorphism Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No hay productos registrados</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Tu inventario está vacío. Registra tu primer producto para comenzar a controlar tus ventas.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold px-5 py-3 rounded-2xl text-sm shadow-lg shadow-violet-500/25"
            >
              <Plus className="w-4 h-4" /> ➕ Agregar tu primer producto
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4 pl-6">Producto / Categoría</th>
                  <th className="p-4">Costo ARS</th>
                  <th className="p-4">Precio Venta ARS</th>
                  <th className="p-4">Margen %</th>
                  <th className="p-4">Estado & Stock</th>
                  <th className="p-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => {
                  const cost = p.cost_price ?? p.cost ?? 0;
                  const price = p.sale_price ?? p.price ?? 0;
                  const marginPct = cost > 0 ? (((price - cost) / cost) * 100).toFixed(1) : '0.0';

                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = !isOutOfStock && p.stock <= p.min_stock;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 pl-6 space-y-1.5">
                        <div className="font-extrabold text-white text-base">{p.name}</div>
                        <CategoryBadge category={p.category} />
                      </td>
                      <td className="p-4 font-medium text-slate-400">${cost.toLocaleString('es-AR')}</td>
                      <td className="p-4 font-bold text-emerald-400">${price.toLocaleString('es-AR')}</td>
                      <td className="p-4 font-extrabold text-indigo-400">
                        <span className="bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
                          +{marginPct}%
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {isOutOfStock ? (
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg flex items-center gap-1 w-fit animate-pulse">
                              🔴 AGOTADO (0 u.)
                            </span>
                          ) : isLowStock ? (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg flex items-center gap-1 w-fit">
                              🟡 STOCK BAJO ({p.stock} u.)
                            </span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg flex items-center gap-1 w-fit">
                              🟢 OPTIMO ({p.stock} u.)
                            </span>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleQuickStockAdjust(p, -1)}
                              className="text-slate-400 hover:text-rose-400 active:scale-90 transition-transform"
                            >
                              <MinusCircle className="w-5 h-5" />
                            </button>
                            <span className="font-extrabold text-white text-xs w-8 text-center">{p.stock} u.</span>
                            <button
                              onClick={() => handleQuickStockAdjust(p, 1)}
                              className="text-slate-400 hover:text-emerald-400 active:scale-90 transition-transform"
                            >
                              <PlusCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="p-2 text-slate-400 hover:text-indigo-400 rounded-xl hover:bg-slate-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-extrabold text-white">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder='Ej. "Funda Silicona iPhone 13"'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Categoría *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold mb-2"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {formData.category === 'Varios / Otros' && (
                  <input
                    type="text"
                    placeholder="Escribe tu categoría personalizada..."
                    value={formData.custom_category}
                    onChange={(e) => setFormData({ ...formData, custom_category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3">
                <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider block">
                  💰 Configuración de Precios ($ ARS)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">💵 Precio de Costo *</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      placeholder="0.00"
                      required
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">🏷️ Precio de Venta *</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      placeholder="0.00"
                      required
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-emerald-400 text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {calculatedMargin !== null && (
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Percent className="w-4 h-4 text-indigo-400" /> Margen Estimado:
                    </span>
                    <span className={`text-sm font-extrabold ${Number(calculatedMargin) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      +{calculatedMargin}% de ganancia limpia
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Stock Actual *</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Stock Mínimo *</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-5 py-3 rounded-2xl text-slate-400 hover:text-white font-bold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-lg shadow-violet-500/25 flex items-center gap-2"
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
