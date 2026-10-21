-- Importação da base "ATUAL 2024" (Google Forms antigo) para o modelo V2.
-- origem: 'V2' (formulário novo) ou 'Base 2024' (importada).
-- legado: respostas que só existiam no formulário antigo, com o rótulo original.
-- legado_id: carimbo de data/hora da planilha; impede importar a mesma linha duas vezes.

alter table public.entrevistas add column if not exists origem text not null default 'V2';
alter table public.entrevistas add column if not exists legado jsonb;
alter table public.entrevistas add column if not exists legado_id text;

alter table public.entrevistas drop constraint if exists entrevistas_origem_check;
alter table public.entrevistas add constraint entrevistas_origem_check check (origem in ('V2', 'Base 2024'));
create unique index if not exists entrevistas_legado_id_key on public.entrevistas (legado_id);
create index if not exists entrevistas_origem_idx on public.entrevistas (origem);

-- Na base antiga, 51 recusas não têm iniciativa registrada. No V2 ela continua obrigatória.
alter table public.entrevistas alter column iniciativa drop not null;
alter table public.entrevistas drop constraint if exists entrevistas_iniciativa_v2_check;
alter table public.entrevistas add constraint entrevistas_iniciativa_v2_check check (iniciativa is not null or origem <> 'V2');

-- Formulário V2: sem campos de legado. Registros da base antiga: só administradoras inserem.
drop policy if exists entrevistas_insert on public.entrevistas;
create policy entrevistas_insert on public.entrevistas for insert to authenticated
  with check (
    (select private.is_allowed_user())
    and criado_por = (select auth.uid())
    and ((origem = 'V2' and legado is null and legado_id is null) or (select private.is_admin()))
  );
