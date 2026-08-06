-- Pets Social messaging schema (run after schema.sql)
-- Adds profile bios, 1:1 conversations, messages, and Realtime.

alter table public.profiles add column if not exists bio text;

-- ---------------------------------------------------------------------------
-- conversations (one row per unique pair of participants)
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  constraint conversations_user_order check (user_a < user_b),
  unique (user_a, user_b)
);

alter table public.conversations enable row level security;

create policy "Participants can view their conversations"
  on public.conversations for select
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Users can create conversations they participate in"
  on public.conversations for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx
  on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

create policy "Participants can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

create policy "Participants can send messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

create policy "Senders can delete their own messages"
  on public.messages for delete
  using (auth.uid() = sender_id);

-- Keep conversations.last_message_at in sync for ordering the chat list.
create or replace function public.handle_new_message()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute procedure public.handle_new_message();

-- Enable Realtime (Postgres Changes) for instant message delivery.
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;
