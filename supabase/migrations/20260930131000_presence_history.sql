-- Immutable daily membership/names with explicit, audited presence corrections.
create extension if not exists pg_cron with schema pg_catalog;
create schema if not exists private;

create table private.registro_presenze_config (
  singleton boolean primary key default true check(singleton),
  inizio_storico date not null,
  primo_giorno_giornaliero date not null
);
alter table private.registro_presenze_config enable row level security;
revoke all on private.registro_presenze_config from public,anon,authenticated;
insert into private.registro_presenze_config(singleton,inizio_storico,primo_giorno_giornaliero)
select true,least(coalesce(min((created_at at time zone 'Europe/Rome')::date),(now() at time zone 'Europe/Rome')::date),(now() at time zone 'Europe/Rome')::date),(now() at time zone 'Europe/Rome')::date
from public.programmazioni_tratta;

create table public.registro_presenze_giorni (
 id uuid primary key default gen_random_uuid(),
 data_servizio date not null unique,
 origine text not null check(origine in ('ricostruito','giornaliero')),
 chiuso_at timestamptz not null default now()
);
create table public.registro_presenze_storico (
 id uuid primary key default gen_random_uuid(),
 data_servizio date not null references public.registro_presenze_giorni(data_servizio),
 tratta_id uuid not null,
 giro_id uuid not null,
 assistito_id uuid not null,
 giro_numero text not null,
 tratta_nome text not null,
 assistito_nome text not null,
 presente boolean not null,
 assenza_origine text not null default '',
 scaletta_origine text not null check(scaletta_origine in ('Settimanale','Variazione per data')),
 versione integer not null default 0 check(versione>=0),
 corretto_at timestamptz,
 motivo_correzione text,
 unique(data_servizio,tratta_id,assistito_id)
);
-- Source identifiers intentionally have no FK to mutable operational tables.
-- Deleting/renaming a person or route must not erase historical administration data.
create index registro_presenze_assistito_data_idx on public.registro_presenze_storico(assistito_id,data_servizio);
create table public.registro_presenze_correzioni (
 id uuid primary key default gen_random_uuid(),
 registro_id uuid not null references public.registro_presenze_storico(id),
 presente_prima boolean not null,
 presente_dopo boolean not null,
 motivo text not null check(char_length(btrim(motivo)) between 3 and 1000),
 operatore_auth_id uuid not null,
 operatore_nome text not null,
 corretto_at timestamptz not null default now(),
 versione integer not null,
 unique(registro_id,versione)
);
create index registro_presenze_correzioni_registro_idx on public.registro_presenze_correzioni(registro_id);

alter table public.registro_presenze_giorni enable row level security;
alter table public.registro_presenze_storico enable row level security;
alter table public.registro_presenze_correzioni enable row level security;
revoke all on public.registro_presenze_giorni,public.registro_presenze_storico,public.registro_presenze_correzioni from public,anon,authenticated;
grant select on public.registro_presenze_giorni,public.registro_presenze_storico,public.registro_presenze_correzioni to authenticated;
create policy registro_giorni_organizzatore_read on public.registro_presenze_giorni for select to authenticated using((select public.is_organizzatore()));
create policy registro_storico_organizzatore_read on public.registro_presenze_storico for select to authenticated using((select public.is_organizzatore()));
create policy registro_correzioni_organizzatore_read on public.registro_presenze_correzioni for select to authenticated using((select public.is_organizzatore()));

