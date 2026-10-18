alter table public.app_settings add column if not exists announcement text;
alter table public.tasks add column if not exists action_type text not null default 'watch';
alter table public.tasks add column if not exists action_url text;
alter table public.tasks add column if not exists duration_seconds integer not null default 15;
alter table public.tasks add column if not exists button_label text;
alter table public.tasks add column if not exists sort_order integer not null default 0;

create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('slide','video')),
  url text not null,
  title text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.media_items to anon, authenticated;
grant all on public.media_items to service_role;
alter table public.media_items enable row level security;
create policy "media public read" on public.media_items for select to anon, authenticated using (is_active);

create table public.balance_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount numeric not null,
  note text,
  created_at timestamptz not null default now()
);
grant select on public.balance_adjustments to authenticated;
grant all on public.balance_adjustments to service_role;
alter table public.balance_adjustments enable row level security;
create policy "own adjustments" on public.balance_adjustments for select to authenticated using (user_id = auth.uid());

create or replace function public.get_my_balances() returns table(available numeric, pending numeric, total_earned numeric, withdrawn numeric)
language sql stable security definer set search_path = public as $$
  with e as (select coalesce(sum(reward_amount),0) v from task_submissions where user_id = auth.uid() and status = 'approved'),
       a as (select coalesce(sum(amount),0) v from balance_adjustments where user_id = auth.uid()),
       p as (select coalesce(sum(reward_amount),0) v from task_submissions where user_id = auth.uid() and status in ('submitted','under_review','pending')),
       w as (select coalesce(sum(amount),0) v from withdrawals where user_id = auth.uid() and status = 'paid'),
       h as (select coalesce(sum(amount),0) v from withdrawals where user_id = auth.uid() and status in ('pending','processing','paid'))
  select e.v + a.v - h.v, p.v, e.v + a.v, w.v from e,a,p,w,h $$;

create or replace function public.admin_user_balances() returns table(user_id uuid, earned numeric, adjusted numeric, withdrawn numeric, held numeric)
language sql stable security definer set search_path = public as $$
  select pr.id,
    coalesce((select sum(reward_amount) from task_submissions t where t.user_id = pr.id and t.status='approved'),0),
    coalesce((select sum(amount) from balance_adjustments b where b.user_id = pr.id),0),
    coalesce((select sum(amount) from withdrawals w where w.user_id = pr.id and w.status='paid'),0),
    coalesce((select sum(amount) from withdrawals w where w.user_id = pr.id and w.status in ('pending','processing','paid')),0)
  from profiles pr $$;
revoke execute on function public.admin_user_balances() from anon, authenticated, public;
grant execute on function public.admin_user_balances() to service_role;