-- ============================================================
-- FIX: Remove conflicting staff policies from 003,
-- and ensure seller_profiles is readable
-- ============================================================

-- 1. Drop duplicate staff policies (003 conflicts with 001's "for all")
DROP POLICY IF EXISTS "Sellers can delete their staff" ON staff;
DROP POLICY IF EXISTS "Sellers can insert staff" ON staff;
DROP POLICY IF EXISTS "Sellers can update their staff" ON staff;
DROP POLICY IF EXISTS "Sellers can read their staff" ON staff;

-- 2. Ensure seller_profiles select policy exists and works
DROP POLICY IF EXISTS "Seller profiles are viewable by everyone" ON seller_profiles;
CREATE POLICY "Seller profiles are viewable by everyone"
  ON seller_profiles FOR SELECT USING (true);

-- 3. Ensure seller_profiles update works for both seller and admin
DROP POLICY IF EXISTS "Sellers can update own profile" ON seller_profiles;
CREATE POLICY "Sellers can update own profile"
  ON seller_profiles FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role_id = 1)
  );

-- 4. Ensure seller_profiles insert works
DROP POLICY IF EXISTS "Users can create seller profile" ON seller_profiles;
CREATE POLICY "Users can create seller profile"
  ON seller_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Keep the 001 staff "for all" policy (already correct)
-- "Sellers can manage their staff" on staff for all using (seller_id in ...)

-- 6. Ensure venues insert works for sellers
DROP POLICY IF EXISTS "Sellers can create venues" ON venues;
CREATE POLICY "Sellers can create venues"
  ON venues FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM seller_profiles WHERE user_id = auth.uid())
  );

-- 7. Ensure ticket_types CRUD for sellers
DROP POLICY IF EXISTS "Sellers can insert ticket types" ON ticket_types;
CREATE POLICY "Sellers can insert ticket types"
  ON ticket_types FOR INSERT WITH CHECK (
    event_id IN (
      SELECT event_id FROM events WHERE seller_id IN (
        SELECT seller_id FROM seller_profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Sellers can update ticket types" ON ticket_types;
CREATE POLICY "Sellers can update ticket types"
  ON ticket_types FOR UPDATE USING (
    event_id IN (
      SELECT event_id FROM events WHERE seller_id IN (
        SELECT seller_id FROM seller_profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Sellers can delete ticket types" ON ticket_types;
CREATE POLICY "Sellers can delete ticket types"
  ON ticket_types FOR DELETE USING (
    event_id IN (
      SELECT event_id FROM events WHERE seller_id IN (
        SELECT seller_id FROM seller_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 8. Order items & orders readable by seller
DROP POLICY IF EXISTS "Sellers can view order items for their events" ON order_items;
CREATE POLICY "Sellers can view order items for their events"
  ON order_items FOR SELECT USING (
    event_id IN (
      SELECT event_id FROM events WHERE seller_id IN (
        SELECT seller_id FROM seller_profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Sellers can view orders for their events" ON orders;
CREATE POLICY "Sellers can view orders for their events"
  ON orders FOR SELECT USING (
    order_id IN (
      SELECT DISTINCT order_id FROM order_items WHERE event_id IN (
        SELECT event_id FROM events WHERE seller_id IN (
          SELECT seller_id FROM seller_profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================
-- VERIFY: check your seller profile exists
-- ============================================================
-- Run this separately to check:
-- SELECT * FROM profiles;
-- SELECT * FROM seller_profiles;
