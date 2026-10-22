# Entrevista de Desligamento V2 | WAP People

Formulário para o time de People conduzir e registrar entrevistas de desligamento, com indicadores (eNPS, motivos de saída, experiência) e exportação em Excel. Substitui o formato "ATUAL 2024".

- Site estático (HTML, CSS e JavaScript, sem build) publicado no **GitHub Pages**.
- Dados no **Supabase** (Postgres + login por e-mail e senha + regras de acesso por linha).
- Especificação e protótipo originais em [`docs/entrevista-desligamento-v2/`](docs/entrevista-desligamento-v2/).

## Telas

1. **Nova entrevista**: formulário em seções, com perguntas condicionais e validação. O entrevistador já vem marcado com o usuário logado. **Rascunho no servidor**: a entrevista em andamento é salva automaticamente no Supabase (tabela `rascunhos`, um por usuária) cerca de 1 s após cada resposta; ao voltar, o site oferece retomar ou descartar. O rascunho é apagado quando a entrevista é salva. **Gestor direto**: sugestões da tabela `lideres` (cargos de liderança do TOTVS), primeiro os da unidade marcada e da mesma área (São Marcos e Afonso Pena contam como uma região, porque no TOTVS estão no mesmo estabelecimento; em Afonso Pena, sem área marcada, Produção, Expedição, Qualidade e Logística vêm primeiro); a busca encontra gestores de todas as unidades; aceita nome fora da lista. O gestor vem antes do setor: ao escolher um gestor da lista, o setor do colaborador já é preenchido com a área dele (dá para trocar). Nomes de pessoas são gravados e exibidos com a primeira letra maiúscula ("João da Silva"). A lista é atualizada por uma administradora na aba Usuários, enviando o relatório de colaboradores ativos (.xml) do TOTVS: o arquivo é lido no navegador e só nome, cargo, área e unidade dos líderes são gravados.
2. **Indicadores**: painel. No topo, o tipo de saída (Todas, Voluntárias, Involuntárias, Sem iniciativa) e o painel de filtros (unidade, origem, mês, gestor, área, entrevistador, colaborador) com etiquetas do que está ativo. Botão **Baixar**: PDF da página (todos os módulos abertos, layout de papel) ou Excel do recorte (filtros, indicadores, temas e observações, entrevistas). Abaixo, o resumo em cartão, a faixa de indicadores com mini-gráficos (tendência, composição, adesão, medidor do eNPS, voltariam) e os módulos: cada um mostra o número principal e abre o detalhe ao clicar. Respostas abertas aparecem num padrão só de maiúsculas.
3. **Respostas**: busca pelo nome do entrevistado (sem diferença de maiúsculas e acentos) e filtros por coluna como no Excel: clique no título (Data, Colaborador, Unidade, Área, Gestor, Entrevistador, Iniciativa, Resultado, Origem) para classificar, pesquisar e marcar valores, com a quantidade de cada um; as opções seguem os filtros das outras colunas e as colunas filtradas viram etiquetas com ×. "Mostrando X de Y", detalhe, **Baixar Excel** do que está na lista (na ordem da tela) e exclusão com dois cliques (só administradoras).
4. **Usuários** (só administradoras): criar usuário, trocar senha, dar ou tirar admin, desativar. Auditoria em duas abas, Inclusões e Exclusões, com a identificação da entrevista (colaborador · data · unidade).

## Acesso

- Só entra quem está ativo na tabela `members`. Não existe cadastro público.
- A primeira administradora é `ana.beatriz@wap.ind.br` (definida em `001_schema.sql`).
- As demais pessoas são criadas pela aba **Usuários**, com senha provisória.

## Configuração (uma vez)

1. **Banco**: no painel do Supabase, abra **SQL Editor** e rode, em ordem, os arquivos de `supabase/migrations/` (`001_schema.sql`, `002_security_advisor.sql`).
2. **Primeira administradora**: em **Authentication > Users > Add user > Create new user**, crie `ana.beatriz@wap.ind.br` com uma senha e marque *Auto Confirm User*. Ela vira admin sozinha.
3. **Cadastro público desligado**: em **Authentication > Sign In / Providers**, desative *Allow new users to sign up*.
4. **Edge Function** `admin-users` (para a aba Usuários): em **Edge Functions > Deploy a new function > Via Editor**, nome `admin-users`, cole `supabase/functions/admin-users/index.ts`, **desligue "Verify JWT"** (a função confere a sessão e o papel de admin sozinha) e publique. Ou, com a Supabase CLI: `supabase functions deploy admin-users --no-verify-jwt`.
5. **Chave pública**: em **Project Settings > API**, copie a chave `anon` (ou *publishable*) para `config.js`. Nunca use a chave `service_role` no site.
6. **GitHub Pages**: no repositório, **Settings > Pages > Deploy from a branch > main / (root)**.

## Publicar alterações

- Push na `main` publica o site em alguns minutos.
- Ao alterar `app.js`, `styles.css` ou `config.js`, aumente o `?v=` correspondente em `index.html` para o navegador não usar a versão antiga.
- A biblioteca do Excel (SheetJS) não entra no `index.html`: o `app.js` só a baixa quando alguém vai exportar (`carregarXlsx`).
- Mudança no banco: crie um novo arquivo numerado em `supabase/migrations/` e rode no SQL Editor.

## Testar localmente

```bash
python -m http.server 8000
```

Abra `http://localhost:8000/?demo=1` para o **modo demonstração**: pula o login e usa uma base em memória, então nada é salvo e tudo some ao recarregar. Com `?demo=1&exemplo=1` ele já começa com 120 entrevistas fictícias, para ver os indicadores. Sem `?demo=1`, usa o Supabase de verdade.

## Operação

- **Keep-alive**: o plano gratuito do Supabase pausa após 7 dias sem uso. O workflow `.github/workflows/supabase-keepalive.yml` faz uma consulta leve todo dia e se reativa sozinho, para o GitHub não desligá-lo após 60 dias sem commits. Se falhar, o GitHub manda e-mail para quem alterou o workflow por último. Se o projeto pausar mesmo assim, entre no painel e clique em *Resume project* (os dados não se perdem).
- **Backup**: no Supabase, **Table Editor > entrevistas > Export to CSV**, ou o botão **Baixar Excel** do site.

## Segurança e privacidade

- Dados sensíveis de RH. Acesso restrito ao time de People pela tabela `members` e por regras RLS no banco.
- Entrevistas não são editadas depois de salvas. Só administradoras excluem.
- `auditoria` registra quem criou e quem excluiu cada entrevista (sem copiar o conteúdo).
- Todo texto digitado é exibido como texto (`textContent`), nunca como HTML.
- O resumo de comentários com IA do protótipo **não** foi incluído: depende de aprovação da WAP para enviar comentários a um serviço externo.

## Pendências (da especificação)

- O Google Forms mostra a escala de recomendação de 1 a 10. O sistema usa 0 a 10, como diz a pergunta e a regra de eNPS.
- A posição de "aceitou participar" e a exibição do motivo involuntário mesmo com recusa foram deduzidas. Confirmar com People.
- Listas de entrevistadores, setores e unidades estão fixas em `app.js`. Avaliar vir do cadastro de RH.
- Tempo de guarda dos dados e exibição do nome do colaborador: avaliar com jurídico/DPO.
