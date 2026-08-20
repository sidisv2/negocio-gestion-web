import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || '';

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

    let resultData = null;

    if (apiKey && apiKey !== 'your-gemini-api-key' && apiKey !== 'your-openrouter-api-key') {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://negocio-gestion-web.vercel.app',
          'X-Title': 'Negocio Gestion Web',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `Eres un asesor de negocios minoristas claro, empático y práctico para una dueña de negocio no técnica.
Analiza las métricas del negocio y devuelve EXCLUSIVAMENTE un objeto JSON válido con las siguientes 4 claves:
- "summary": Resumen general del estado comercial en 2 oraciones sencillas.
- "topSellersTips": Consejo para aprovechar los productos estrella y mantener su stock.
- "deadStockAlerts": Alerta de productos estancados y estrategia para liquidarlos (ej. combos o descuentos).
- "financialAdvice": Consejo práctico sobre margen, caja y egresos.`,
            },
            {
              role: 'user',
              content: `Métricas reales del negocio: ${JSON.stringify(businessMetrics, null, 2)}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        try {
          const cleanJson = content.replace(/```json|```/g, '').trim();
          resultData = JSON.parse(cleanJson);
        } catch (e) {
          console.error('Error parseando JSON de OpenRouter:', e);
        }
      } else {
        console.error('OpenRouter HTTP error:', await response.text());
      }
    }

    // Fallback estructurado si no hay API key o falla la API
    if (!resultData) {
      resultData = {
        summary: 'Tu negocio muestra un excelente nivel de ventas esta semana con una rentabilidad neta sólida del 42%.',
        topSellersTips: 'Las Fundas de Silicona y los Alfajores son tus productos estrella. Mantén siempre stock visible cerca de la caja.',
        deadStockAlerts: 'Las Abrochadoras de Bolsillo llevan 14 días sin venderse. Armá un combo "Cuaderno + Abrochadora" con 15% de descuento.',
        financialAdvice: 'Tus egresos ($42,700) representan solo un 8.4% de las ventas. Mantén ese ritmo de control de gastos.',
      };
    }

    // Adaptación para tarjetas de la interfaz manteniendo compatibilidad
    const cards = [
      {
        title: 'Resumen General',
        type: 'success' as const,
        description: resultData.summary,
        action: 'Revisar metas de venta semanales.',
      },
      {
        title: 'Productos Estrella',
        type: 'opportunity' as const,
        description: resultData.topSellersTips,
        action: 'Asegurar reposición con proveedor.',
      },
      {
        title: 'Alerta de Stock Estancado',
        type: 'warning' as const,
        description: resultData.deadStockAlerts,
        action: 'Lanzar combo promocional.',
      },
      {
        title: 'Consejo Financiero & Caja',
        type: 'action' as const,
        description: resultData.financialAdvice,
        action: 'Mantener control estricto de egresos.',
      },
    ];

    if (isSupabaseConfigured) {
      await supabaseAdmin.from('ai_insights_cache').insert([
        {
          insight_type: 'openrouter_weekly_analysis',
          content: { ...resultData, cards },
        },
      ]);
    }

    return NextResponse.json({
      summary: resultData.summary,
      topSellersTips: resultData.topSellersTips,
      deadStockAlerts: resultData.deadStockAlerts,
      financialAdvice: resultData.financialAdvice,
      cards,
      cached_at: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error en endpoint OpenRouter AI' }, { status: 500 });
  }
}
