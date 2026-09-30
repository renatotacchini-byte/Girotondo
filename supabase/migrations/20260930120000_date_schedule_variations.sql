-- Dated schedules override the weekly schedule for this route/date only.
alter table public.programmazioni_tratta add column data_specifica date;
alter table public.programmazioni_tratta add constraint programmazione_data_giorno_check
  check (data_specifica is null or giorno_settimana=extract(isodow from data_specifica)::smallint);
drop index public.programmazioni_tratta_giorno_uq;
create unique index programmazioni_tratta_giorno_uq
  on public.programmazioni_tratta(tratta_id,giorno_settimana) where data_specifica is null;
create unique index programmazioni_tratta_data_uq
  on public.programmazioni_tratta(tratta_id,data_specifica) where data_specifica is not null;

create or replace function public.copia_programmazione_tratta(
  p_tratta_id uuid,
  p_giorno_origine smallint,
  p_giorno_destinazione smallint
) returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_source_id uuid;
  v_target_id uuid;
  v_new_stop_id uuid;
  v_stop record;
  v_fermate integer := 0;
  v_operazioni integer := 0;
  v_inserted integer;
begin
  if (select auth.uid()) is null or not public.is_organizzatore() then
    raise exception 'Solo un organizzatore può copiare una programmazione.';
  end if;
  if p_tratta_id is null or p_giorno_origine not between 1 and 7
     or p_giorno_destinazione not between 1 and 7
     or p_giorno_origine = p_giorno_destinazione then
    raise exception 'Seleziona due giorni diversi della stessa tratta.';
  end if;

  select id into v_source_id
  from public.programmazioni_tratta
  where tratta_id=p_tratta_id and giorno_settimana=p_giorno_origine and data_specifica is null and attivo=true;
  if v_source_id is null then
    raise exception 'La programmazione di origine non è disponibile.';
  end if;
  if exists (
    select 1 from public.programmazioni_tratta
    where tratta_id=p_tratta_id and giorno_settimana=p_giorno_destinazione and data_specifica is null
  ) then
    raise exception 'Il giorno di destinazione ha già una programmazione.';
  end if;

  -- A failure anywhere in this function rolls back the new day and every row.
  insert into public.programmazioni_tratta
    (tratta_id,giorno_settimana,data_inizio,data_fine,attivo)
  values (p_tratta_id,p_giorno_destinazione,null,null,true)
  returning id into v_target_id;

  for v_stop in
    select id,ordine,nome,indirizzo,note,orario_previsto,tipo_orario
    from public.fermate_programmazione
    where programmazione_tratta_id=v_source_id
    order by ordine,id
  loop
    insert into public.fermate_programmazione
      (programmazione_tratta_id,ordine,nome,indirizzo,note,orario_previsto,tipo_orario)
    values
      (v_target_id,v_stop.ordine,v_stop.nome,v_stop.indirizzo,v_stop.note,
       v_stop.orario_previsto,v_stop.tipo_orario)
    returning id into v_new_stop_id;
    v_fermate := v_fermate+1;

    insert into public.operazioni_programmazione
      (fermata_id,assistito_id,azione,orario_previsto,tipo_orario,destinazione,note,created_at)
    select v_new_stop_id,assistito_id,azione,orario_previsto,tipo_orario,
      destinazione,note,
      clock_timestamp()+row_number() over(order by created_at,id)*interval '1 microsecond'
    from public.operazioni_programmazione
    where fermata_id=v_stop.id
    order by created_at,id;
    get diagnostics v_inserted = row_count;
    v_operazioni := v_operazioni+v_inserted;
  end loop;

  return jsonb_build_object('programmazione_id',v_target_id,
    'fermate',v_fermate,'operazioni',v_operazioni);
end;
$$;
revoke all on function public.copia_programmazione_tratta(uuid,smallint,smallint) from public,anon;
grant execute on function public.copia_programmazione_tratta(uuid,smallint,smallint) to authenticated;

create or replace function public.crea_variazione_tratta(
  p_tratta_id uuid,
  p_data date
) returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_source_id uuid;
  v_target_id uuid;
  v_new_stop_id uuid;
  v_stop record;
  v_fermate integer := 0;
  v_operazioni integer := 0;
  v_inserted integer;
begin
  if (select auth.uid()) is null or not public.is_organizzatore() then
    raise exception 'Solo un organizzatore può copiare una programmazione.';
  end if;
  if p_tratta_id is null or p_data is null then
    raise exception 'Seleziona una tratta e una data.';
  end if;
  select id into v_source_id from public.programmazioni_tratta
  where tratta_id=p_tratta_id and data_specifica is null and attivo=true
    and giorno_settimana=extract(isodow from p_data)::smallint
    and (data_inizio is null or data_inizio<=p_data)
    and (data_fine is null or data_fine>=p_data);
  if v_source_id is null then
    raise exception 'Nessuna programmazione settimanale attiva per questa data.';
  end if;
  if exists (select 1 from public.programmazioni_tratta
    where tratta_id=p_tratta_id and data_specifica=p_data) then
    raise exception 'Esiste già una variazione per questa data. Aprila per modificarla.';
  end if;

  -- A failure anywhere in this function rolls back the new day and every row.
  insert into public.programmazioni_tratta
    (tratta_id,giorno_settimana,data_specifica,data_inizio,data_fine,attivo)
  values (p_tratta_id,extract(isodow from p_data)::smallint,p_data,null,null,true)
  returning id into v_target_id;

  for v_stop in
    select id,ordine,nome,indirizzo,note,orario_previsto,tipo_orario
    from public.fermate_programmazione
    where programmazione_tratta_id=v_source_id
    order by ordine,id
  loop
    insert into public.fermate_programmazione
      (programmazione_tratta_id,ordine,nome,indirizzo,note,orario_previsto,tipo_orario)
    values
      (v_target_id,v_stop.ordine,v_stop.nome,v_stop.indirizzo,v_stop.note,
       v_stop.orario_previsto,v_stop.tipo_orario)
    returning id into v_new_stop_id;
    v_fermate := v_fermate+1;

    insert into public.operazioni_programmazione
      (fermata_id,assistito_id,azione,orario_previsto,tipo_orario,destinazione,note,created_at)
    select v_new_stop_id,assistito_id,azione,orario_previsto,tipo_orario,
      destinazione,note,
      clock_timestamp()+row_number() over(order by created_at,id)*interval '1 microsecond'
    from public.operazioni_programmazione
    where fermata_id=v_stop.id
    order by created_at,id;
    get diagnostics v_inserted = row_count;
    v_operazioni := v_operazioni+v_inserted;
  end loop;

  return jsonb_build_object('programmazione_id',v_target_id,
    'fermate',v_fermate,'operazioni',v_operazioni);
end;
$$;
revoke all on function public.crea_variazione_tratta(uuid,date) from public,anon;
grant execute on function public.crea_variazione_tratta(uuid,date) to authenticated;
