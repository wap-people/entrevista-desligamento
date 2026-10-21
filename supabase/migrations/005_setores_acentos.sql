-- Ortografia das áreas: a lista do formulário passou a ter acento.
update public.entrevistas set setor = 'Logística' where setor = 'Logistica';
update public.entrevistas set setor = 'Inventário' where setor = 'Inventario';
update public.entrevistas set setor = 'Garantia Técnica' where setor = 'Garantia Tecnica';
