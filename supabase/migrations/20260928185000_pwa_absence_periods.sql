-- Multi-day absences apply to the person on both directions of a giro.
-- Single-route absences remain in assenze_tratta.
create table public.assenze_periodo (
  id uuid primary key default gen_random_uuid(),
  giro_id uuid not null references public.giri(id) on delete restrict,
  assistito_id uuid not null references public.assistiti(id) on delete restrict,
  data_inizio date not null,
  data_fine date not null,
  segnalato_da uuid not null references public.operatori(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint assenze_periodo_date_valide check (data_fine >= data_inizio),
  constraint assenze_periodo_unica unique (giro_id,assistito_id,data_inizio,data_fine)
);
create index assenze_periodo_giro_date_idx on public.assenze_periodo (giro_id,data_inizio,data_fine);
alter table public.assenze_periodo enable row level security;

create policy assenze_periodo_select on public.assenze_periodo for select to authenticated
using (
  public.is_organizzatore() or exists (
    select 1 from public.assegnazioni a
    where a.giro_id=assenze_periodo.giro_id
      and a.operatore_id=public.current_operatore_id()
  )
);
create policy assenze_periodo_insert on public.assenze_periodo for insert to authenticated
with check (public.is_organizzatore() and segnalato_da=public.current_operatore_id());
create policy assenze_periodo_delete on public.assenze_periodo for delete to authenticated
using (public.is_organizzatore());

grant select, insert, delete on public.assenze_periodo to authenticated;
grant select, insert, update, delete on public.assenze_periodo to service_role;
