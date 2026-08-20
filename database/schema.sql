-- ========================================================
-- Schema Script for negocio-gestion-web (/database/schema.sql)
-- Google Auth & Row Level Security (RLS) Multi-Tenant
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    barcode TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Accesorios', 'Librería', 'Golosinas', 'Varios')),
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sales Table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'Efectivo' CHECK (payment_method IN ('Efectivo', 'Tarjeta', 'Transferencia', 'MercadoPago')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sale Items Table
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Expenses / Cashflow Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL CHECK (category IN ('mercaderia', 'servicios', 'alquiler', 'varios')),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity_purchased INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Products RLS Policies
CREATE POLICY "Users can manage their own products" ON public.products
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sales RLS Policies
CREATE POLICY "Users can manage their own sales" ON public.sales
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sale Items RLS Policies (Joined through sales.user_id)
CREATE POLICY "Users can manage their own sale items" ON public.sale_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sales s
            WHERE s.id = sale_items.sale_id AND s.user_id = auth.uid()
        )
    );

-- Expenses RLS Policies
CREATE POLICY "Users can manage their own expenses" ON public.expenses
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========================================================
-- Automatic Stock Adjustment Triggers
-- ========================================================

-- Trigger 1: Decrement stock on sale_item insert
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

-- Trigger 2: Increment stock on stock purchase expense insert
CREATE OR REPLACE FUNCTION public.fn_increment_stock_on_expense()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.category = 'mercaderia' AND NEW.product_id IS NOT NULL AND NEW.quantity_purchased > 0 THEN
        UPDATE public.products
        SET stock = stock + NEW.quantity_purchased,
            updated_at = NOW()
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_increment_stock ON public.expenses;
CREATE TRIGGER tr_increment_stock
AFTER INSERT ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.fn_increment_stock_on_expense();

-- ========================================================
-- Performance Indexes
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_products_user ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON public.expenses(user_id);