-- Internal scheduler code: invoker, never exposed or granted to clients.
create function private.registro_presenze_archivia_data(p_data date,p_origine text)
returns integer language plpgsql security invoker set search_path='' as $$
declare v_count integer;
begin
 if p_data is null or p_data >= (now() at time zone 'Europe/Rome')::date then
   raise exception 'Solo le giornate concluse possono essere archiviate.';
 end if;
 insert into public.registro_presenze_giorni(data_servizio,origine)
 values(p_data,p_origine) on conflict(data_servizio) do nothing;
 get diagnostics v_count=row_count;
 if v_count=0 then return 0; end if;
 with effective as (
   select p.* from public.programmazioni_tratta p
   where p.attivo and (p.data_specifica=p_data or
    (p.data_specifica is null and p.giorno_settimana=extract(isodow from p_data)::smallint
     and (p.data_inizio is null or p.data_inizio<=p_data)
     and (p.data_fine is null or p.data_fine>=p_data)
     and not exists(select 1 from public.programmazioni_tratta q
       where q.tratta_id=p.tratta_id and q.data_specifica=p_data and q.attivo)))
 ), members as (
   select distinct p.tratta_id,o.assistito_id,
    case when p.data_specifica is null then 'Settimanale' else 'Variazione per data' end as origine
   from effective p join public.fermate_programmazione f on f.programmazione_tratta_id=p.id
   join public.operazioni_programmazione o on o.fermata_id=f.id
 ), rows as (
   select m.*,t.giro_id,t.nome as tratta_nome,g.numero::text as giro_numero,
     btrim(concat_ws(' ',a.cognome,a.nome)) as assistito_nome,
     exists(select 1 from public.assenze_tratta x where x.data_servizio=p_data and x.tratta_id=m.tratta_id and x.assistito_id=m.assistito_id) as singola,
     exists(select 1 from public.assenze_periodo x where x.giro_id=t.giro_id and x.assistito_id=m.assistito_id and p_data between x.data_inizio and x.data_fine) as periodo
   from members m join public.tratte t on t.id=m.tratta_id join public.giri g on g.id=t.giro_id join public.assistiti a on a.id=m.assistito_id
 )
 insert into public.registro_presenze_storico(data_servizio,tratta_id,giro_id,assistito_id,giro_numero,tratta_nome,assistito_nome,presente,assenza_origine,scaletta_origine)
 select p_data,tratta_id,giro_id,assistito_id,giro_numero,tratta_nome,assistito_nome,
 not(singola or periodo),case when singola then 'Assenza della tratta' when periodo then 'Periodo di assenza' else '' end,origine
 from rows;
 get diagnostics v_count=row_count;
 return v_count;
end $$;
revoke all on function private.registro_presenze_archivia_data(date,text) from public,anon,authenticated;

create function private.registro_presenze_chiudi_giornate()
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_date date; v_start date; v_auto date; v_today date:=(now() at time zone 'Europe/Rome')::date; v_days integer:=0; v_rows integer:=0;
begin
 -- Also serializes operational mutations, preventing a missing day from being
 -- reconstructed after the first next-day schedule edit.
 perform pg_catalog.pg_advisory_xact_lock(1040,510);
 select inizio_storico,primo_giorno_giornaliero into v_start,v_auto from private.registro_presenze_config where singleton;
 for v_date in select d::date from pg_catalog.generate_series(v_start::timestamp,(v_today-1)::timestamp,interval '1 day') d
   where not exists(select 1 from public.registro_presenze_giorni g where g.data_servizio=d::date)
 loop
   v_rows:=v_rows+private.registro_presenze_archivia_data(v_date,case when v_date<v_auto then 'ricostruito' else 'giornaliero' end);
   v_days:=v_days+1;
 end loop;
 return jsonb_build_object('giornate_aggiunte',v_days,'righe_aggiunte',v_rows,'inizio_storico',v_start,
  'primo_giorno_giornaliero',v_auto,'chiuso_fino_a',(select max(data_servizio) from public.registro_presenze_giorni));
end $$;
revoke all on function private.registro_presenze_chiudi_giornate() from public,anon,authenticated;

-- Privileged wrappers live in private and validate identity and authorization.
create function private.registro_presenze_sync_organizzatore()
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if (select auth.uid()) is null or not coalesce(public.is_organizzatore(),false) then raise exception 'Solo un organizzatore può accedere al registro.'; end if;
 return private.registro_presenze_chiudi_giornate();
