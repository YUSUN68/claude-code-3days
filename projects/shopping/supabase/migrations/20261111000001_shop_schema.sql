-- 인테리어 소품 쇼핑몰 스키마 (모든 객체는 shop_ 접두어, 기존 테이블은 건드리지 않음)

-- ───────── 테이블 ─────────
create table public.shop_categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order int not null default 0
);

create table public.shop_products (
  id bigint generated always as identity primary key,
  category_id bigint not null references public.shop_categories(id) on delete restrict,
  slug text not null unique,
  name text not null,
  summary text,
  description text,
  price int not null check (price >= 0),
  sale_price int check (sale_price is null or (sale_price >= 0 and sale_price < price)),
  final_price int generated always as (coalesce(sale_price, price)) stored,
  stock int not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index shop_products_category_idx on public.shop_products(category_id);
create index shop_products_final_price_idx on public.shop_products(final_price);
create index shop_products_created_idx on public.shop_products(created_at desc);

create table public.shop_gift_themes (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  emoji text,
  sort_order int not null default 0
);

create table public.shop_product_themes (
  product_id bigint not null references public.shop_products(id) on delete cascade,
  theme_id bigint not null references public.shop_gift_themes(id) on delete cascade,
  primary key (product_id, theme_id)
);
create index shop_product_themes_theme_idx on public.shop_product_themes(theme_id);

create table public.shop_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  zipcode text,
  address1 text,
  address2 text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table public.shop_cart_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id bigint not null references public.shop_products(id) on delete cascade,
  quantity int not null check (quantity > 0 and quantity <= 99),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index shop_cart_items_product_idx on public.shop_cart_items(product_id);

create table public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipping', 'delivered', 'cancelled')),
  order_name text not null,
  items_amount int not null,
  shipping_fee int not null,
  total_amount int not null,
  recipient text not null,
  phone text not null,
  zipcode text not null,
  address1 text not null,
  address2 text,
  memo text,
  payment_key text,
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index shop_orders_user_idx on public.shop_orders(user_id, created_at desc);
create index shop_orders_status_idx on public.shop_orders(status, created_at desc);

create table public.shop_order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  product_id bigint references public.shop_products(id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price int not null,
  quantity int not null check (quantity > 0)
);
create index shop_order_items_order_idx on public.shop_order_items(order_id);
create index shop_order_items_product_idx on public.shop_order_items(product_id);

-- ───────── 함수 ─────────
create or replace function public.shop_is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.shop_profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- 가입 시 프로필 자동 생성
create or replace function public.shop_handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.shop_profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger shop_on_auth_user_created
  after insert on auth.users
  for each row execute function public.shop_handle_new_user();

-- 주문 생성: 가격은 DB에서 다시 계산 (클라이언트가 보낸 금액은 믿지 않음)
-- p_items: [{"product_id": 1, "quantity": 2}, ...]
create or replace function public.shop_create_order(
  p_items jsonb,
  p_recipient text,
  p_phone text,
  p_zipcode text,
  p_address1 text,
  p_address2 text,
  p_memo text
)
returns table (order_id uuid, order_no text, order_name text, total_amount int)
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_order_id uuid;
  v_order_no text;
  v_items_amount int := 0;
  v_shipping int;
  v_count int := 0;
  v_first_name text;
  v_order_name text;
  r record;
begin
  if v_user is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception '주문할 상품이 없습니다.';
  end if;
  if coalesce(trim(p_recipient), '') = '' or coalesce(trim(p_phone), '') = ''
     or coalesce(trim(p_zipcode), '') = '' or coalesce(trim(p_address1), '') = '' then
    raise exception '배송 정보를 모두 입력해 주세요.';
  end if;

  v_order_no := to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDD') || '-'
                || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.shop_orders (order_no, user_id, order_name, items_amount, shipping_fee,
    total_amount, recipient, phone, zipcode, address1, address2, memo)
  values (v_order_no, v_user, '', 0, 0, 0, p_recipient, p_phone, p_zipcode, p_address1,
    p_address2, p_memo)
  returning id into v_order_id;

  for r in
    select p.id, p.name, p.final_price, p.stock, p.is_active, p.images,
           (i.value ->> 'quantity')::int as qty
    from jsonb_array_elements(p_items) i
    join public.shop_products p on p.id = (i.value ->> 'product_id')::bigint
  loop
    if not r.is_active then
      raise exception '판매가 중지된 상품이 있습니다: %', r.name;
    end if;
    if r.qty is null or r.qty < 1 or r.qty > 99 then
      raise exception '수량이 올바르지 않습니다: %', r.name;
    end if;
    if r.stock < r.qty then
      raise exception '재고가 부족합니다: % (남은 수량 %개)', r.name, r.stock;
    end if;
    insert into public.shop_order_items (order_id, product_id, product_name, product_image,
      unit_price, quantity)
    values (v_order_id, r.id, r.name, r.images[1], r.final_price, r.qty);
    v_items_amount := v_items_amount + r.final_price * r.qty;
    v_count := v_count + 1;
    if v_first_name is null then v_first_name := r.name; end if;
  end loop;

  if v_count <> jsonb_array_length(p_items) then
    raise exception '존재하지 않는 상품이 포함되어 있습니다.';
  end if;

  -- 5만원 이상 무료배송, 미만 3,000원 (lib/constants.ts 와 동일하게 유지)
  v_shipping := case when v_items_amount >= 50000 then 0 else 3000 end;
  v_order_name := case when v_count > 1 then v_first_name || ' 외 ' || (v_count - 1) || '건'
                       else v_first_name end;

  update public.shop_orders
  set items_amount = v_items_amount, shipping_fee = v_shipping,
      total_amount = v_items_amount + v_shipping, order_name = v_order_name
  where id = v_order_id;

  return query select v_order_id, v_order_no, v_order_name, v_items_amount + v_shipping;
end;
$$;

-- 결제 승인 후 호출 (서버의 service_role 키로만 실행 가능)
create or replace function public.shop_mark_order_paid(
  p_order_no text,
  p_payment_key text,
  p_payment_method text
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_order public.shop_orders;
begin
  select * into v_order from public.shop_orders where order_no = p_order_no for update;
  if not found then raise exception '주문을 찾을 수 없습니다.'; end if;
  if v_order.status = 'paid' then return; end if;
  if v_order.status <> 'pending' then raise exception '결제할 수 없는 주문 상태입니다.'; end if;

  update public.shop_orders
  set status = 'paid', payment_key = p_payment_key, payment_method = p_payment_method,
      paid_at = now()
  where id = v_order.id;

  update public.shop_products p
  set stock = greatest(p.stock - oi.quantity, 0)
  from public.shop_order_items oi
  where oi.order_id = v_order.id and oi.product_id = p.id;

  delete from public.shop_cart_items c
  using public.shop_order_items oi
  where oi.order_id = v_order.id and c.product_id = oi.product_id
    and c.user_id = v_order.user_id;
end;
$$;

-- 결제 실패/취소 시 본인의 대기 주문 취소
create or replace function public.shop_cancel_pending_order(p_order_no text)
returns void
language sql security definer set search_path = ''
as $$
  update public.shop_orders set status = 'cancelled'
  where order_no = p_order_no and user_id = (select auth.uid()) and status = 'pending';
$$;

revoke execute on function public.shop_is_admin() from public, anon;
revoke execute on function public.shop_handle_new_user() from public, anon, authenticated;
revoke execute on function public.shop_create_order(jsonb, text, text, text, text, text, text) from public, anon;
revoke execute on function public.shop_mark_order_paid(text, text, text) from public, anon, authenticated;
revoke execute on function public.shop_cancel_pending_order(text) from public, anon;
grant execute on function public.shop_is_admin() to authenticated;
grant execute on function public.shop_create_order(jsonb, text, text, text, text, text, text) to authenticated;
grant execute on function public.shop_cancel_pending_order(text) to authenticated;
grant execute on function public.shop_mark_order_paid(text, text, text) to service_role;

-- ───────── RLS ─────────
alter table public.shop_categories enable row level security;
alter table public.shop_products enable row level security;
alter table public.shop_gift_themes enable row level security;
alter table public.shop_product_themes enable row level security;
alter table public.shop_profiles enable row level security;
alter table public.shop_cart_items enable row level security;
alter table public.shop_orders enable row level security;
alter table public.shop_order_items enable row level security;

-- 카탈로그: 누구나 읽기, 관리자만 쓰기
create policy "categories readable" on public.shop_categories for select using (true);
create policy "categories admin write" on public.shop_categories for all to authenticated
  using ((select public.shop_is_admin())) with check ((select public.shop_is_admin()));

create policy "products readable" on public.shop_products for select
  using (is_active or (select public.shop_is_admin()));
create policy "products admin insert" on public.shop_products for insert to authenticated
  with check ((select public.shop_is_admin()));
create policy "products admin update" on public.shop_products for update to authenticated
  using ((select public.shop_is_admin())) with check ((select public.shop_is_admin()));
create policy "products admin delete" on public.shop_products for delete to authenticated
  using ((select public.shop_is_admin()));

create policy "themes readable" on public.shop_gift_themes for select using (true);
create policy "themes admin write" on public.shop_gift_themes for all to authenticated
  using ((select public.shop_is_admin())) with check ((select public.shop_is_admin()));

create policy "product themes readable" on public.shop_product_themes for select using (true);
create policy "product themes admin insert" on public.shop_product_themes for insert to authenticated
  with check ((select public.shop_is_admin()));
create policy "product themes admin delete" on public.shop_product_themes for delete to authenticated
  using ((select public.shop_is_admin()));

-- 프로필: 본인 읽기/수정(역할 컬럼은 수정 불가), 관리자는 전체 읽기
create policy "profiles self or admin read" on public.shop_profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.shop_is_admin()));
create policy "profiles self update" on public.shop_profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.shop_profiles from authenticated, anon;
grant update (name, phone, zipcode, address1, address2) on public.shop_profiles to authenticated;

