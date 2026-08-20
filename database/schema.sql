-- ========================================================
-- Schema Script for negocio-gestion-web (/database/schema.sql)
-- Retail Business Management (Accesorios, Librería, Golosinas)
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Accesorios', 'Librería', 'Golosinas', 'Varios')),
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sales / Venta Encabezado
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'Efectivo' CHECK (payment_method IN ('Efectivo', 'Tarjeta', 'Transferencia', 'MercadoPago')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sale Items / Detalle de Venta
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Expenses / Control de Caja & Gastos
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL DEFAULT 'Gasto General' CHECK (category IN ('Proveedor', 'Servicios', 'Retiro de Caja', 'Gasto General')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI Insights Cache
CREATE TABLE IF NOT EXISTS public.ai_insights_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insight_type TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- Automatic Stock Decrement Trigger
-- ========================================================

CREATE OR REPLACE FUNCTION public.fn_decrement_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock = stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_decrement_stock ON public.sale_items;
CREATE TRIGGER tr_decrement_stock
AFTER INSERT ON public.sale_items
FOR EACH ROW
EXECUTE FUNCTION public.fn_decrement_stock_on_sale();

-- ========================================================
-- Indexes for High Performance Querying
-- ========================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
