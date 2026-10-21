# Entrevista de Desligamento V2 | WAP People

Formulário para o time de People conduzir e registrar entrevistas de desligamento, com indicadores (eNPS, motivos de saída, experiência) e exportação em Excel. Substitui o formato "ATUAL 2024".

- Site estático (HTML, CSS e JavaScript, sem build) publicado no **GitHub Pages**.
- Dados no **Supabase** (Postgres + login por e-mail e senha + regras de acesso por linha).
- Especificação e protótipo originais em [`docs/entrevista-desligamento-v2/`](docs/entrevista-desligamento-v2/).

## Telas

1. **Nova entrevista**: formulário em seções, com perguntas condicionais e validação. O entrevistador já vem marcado com o usuário logado.
2. **Indicadores**: cartões, eNPS, principal fator, motivo involuntário, experiência, feedback, por unidade e comentários. Filtro por unidade e período.
3. **Respostas**: lista, detalhe, **Baixar Excel** (abas Entrevistas e Indicadores) e exclusão com dois cliques (só administradoras).
4. **Usuários** (só administradoras): criar usuário, trocar senha, dar ou tirar admin, desativar. Mostra a auditoria de quem registrou e quem excluiu cada entrevista.

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
- Mudança no banco: crie um novo arquivo numerado em `supabase/migrations/` e rode no SQL Editor.

## Testar localmente

```bash
python -m http.server 8000
```

Abra `http://localhost:8000/?demo=1` para o **modo demonstração**: pula o login e usa uma base em memória, então nada é salvo e tudo some ao recarregar. Sem `?demo=1`, usa o Supabase de verdade.

## Operação

- **Keep-alive**: o plano gratuito do Supabase pausa após 7 dias sem uso. O workflow `.github/workflows/supabase-keepalive.yml` faz uma consulta leve a cada 3 dias. Se o projeto pausar, entre no painel e clique em *Resume project*.
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
