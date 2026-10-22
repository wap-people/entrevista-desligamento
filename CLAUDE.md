# Entrevista de Desligamento

Site estático (HTML/CSS/JS, sem build, sem npm) no GitHub Pages, com dados no Supabase. Mesmo padrão do repositório `wap-people/facilities.estoque`.

## Arquivos
- `index.html`: telas (login, abas Nova entrevista, Indicadores, Respostas, Usuários).
- `styles.css`: identidade visual WAP Group, tema claro e escuro.
- `app.js`: tudo da página: definição do formulário (`F`), regras condicionais, indicadores, Excel, usuários, login. `?demo=1` usa base em memória.
- `config.js`: URL e chave anon PÚBLICAS do Supabase.
- `supabase/migrations/`: esquema numerado. `supabase/functions/admin-users/`: gestão de usuários (service role, só no servidor).
- `docs/entrevista-desligamento-v2/`: especificação e protótipo de referência.

## Regras
1. Ao mudar `app.js`, `styles.css` ou `config.js`, aumentar o `?v=` em `index.html`.
2. Mudança de banco = novo arquivo numerado em `supabase/migrations/`. Nunca editar migração já aplicada.
3. RLS: só `members` ativos leem e criam entrevistas; só admins excluem; ninguém edita. `auditoria` é gravada só por trigger. `rascunhos`: cada usuária lê e grava só o próprio. `lideres`: membros leem, só admins substituem. O repositório é público: nunca versionar nomes de colaboradores nem relatórios do TOTVS (`*.xml` está no .gitignore).
4. Nunca colocar a chave `service_role` em código, commit ou mensagem.
5. Usuários são criados por uma administradora pela aba Usuários, não pelo Claude.
6. O banco é produção com dados sensíveis de RH. Testar com `?demo=1` ou pedir confirmação antes de gravar.
7. Exibir texto digitado só com `textContent` (helper `el`).
8. Banco em snake_case, página em camelCase (`toRow` / `fromRow`).

## Regras de negócio
- eNPS: detratores 0 a 6, neutros 7 e 8, promotores 9 e 10. `% promotores − % detratores`, arredondado, sobre quem deu nota.
- "Aceitou participar = Não": salva só identificação, desligamento, motivo involuntário (se involuntária) e observações.
- "Outro" grava `Outro: <texto>`; indicadores agrupam em "Outro".
- Nomes (colaborador, gestor, entrevistador): `nomeProprio()` ao salvar e ao carregar. Primeira letra maiúscula, preposições (de, da, do, das, dos, e) em minúsculo.
