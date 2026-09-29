-- Keep the current creation order, then assign new routes the next position.
alter table public.tratte add column ordine integer;

with ranked as (
  select id, row_number() over (partition by giro_id order by created_at, id)::integer as posizione
  from public.tratte
)
update public.tratte t set ordine = ranked.posizione
from ranked where ranked.id = t.id;

alter table public.tratte alter column ordine set not null;

create function public.assegna_ordine_tratta()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if new.ordine is null then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.giro_id::text, 0));
    select coalesce(max(t.ordine), 0) + 1 into new.ordine
    from public.tratte t where t.giro_id = new.giro_id;
  end if;
  return new;
end;
$$;

create trigger assegna_ordine_tratta
before insert on public.tratte
for each row execute function public.assegna_ordine_tratta();

-- Existing organizer-only RLS policies still control writes.
grant insert, update on table public.tratte to authenticated;

create function public.sposta_tratta(p_tratta_id uuid, p_direzione smallint)
returns void language plpgsql security invoker set search_path = ''
as $$
declare
  v_giro_id uuid;
  v_ids uuid[];
  v_pos integer;
  v_other uuid;
  v_ordine integer;
  v_other_ordine integer;
begin
  if (select auth.uid()) is null or not public.is_organizzatore() then
    raise exception 'Solo un organizzatore può spostare una tratta.';
  end if;
  if p_direzione not in (-1, 1) or p_direzione is null then
    raise exception 'Direzione non valida.';
  end if;
  select giro_id into v_giro_id from public.tratte
  where id = p_tratta_id and attivo = true;
  if v_giro_id is null then raise exception 'Tratta attiva non trovata.'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_giro_id::text, 0));
  perform 1 from public.tratte where giro_id = v_giro_id for update;
  select array_agg(id order by ordine, created_at, id) into v_ids
  from public.tratte where giro_id = v_giro_id and attivo = true;
  v_pos := array_position(v_ids, p_tratta_id);
  if v_pos is null or v_pos + p_direzione < 1 or v_pos + p_direzione > array_length(v_ids, 1) then
    raise exception 'La tratta è già all’estremità del giro.';
  end if;
  v_other := v_ids[v_pos + p_direzione];
  select ordine into v_ordine from public.tratte where id = p_tratta_id;
  select ordine into v_other_ordine from public.tratte where id = v_other;
  update public.tratte
    set ordine = case when id = p_tratta_id then v_other_ordine else v_ordine end
  where id in (p_tratta_id, v_other) and giro_id = v_giro_id;
  if not found then raise exception 'Spostamento non confermato.'; end if;
end;
$$;

revoke all on function public.sposta_tratta(uuid, smallint) from public, anon;
grant execute on function public.sposta_tratta(uuid, smallint) to authenticated;
