import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin, Expense } from '@/lib/supabase';

// In-memory fallback initialized EMPTY (No mock data)
let localExpenses: Expense[] = [];

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseAdmin.from('expenses').select('*').order('created_at', { ascending: false });
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
    const { description, amount, category } = body;

    if (!description || !amount) {
      return NextResponse.json({ error: 'Descripción y monto requeridos' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseAdmin
        .from('expenses')
        .insert([{ description, amount: Number(amount), category: category || 'Varios' }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ expense: data });
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      description,
      amount: Number(amount),
      category: category || 'Varios',
      created_at: new Date().toISOString(),
    };
    localExpenses.unshift(newExpense);
    return NextResponse.json({ expense: newExpense });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating expense' }, { status: 500 });
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
