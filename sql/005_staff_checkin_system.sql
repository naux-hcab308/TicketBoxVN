-- ============================================================
-- Staff Check-in System
-- Add auth fields to staff + create session table
-- ============================================================

-- Add status and password to staff table
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  ADD COLUMN IF NOT EXISTS password_hash text;

-- Staff sessions (simple token-based auth for staff)
CREATE TABLE IF NOT EXISTS public.staff_sessions (
  session_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id uuid REFERENCES public.staff(staff_id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_sessions_token ON staff_sessions(token);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_staff ON staff_sessions(staff_id);

ALTER TABLE public.staff_sessions ENABLE ROW LEVEL SECURITY;

-- Everyone can read staff_sessions (needed for token validation)
CREATE POLICY "Staff sessions are readable" ON staff_sessions FOR SELECT USING (true);
CREATE POLICY "Staff sessions are insertable" ON staff_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff sessions are deletable" ON staff_sessions FOR DELETE USING (true);

-- Staff table: allow public read for login validation
DROP POLICY IF EXISTS "Sellers can manage their staff" ON staff;
CREATE POLICY "Staff are readable for login" ON staff FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their staff" ON staff FOR ALL USING (
  seller_id IN (SELECT seller_id FROM seller_profiles WHERE user_id = auth.uid())
);

-- Checkin logs: allow staff to insert via session
DROP POLICY IF EXISTS "Staff can create checkin logs" ON checkin_logs;
CREATE POLICY "Checkin logs are insertable" ON checkin_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Staff can view checkin logs for their events" ON checkin_logs;
CREATE POLICY "Checkin logs are readable" ON checkin_logs FOR SELECT USING (true);

-- Tickets: staff need to read and update ticket status
DROP POLICY IF EXISTS "Customers can view own tickets" ON tickets;
CREATE POLICY "Tickets are readable" ON tickets FOR SELECT USING (true);
CREATE POLICY "Tickets are updatable" ON tickets FOR UPDATE USING (true);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.staff_sessions TO anon, authenticated;
GRANT SELECT ON public.staff TO anon, authenticated;
GRANT SELECT, UPDATE ON public.tickets TO anon, authenticated;
GRANT SELECT, INSERT ON public.checkin_logs TO anon, authenticated;
GRANT SELECT ON public.events TO anon, authenticated;
GRANT SELECT ON public.event_staff_assignments TO anon, authenticated;