-- 장바구니: 본인만
create policy "cart own select" on public.shop_cart_items for select to authenticated
  using (user_id = (select auth.uid()));
create policy "cart own insert" on public.shop_cart_items for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "cart own update" on public.shop_cart_items for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "cart own delete" on public.shop_cart_items for delete to authenticated
  using (user_id = (select auth.uid()));

-- 주문: 본인/관리자 읽기, 생성은 shop_create_order 함수로만, 상태 변경은 관리자만
create policy "orders own or admin read" on public.shop_orders for select to authenticated
  using (user_id = (select auth.uid()) or (select public.shop_is_admin()));
create policy "orders admin update" on public.shop_orders for update to authenticated
  using ((select public.shop_is_admin())) with check ((select public.shop_is_admin()));
revoke update on public.shop_orders from authenticated, anon;
grant update (status) on public.shop_orders to authenticated;

create policy "order items own or admin read" on public.shop_order_items for select to authenticated
  using (exists (
    select 1 from public.shop_orders o
    where o.id = order_id and (o.user_id = (select auth.uid()) or (select public.shop_is_admin()))
  ));

-- ───────── Storage ─────────
insert into storage.buckets (id, name, public)
values ('shop-product-images', 'shop-product-images', true)
on conflict (id) do nothing;

create policy "shop images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'shop-product-images' and (select public.shop_is_admin()));
create policy "shop images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'shop-product-images' and (select public.shop_is_admin()));
create policy "shop images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'shop-product-images' and (select public.shop_is_admin()));
