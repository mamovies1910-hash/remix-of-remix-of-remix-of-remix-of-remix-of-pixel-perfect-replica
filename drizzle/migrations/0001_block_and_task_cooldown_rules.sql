create or replace function public.submit_task(_task_id uuid, _evidence text) returns void
language plpgsql security definer set search_path = public as $$
declare r numeric;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from profiles where id = auth.uid() and account_status = 'blocked') then raise exception 'Your account is blocked'; end if;
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
  if exists (select 1 from profiles where id = auth.uid() and account_status = 'blocked') then raise exception 'Your account is blocked'; end if;
  select * into s from app_settings where id = 1;
  if _amount < s.min_withdrawal then raise exception 'Minimum withdrawal is %', s.min_withdrawal; end if;
  if not exists (select 1 from payout_methods where id = _payout_method_id and user_id = auth.uid()) then raise exception 'Invalid payout account'; end if;
  select available into bal from get_my_balances();
  if _amount > bal then raise exception 'Insufficient balance'; end if;
  insert into withdrawals(user_id, payout_method_id, amount, fee, currency) values (auth.uid(), _payout_method_id, _amount, round(_amount*s.fee_percent/100 + s.fee_flat, 2), s.currency);
end $$;