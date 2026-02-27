-- Fix cart & order RLS policies for user_id based access

-- Drop ALL existing cart policies
DROP POLICY IF EXISTS "Customers can manage own cart" ON carts;
DROP POLICY IF EXISTS "Users can manage own cart" ON carts;

-- Recreate with both USING and WITH CHECK for INSERT support
CREATE POLICY "Users can manage own cart" ON carts
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Drop ALL existing cart_items policies
DROP POLICY IF EXISTS "Customers can manage own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;

CREATE POLICY "Users can manage own cart items" ON cart_items
  FOR ALL
  USING (cart_id IN (SELECT cart_id FROM carts WHERE user_id = auth.uid()))
  WITH CHECK (cart_id IN (SELECT cart_id FROM carts WHERE user_id = auth.uid()));

-- Drop ALL existing orders policies
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

CREATE POLICY "Users can manage own orders" ON orders
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Drop ALL existing order_items policies
DROP POLICY IF EXISTS "Customers can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

CREATE POLICY "Users can manage own order items" ON order_items
  FOR ALL
  USING (order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid()))
  WITH CHECK (order_id IN (SELECT order_id FROM orders WHERE user_id = auth.uid()));

-- Ensure grants
GRANT ALL ON public.carts TO authenticated;
GRANT ALL ON public.cart_items TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT SELECT, INSERT ON public.tickets TO authenticated;
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT SELECT, UPDATE ON public.ticket_types TO authenticated;
