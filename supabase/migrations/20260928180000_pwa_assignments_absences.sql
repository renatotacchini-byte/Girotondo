-- PWA assignments remain organizer-only; the existing policies enforce the role.
grant insert, update on public.assegnazioni to authenticated;

create unique index if not exists assegnazioni_unica_settimanale
  on public.assegnazioni (giro_id, direzione, giorno_settimana)
  where data_specifica is null;
create unique index if not exists assegnazioni_unica_giornaliera
  on public.assegnazioni (giro_id, direzione, data_specifica)
  where data_specifica is not null;

-- The old assenze table refers to fermate_giro. Keep it intact; new reports use
-- the current programmazione -> fermata -> operazione model.
create table if not exists public.assenze_tratta (
  id uuid primary key default gen_random_uuid(),
  data_servizio date not null,
  tratta_id uuid not null references public.tratte(id) on delete restrict,
  assistito_id uuid not null references public.assistiti(id) on delete restrict,
  segnalato_da uuid not null references public.operatori(id) on delete restrict,
  note text,
  created_at timestamptz not null default now(),
  unique (data_servizio, tratta_id, assistito_id)
);
create index if not exists assenze_tratta_data_idx on public.assenze_tratta (data_servizio, tratta_id);
alter table public.assenze_tratta enable row level security;

-- This function checks the actual assignment, including a daily override, and
-- that the assistito occurs in the route's active program for that date.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
create or replace function private.pwa_can_report_absence(p_date date,p_tratta uuid,p_assistito uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.tratte t
    join public.programmazioni_tratta p on p.tratta_id=t.id
    join public.fermate_programmazione f on f.programmazione_tratta_id=p.id
    join public.operazioni_programmazione op on op.fermata_id=f.id
    join public.operatori me on me.auth_user_id=(select auth.uid()) and me.attivo=true
    join public.assegnazioni a on a.giro_id=t.giro_id and a.direzione=lower(t.nome) and a.operatore_id=me.id
    where t.id=p_tratta and t.attivo=true and op.assistito_id=p_assistito
      and p.attivo=true and p.giorno_settimana=extract(isodow from p_date)::integer
      and (p.data_inizio is null or p.data_inizio<=p_date)
      and (p.data_fine is null or p.data_fine>=p_date)
      and (a.data_specifica=p_date or (
        a.data_specifica is null and a.giorno_settimana=extract(isodow from p_date)::integer
        and not exists (
          select 1 from public.assegnazioni override
          where override.giro_id=a.giro_id and override.direzione=a.direzione
            and override.data_specifica=p_date
        )
      ))
  );
$$;
revoke all on function private.pwa_can_report_absence(date,uuid,uuid) from public;
grant execute on function private.pwa_can_report_absence(date,uuid,uuid) to authenticated;

create policy assenze_tratta_select on public.assenze_tratta for select to authenticated
using (public.is_organizzatore() or private.pwa_can_report_absence(data_servizio,tratta_id,assistito_id));
create policy assenze_tratta_insert on public.assenze_tratta for insert to authenticated
with check (segnalato_da=public.current_operatore_id() and
  (public.is_organizzatore() or private.pwa_can_report_absence(data_servizio,tratta_id,assistito_id)));
create policy assenze_tratta_delete on public.assenze_tratta for delete to authenticated
using (public.is_organizzatore());
grant select, insert, delete on public.assenze_tratta to authenticated;
grant select, insert, update, delete on public.assenze_tratta to service_role;
