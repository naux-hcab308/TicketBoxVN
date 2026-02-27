-- ============================================================
-- Admin RLS Policies
-- Allows users with role_id = 1 (admin) to read all data
-- ============================================================

create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role_id = 1
  );
end;
$$ language plpgsql security definer;

-- Seller profiles: admin can read all
create policy "Admin can read all seller profiles"
  on seller_profiles for select using (is_admin());

-- Customer profiles: admin can read all
create policy "Admin can read all customer profiles"
  on customer_profiles for select using (is_admin());

-- Staff: admin can read all
create policy "Admin can read all staff"
  on staff for select using (is_admin());

-- Events: admin can read all regardless of status
create policy "Admin can read all events"
  on events for select using (is_admin());

-- Admin can update event status
create policy "Admin can update events"
  on events for update using (is_admin());

-- Event approval requests: admin can read & insert
create policy "Admin can read all approval requests"
  on event_approval_requests for select using (is_admin());

create policy "Admin can create approval requests"
  on event_approval_requests for insert with check (is_admin());

-- Ticket types: admin can read all
create policy "Admin can read all ticket types"
  on ticket_types for select using (is_admin());

-- Orders: admin can read all
create policy "Admin can read all orders"
  on orders for select using (is_admin());

-- Order items: admin can read all
create policy "Admin can read all order items"
  on order_items for select using (is_admin());

-- Tickets: admin can read all
create policy "Admin can read all tickets"
  on tickets for select using (is_admin());

-- Checkin logs: admin can read all
create policy "Admin can read all checkin logs"
  on checkin_logs for select using (is_admin());

-- Payments: admin can read all
create policy "Admin can read all payments"
  on payments for select using (is_admin());

-- Seller profiles: admin can update KYC status
create policy "Admin can update seller profiles"
  on seller_profiles for update using (is_admin());
