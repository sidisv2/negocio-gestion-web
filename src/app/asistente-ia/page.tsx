'use client';

import { useState } from 'react';
import { Bot, Send, HelpCircle, Loader2, User, AlertCircle } from 'lucide-react';

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
  const [errorMessage, setErrorMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Hola Paola! Soy tu Asesora de Negocios Inteligente. Tengo acceso directo a tus productos, stock y ventas registradas en tu base de datos. ¿En qué te puedo ayudar hoy?',
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    setErrorMessage('');
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || 'Ocurrió un error al comunicarse con la Asesora IA.');
        return;
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply || 'No se recibió respuesta del modelo.',
        timestamp: data.timestamp || new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Error enviando mensaje a Asistente IA:', err);
      setErrorMessage('Error de conexión al servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-indigo-400" /> Asesora de Negocios Conversacional
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Respuestas en tiempo real respaldadas por tu base de datos e impulsadas por OpenRouter API
        </p>
      </div>

      {/* Predefined Quick Questions */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-indigo-400" /> Preguntas Sugeridas
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

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {errorMessage}
        </div>
      )}

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
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Consultando Supabase y generando respuesta...
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
            placeholder="Escribe tu mensaje (ej. 'hola me llamo Paola' o consulta sobre stock)..."
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
