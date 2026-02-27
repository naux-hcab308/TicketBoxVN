-- ============================================================
-- ALL-IN-ONE: Customer system fix
-- Step 1: Add columns
-- Step 2: Fix NOT NULL
-- Step 3: Fix RLS
-- Step 4: Fix grants
-- ============================================================

-- Step 1: Add user_id columns
ALTER TABLE public.carts
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS hold_until timestamptz;

-- Step 2: Make customer_id nullable
ALTER TABLE public.carts ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN customer_id DROP NOT NULL;

-- Step 3: Fix RLS policies

-- CARTS
DROP POLICY IF EXISTS "Customers can manage own cart" ON carts;
DROP POLICY IF EXISTS "Users can manage own cart" ON carts;
CREATE POLICY "Users can manage own cart" ON carts
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- CART ITEMS
DROP POLICY IF EXISTS "Customers can manage own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;
CREATE POLICY "Users can manage own cart items" ON cart_items
  FOR ALL
  USING (cart_id IN (SELECT cart_id FROM carts WHERE user_id = auth.uid()))
  WITH CHECK (cart_id IN (SELECT cart_id FROM carts WHERE user_id = auth.uid()));

-- ORDERS
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can manage own orders" ON orders;
CREATE POLICY "Users can manage own orders" ON orders
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ORDER ITEMS
DROP POLICY IF EXISTS "Customers can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Users can manage own order items" ON order_items;
CREATE POLICY "Users can manage own order items" ON order_items
  FOR ALL
  USING (order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid()))
  WITH CHECK (order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid()));

-- TICKETS
DROP POLICY IF EXISTS "Customers can view own tickets" ON tickets;
DROP POLICY IF EXISTS "Tickets are readable" ON tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
CREATE POLICY "Tickets are readable" ON tickets FOR SELECT USING (true);
CREATE POLICY "Tickets are insertable" ON tickets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Tickets are updatable" ON tickets;
CREATE POLICY "Tickets are updatable" ON tickets FOR UPDATE USING (true);

-- PAYMENTS
DROP POLICY IF EXISTS "Customers can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can create payments" ON payments;
CREATE POLICY "Users can manage payments" ON payments
  FOR ALL
  USING (order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid()))
  WITH CHECK (order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid()));

-- EVENTS: everyone can view published
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON events;
CREATE POLICY "Published events are viewable by everyone" ON events FOR SELECT USING (
  status IN ('published', 'approved', 'completed')
  OR seller_id IN (SELECT seller_id FROM seller_profiles WHERE user_id = auth.uid())
);

-- TICKET TYPES: everyone can view
DROP POLICY IF EXISTS "Ticket types of published events are viewable" ON ticket_types;
DROP POLICY IF EXISTS "Ticket types are viewable" ON ticket_types;
CREATE POLICY "Ticket types are viewable" ON ticket_types FOR SELECT USING (true);

-- Step 4: Grants
GRANT ALL ON public.carts TO authenticated;
GRANT ALL ON public.cart_items TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.tickets TO authenticated;
GRANT ALL ON public.payments TO authenticated;
GRANT SELECT ON public.events TO anon, authenticated;
GRANT SELECT, UPDATE ON public.ticket_types TO anon, authenticated;
GRANT SELECT ON public.venues TO anon, authenticated;
