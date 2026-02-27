-- ============================================================
-- Seat Map System
-- ============================================================

-- Seats table: each seat belongs to a ticket_type
CREATE TABLE IF NOT EXISTS public.seats (
  seat_id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_type_id  uuid REFERENCES public.ticket_types(ticket_type_id) ON DELETE CASCADE NOT NULL,
  event_id        uuid REFERENCES public.events(event_id) ON DELETE CASCADE NOT NULL,
  row_label       text NOT NULL,         -- 'A', 'B', 'C'...
  seat_number     int NOT NULL,          -- 1, 2, 3...
  label           text,                  -- display label e.g. 'A1'
  status          text DEFAULT 'available' CHECK (status IN ('available', 'held', 'sold', 'disabled')),
  held_by         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  held_until      timestamptz,
  ticket_id       uuid REFERENCES public.tickets(ticket_id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now(),

  UNIQUE (event_id, row_label, seat_number)
);

CREATE INDEX IF NOT EXISTS idx_seats_ticket_type ON seats(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_seats_event ON seats(event_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);

ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

-- Everyone can view seats (needed for seat map display)
CREATE POLICY "Seats are viewable" ON seats FOR SELECT USING (true);

-- Authenticated users can update seats (for holding/buying)
CREATE POLICY "Users can update seats" ON seats FOR UPDATE USING (true);

-- Sellers can manage seats for their events
CREATE POLICY "Sellers can manage seats" ON seats FOR ALL USING (
  event_id IN (
    SELECT event_id FROM events WHERE seller_id IN (
      SELECT seller_id FROM seller_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Admin can manage all seats
CREATE POLICY "Admin can manage seats" ON seats FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role_id = 1)
);

-- Grants
GRANT SELECT, UPDATE ON public.seats TO authenticated;
GRANT SELECT ON public.seats TO anon;
GRANT INSERT, DELETE ON public.seats TO authenticated;

-- Add has_seatmap flag to ticket_types
ALTER TABLE public.ticket_types
  ADD COLUMN IF NOT EXISTS has_seatmap boolean DEFAULT false;
