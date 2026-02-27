-- Make customer_id nullable in carts and orders
-- since we now use user_id directly
ALTER TABLE public.carts ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN customer_id DROP NOT NULL;
