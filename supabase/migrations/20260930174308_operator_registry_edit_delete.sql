grant update (nome,cognome,ruolo,attivo) on public.operatori to authenticated;
grant delete on public.operatori to authenticated;
drop policy if exists operatori_update on public.operatori;
create policy operatori_update on public.operatori for update to authenticated
using ((select public.is_organizzatore()))
with check ((select public.is_organizzatore()) and (auth_user_id is distinct from (select auth.uid()) or (attivo and ruolo in ('organizzatore','entrambi'))));
drop policy if exists operatori_delete on public.operatori;
create policy operatori_delete on public.operatori for delete to authenticated
using ((select public.is_organizzatore()) and auth_user_id is distinct from (select auth.uid()));
