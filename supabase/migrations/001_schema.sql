-- Entrevista de Desligamento V2: esquema inicial.
-- Rodar uma vez no SQL Editor do Supabase (projeto novo).
-- Acesso: só quem está em public.members com active = true (time de People).
-- Exclusão de entrevistas: só administradores.
-- Quem criou e quem excluiu cada entrevista fica em public.auditoria (preenchida por trigger).

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- ---------- Membros (usuários com acesso) ----------
create table if not exists public.members (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  email      text        not null unique,
  full_name  text        not null default '',
  is_admin   boolean     not null default false,
  active     boolean     not null default true,
  created_at timestamptz not null default now(),
  created_by uuid        null references auth.users(id) on delete set null
);
create index if not exists members_created_by_idx on public.members (created_by);

create or replace function private.is_allowed_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members m where m.user_id = auth.uid() and m.active);
$$;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members m where m.user_id = auth.uid() and m.active and m.is_admin);
$$;
revoke all on function private.is_allowed_user() from public, anon;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_allowed_user() to authenticated;
grant execute on function private.is_admin() to authenticated;

alter table public.members enable row level security;
drop policy if exists members_read on public.members;
create policy members_read on public.members for select to authenticated using ((select private.is_allowed_user()));
-- Sem policy de escrita: membros só são criados/alterados pela Edge Function
-- "admin-users" (que confere se quem chama é administrador).
revoke all on public.members from anon;

-- Primeiro administrador: quando a conta abaixo for criada em
-- Authentication > Users, ela vira admin automaticamente.
create or replace function private.bootstrap_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) in ('ana.beatriz@wap.ind.br') then
    insert into public.members (user_id, email, full_name, is_admin, active)
    values (new.id, lower(new.email), coalesce(new.raw_user_meta_data ->> 'full_name', 'Ana Beatriz Capistrano Esteves'), true, true)
    on conflict (user_id) do update set is_admin = true, active = true;
  end if;
  return new;
end;
$$;
revoke all on function private.bootstrap_admin() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_bootstrap on auth.users;
create trigger on_auth_user_created_bootstrap after insert on auth.users
  for each row execute function private.bootstrap_admin();

-- Caso a conta já exista quando esta migração rodar:
insert into public.members (user_id, email, full_name, is_admin, active)
select u.id, lower(u.email), coalesce(u.raw_user_meta_data ->> 'full_name', 'Ana Beatriz Capistrano Esteves'), true, true
from auth.users u where lower(u.email) = 'ana.beatriz@wap.ind.br'
on conflict (user_id) do update set is_admin = true, active = true;

-- ---------- Entrevistas ----------
-- Uma entrevista por linha. Campos ficam nulos quando a pergunta não foi exibida.
create table if not exists public.entrevistas (
  id                  uuid        primary key default gen_random_uuid(),
  criado_em           timestamptz not null default now(),
  criado_por          uuid        null default auth.uid() references auth.users(id) on delete set null,
  data                date        not null,
  entrevistador       text        not null,
  unidade             text        not null,
  colaborador         text        not null,
  setor               text        not null,
  gestor              text        not null,
  iniciativa          text        not null check (iniciativa in ('Demissão voluntária (colaborador)', 'Demissão involuntária (empresa)')),
  aceitou             text        not null check (aceitou in ('Sim', 'Não')),
  principal_fator     text,
  secundarios         text,
  motivo_involuntario text,
  clima_area          text check (clima_area      in ('Excelente', 'Bom', 'Regular', 'Ruim')),
  clima_empresa       text check (clima_empresa   in ('Excelente', 'Bom', 'Regular', 'Ruim')),
  gestor_rel          text check (gestor_rel      in ('Excelente', 'Bom', 'Regular', 'Ruim')),
  feedback            text check (feedback        in ('Nenhuma vez', '1 a 2 vezes', '3 a 5 vezes', '6 vezes ou mais')),
  salario             text check (salario         in ('Excelente', 'Bom', 'Regular', 'Ruim')),
  beneficios          text check (beneficios      in ('Excelente', 'Bom', 'Regular', 'Ruim')),
  desenvolvimento     text check (desenvolvimento in ('Excelente', 'Bom', 'Regular', 'Ruim')),
  equilibrio          text check (equilibrio      in ('Excelente', 'Bom', 'Regular', 'Ruim')),
  voltaria            text check (voltaria in ('Sim', 'Não')),
  nps                 smallint check (nps between 0 and 10),
  mudaria             text,
  obs                 text
);
create index if not exists entrevistas_data_idx on public.entrevistas (data);
create index if not exists entrevistas_criado_por_idx on public.entrevistas (criado_por);

alter table public.entrevistas enable row level security;
drop policy if exists entrevistas_read on public.entrevistas;
drop policy if exists entrevistas_insert on public.entrevistas;
drop policy if exists entrevistas_delete on public.entrevistas;
create policy entrevistas_read on public.entrevistas for select to authenticated
  using ((select private.is_allowed_user()));
create policy entrevistas_insert on public.entrevistas for insert to authenticated
  with check ((select private.is_allowed_user()) and criado_por = (select auth.uid()));
create policy entrevistas_delete on public.entrevistas for delete to authenticated
  using ((select private.is_admin()));
-- Sem policy de update: entrevista salva não é editada pelo site.
revoke all on public.entrevistas from anon;

-- ---------- Auditoria (quem criou e quem excluiu) ----------
-- Só o evento, sem o conteúdo da entrevista.
create table if not exists public.auditoria (
  id            bigint      generated always as identity primary key,
  em            timestamptz not null default now(),
  acao          text        not null check (acao in ('criou', 'excluiu')),
  entrevista_id uuid        not null,
  ator_id       uuid        null,
  ator_email    text,
  ator_nome     text
);
create index if not exists auditoria_entrevista_idx on public.auditoria (entrevista_id);

alter table public.auditoria enable row level security;
drop policy if exists auditoria_read on public.auditoria;
create policy auditoria_read on public.auditoria for select to authenticated using ((select private.is_admin()));
-- Sem policy de escrita: só o trigger abaixo grava.
revoke all on public.auditoria from anon;

create or replace function private.log_entrevista()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  rid uuid := case when tg_op = 'DELETE' then old.id else new.id end;
begin
  insert into public.auditoria (acao, entrevista_id, ator_id, ator_email, ator_nome)
  select case when tg_op = 'DELETE' then 'excluiu' else 'criou' end, rid, auth.uid(), m.email, m.full_name
  from (select 1) x left join public.members m on m.user_id = auth.uid();
  return null;
end;
$$;
revoke all on function private.log_entrevista() from public, anon, authenticated;
drop trigger if exists entrevistas_audit on public.entrevistas;
create trigger entrevistas_audit after insert or delete on public.entrevistas
  for each row execute function private.log_entrevista();

-- ---------- Keep-alive ----------
-- Consulta leve usada pelo workflow do GitHub para o projeto gratuito não pausar.
-- Não lê nenhuma tabela.
create or replace function public.ping()
returns boolean language sql stable as $$ select true; $$;
grant execute on function public.ping() to anon, authenticated;
