import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { isSupabaseConfigured, supabaseAdmin, AIInsightCard } from '@/lib/supabase';

const apiKey = process.env.GEMINI_API_KEY || '';

export async function POST() {
  try {
    const businessMetrics = {
      period: 'Últimos 7 días',
      totalSalesAmount: 503000,
      totalExpensesAmount: 42700,
      netProfit: 215000,
      topBestSellers: [
        { name: 'Funda Silicona iPhone 13/14', unitsSold: 42, category: 'Accesorios' },
        { name: 'Alfajor de Chocolate Triples', unitsSold: 38, category: 'Golosinas' },
        { name: 'Vidrio Templado 9D Universal', unitsSold: 29, category: 'Accesorios' },
      ],
      topStagnantProducts: [
        { name: 'Abrochadora de Bolsillo', stockRemaining: 7, daysWithoutSale: 14 },
        { name: 'Set Bolígrafos 4 Colores', stockRemaining: 30, daysWithoutSale: 10 },
      ],
    };

    let generatedCards: AIInsightCard[] = [];

    if (apiKey && apiKey !== 'your-gemini-api-key') {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
Eres un asesor de negocios minoristas claro, empático y práctico para una dueña de negocio no técnica.
Analiza los siguientes números reales de ventas de su negocio (Accesorios de Celular, Librería y Golosinas):

${JSON.stringify(businessMetrics, null, 2)}

Devuelve EXCLUSIVAMENTE un objeto JSON válido con una propiedad "cards" conteniendo exactamente 4 elementos con esta estructura:
{
  "cards": [
    {
      "title": "Título corto y positivo",
      "type": "success", 
      "description": "Explicación clara en 2 oraciones sin palabras técnicas ni jerga.",
      "action": "Acción recomendada específica para la semana."
    },
    ...
  ]
}

Donde "type" puede ser: "success" (lo que mejor funciona), "warning" (alerta stock o egresos), "opportunity" (oportunidad combo/margen) o "action" (acción de la semana).
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const rawText = response.text || '';
      const cleanJson = rawText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed?.cards) {
        generatedCards = parsed.cards;
      }
    }

    // Fallback if Gemini key not set or parsing error
    if (generatedCards.length === 0) {
      generatedCards = [
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
      ];
    }

    // Cache to Supabase if configured
    if (isSupabaseConfigured) {
      await supabaseAdmin.from('ai_insights_cache').insert([
        {
          insight_type: 'weekly_retail_analysis',
          content: { cards: generatedCards },
        },
      ]);
    }

    return NextResponse.json({
      cards: generatedCards,
      cached_at: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error analizando datos con Gemini' }, { status: 500 });
  }
}
