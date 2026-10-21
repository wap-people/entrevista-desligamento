-- Ajustes do Security Advisor do Supabase.

-- public.ping: search_path fixo.
create or replace function public.ping()
returns boolean language sql stable set search_path = '' as $$ select true; $$;
grant execute on function public.ping() to anon, authenticated;

-- public.rls_auto_enable() foi criada pelo Supabase (habilita RLS em tabelas novas).
-- Ela roda como event trigger; ninguém precisa chamá-la pela API.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
