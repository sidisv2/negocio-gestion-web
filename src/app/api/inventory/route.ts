import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/lib/mockData';

let localProducts = [...INITIAL_PRODUCTS];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (isSupabaseConfigured) {
      let query = supabaseAdmin.from('products').select('*').order('name', { ascending: true });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;

      if (error) {
        console.error('Supabase inventory GET error:', error);
        return NextResponse.json({ products: [] });
      }
      return NextResponse.json({ products: data || [] });
    }

    return NextResponse.json({ products: localProducts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, cost_price, sale_price, stock, min_stock, user_id } = body;

    const parsedCost = parseFloat(cost_price || '0');
    const parsedSale = parseFloat(sale_price || '0');
    const parsedStock = parseInt(stock || '0', 10);
    const parsedMinStock = parseInt(min_stock || '5', 10);

    if (!name) {
      return NextResponse.json({ error: 'El nombre del producto es obligatorio.' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const productPayload: any = {
        name: name.trim(),
        category: category || 'Accesorios Celular',
        cost_price: isNaN(parsedCost) ? 0 : parsedCost,
        sale_price: isNaN(parsedSale) ? 0 : parsedSale,
        stock: isNaN(parsedStock) ? 0 : parsedStock,
        min_stock: isNaN(parsedMinStock) ? 5 : parsedMinStock,
      };

      if (user_id) {
        productPayload.user_id = user_id;
      }

      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([productPayload])
        .select()
        .single();

      if (error) {
        console.error('Supabase inventory POST error:', error);
        return NextResponse.json({ error: error.message || 'Error al guardar producto en Supabase' }, { status: 400 });
      }

      return NextResponse.json({ product: data });
    }

    const newProd = {
      id: Date.now().toString(),
      name: name.trim(),
      category: category || 'Accesorios Celular',
      cost_price: parsedCost,
      sale_price: parsedSale,
      stock: parsedStock,
      min_stock: parsedMinStock,
      created_at: new Date().toISOString(),
    };

    localProducts.unshift(newProd);
    return NextResponse.json({ product: newProd });
  } catch (err: any) {
    console.error('API /inventory POST error:', err);
    return NextResponse.json({ error: err.message || 'Error guardando producto' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category, cost_price, sale_price, stock, min_stock, user_id } = body;

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    if (isSupabaseConfigured) {
      const updatePayload: any = {
        name: name ? name.trim() : undefined,
        category: category || undefined,
        cost_price: cost_price !== undefined ? parseFloat(cost_price) : undefined,
        sale_price: sale_price !== undefined ? parseFloat(sale_price) : undefined,
        stock: stock !== undefined ? parseInt(stock, 10) : undefined,
        min_stock: min_stock !== undefined ? parseInt(min_stock, 10) : undefined,
      };

      // Clean undefined fields
      Object.keys(updatePayload).forEach((key) => updatePayload[key] === undefined && delete updatePayload[key]);

      let query = supabaseAdmin.from('products').update(updatePayload).eq('id', id);
      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      const { data, error } = await query.select().single();

      if (error) {
        console.error('Supabase inventory PUT error:', error);
        return NextResponse.json({ error: error.message || 'Error al actualizar producto en Supabase' }, { status: 400 });
      }

      return NextResponse.json({ product: data });
    }

    const index = localProducts.findIndex((p) => p.id === id);
    if (index !== -1) {
      localProducts[index] = { ...localProducts[index], ...body };
      return NextResponse.json({ product: localProducts[index] });
    }

    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  } catch (err: any) {
    console.error('API /inventory PUT error:', err);
    return NextResponse.json({ error: err.message || 'Error actualizando producto' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    if (isSupabaseConfigured) {
      const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
      if (error) {
        console.error('Supabase inventory DELETE error:', error);
        return NextResponse.json({ error: error.message || 'Error al eliminar producto' }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    localProducts = localProducts.filter((p) => p.id !== id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error eliminando producto' }, { status: 500 });
  }
}
