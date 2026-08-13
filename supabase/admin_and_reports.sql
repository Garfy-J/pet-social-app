-- Pets Social: admin moderation (delete any post/comment) + reports log.
-- Run after schema.sql, messaging_schema.sql, and chat_and_profile_updates.sql.

alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Additive to the existing "Users can delete their own X" policies —
-- Postgres OR's together permissive policies for the same command, so a
-- row is deletable if the requester owns it OR is an admin.
create policy "Admins can delete any post"
  on public.posts for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can delete any comment"
  on public.comments for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ---------------------------------------------------------------------------
-- reports (a post OR a comment, never both)
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint reports_single_target check (
    (post_id is not null and comment_id is null)
    or (post_id is null and comment_id is not null)
  )
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);

alter table public.reports enable row level security;

create policy "Users can file their own reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Admins can view all reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Make yourself an admin (adjust the username):
-- update public.profiles set is_admin = true where username = 'garfy';
