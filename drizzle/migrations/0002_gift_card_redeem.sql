create table public.reward_options (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (brand in ('google_play','amazon')),
  title text not null,
  amount numeric not null check (amount > 0),
  is_active boolean not null default true,
  daily_limit_per_user integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.reward_options to authenticated;
grant all on public.reward_options to service_role;
alter table public.reward_options enable row level security;
create policy "active options read" on public.reward_options for select to authenticated using (is_active);

alter table public.withdrawals add column if not exists reward_option_id uuid references public.reward_options(id);
alter table public.withdrawals add column if not exists reward_label text;

create or replace function public.request_redeem(_option_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare o reward_options; bal numeric; s app_settings;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from profiles where id = auth.uid() and account_status = 'blocked') then raise exception 'Your account is blocked'; end if;
  select * into o from reward_options where id = _option_id and is_active;
  if o.id is null then raise exception 'This card is not available'; end if;
  if o.daily_limit_per_user is not null and (select count(*) from withdrawals where user_id = auth.uid() and reward_option_id = o.id and created_at::date = now()::date and status <> 'rejected') >= o.daily_limit_per_user then
    raise exception 'Daily limit reached for this card'; end if;
  select available into bal from get_my_balances();
  if o.amount > bal then raise exception 'Insufficient balance'; end if;
  select * into s from app_settings where id = 1;
  insert into withdrawals(user_id, amount, fee, currency, reward_option_id, reward_label)
  values (auth.uid(), o.amount, 0, coalesce(s.currency,'INR'), o.id, o.title);
end $$;
revoke execute on function public.request_redeem(uuid) from anon, public;
grant execute on function public.request_redeem(uuid) to authenticated;

insert into public.reward_options(brand, title, amount, sort_order) values
('google_play','Google Play Redeem Code',1599,1),('amazon','Amazon Gift Card',1599,2),
('google_play','Google Play Redeem Code',4000,3),('amazon','Amazon Gift Card',4000,4),
('google_play','Google Play Redeem Code',8000,5),('amazon','Amazon Gift Card',8000,6);