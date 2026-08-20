import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin, Expense } from '@/lib/supabase';

let localExpenses: Expense[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (isSupabaseConfigured) {
      let query = supabaseAdmin.from('expenses').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ expenses: data || [] });
    }
    return NextResponse.json({ expenses: localExpenses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, amount, category, product_id, quantity_purchased, user_id } = body;

    const parsedAmount = parseFloat(amount || '0');
    const parsedQty = parseInt(quantity_purchased || '0', 10);

    if (!description || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Descripción y monto mayor a 0 requeridos.' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const expensePayload: any = {
        description: description.trim(),
        amount: parsedAmount,
        category: category || 'varios',
      };

      if (user_id) expensePayload.user_id = user_id;
      if (category === 'mercaderia' && product_id) {
        expensePayload.product_id = product_id;
        expensePayload.quantity_purchased = parsedQty > 0 ? parsedQty : 1;
      }

      // 1. Insert Expense
      const { data, error } = await supabaseAdmin
        .from('expenses')
        .insert([expensePayload])
        .select()
        .single();

      if (error) {
        console.error('Supabase error inserting expense:', error);
        return NextResponse.json({ error: error.message || 'Error al registrar el egreso' }, { status: 400 });
      }

      // 2. Explicit Stock Increment if purchase category and product linked
      if (category === 'mercaderia' && product_id && parsedQty > 0) {
        const { data: currentProd } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', product_id)
          .single();

        if (currentProd) {
          const newStock = (currentProd.stock || 0) + parsedQty;
          await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', product_id);
        }
      }

      return NextResponse.json({ expense: data });
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      description,
      amount: parsedAmount,
      category: category || 'varios',
      product_id: product_id || undefined,
      quantity_purchased: parsedQty || undefined,
      created_at: new Date().toISOString(),
    };

    localExpenses.unshift(newExpense);
    return NextResponse.json({ expense: newExpense });
  } catch (err: any) {
    console.error('API /expenses error:', err);
    return NextResponse.json({ error: err.message || 'Error al guardar egreso' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    if (isSupabaseConfigured) {
      const { error } = await supabaseAdmin.from('expenses').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    localExpenses = localExpenses.filter((e) => e.id !== id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error eliminando movimiento' }, { status: 500 });
  }
}
