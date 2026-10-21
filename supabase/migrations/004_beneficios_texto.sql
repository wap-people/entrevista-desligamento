-- Experiência do Colaborador: duas perguntas abertas (opcionais) depois de "Como você avalia nossos benefícios?".
alter table public.entrevistas add column if not exists beneficio_melhor text;     -- Qual benefício mais te atendia?
alter table public.entrevistas add column if not exists beneficio_melhoria text;   -- Qual benefício tem maior oportunidade de melhoria?
