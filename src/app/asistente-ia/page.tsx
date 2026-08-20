'use client';

import { useState } from 'react';
import { Bot, Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';

export default function AsistenteIAPage() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState([
    {
      title: 'Reposición Prioritaria de Stock',
      type: 'warning',
      description: 'Los productos "Auriculares In-Ear Bluetooth Pro" y "Cargador Carga Rápida 20W" tienen alta demanda esta semana y les quedan menos de 6 unidades.',
      action: 'Crear orden de compra para accesorios.',
    },
    {
      title: 'Promoción Sugerida para Golosinas',
      type: 'opportunity',
      description: 'Los alfajores y chocolates representan el 45% de las ventas adicionales en el checkout. Crear un combo "Cuaderno + Alfajor" podría aumentar el ticket medio un 18%.',
      action: 'Lanzar combo promocional.',
    },
    {
      title: 'Análisis de Margen de Ganancia',
      type: 'success',
      description: 'La categoría Accesorios de Celular cuenta con el margen bruto más alto (65%), mientras que Librería aporta volumen constante.',
      action: 'Mantener stock variado de templados y fundas.',
    },
  ]);

  const handleGenerateInsight = () => {
    setLoading(true);
    setTimeout(() => {
      setInsights((prev) => [
        {
          title: 'Optimización de Precios Recomendada',
          type: 'opportunity',
          description: 'Basado en los costos actuales y la inflación proyectada, se sugiere actualizar un +5% el precio en artículos de librería seleccionados.',
          action: 'Revisar lista de precios.',
        },
        ...prev,
      ]);
      setLoading(false);
    }, 1500);
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

        <button
          onClick={handleGenerateInsight}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analizando Datos...' : 'Actualizar Análisis'}
        </button>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/40 border border-indigo-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Inteligencia Comercial Activa
          </span>
          <h2 className="text-2xl font-bold text-white">Optimiza tus compras y maximiza las ganancias de tu local</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Tu asistente analiza diariamente los patrones de venta en Accesorios, Librería y Golosinas para darte sugerencias simples y claras.
          </p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {insights.map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {item.type === 'warning' && (
                  <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 p-2 rounded-xl">
                    <AlertTriangle className="w-5 h-5" />
                  </span>
                )}
                {item.type === 'opportunity' && (
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 p-2 rounded-xl">
                    <Lightbulb className="w-5 h-5" />
                  </span>
                )}
                {item.type === 'success' && (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 p-2 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </span>
                )}
              </div>

              <h3 className="font-bold text-white text-lg">{item.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <span className="text-xs font-semibold text-indigo-400">Sugerencia:</span>
              <p className="text-xs font-medium text-slate-200 mt-0.5">{item.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
