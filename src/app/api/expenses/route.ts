import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin, Expense } from '@/lib/supabase';

let localExpenses: Expense[] = [
  { id: '1', description: 'Pago Proveedor Golosinas (Arcor)', amount: 18500, category: 'Proveedor', created_at: '2026-08-20T10:15:00' },
  { id: '2', description: 'Factura Luz & Internet Local', amount: 9200, category: 'Servicios', created_at: '2026-08-19T16:30:00' },
  { id: '3', description: 'Retiro de Caja Personal', amount: 15000, category: 'Retiro de Caja', created_at: '2026-08-18T19:00:00' },
];

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseAdmin.from('expenses').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ expenses: data, source: 'supabase' });
    }
    return NextResponse.json({ expenses: localExpenses, source: 'demo_fallback' });
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
        .insert([{ description, amount: Number(amount), category: category || 'Gasto General' }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ expense: data, source: 'supabase' });
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      description,
      amount: Number(amount),
      category: category || 'Gasto General',
      created_at: new Date().toISOString(),
    };
    localExpenses.unshift(newExpense);
    return NextResponse.json({ expense: newExpense, source: 'demo_fallback' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating expense' }, { status: 500 });
  }
}
