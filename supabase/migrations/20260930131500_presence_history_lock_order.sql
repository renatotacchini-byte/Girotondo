-- Acquire the history lock before route/stop row locks in existing reorder RPCs.
-- Otherwise a concurrent edit waiting for a row could hold the history lock.
do $$
declare f record; v_definition text;
begin
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname in ('sposta_fermata_programmazione','riordina_fermate_programmazione','sposta_tratta')
 loop
  v_definition:=pg_get_functiondef(f.oid);
  if position('perform public.sincronizza_registro_presenze();' in v_definition)=0 then
   if position(E'begin\n' in v_definition)=0 then raise exception 'Reorder function body not recognized'; end if;
   execute replace(v_definition,E'begin\n',E'begin\n  perform public.sincronizza_registro_presenze();\n');
  end if;
 end loop;
end $$;
