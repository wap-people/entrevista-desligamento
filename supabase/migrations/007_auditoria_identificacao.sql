-- Auditoria: identificação curta da entrevista (colaborador · data · unidade), para a aba "Exclusões"
-- mostrar QUAL entrevista foi excluída. Só a identificação; as respostas não são copiadas.
-- A auditoria continua visível só para administradoras.
alter table public.auditoria add column if not exists entrevista_desc text;

create or replace function private.log_entrevista()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r public.entrevistas := case when tg_op = 'DELETE' then old else new end;
begin
  insert into public.auditoria (acao, entrevista_id, entrevista_desc, ator_id, ator_email, ator_nome)
  select case when tg_op = 'DELETE' then 'excluiu' else 'criou' end, r.id,
         concat_ws(' · ', r.colaborador, to_char(r.data, 'DD/MM/YYYY'), r.unidade),
         auth.uid(), m.email, m.full_name
  from (select 1) x left join public.members m on m.user_id = auth.uid();
  return null;
end;
$$;
revoke all on function private.log_entrevista() from public, anon, authenticated;

-- Eventos antigos: preenche a identificação das entrevistas que ainda existem
update public.auditoria a set entrevista_desc = concat_ws(' · ', e.colaborador, to_char(e.data, 'DD/MM/YYYY'), e.unidade)
from public.entrevistas e where e.id = a.entrevista_id and a.entrevista_desc is null;
