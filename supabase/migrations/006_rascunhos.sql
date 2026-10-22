-- Rascunho da entrevista em andamento, salvo no servidor (não só no navegador):
-- não se perde se a aba fechar ou se a pessoa trocar de computador.
-- Um rascunho por usuária; cada uma só lê e altera o próprio. Apagado ao salvar a entrevista.
create table if not exists public.rascunhos (
  user_id       uuid        primary key default auth.uid() references auth.users(id) on delete cascade,
  dados         jsonb       not null,
  atualizado_em timestamptz not null default now()
);

alter table public.rascunhos enable row level security;
drop policy if exists rascunhos_proprio on public.rascunhos;
create policy rascunhos_proprio on public.rascunhos for all to authenticated
  using (user_id = (select auth.uid()) and (select private.is_allowed_user()))
  with check (user_id = (select auth.uid()) and (select private.is_allowed_user()));
revoke all on public.rascunhos from anon;
