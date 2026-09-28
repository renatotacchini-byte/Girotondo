-- Delete one route/day and its own operations and stops in a single transaction.
grant delete on public.programmazioni_tratta to authenticated;

create or replace function public.elimina_programmazione_tratta(p_programmazione_id uuid)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_tratta_id uuid;
  v_giorno smallint;
  v_operazioni integer;
  v_fermate integer;
  v_programmazioni integer;
begin
  if (select auth.uid()) is null or not public.is_organizzatore() then
    raise exception 'Solo un organizzatore può eliminare una programmazione.';
  end if;
  select tratta_id,giorno_settimana into v_tratta_id,v_giorno
  from public.programmazioni_tratta
  where id=p_programmazione_id
  for update;
  if not found then
    raise exception 'Programmazione non trovata.';
  end if;

  delete from public.operazioni_programmazione op
  using public.fermate_programmazione f
  where op.fermata_id=f.id and f.programmazione_tratta_id=p_programmazione_id;
  get diagnostics v_operazioni = row_count;

  delete from public.fermate_programmazione
  where programmazione_tratta_id=p_programmazione_id;
  get diagnostics v_fermate = row_count;

  delete from public.programmazioni_tratta where id=p_programmazione_id;
  get diagnostics v_programmazioni = row_count;
  if v_programmazioni <> 1 then
    raise exception 'Eliminazione del giorno non confermata.';
  end if;
  return jsonb_build_object('tratta_id',v_tratta_id,'giorno_settimana',v_giorno,
    'fermate',v_fermate,'operazioni',v_operazioni);
end;
$$;
revoke all on function public.elimina_programmazione_tratta(uuid) from public,anon;
grant execute on function public.elimina_programmazione_tratta(uuid) to authenticated;
