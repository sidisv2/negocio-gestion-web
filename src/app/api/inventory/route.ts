import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin, Product } from '@/lib/supabase';

let localProducts: Product[] = [];

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

      return NextResponse.json({ products: data || [] });
    }

    let filtered = localProducts;
    if (category && category !== 'Todas') {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q)));
    }

    return NextResponse.json({ products: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barcode, name, category, cost_price, sale_price, cost, price, stock, min_stock } = body;

    const finalSalePrice = sale_price ?? price ?? 0;
    const finalCostPrice = cost_price ?? cost ?? 0;

    if (!name) {
      return NextResponse.json({ error: 'Falta nombre de producto' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([{ barcode: barcode || null, name, category, cost_price: finalCostPrice, sale_price: finalSalePrice, stock: Number(stock) || 0, min_stock: Number(min_stock) || 5 }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ product: data });
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      barcode: barcode || '',
      name,
      category: category || 'Varios',
      cost_price: finalCostPrice,
      sale_price: finalSalePrice,
      cost: finalCostPrice,
      price: finalSalePrice,
      stock: Number(stock) || 0,
      min_stock: Number(min_stock) || 5,
      created_at: new Date().toISOString(),
    };

    localProducts.unshift(newProduct);
    return NextResponse.json({ product: newProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating product' }, { status: 500 });
  }
}
