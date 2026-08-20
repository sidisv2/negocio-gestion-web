import { Product } from '@/lib/supabase';

// Mock in-memory database for offline preview / fallback before Supabase credentials are configured
export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', barcode: '7791234001', name: 'Funda Silicona iPhone 13/14', category: 'Accesorios', cost: 1500, price: 4500, stock: 12, min_stock: 3 },
  { id: '2', barcode: '7791234002', name: 'Vidrio Templado 9D Universal', category: 'Accesorios', cost: 500, price: 1800, stock: 25, min_stock: 5 },
  { id: '3', barcode: '7791234003', name: 'Cargador Carga Rápida Type-C 20W', category: 'Accesorios', cost: 2200, price: 6500, stock: 8, min_stock: 3 },
  { id: '4', barcode: '7791234004', name: 'Cable USB-C a Lightning 1m', category: 'Accesorios', cost: 800, price: 2500, stock: 15, min_stock: 4 },
  { id: '5', barcode: '7791234005', name: 'Auriculares In-Ear Bluetooth Pro', category: 'Accesorios', cost: 3500, price: 9900, stock: 6, min_stock: 2 },
  { id: '6', barcode: '7791234006', name: 'Cuaderno Universitario A4 80h', category: 'Librería', cost: 1200, price: 2900, stock: 20, min_stock: 5 },
  { id: '7', barcode: '7791234007', name: 'Set Bolígrafos 4 Colores BIC', category: 'Librería', cost: 450, price: 1200, stock: 30, min_stock: 8 },
  { id: '8', barcode: '7791234008', name: 'Resaltador Pastel Stabilo Boss', category: 'Librería', cost: 600, price: 1500, stock: 18, min_stock: 5 },
  { id: '9', barcode: '7791234009', name: 'Abrochadora de Bolsillo + Ganchos', category: 'Librería', cost: 950, price: 2400, stock: 7, min_stock: 2 },
  { id: '10', barcode: '7791234010', name: 'Bloc de Notas Adhesivas Post-it', category: 'Librería', cost: 350, price: 950, stock: 22, min_stock: 6 },
  { id: '11', barcode: '7791234011', name: 'Alfajor de Chocolate Triples', category: 'Golosinas', cost: 300, price: 750, stock: 40, min_stock: 10 },
  { id: '12', barcode: '7791234012', name: 'Paquete Caramelos Menta x 100g', category: 'Golosinas', cost: 250, price: 600, stock: 15, min_stock: 5 },
  { id: '13', barcode: '7791234013', name: 'Chocolatina con Maní 50g', category: 'Golosinas', cost: 400, price: 950, stock: 28, min_stock: 8 },
  { id: '14', barcode: '7791234014', name: 'Chicles de Fruta Masticables', category: 'Golosinas', cost: 150, price: 400, stock: 50, min_stock: 15 },
  { id: '15', barcode: '7791234015', name: 'Gomitas de Fruta Surtidas 80g', category: 'Golosinas', cost: 320, price: 800, stock: 35, min_stock: 10 },
];
