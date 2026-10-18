create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, phone text, avatar_url text,
  country text default 'India', preferred_language text default 'en',
  profile_completed boolean not null default false,
  account_status text not null default 'active',
  last_seen_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','user')), unique(user_id, role)
);
create table public.app_settings (
  id int primary key default 1 check (id = 1),
  min_withdrawal numeric not null default 100, fee_percent numeric not null default 0, fee_flat numeric not null default 0,
  currency text not null default 'INR', updated_at timestamptz not null default now()
);
insert into public.app_settings(id) values (1);
create table public.tasks (
  id uuid primary key default gen_random_uuid(), title text not null, description text,
  reward_amount numeric not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.task_submissions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null,
  task_id uuid not null references public.tasks(id) on delete cascade,
  evidence text, status text not null default 'approved', reward_amount numeric not null default 0,
  submitted_at timestamptz not null default now(), reviewed_at timestamptz
);
create table public.payout_methods (
  id uuid primary key default gen_random_uuid(), user_id uuid not null,
  method_type text not null check (method_type in ('upi','bank')), holder_name text not null,
  upi_id text, bank_name text, account_number text, ifsc text,
  verification_status text not null default 'pending', created_at timestamptz not null default now()
);
create table public.withdrawals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null,
  payout_method_id uuid references public.payout_methods(id), amount numeric not null, fee numeric not null default 0,
  currency text not null default 'INR', status text not null default 'pending', provider_reference text,
  created_at timestamptz not null default now()
);

grant select, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.app_settings to anon, authenticated;
grant select on public.tasks to authenticated;
grant select on public.task_submissions to authenticated;
grant select, insert on public.payout_methods to authenticated;
grant select on public.withdrawals to authenticated;
grant all on public.profiles, public.user_roles, public.app_settings, public.tasks, public.task_submissions, public.payout_methods, public.withdrawals, public.firebase_identity_links to service_role;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.app_settings enable row level security;
alter table public.tasks enable row level security;
alter table public.task_submissions enable row level security;
alter table public.payout_methods enable row level security;
alter table public.withdrawals enable row level security;
alter table public.firebase_identity_links enable row level security;

create or replace function public.has_role(_user_id uuid, _role text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "settings read" on public.app_settings for select using (true);
create policy "tasks read" on public.tasks for select to authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "own subs" on public.task_submissions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own payout read" on public.payout_methods for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own payout insert" on public.payout_methods for insert to authenticated with check (user_id = auth.uid());
create policy "own withdrawals" on public.withdrawals for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.protect_profile() returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null and not public.has_role(auth.uid(),'admin') then
    new.account_status := old.account_status;
  end if;
  new.updated_at := now(); return new;
end $$;
create trigger protect_profile before update on public.profiles for each row execute function public.protect_profile();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, email, full_name) values (new.id, new.email, new.raw_user_meta_data->>'full_name') on conflict do nothing;
  insert into public.user_roles(user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.get_my_balances() returns table(available numeric, pending numeric, total_earned numeric, withdrawn numeric)
language sql stable security definer set search_path = public as $$
  with e as (select coalesce(sum(reward_amount),0) v from task_submissions where user_id = auth.uid() and status = 'approved'),
       p as (select coalesce(sum(reward_amount),0) v from task_submissions where user_id = auth.uid() and status in ('submitted','under_review','pending')),
       w as (select coalesce(sum(amount),0) v from withdrawals where user_id = auth.uid() and status = 'paid'),
       h as (select coalesce(sum(amount),0) v from withdrawals where user_id = auth.uid() and status in ('pending','processing','paid'))
  select e.v - h.v, p.v, e.v, w.v from e,p,w,h $$;

create or replace function public.submit_task(_task_id uuid, _evidence text) returns void
language plpgsql security definer set search_path = public as $$
declare r numeric;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select reward_amount into r from tasks where id = _task_id and is_active;
  if r is null then raise exception 'Task not available'; end if;
  if exists (select 1 from task_submissions where user_id = auth.uid() and task_id = _task_id and submitted_at::date = now()::date) then
    raise exception 'Already completed today'; end if;
  insert into task_submissions(user_id, task_id, evidence, status, reward_amount) values (auth.uid(), _task_id, left(_evidence, 500), 'approved', r);
end $$;

create or replace function public.request_withdrawal(_amount numeric, _payout_method_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare s app_settings; bal numeric;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select * into s from app_settings where id = 1;
  if _amount < s.min_withdrawal then raise exception 'Minimum withdrawal is %', s.min_withdrawal; end if;
  if not exists (select 1 from payout_methods where id = _payout_method_id and user_id = auth.uid()) then raise exception 'Invalid payout account'; end if;
  select available into bal from get_my_balances();
  if _amount > bal then raise exception 'Insufficient balance'; end if;
  insert into withdrawals(user_id, payout_method_id, amount, fee, currency) values (auth.uid(), _payout_method_id, _amount, round(_amount*s.fee_percent/100 + s.fee_flat, 2), s.currency);
end $$;

revoke execute on function public.get_my_balances() from anon, public;
revoke execute on function public.submit_task(uuid,text) from anon, public;
revoke execute on function public.request_withdrawal(numeric,uuid) from anon, public;
grant execute on function public.get_my_balances(), public.submit_task(uuid,text), public.request_withdrawal(numeric,uuid), public.has_role(uuid,text) to authenticated;

insert into public.tasks(title, description, reward_amount) values
('Watch a video ad','Watch a short ad to earn a reward.',5),
('Complete a survey','Answer a few quick questions.',10),
('Join a community','Join our channel and stay connected.',8),
('Daily check-in','Open the app and claim your daily bonus.',2),
('Share with a friend','Share the app link with a friend.',15);