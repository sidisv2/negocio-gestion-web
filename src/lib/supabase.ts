import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type Product = {
  id: string;
  barcode: string;
  name: string;
  category: 'Accesorios' | 'Librería' | 'Golosinas' | 'Varios';
  cost: number;
  price: number;
  stock: number;
  min_stock: number;
  created_at?: string;
};

export type Sale = {
  id: string;
  total_amount: number;
  payment_method: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'MercadoPago';
  created_at: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: 'Proveedor' | 'Servicios' | 'Retiro de Caja' | 'Gasto General';
  created_at: string;
};
