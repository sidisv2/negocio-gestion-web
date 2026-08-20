import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin, Product } from '@/lib/supabase';

let localProducts: Product[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const userId = searchParams.get('userId') || '';

    if (isSupabaseConfigured) {
      let query = supabaseAdmin.from('products').select('*').order('name', { ascending: true });

      if (userId) {
        query = query.eq('user_id', userId);
      }
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
    const { barcode, name, category, cost_price, sale_price, stock, min_stock, user_id } = body;

    const parsedCost = parseFloat(cost_price || '0');
    const parsedSale = parseFloat(sale_price || '0');
    const parsedStock = parseInt(stock || '0', 10);
    const parsedMinStock = parseInt(min_stock || '5', 10);

    if (!name || isNaN(parsedSale)) {
      return NextResponse.json({ error: 'Falta el nombre o precio de venta válido' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const productPayload: any = {
        name,
        category: category || 'Varios',
        cost_price: parsedCost,
        sale_price: parsedSale,
        stock: parsedStock,
        min_stock: parsedMinStock,
      };

      if (barcode) productPayload.barcode = barcode;
      if (user_id) productPayload.user_id = user_id;

      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([productPayload])
        .select()
        .single();

      if (error) {
        console.error('Supabase error inserting product:', error);
        return NextResponse.json({ error: error.message || 'Error al guardar en Supabase' }, { status: 400 });
      }

      return NextResponse.json({ product: data });
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      barcode: barcode || '',
      name,
      category: category || 'Varios',
      cost_price: parsedCost,
      sale_price: parsedSale,
      cost: parsedCost,
      price: parsedSale,
      stock: parsedStock,
      min_stock: parsedMinStock,
      created_at: new Date().toISOString(),
    };

    localProducts.unshift(newProduct);
    return NextResponse.json({ product: newProduct });
  } catch (err: any) {
    console.error('API /inventory error:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
