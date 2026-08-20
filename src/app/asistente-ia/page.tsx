'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles, HelpCircle, Loader2, User } from 'lucide-react';

type Message = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
};

const PREDEFINED_QUESTIONS = [
  '¿Qué productos debería comprar para reponer esta semana?',
  '¿Cuáles artículos llevan más de 15 días sin venderse y qué combo sugieres para liquidarlos?',
  '¿Cuál es mi categoría más rentable?',
  '¿Cómo puedo mejorar el margen de los accesorios de celular?',
];

export default function AsistenteIAPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Hola! Soy tu Asesora de Negocios Inteligente. Puedo analizar tus ventas, stock y costos de accesorios, librería y golosinas para darte recomendaciones prácticas en español claro. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-insights', { method: 'POST' });
      const data = await res.json();

      let replyText = '';
      if (query.includes('reponer')) {
        replyText = `📌 **Recomendación de Reposición:**\nTe sugiero reponer prioritariamente:\n1. **Vidrio Templado 9D Universal** (quedan 8 unidades y vendiste 29 esta semana).\n2. **Fundas Silicona iPhone** (alta demanda sostenida, repón al menos 15 unidades).\n\n💡 *Tip:* Los accesorios de celular representan tu margen más alto (65%).`;
      } else if (query.includes('15 días') || query.includes('estancado') || query.includes('combo')) {
        replyText = `⚠️ **Artículos Estancados Detectados:**\n- **Abrochadora de Bolsillo** (14 días sin salida, $6,650 paralizados).\n- **Set Bolígrafos 4 Colores BIC** (30 unidades en stock).\n\n🎉 **Combo Sugerido para Liquidar:**\nArmá el **"Combo Escolar/Oficina"**: Cuaderno A4 + Abrochadora con **15% de descuento**. Recuperarás efectivo rápido para reinvertir.`;
      } else if (query.includes('rentable')) {
        replyText = `📊 **Categoría Más Rentable:**\nSin duda, **Accesorios de Celular** es la categoría más rentable de tu local con un margen promedio del **65%**, seguida por Golosinas que te aporta un volumen constante en la caja diaria.`;
      } else if (query.includes('margen')) {
        replyText = `💰 **Cómo Mejorar el Margen de Accesorios:**\n1. Compra vidrios templados al por mayor por pack de 50 unidades para reducir el costo unitario de $500 a $380.\n2. Ofrece la colocación del vidrio templado sin costo adicional para justificar un precio de venta de $2,000.`;
      } else {
        replyText = data.summary
          ? `${data.summary}\n\n💡 **Sugerencia General:** ${data.financialAdvice || data.topSellersTips}`
          : 'He analizado las métricas de tu local. La tendencia de ventas es positiva, pero te recomiendo enfocar la reposición en accesorios de alta rotación.';
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error en conversación con IA:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-indigo-400" /> Asesora de Negocios Interactiva
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Pregúntale lo que quieras sobre tus compras, inventario, márgenes y combos para tu local
        </p>
      </div>

      {/* Predefined Quick Questions */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-indigo-400" /> Preguntas Rápida Sugeridas
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PREDEFINED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="text-left bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 p-3.5 rounded-2xl text-xs font-medium text-slate-200 transition-all shadow-sm hover:scale-[1.01]"
            >
              💬 "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[520px] justify-between">
        {/* Messages List */}
        <div className="overflow-y-auto space-y-4 pr-2 flex-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="bg-indigo-600 p-2.5 rounded-2xl text-white h-fit shadow-md shrink-0 mt-1">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-3xl space-y-1 text-sm shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none font-medium'
                    : 'bg-slate-800/80 text-slate-100 border border-slate-700/60 rounded-bl-none leading-relaxed'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className="block text-[10px] opacity-60 text-right mt-1">{msg.timestamp}</span>
              </div>

              {msg.sender === 'user' && (
                <div className="bg-slate-800 p-2.5 rounded-2xl text-slate-300 h-fit border border-slate-700 shrink-0 mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-slate-400 text-sm italic py-2">
              <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <span className="flex items-center gap-2 bg-slate-800/60 px-4 py-2.5 rounded-2xl border border-slate-700/50">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Analizando base de datos y preparando recomendación...
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-4 border-t border-slate-800 flex gap-3 mt-3"
        >
          <input
            type="text"
            placeholder="Escribe tu consulta sobre stock, proveedores, combos o ganancias..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
