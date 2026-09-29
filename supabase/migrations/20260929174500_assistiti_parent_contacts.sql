-- Two optional parent/contact phone numbers for each assisted person.
alter table public.assistiti
  add column contatto_1_nome text,
  add column contatto_1_telefono text,
  add column contatto_2_nome text,
  add column contatto_2_telefono text;

alter table public.assistiti
  add constraint assistiti_contatto_1_completo
    check ((nullif(btrim(contatto_1_nome), '') is null)
           = (nullif(btrim(contatto_1_telefono), '') is null)),
  add constraint assistiti_contatto_2_completo
    check ((nullif(btrim(contatto_2_nome), '') is null)
           = (nullif(btrim(contatto_2_telefono), '') is null));
