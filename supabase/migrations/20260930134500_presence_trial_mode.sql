-- Preserve existing test history; do not mix it with the future real register.
alter table private.registro_presenze_config add column modalita_prova boolean not null default false;
alter table private.registro_presenze_config add column data_avvio_reale date;
update private.registro_presenze_config set modalita_prova=true,data_avvio_reale=null where singleton;
alter table private.registro_presenze_config add constraint registro_avvio_reale_check
 check ((modalita_prova and data_avvio_reale is null) or (not modalita_prova and data_avvio_reale is not null));
create policy registro_config_no_client_access on private.registro_presenze_config for all to anon,authenticated using(false) with check(false);

alter table public.registro_presenze_giorni add column modalita_prova boolean not null default true;
alter table public.registro_presenze_storico add column modalita_prova boolean not null default true;
alter table public.registro_presenze_storico alter column modalita_prova set default false;
-- Existing snapshots belong to tests; new production snapshots default to real.
alter table public.registro_presenze_giorni alter column modalita_prova set default false;

create or replace function private.registro_presenze_chiudi_giornate()
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_date date;v_start date;v_auto date;v_today date:=(now() at time zone 'Europe/Rome')::date;
 v_days integer:=0;v_rows integer:=0;v_prova boolean;v_avvio date;v_meta jsonb;
begin
 perform pg_catalog.pg_advisory_xact_lock(1040,510);
 select inizio_storico,primo_giorno_giornaliero,modalita_prova,data_avvio_reale
 into v_start,v_auto,v_prova,v_avvio from private.registro_presenze_config where singleton;
 if not v_prova then v_start:=greatest(v_start,v_avvio);end if;
 v_meta:=jsonb_build_object('inizio_storico',v_start,'primo_giorno_giornaliero',v_auto,
  'modalita_prova',v_prova,'data_avvio_reale',v_avvio,'oggi',v_today);
 if v_prova then
  return v_meta||jsonb_build_object('giornate_aggiunte',0,'righe_aggiunte',0,'chiuso_fino_a',null);
 end if;
 -- A real start date must be explicitly selected after setup/testing.
 v_start:=greatest(v_start,v_avvio);
 for v_date in select d::date from pg_catalog.generate_series(v_start::timestamp,(v_today-1)::timestamp,interval '1 day') d
   where not exists(select 1 from public.registro_presenze_giorni g where g.data_servizio=d::date)
 loop
  v_rows:=v_rows+private.registro_presenze_archivia_data(v_date,case when v_date<v_auto then 'ricostruito' else 'giornaliero' end);
  v_days:=v_days+1;
 end loop;
 return v_meta||jsonb_build_object('giornate_aggiunte',v_days,'righe_aggiunte',v_rows,
  'chiuso_fino_a',(select max(data_servizio) from public.registro_presenze_giorni where not modalita_prova));
end $$;

-- Guard the lower-level capture routine too, not just Cron/the trigger entry point.
do $$ declare d text;begin
 d:=pg_get_functiondef('private.registro_presenze_archivia_data(date,text)'::regprocedure);
 if position('if p_data is null' in d)=0 then raise exception 'Snapshot function not recognized';end if;
 execute replace(d,'if p_data is null',E'if exists(select 1 from private.registro_presenze_config where singleton and modalita_prova) then return 0;end if;\n if p_data is null');
end $$;
revoke all on function private.registro_presenze_chiudi_giornate() from public,anon,authenticated;
revoke all on function private.registro_presenze_archivia_data(date,text) from public,anon,authenticated;

-- Test rows are preserved, but cannot be corrected as real attendance.
do $$ declare d text;begin
 d:=pg_get_functiondef('private.registro_presenze_correggi(uuid,boolean,text,integer)'::regprocedure);
 if position('if v_row.versione<>' in d)=0 then raise exception 'Correction function not recognized';end if;
 execute replace(d,'if v_row.versione<>',E'if v_row.modalita_prova then raise exception ''Questa presenza appartiene alle prove e non al registro reale.'';end if;\n if v_row.versione<>');
end $$;
