grant select on public.reward_options to anon;
drop policy if exists "active options read" on public.reward_options;
create policy "active options read" on public.reward_options for select to anon, authenticated using (is_active);