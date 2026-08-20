import { Product } from '@/lib/supabase';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', barcode: '7791234001', name: 'Funda Silicona iPhone 13/14', category: 'Accesorios', cost_price: 1500, sale_price: 4500, cost: 1500, price: 4500, stock: 12, min_stock: 3 },
  { id: '2', barcode: '7791234002', name: 'Vidrio Templado 9D Universal', category: 'Accesorios', cost_price: 500, sale_price: 1800, cost: 500, price: 1800, stock: 25, min_stock: 5 },
  { id: '3', barcode: '7791234003', name: 'Cargador Carga Rápida Type-C 20W', category: 'Accesorios', cost_price: 2200, sale_price: 6500, cost: 2200, price: 6500, stock: 8, min_stock: 3 },
];
