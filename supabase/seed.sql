-- ========================================================
-- Seed Data for negocio-gestion-web
-- ========================================================

-- Seed Products
INSERT INTO public.products (sku, name, description, price, cost, stock_quantity)
VALUES 
    ('PROD-001', 'Laptop Pro 15', 'High performance laptop for business', 1299.99, 900.00, 15),
    ('PROD-002', 'Wireless Mouse', 'Ergonomic wireless optical mouse', 29.99, 12.50, 50),
    ('PROD-003', 'Mechanical Keyboard', 'RGB backlight mechanical keyboard', 89.99, 45.00, 30),
    ('PROD-004', '27-inch Monitor 4K', 'Ultra HD IPS Display', 349.99, 220.00, 10)
ON CONFLICT (sku) DO NOTHING;
