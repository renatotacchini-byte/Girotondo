-- Vehicle registry writes are restricted by the existing organizer-only RLS policies.
grant insert, update, delete on table public.automezzi to authenticated;
