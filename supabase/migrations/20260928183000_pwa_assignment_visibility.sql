-- Operators see the assignment roster in Auto; mutation remains organizer-only.
-- Reading the full roster lets the PWA suppress a weekly assignment when a
-- daily override assigns the same route to another operator.
alter policy assegnazioni_select on public.assegnazioni
  using (public.current_operatore_id() is not null);
