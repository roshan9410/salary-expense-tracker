create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null,
  amount_paise bigint not null check (amount_paise > 0),
  note text,
  spent_on date not null,
  created_at timestamptz not null default now()
);
create index on public.transactions (user_id, spent_on);

create table public.month_settings (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  month date not null,
  salary_paise bigint not null default 0,
  savings_goal_paise bigint not null default 0,
  primary key (user_id, month)
);

alter table public.transactions enable row level security;
alter table public.month_settings enable row level security;
create policy "own transactions" on public.transactions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own settings" on public.month_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
