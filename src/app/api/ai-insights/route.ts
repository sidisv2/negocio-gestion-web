import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { messages = [] } = body;

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || '';

    if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey === 'your-openrouter-api-key') {
      return NextResponse.json(
        { error: 'Falta la API Key (OPENROUTER_API_KEY o GEMINI_API_KEY) en las variables de entorno.' },
        { status: 500 }
      );
    }

    let productsData: any[] = [];
    let salesData: any[] = [];
    let expensesData: any[] = [];
    let isRealDataPresent = false;

    if (isSupabaseConfigured) {
      const [prodRes, salesRes, expRes] = await Promise.all([
        supabaseAdmin.from('products').select('*'),
        supabaseAdmin.from('sales').select('*, sale_items(*)'),
        supabaseAdmin.from('expenses').select('*'),
      ]);

      productsData = prodRes.data || [];
      salesData = salesRes.data || [];
      expensesData = expRes.data || [];

      if (productsData.length > 0 || salesData.length > 0 || expensesData.length > 0) {
        isRealDataPresent = true;
      }
    }

    if (!isRealDataPresent && productsData.length === 0) {
      productsData = INITIAL_PRODUCTS;
    }

    const supabaseContextString = `
[INFORMACIÓN REAL DE LA TIENDA DE PAOLA DESDE SUPABASE]
- Moneda Oficial: Pesos Argentinos (ARS, $)
- Estado de Datos: ${isRealDataPresent ? 'Datos reales consultados desde Supabase' : 'Datos iniciales de demostración'}
- Total Productos en Inventario: ${productsData.length}
- Lista de Productos, Stock y Precios en ARS:
${JSON.stringify(
  productsData.map((p) => ({
    nombre: p.name,
    categoria: p.category,
    precio_venta_ars: p.sale_price || p.price,
    costo_ars: p.cost_price || p.cost,
    stock: p.stock,
    min_stock: p.min_stock,
  })),
  null,
  2
)}

- Historial Reciente de Ventas en ARS:
${salesData.length > 0 ? JSON.stringify(salesData.slice(0, 10), null, 2) : 'Aún no hay ventas registradas en la base de datos.'}

- Historial Reciente de Egresos/Gastos en ARS:
${expensesData.length > 0 ? JSON.stringify(expensesData.slice(0, 10), null, 2) : 'Aún no hay gastos registrados en la base de datos.'}
`;

    const systemPrompt = `Eres la asesora de negocios personal de Paola en su tienda minorista en Argentina (accesorios de celular, librería y golosinas/chucherías).
El negocio opera exclusivamente en Argentina. Todas las cifras monetarias están expresadas en Pesos Argentinos (ARS, $). Analiza los montos, márgenes y costos exclusivamente bajo el contexto económico de Argentina y en Pesos Argentinos (ARS).

REGLAS DE INTERACCIÓN:
1. Responde de forma cálida, cercana, sin tecnicismos y basada en lo que Paola o el usuario pregunte.
2. Formatea siempre los precios usando la moneda en Pesos Argentinos (ej: $ 15.000 ARS).
3. Si el usuario te hace un saludo o charla amigable, responde de manera humana y conversacional.
4. Si pregunta sobre métricas, stock, reposición o combos, consulta los datos de Supabase y dale sugerencias sencillas y realistas para el mercado argentino.
5. Si la base de datos no tiene ventas o productos registrados aún, indícaselo amablemente: "Aún no tienes ventas/productos registrados en tu base de datos".

CONTEXTO DE DATOS SUPABASE:
${supabaseContextString}
`;

    const openRouterMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://negocio-gestion-web.vercel.app',
        'X-Title': 'Negocio Gestion Web - Asesora IA',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: openRouterMessages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter API error response:', errText);
      return NextResponse.json({ error: `Error en OpenRouter API: ${errText}` }, { status: 500 });
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content || 'No pude procesar la respuesta en este momento.';

    return NextResponse.json({
      reply: replyText,
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (err: any) {
    console.error('Error en /api/ai-insights:', err);
    return NextResponse.json({ error: err.message || 'Error en endpoint de Asistente IA' }, { status: 500 });
  }
}
