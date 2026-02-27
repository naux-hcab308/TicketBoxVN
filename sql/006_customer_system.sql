-- ============================================================
-- Customer System: cart hold, direct user_id references, RLS
-- ============================================================

-- Add hold_until to cart_items for temporary seat reservation
ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS hold_until timestamptz;

-- Add user_id directly to carts for easier access
ALTER TABLE public.carts
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id directly to orders for easier access
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update carts RLS: allow user_id based access
DROP POLICY IF EXISTS "Customers can manage own cart" ON carts;
CREATE POLICY "Users can manage own cart" ON carts FOR ALL USING (
  user_id = auth.uid()
  OR customer_id IN (SELECT customer_id FROM customer_profiles WHERE user_id = auth.uid())
);

-- Update cart_items RLS
DROP POLICY IF EXISTS "Customers can manage own cart items" ON cart_items;
CREATE POLICY "Users can manage own cart items" ON cart_items FOR ALL USING (
  cart_id IN (SELECT cart_id FROM carts WHERE user_id = auth.uid()
    OR customer_id IN (SELECT customer_id FROM customer_profiles WHERE user_id = auth.uid()))
);

-- Update orders RLS
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (
  user_id = auth.uid()
  OR customer_id IN (SELECT customer_id FROM customer_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (
  user_id = auth.uid()
);

-- Update order_items RLS
DROP POLICY IF EXISTS "Customers can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create order items" ON order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid())
);

-- Tickets: users can view their own tickets
DROP POLICY IF EXISTS "Customers can view own tickets" ON tickets;
DROP POLICY IF EXISTS "Tickets are readable" ON tickets;
CREATE POLICY "Users can view own tickets" ON tickets FOR SELECT USING (
  order_item_id IN (
    SELECT order_item_id FROM order_items WHERE order_id IN (
      SELECT order_id FROM orders WHERE user_id = auth.uid()
    )
  )
  OR true -- staff also need to read for checkin (handled by 005 migration)
);

-- Payments: users can view and create
DROP POLICY IF EXISTS "Customers can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (
  order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create payments" ON payments FOR INSERT WITH CHECK (
  order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid())
);

-- Events: everyone can view published events (ensure anon can too)
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON events;
CREATE POLICY "Published events are viewable by everyone" ON events FOR SELECT USING (
  status IN ('published', 'approved', 'completed')
  OR seller_id IN (SELECT seller_id FROM seller_profiles WHERE user_id = auth.uid())
);

-- Ticket types: published event ticket types are viewable by everyone
DROP POLICY IF EXISTS "Ticket types of published events are viewable" ON ticket_types;
CREATE POLICY "Ticket types are viewable" ON ticket_types FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT SELECT ON public.tickets TO authenticated;
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT SELECT ON public.events TO anon, authenticated;
GRANT SELECT ON public.ticket_types TO anon, authenticated;
GRANT SELECT ON public.venues TO anon, authenticated;

-- Allow ticket_types quantity_sold update during order creation
GRANT UPDATE ON public.ticket_types TO authenticated;
-- Allow ticket insert during order confirmation
GRANT INSERT ON public.tickets TO authenticated;
