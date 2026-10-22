-- Lista de gestores (cargos de liderança) para sugerir no campo "Gestor direto".
-- Vem do relatório de colaboradores ativos do TOTVS; guarda SÓ nome, cargo, área e unidade
-- (nada de CPF, PIS, telefones, e-mails ou datas). O repositório é público: a lista fica no banco, não no código.
-- Leitura: membros ativos (time de People). Atualização: só administradoras (substituem a lista inteira).
create table if not exists public.lideres (
  id            bigint      generated always as identity primary key,
  nome          text        not null,
  cargo         text        not null,
  area          text,
  unidade       text,
  atualizado_em timestamptz not null default now()
);
create index if not exists lideres_unidade_idx on public.lideres (unidade);

alter table public.lideres enable row level security;
drop policy if exists lideres_read on public.lideres;
drop policy if exists lideres_admin_insert on public.lideres;
drop policy if exists lideres_admin_delete on public.lideres;
create policy lideres_read on public.lideres for select to authenticated using ((select private.is_allowed_user()));
create policy lideres_admin_insert on public.lideres for insert to authenticated with check ((select private.is_admin()));
create policy lideres_admin_delete on public.lideres for delete to authenticated using ((select private.is_admin()));
revoke all on public.lideres from anon;
