-- ============================================================
-- Seller RLS Policies
-- Allows sellers to manage their own data
-- ============================================================

-- Venues: sellers can create venues
create policy "Sellers can create venues"
  on venues for insert with check (
    exists (select 1 from seller_profiles where user_id = auth.uid())
  );

-- Ticket types: sellers can manage ticket types for their events
create policy "Sellers can insert ticket types"
  on ticket_types for insert with check (
    event_id in (
      select event_id from events where seller_id in (
        select seller_id from seller_profiles where user_id = auth.uid()
      )
    )
  );

create policy "Sellers can update ticket types"
  on ticket_types for update using (
    event_id in (
      select event_id from events where seller_id in (
        select seller_id from seller_profiles where user_id = auth.uid()
      )
    )
  );

create policy "Sellers can delete ticket types"
  on ticket_types for delete using (
    event_id in (
      select event_id from events where seller_id in (
        select seller_id from seller_profiles where user_id = auth.uid()
      )
    )
  );

-- Staff: sellers can delete their own staff
create policy "Sellers can delete their staff"
  on staff for delete using (
    seller_id in (select seller_id from seller_profiles where user_id = auth.uid())
  );

-- Staff: sellers can insert staff
create policy "Sellers can insert staff"
  on staff for insert with check (
    seller_id in (select seller_id from seller_profiles where user_id = auth.uid())
  );

-- Staff: sellers can update their staff
create policy "Sellers can update their staff"
  on staff for update using (
    seller_id in (select seller_id from seller_profiles where user_id = auth.uid())
  );

-- Staff: sellers can read their staff
create policy "Sellers can read their staff"
  on staff for select using (
    seller_id in (select seller_id from seller_profiles where user_id = auth.uid())
  );

-- Order items: sellers can view order items for their events
create policy "Sellers can view order items for their events"
  on order_items for select using (
    event_id in (
      select event_id from events where seller_id in (
        select seller_id from seller_profiles where user_id = auth.uid()
      )
    )
  );

-- Orders: sellers can view orders related to their events
create policy "Sellers can view orders for their events"
  on orders for select using (
    order_id in (
      select distinct order_id from order_items where event_id in (
        select event_id from events where seller_id in (
          select seller_id from seller_profiles where user_id = auth.uid()
        )
      )
    )
  );
