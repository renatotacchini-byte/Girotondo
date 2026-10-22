alter table public.assenze_periodo alter column giro_id drop not null;
alter table public.assenze_periodo add column tratta_id uuid references public.tratte(id) on delete restrict;
alter table public.assenze_periodo add constraint assenza_scope_valido check (tratta_id is null or giro_id is null);
drop policy assenze_periodo_select on public.assenze_periodo;
create policy assenze_periodo_select on public.assenze_periodo for select to authenticated using (
public.is_organizzatore() or exists (
 select 1 from public.assegnazioni a where a.operatore_id=public.current_operatore_id()
 and (a.giro_id=assenze_periodo.giro_id or (assenze_periodo.giro_id is null and exists(
 select 1 from public.tratte t join public.programmazioni_tratta p on p.tratta_id=t.id
 join public.fermate_programmazione f on f.programmazione_tratta_id=p.id
 join public.operazioni_programmazione o on o.fermata_id=f.id
 where t.giro_id=a.giro_id and o.assistito_id=assenze_periodo.assistito_id
 and (assenze_periodo.tratta_id is null or t.id=assenze_periodo.tratta_id))))));
create policy assenze_periodo_update on public.assenze_periodo for update to authenticated
using(public.is_organizzatore()) with check(public.is_organizzatore());
grant update on public.assenze_periodo to authenticated;
do $do$ declare f text; begin
 select pg_get_functiondef('private.registro_presenze_archivia_data(date,text)'::regprocedure) into f;
 if position('x.giro_id=t.giro_id and x.assistito_id' in f)=0 then raise exception 'Unexpected archive definition'; end if;
 f:=replace(f,'x.giro_id=t.giro_id and x.assistito_id','(x.giro_id is null or x.giro_id=t.giro_id) and (x.tratta_id is null or x.tratta_id=m.tratta_id) and x.assistito_id');
 execute f;
end $do$;