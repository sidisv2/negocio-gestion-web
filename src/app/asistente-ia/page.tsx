'use client';

import { useState, useEffect } from 'react';
import { AIInsightCard } from '@/lib/supabase';
import { Bot, Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

export default function AsistenteIAPage() {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [insights, setInsights] = useState<AIInsightCard[]>([
    {
      title: 'Lo que Mejor Funciona',
      type: 'success',
      description: 'Las Fundas de Silicona y los Alfajores son tus productos estrella de la semana, representando el 40% de los ingresos totales.',
      action: 'Asegurar stock suficiente de fundas para el fin de semana.',
    },
    {
      title: 'Alerta de Stock Estancado',
      type: 'warning',
      description: 'Las Abrochadoras de Bolsillo llevan más de 10 días sin rotación significativa y ocupan espacio en el mostrador.',
      action: 'Crear un combo promocional "Cuaderno + Abrochadora" con 15% de descuento.',
    },
    {
      title: 'Estado del Margen & Caja',
      type: 'opportunity',
      description: 'Tus egresos de caja ($42,700) están perfectamente controlados frente a tus ingresos ($503,000), dejando un margen del 42%.',
      action: 'Mantener el control de compras a proveedores por categoría.',
    },
    {
      title: 'Acción Recomendada para la Semana',
      type: 'action',
      description: 'Aumentar en un 10% el pedido de vidrios templados universales para capitalizar el alto flujo del punto de venta.',
      action: 'Revisar pedido con proveedor de accesorios celular.',
    },
  ]);

  const handleFetchInsights = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai-insights', { method: 'POST' });
      const data = await res.json();
      if (data.cards && data.cards.length > 0) {
        setInsights(data.cards);
        if (data.cached_at) setLastUpdated(data.cached_at);
      }
    } catch (err) {
      console.error('Error invocando motor Gemini AI:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-400" /> Asistente IA de Negocio
          </h1>
          <p className="text-slate-400 text-sm mt-1">Recomendaciones inteligentes impulsadas por Gemini API</p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Actualizado {lastUpdated}
            </span>
          )}
          <button
            onClick={handleFetchInsights}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analizando Datos con Gemini...' : 'Generar Nuevo Análisis con IA'}
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/40 border border-indigo-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Inteligencia Comercial Activa
          </span>
          <h2 className="text-2xl font-bold text-white">Optimiza tus compras y maximiza las ganancias de tu local</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Tu asistente analiza diariamente los patrones de venta en Accesorios, Librería y Golosinas para darte sugerencias simples y claras sin tecnicismos.
          </p>
        </div>
      </div>

      {/* Insights Grid with Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl animate-pulse space-y-4">
              <div className="w-10 h-10 bg-slate-800 rounded-xl"></div>
              <div className="h-5 bg-slate-800 rounded w-3/4"></div>
              <div className="h-16 bg-slate-800/60 rounded"></div>
              <div className="h-4 bg-slate-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {insights.map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {item.type === 'warning' && (
                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 p-2.5 rounded-xl">
                      <AlertTriangle className="w-5 h-5" />
                    </span>
                  )}
                  {item.type === 'opportunity' && (
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 p-2.5 rounded-xl">
                      <Lightbulb className="w-5 h-5" />
                    </span>
                  )}
                  {item.type === 'success' && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 p-2.5 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                    </span>
                  )}
                  {item.type === 'action' && (
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 p-2.5 rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-lg leading-tight">{item.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-indigo-400">Acción sugerida:</span>
                <p className="text-xs font-medium text-slate-200 mt-0.5">{item.action}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
