import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin, Product } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/lib/mockData';

// Global in-memory storage for local demo fallback
let localProducts: Product[] = [...INITIAL_PRODUCTS];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    if (isSupabaseConfigured) {
      let query = supabaseAdmin.from('products').select('*').order('name', { ascending: true });

      if (category && category !== 'Todas') {
        query = query.eq('category', category);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,barcode.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return NextResponse.json({ products: data, source: 'supabase' });
    }

    // Fallback in-memory query
    let filtered = localProducts;
    if (category && category !== 'Todas') {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.barcode.includes(q));
    }

    return NextResponse.json({ products: filtered, source: 'demo_fallback' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barcode, name, category, cost, price, stock, min_stock } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Faltan campos obligatorios (nombre, precio)' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([{ barcode, name, category, cost, price, stock, min_stock }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ product: data, source: 'supabase' });
    }

    // Fallback mock insert
    const newProduct: Product = {
      id: Date.now().toString(),
      barcode: barcode || `779999${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      category: category || 'Varios',
      cost: Number(cost) || 0,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      min_stock: Number(min_stock) || 5,
      created_at: new Date().toISOString(),
    };

    localProducts.unshift(newProduct);
    return NextResponse.json({ product: newProduct, source: 'demo_fallback' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating product' }, { status: 500 });
  }
}
