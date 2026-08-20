import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Is Supabase configured with real environment credentials?
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-supabase-project.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key'
);

// Client-side & Public Supabase Client
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);

// Admin Service Role Client (Server-side only)
export const supabaseAdmin = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured && supabaseServiceKey ? supabaseServiceKey : 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// TypeScript Models
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
  updated_at?: string;
};

export type SaleItemInput = {
  product_id: string;
  quantity: number;
  unit_price: number;
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

export type AIInsightCard = {
  title: string;
  type: 'success' | 'warning' | 'opportunity' | 'action';
  description: string;
  action: string;
};

export type AIInsightsResponse = {
  cards: AIInsightCard[];
  cached_at?: string;
};
