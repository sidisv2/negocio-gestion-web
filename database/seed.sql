-- ========================================================
-- Seed Script for negocio-gestion-web (/database/seed.sql)
-- 15 productos de prueba (Accesorios, Librería, Golosinas)
-- ========================================================

INSERT INTO public.products (barcode, name, category, cost, price, stock, min_stock)
VALUES
    -- Accesorios Celular
    ('7791234001', 'Funda Silicona iPhone 13/14', 'Accesorios', 1500.00, 4500.00, 12, 3),
    ('7791234002', 'Vidrio Templado 9D Universal', 'Accesorios', 500.00, 1800.00, 25, 5),
    ('7791234003', 'Cargador Carga Rápida Type-C 20W', 'Accesorios', 2200.00, 6500.00, 8, 3),
    ('7791234004', 'Cable USB-C a Lightning 1m', 'Accesorios', 800.00, 2500.00, 15, 4),
    ('7791234005', 'Auriculares In-Ear Bluetooth Pro', 'Accesorios', 3500.00, 9900.00, 6, 2),

    -- Librería
    ('7791234006', 'Cuaderno Universitario A4 80h', 'Librería', 1200.00, 2900.00, 20, 5),
    ('7791234007', 'Set Bolígrafos 4 Colores BIC', 'Librería', 450.00, 1200.00, 30, 8),
    ('7791234008', 'Resaltador Pastel Stabilo Boss', 'Librería', 600.00, 1500.00, 18, 5),
    ('7791234009', 'Abrochadora de Bolsillo + Ganchos', 'Librería', 950.00, 2400.00, 7, 2),
    ('7791234010', 'Bloc de Notas Adhesivas Post-it', 'Librería', 350.00, 950.00, 22, 6),

    -- Golosinas / Chucherías
    ('7791234011', 'Alfa Jor de Chocolate Triples', 'Golosinas', 300.00, 750.00, 40, 10),
    ('7791234012', 'Paquete Caramelos Menta x 100g', 'Golosinas', 250.00, 600.00, 15, 5),
    ('7791234013', 'Chocolatina con Maní 50g', 'Golosinas', 400.00, 950.00, 28, 8),
    ('7791234014', 'Chicles de Fruta Masticables', 'Golosinas', 150.00, 400.00, 50, 15),
    ('7791234015', 'Gomitas de Fruta Surtidas 80g', 'Golosinas', 320.00, 800.00, 35, 10)
ON CONFLICT (barcode) DO NOTHING;
