-- Pets Social: unread-message tracking + avatar uploads
-- Run after schema.sql and messaging_schema.sql.

-- ---------------------------------------------------------------------------
-- Per-participant read state, for unread indicators in the chat list.
-- ---------------------------------------------------------------------------
alter table public.conversations add column if not exists user_a_last_read_at timestamptz;
alter table public.conversations add column if not exists user_b_last_read_at timestamptz;

create policy "Participants can update their read state"
  on public.conversations for update
  using (auth.uid() = user_a or auth.uid() = user_b);

-- Row-level policies can't compare OLD vs NEW values, so a trigger stops a
-- participant from reassigning the conversation to themselves + someone else.
create or replace function public.prevent_conversation_participant_change()
returns trigger
language plpgsql
as $$
begin
  if new.user_a <> old.user_a or new.user_b <> old.user_b then
    raise exception 'Cannot change conversation participants';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_participant_change on public.conversations;
create trigger prevent_participant_change
  before update on public.conversations
  for each row execute procedure public.prevent_conversation_participant_change();

-- ---------------------------------------------------------------------------
-- storage: bucket for profile avatars
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can replace their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
