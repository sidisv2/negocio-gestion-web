import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin, SaleItemInput } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, payment_method } = body as {
      items: SaleItemInput[];
      payment_method: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'MercadoPago';
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito no puede estar vacío' }, { status: 400 });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    if (isSupabaseConfigured) {
      // 1. Insert Sales Header
      const { data: saleData, error: saleError } = await supabaseAdmin
        .from('sales')
        .insert([{ total_amount: totalAmount, payment_method: payment_method || 'Efectivo' }])
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Insert Sale Items (Triggers database fn_decrement_stock_on_sale)
      const saleItemsToInsert = items.map((item) => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await supabaseAdmin.from('sale_items').insert(saleItemsToInsert);
      if (itemsError) throw itemsError;

      return NextResponse.json({ success: true, sale: saleData, source: 'supabase' });
    }

    // Demo Fallback Transaction
    return NextResponse.json({
      success: true,
      sale: {
        id: `sale-${Date.now()}`,
        total_amount: totalAmount,
        payment_method: payment_method || 'Efectivo',
        created_at: new Date().toISOString(),
      },
      source: 'demo_fallback',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error registrando la venta' }, { status: 500 });
  }
}
