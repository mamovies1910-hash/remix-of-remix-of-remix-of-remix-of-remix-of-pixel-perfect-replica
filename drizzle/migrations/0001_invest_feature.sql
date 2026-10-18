CREATE TABLE public.invest_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '💰',
  description text,
  daily_percent numeric not null default 2,
  min_amount numeric not null default 100,
  max_amount numeric not null default 100000,
  duration_days integer not null default 30,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.invest_plans TO anon, authenticated;
GRANT ALL ON public.invest_plans TO service_role;
ALTER TABLE public.invest_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans read" ON public.invest_plans FOR SELECT TO anon, authenticated USING (is_active);

CREATE TABLE public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_id uuid not null references public.invest_plans(id),
  plan_name text not null,
  amount numeric not null,
  daily_percent numeric not null,
  duration_days integer not null,
  started_at timestamptz not null default now()
);
GRANT SELECT ON public.investments TO authenticated;
GRANT ALL ON public.investments TO service_role;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own investments" ON public.investments FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Net balance effect of a user's investments: principal locked until maturity, daily profit credited each full day.
CREATE OR REPLACE FUNCTION public.invest_delta(_uid uuid) RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select coalesce(sum(
    - i.amount
    + round(i.amount * i.daily_percent / 100 * least(floor(extract(epoch from now() - i.started_at) / 86400), i.duration_days), 2)
    + case when now() >= i.started_at + make_interval(days => i.duration_days) then i.amount else 0 end
  ), 0) from investments i where i.user_id = _uid $$;

CREATE OR REPLACE FUNCTION public.get_my_balances()
 RETURNS TABLE(available numeric, pending numeric, total_earned numeric, withdrawn numeric)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  with e as (select coalesce(sum(reward_amount),0) v from task_submissions where user_id = auth.uid() and status = 'approved'),
       a as (select coalesce(sum(amount),0) v from balance_adjustments where user_id = auth.uid()),
       p as (select coalesce(sum(reward_amount),0) v from task_submissions where user_id = auth.uid() and status in ('submitted','under_review','pending')),
       w as (select coalesce(sum(amount),0) v from withdrawals where user_id = auth.uid() and status = 'paid'),
       h as (select coalesce(sum(amount),0) v from withdrawals where user_id = auth.uid() and status in ('pending','processing','paid')),
       i as (select public.invest_delta(auth.uid()) v)
  select e.v + a.v - h.v + i.v, p.v, e.v + a.v, w.v from e,a,p,w,h,i $function$;

CREATE OR REPLACE FUNCTION public.admin_user_balances()
 RETURNS TABLE(user_id uuid, earned numeric, adjusted numeric, withdrawn numeric, held numeric)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  select pr.id,
    coalesce((select sum(reward_amount) from task_submissions t where t.user_id = pr.id and t.status='approved'),0),
    coalesce((select sum(amount) from balance_adjustments b where b.user_id = pr.id),0) + public.invest_delta(pr.id),
    coalesce((select sum(amount) from withdrawals w where w.user_id = pr.id and w.status='paid'),0),
    coalesce((select sum(amount) from withdrawals w where w.user_id = pr.id and w.status in ('pending','processing','paid')),0)
  from profiles pr $function$;
REVOKE EXECUTE ON FUNCTION public.admin_user_balances() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.invest_delta(uuid) FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.invest_now(_plan_id uuid, _amount numeric) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
declare pl invest_plans; bal numeric;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from profiles where id = auth.uid() and account_status = 'blocked') then raise exception 'Your account is blocked'; end if;
  select * into pl from invest_plans where id = _plan_id and is_active;
  if pl.id is null then raise exception 'Plan not available'; end if;
  if _amount < pl.min_amount then raise exception 'Minimum is %', pl.min_amount; end if;
  if _amount > pl.max_amount then raise exception 'Maximum is %', pl.max_amount; end if;
  select available into bal from get_my_balances();
  if _amount > bal then raise exception 'Insufficient balance'; end if;
  insert into investments(user_id, plan_id, plan_name, amount, daily_percent, duration_days)
  values (auth.uid(), pl.id, pl.name, _amount, pl.daily_percent, pl.duration_days);
end $$;
GRANT EXECUTE ON FUNCTION public.invest_now(uuid, numeric) TO authenticated;