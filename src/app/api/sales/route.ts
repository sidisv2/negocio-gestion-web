import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin, SaleItemInput } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, payment_method, user_id, notes } = body as {
      items: SaleItemInput[];
      payment_method: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'MercadoPago';
      user_id?: string;
      notes?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito de venta no puede estar vacío.' }, { status: 400 });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    if (isSupabaseConfigured) {
      // 1. Insert Sales Header with user_id
      const salePayload: any = {
        total_amount: totalAmount,
        payment_method: payment_method || 'Efectivo',
        notes: notes || null,
      };
      if (user_id) salePayload.user_id = user_id;

      const { data: saleData, error: saleError } = await supabaseAdmin
        .from('sales')
        .insert([salePayload])
        .select()
        .single();

      if (saleError) {
        console.error('Supabase error inserting sale header:', saleError);
        return NextResponse.json({ error: saleError.message || 'Error al guardar la venta' }, { status: 400 });
      }

      // 2. Insert Sale Items (Triggers database fn_decrement_stock_on_sale or manually update stock)
      const saleItemsToInsert = items.map((item) => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_cost: item.unit_cost || 0,
      }));

      const { error: itemsError } = await supabaseAdmin.from('sale_items').insert(saleItemsToInsert);
      if (itemsError) {
        console.error('Supabase error inserting sale items:', itemsError);
        return NextResponse.json({ error: itemsError.message || 'Error al guardar los items de la venta' }, { status: 400 });
      }

      // 3. Fallback/Explicit Stock Decrement for consistency
      for (const item of items) {
        const { data: currentProd } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (currentProd) {
          const newStock = Math.max(0, (currentProd.stock || 0) - item.quantity);
          await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', item.product_id);
        }
      }

      return NextResponse.json({ success: true, sale: saleData });
    }

    return NextResponse.json({
      success: true,
      sale: {
        id: `sale-${Date.now()}`,
        total_amount: totalAmount,
        payment_method: payment_method || 'Efectivo',
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('API /sales error:', err);
    return NextResponse.json({ error: err.message || 'Error al procesar la venta' }, { status: 500 });
  }
}