end $$;
revoke all on function private.registro_presenze_sync_organizzatore() from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.registro_presenze_sync_organizzatore() to authenticated;
create function public.sincronizza_registro_presenze()
returns jsonb language sql security invoker set search_path='' as $$ select private.registro_presenze_sync_organizzatore(); $$;
revoke all on function public.sincronizza_registro_presenze() from public,anon;
grant execute on function public.sincronizza_registro_presenze() to authenticated;

create function private.registro_presenze_correggi(p_id uuid,p_presente boolean,p_motivo text,p_versione integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_row public.registro_presenze_storico%rowtype; v_actor text; v_motivo text:=btrim(p_motivo);
begin
 if (select auth.uid()) is null or not coalesce(public.is_organizzatore(),false) then raise exception 'Solo un organizzatore può correggere il registro.'; end if;
 if p_presente is null or p_versione is null or v_motivo is null or char_length(v_motivo) not between 3 and 1000 then raise exception 'Indica presenza e motivazione della correzione (3–1000 caratteri).'; end if;
 select * into v_row from public.registro_presenze_storico where id=p_id for update;
 if not found then raise exception 'Presenza archiviata non trovata.'; end if;
 if v_row.versione<>p_versione then raise exception 'Questa presenza è stata modificata da un altro organizzatore. Ricalcola il registro.'; end if;
 if v_row.presente=p_presente then raise exception 'Il registro ha già lo stato indicato.'; end if;
 select btrim(concat_ws(' ',nome,cognome)) into v_actor from public.operatori where auth_user_id=(select auth.uid()) and attivo limit 1;
 update public.registro_presenze_storico set presente=p_presente,versione=versione+1,corretto_at=now(),motivo_correzione=v_motivo where id=p_id;
 insert into public.registro_presenze_correzioni(registro_id,presente_prima,presente_dopo,motivo,operatore_auth_id,operatore_nome,versione)
 values(p_id,v_row.presente,p_presente,v_motivo,(select auth.uid()),coalesce(v_actor,'Organizzatore'),v_row.versione+1);
 return jsonb_build_object('id',p_id,'presente',p_presente,'versione',v_row.versione+1);
end $$;
revoke all on function private.registro_presenze_correggi(uuid,boolean,text,integer) from public,anon,authenticated;
grant execute on function private.registro_presenze_correggi(uuid,boolean,text,integer) to authenticated;
create function public.correggi_registro_presenze(p_id uuid,p_presente boolean,p_motivo text,p_versione integer)
returns jsonb language sql security invoker set search_path='' as $$ select private.registro_presenze_correggi(p_id,p_presente,p_motivo,p_versione); $$;
revoke all on function public.correggi_registro_presenze(uuid,boolean,text,integer) from public,anon;
grant execute on function public.correggi_registro_presenze(uuid,boolean,text,integer) to authenticated;

-- Trigger-only privileged entry point, with no direct client execution grant.
create function private.registro_presenze_proteggi_passato()
returns trigger language plpgsql security definer set search_path='' as $$
begin perform private.registro_presenze_chiudi_giornate(); return null; end $$;
revoke all on function private.registro_presenze_proteggi_passato() from public,anon,authenticated;
do $$ declare t text; begin
 foreach t in array array['giri','tratte','assistiti','programmazioni_tratta','fermate_programmazione','operazioni_programmazione','assenze_tratta','assenze_periodo'] loop
  execute format('create trigger registro_presenze_prima_modifica before insert or update or delete on public.%I for each statement execute function private.registro_presenze_proteggi_passato()',t);
 end loop;
end $$;

-- Bootstrap existing days honestly marked as reconstructed. Never overwrite.
select private.registro_presenze_chiudi_giornate();
-- UTC schedules cover local midnight + 5 minutes for both CET and CEST.
-- The second run is an idempotent no-op; triggers cover edits before the run.
select cron.schedule('girotondo-chiusura-presenze','5 22,23 * * *','select private.registro_presenze_chiudi_giornate();');
