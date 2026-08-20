'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/supabase';
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, CreditCard, Banknote, QrCode, Loader2 } from 'lucide-react';

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'MercadoPago' | 'Tarjeta'>('Efectivo');
  const [submitting, setSubmitting] = useState(false);
  const [saleCompleted, setSaleCompleted] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/inventory?category=${selectedCategory}&search=${search}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error cargando inventario:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, search]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0 || submitting) return;

    try {
      setSubmitting(true);
      const salePayload = {
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
        })),
      };

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salePayload),
      });

      if (res.ok) {
        setSaleCompleted(true);
        setCart([]);
        fetchInventory(); // Reload updated stock
        setTimeout(() => setSaleCompleted(false), 3000);
      }
    } catch (err) {
      console.error('Error registrando venta:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left side: Product catalog & scanner */}
      <div className="lg:col-span-7 space-y-5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Punto de Venta Rápido (POS)</h1>
          <p className="text-slate-400 text-sm mt-1">Busca o escanea productos para cobrar en 1 clic</p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o código de barras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['Todas', 'Accesorios', 'Librería', 'Golosinas'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                    {product.category}
                  </span>
                  <h3 className="font-semibold text-white mt-2 text-sm line-clamp-2 group-hover:text-indigo-300">
                    {product.name}
                  </h3>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-400">${product.price.toLocaleString('es-AR')}</span>
                  <span className="text-xs text-slate-400">Stock: {product.stock}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Shopping Cart & Checkout */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-[calc(100vh-6rem)] sticky top-6 shadow-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-400" /> Ticket de Venta
            </h2>
            <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)} ítems
            </span>
          </div>

          {/* Cart Item List */}
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No hay productos en el carrito.
                <br /> Toca cualquier producto para añadirlo.
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="flex-1 pr-2">
                    <h4 className="font-medium text-white text-sm line-clamp-1">{product.name}</h4>
                    <span className="text-xs text-slate-400">${product.price.toLocaleString('es-AR')} c/u</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700">
                      <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:text-indigo-400">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-sm font-semibold text-white">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:text-indigo-400">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button onClick={() => removeFromCart(product.id)} className="text-rose-400 hover:text-rose-300 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment & Total Section */}
        <div className="border-t border-slate-800 pt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('Efectivo')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'Efectivo'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Banknote className="w-4 h-4" /> Efectivo
              </button>

              <button
                onClick={() => setPaymentMethod('MercadoPago')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'MercadoPago'
                    ? 'bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4" /> MercadoPago
              </button>

              <button
                onClick={() => setPaymentMethod('Tarjeta')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'Tarjeta'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Tarjeta
              </button>
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between border border-slate-700">
            <span className="text-slate-400 font-medium">TOTAL A COBRAR</span>
            <span className="text-3xl font-extrabold text-emerald-400">${totalAmount.toLocaleString('es-AR')}</span>
          </div>

          {saleCompleted ? (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 p-4 rounded-2xl text-center font-bold flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 className="w-6 h-6" /> ¡Venta Registrada Exitosamente!
            </div>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-600/25 text-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {submitting ? 'PROCESANDO...' : 'COBRAR AHORA'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
