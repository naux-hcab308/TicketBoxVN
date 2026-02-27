-- ============================================================
-- TicketBox Database Schema - Supabase Migration
-- Based on ERD: Roles, Users/Profiles, Seller, Customer,
-- Staff, Events, Venues, TicketTypes, Carts, Orders, Payments
-- ============================================================

-- ========================
-- 1. ROLES
-- ========================
create table public.roles (
  role_id   serial primary key,
  role_name text not null unique  -- 'admin', 'seller', 'customer'
);

insert into public.roles (role_name) values
  ('admin'),
  ('seller'),
  ('customer');

-- ========================
-- 2. PROFILES (extends auth.users = Users in ERD)
-- ========================
create table public.profiles (
  user_id       uuid references auth.users(id) on delete cascade primary key,
  full_name     text,
  email         text,
  phone_number  text,
  images        text,            -- avatar URL
  role_id       int references public.roles(role_id) default 3,
  status        text default 'active' check (status in ('active', 'inactive', 'banned')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========================
-- 3. SELLER PROFILES
-- ========================
create table public.seller_profiles (
  seller_id      uuid default gen_random_uuid() primary key,
  user_id        uuid references public.profiles(user_id) on delete cascade unique not null,
  business_name  text not null,
  email          text,
  address        text,
  bank_name      text,
  bank_account_no text,
  kyc_status     text default 'pending' check (kyc_status in ('pending', 'verified', 'rejected')),
  created_at     timestamptz default now()
);

-- ========================
-- 4. CUSTOMER PROFILES
-- ========================
create table public.customer_profiles (
  customer_id   uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(user_id) on delete cascade unique not null,
  gender        text check (gender in ('male', 'female', 'other')),
  submitted_at  timestamptz default now()
);

-- ========================
-- 5. STAFF
-- ========================
create table public.staff (
  staff_id       uuid default gen_random_uuid() primary key,
  seller_id      uuid references public.seller_profiles(seller_id) on delete cascade not null,
  employee_code  text unique,
  staff_number   text,
  name           text not null,
  shift_id       text,
  created_at     timestamptz default now()
);

create index idx_staff_seller on staff(seller_id);

-- ========================
-- 6. VENUES
-- ========================
create table public.venues (
  venue_id    uuid default gen_random_uuid() primary key,
  venue_name  text not null,
  address     text,
  city        text,
  created_at  timestamptz default now()
);

-- ========================
-- 7. EVENTS
-- ========================
create table public.events (
  event_id     uuid default gen_random_uuid() primary key,
  event_name   text not null,
  description  text,
  seller_id    uuid references public.seller_profiles(seller_id) on delete set null,
  venue_id     uuid references public.venues(venue_id) on delete set null,
  banner_url   text,
  start_time   timestamptz not null,
  end_time     timestamptz,
  status       text default 'draft' check (status in ('draft', 'pending_approval', 'approved', 'published', 'cancelled', 'completed')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index idx_events_seller on events(seller_id);
create index idx_events_venue on events(venue_id);
create index idx_events_status on events(status);
create index idx_events_start_time on events(start_time);

-- ========================
-- 8. EVENT APPROVAL REQUESTS
-- ========================
create table public.event_approval_requests (
  request_id   uuid default gen_random_uuid() primary key,
  event_id     uuid references public.events(event_id) on delete cascade not null,
  seller_id    uuid references public.seller_profiles(seller_id) on delete cascade not null,
  decision     text check (decision in ('pending', 'approved', 'rejected')),
  admin_note   text,
  decision_at  timestamptz,
  created_at   timestamptz default now()
);

create index idx_approval_event on event_approval_requests(event_id);

-- ========================
-- 9. EVENT STAFF ASSIGNMENTS
-- ========================
create table public.event_staff_assignments (
  assignment_id       uuid default gen_random_uuid() primary key,
  event_id            uuid references public.events(event_id) on delete cascade not null,
  staff_id            uuid references public.staff(staff_id) on delete cascade not null,
  assigned_by_seller_id uuid references public.seller_profiles(seller_id) on delete set null,
  status              text default 'assigned' check (status in ('assigned', 'confirmed', 'cancelled')),
  assigned_at         timestamptz default now(),

  unique (event_id, staff_id)
);

create index idx_assignments_event on event_staff_assignments(event_id);
create index idx_assignments_staff on event_staff_assignments(staff_id);

-- ========================
-- 10. TICKET TYPES
-- ========================
create table public.ticket_types (
  ticket_type_id  uuid default gen_random_uuid() primary key,
  event_id        uuid references public.events(event_id) on delete cascade not null,
  type_name       text not null,          -- 'VIP', 'Standard', 'Early Bird'
  price           bigint not null default 0,  -- VND
  quantity_total  int not null default 0,
  quantity_sold   int default 0,
  sale_start      timestamptz,
  sale_end        timestamptz,
  created_at      timestamptz default now()
);

create index idx_ticket_types_event on ticket_types(event_id);

-- ========================
-- 11. CARTS
-- ========================
create table public.carts (
  cart_id      uuid default gen_random_uuid() primary key,
  customer_id  uuid references public.customer_profiles(customer_id) on delete cascade not null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index idx_carts_customer on carts(customer_id);

-- ========================
-- 12. CART ITEMS
-- ========================
create table public.cart_items (
  cart_id         uuid references public.carts(cart_id) on delete cascade not null,
  ticket_type_id  uuid references public.ticket_types(ticket_type_id) on delete cascade not null,
  quantity        int not null default 1,
  unit_price      bigint not null,
  created_at      timestamptz default now(),

  primary key (cart_id, ticket_type_id)
);

-- ========================
-- 13. ORDERS
-- ========================
create table public.orders (
  order_id        uuid default gen_random_uuid() primary key,
  order_code      text unique not null,
  customer_id     uuid references public.customer_profiles(customer_id) on delete set null not null,
  total_amount    bigint not null default 0,
  status          text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'refunded')),
  payment_method  text,
  paid_at         timestamptz,
  created_at      timestamptz default now()
);

create index idx_orders_customer on orders(customer_id);
create index idx_orders_status on orders(status);
create index idx_orders_code on orders(order_code);

-- ========================
-- 14. ORDER ITEMS
-- ========================
create table public.order_items (
  order_item_id   uuid default gen_random_uuid() primary key,
  order_id        uuid references public.orders(order_id) on delete cascade not null,
  event_id        uuid references public.events(event_id) on delete set null,
  ticket_type_id  uuid references public.ticket_types(ticket_type_id) on delete set null not null,
  quantity        int not null default 1,
  unit_price      bigint not null,
  expires_at      timestamptz
);

create index idx_order_items_order on order_items(order_id);
create index idx_order_items_event on order_items(event_id);

-- ========================
-- 15. TICKETS (individual issued tickets)
-- ========================
create table public.tickets (
  ticket_id      uuid default gen_random_uuid() primary key,
  order_item_id  uuid references public.order_items(order_item_id) on delete set null,
  event_id       uuid references public.events(event_id) on delete set null not null,
  code           text unique not null,
  status         text default 'valid' check (status in ('valid', 'used', 'cancelled', 'expired')),
  is_placed      boolean default false,
  created_at     timestamptz default now()
);

create index idx_tickets_event on tickets(event_id);
create index idx_tickets_order_item on tickets(order_item_id);
create index idx_tickets_code on tickets(code);

-- ========================
-- 16. CHECKIN LOGS
-- ========================
create table public.checkin_logs (
  checkin_id    uuid default gen_random_uuid() primary key,
  ticket_id     uuid references public.tickets(ticket_id) on delete cascade not null,
  event_id      uuid references public.events(event_id) on delete cascade not null,
  staff_id      uuid references public.staff(staff_id) on delete set null,
  checkin_time  timestamptz default now(),
  result        text not null check (result in ('success', 'failed', 'duplicate')),
  note          text
);

create index idx_checkin_ticket on checkin_logs(ticket_id);
create index idx_checkin_event on checkin_logs(event_id);

-- ========================
-- 17. PAYMENTS
-- ========================
create table public.payments (
  payment_id        uuid default gen_random_uuid() primary key,
  order_id          uuid references public.orders(order_id) on delete cascade not null,
  amount            bigint not null,
  provider          text,                 -- 'vnpay', 'momo', 'zalopay', etc.
  payment_method    text,
  txn_ref           text unique,          -- transaction reference from provider
  final_return_date timestamptz,
  created_at        timestamptz default now()
);

create index idx_payments_order on payments(order_id);
create index idx_payments_txn on payments(txn_ref);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.staff enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.event_approval_requests enable row level security;
alter table public.event_staff_assignments enable row level security;
alter table public.ticket_types enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.tickets enable row level security;
alter table public.checkin_logs enable row level security;
alter table public.payments enable row level security;

-- ---- ROLES ----
create policy "Roles are viewable by everyone"
  on roles for select using (true);

-- ---- PROFILES ----
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = user_id);

-- ---- SELLER PROFILES ----
create policy "Seller profiles are viewable by everyone"
  on seller_profiles for select using (true);

create policy "Sellers can update own profile"
  on seller_profiles for update using (auth.uid() = user_id);

create policy "Users can create seller profile"
  on seller_profiles for insert with check (auth.uid() = user_id);

-- ---- CUSTOMER PROFILES ----
create policy "Customers can view own profile"
  on customer_profiles for select using (
    auth.uid() = user_id
  );

create policy "Users can create customer profile"
  on customer_profiles for insert with check (auth.uid() = user_id);

create policy "Customers can update own profile"
  on customer_profiles for update using (auth.uid() = user_id);

-- ---- STAFF ----
create policy "Sellers can manage their staff"
  on staff for all using (
    seller_id in (select seller_id from seller_profiles where user_id = auth.uid())
  );

-- ---- VENUES ----
create policy "Venues are viewable by everyone"
  on venues for select using (true);

-- ---- EVENTS ----
create policy "Published events are viewable by everyone"
  on events for select using (
    status in ('published', 'completed')
    or seller_id in (select seller_id from seller_profiles where user_id = auth.uid())
  );

create policy "Sellers can manage their events"
  on events for insert with check (
    seller_id in (select seller_id from seller_profiles where user_id = auth.uid())
  );

create policy "Sellers can update their events"
  on events for update using (
    seller_id in (select seller_id from seller_profiles where user_id = auth.uid())
  );

-- ---- EVENT APPROVAL REQUESTS ----
create policy "Sellers can view their approval requests"
  on event_approval_requests for select using (
    seller_id in (select seller_id from seller_profiles where user_id = auth.uid())
  );

create policy "Sellers can submit approval requests"
  on event_approval_requests for insert with check (
    seller_id in (select seller_id from seller_profiles where user_id = auth.uid())
  );

-- ---- EVENT STAFF ASSIGNMENTS ----
create policy "Sellers can manage assignments"
  on event_staff_assignments for all using (
    assigned_by_seller_id in (select seller_id from seller_profiles where user_id = auth.uid())
  );

-- ---- TICKET TYPES ----
create policy "Ticket types of published events are viewable"
  on ticket_types for select using (
    event_id in (select event_id from events where status = 'published')
    or event_id in (select event_id from events where seller_id in
      (select seller_id from seller_profiles where user_id = auth.uid()))
  );

create policy "Sellers can manage ticket types"
  on ticket_types for all using (
    event_id in (select event_id from events where seller_id in
      (select seller_id from seller_profiles where user_id = auth.uid()))
  );

-- ---- CARTS ----
create policy "Customers can manage own cart"
  on carts for all using (
    customer_id in (select customer_id from customer_profiles where user_id = auth.uid())
  );

-- ---- CART ITEMS ----
create policy "Customers can manage own cart items"
  on cart_items for all using (
    cart_id in (select cart_id from carts where customer_id in
      (select customer_id from customer_profiles where user_id = auth.uid()))
  );

-- ---- ORDERS ----
create policy "Customers can view own orders"
  on orders for select using (
    customer_id in (select customer_id from customer_profiles where user_id = auth.uid())
  );

create policy "Customers can create orders"
  on orders for insert with check (
    customer_id in (select customer_id from customer_profiles where user_id = auth.uid())
  );

-- ---- ORDER ITEMS ----
create policy "Customers can view own order items"
  on order_items for select using (
    order_id in (select order_id from orders where customer_id in
      (select customer_id from customer_profiles where user_id = auth.uid()))
  );

-- ---- TICKETS ----
create policy "Customers can view own tickets"
  on tickets for select using (
    order_item_id in (
      select order_item_id from order_items where order_id in (
        select order_id from orders where customer_id in (
          select customer_id from customer_profiles where user_id = auth.uid()
        )
      )
    )
  );

-- ---- CHECKIN LOGS ----
create policy "Staff can view checkin logs for their events"
  on checkin_logs for select using (
    staff_id in (select staff_id from staff where seller_id in
      (select seller_id from seller_profiles where user_id = auth.uid()))
  );

create policy "Staff can create checkin logs"
  on checkin_logs for insert with check (
    staff_id in (select staff_id from staff where seller_id in
      (select seller_id from seller_profiles where user_id = auth.uid()))
  );

-- ---- PAYMENTS ----
create policy "Customers can view own payments"
  on payments for select using (
    order_id in (select order_id from orders where customer_id in
      (select customer_id from customer_profiles where user_id = auth.uid()))
  );


-- ============================================================
-- HELPER FUNCTION: auto-update updated_at
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger set_events_updated_at
  before update on events
  for each row execute function update_updated_at();

create trigger set_carts_updated_at
  before update on carts
  for each row execute function update_updated_at();
