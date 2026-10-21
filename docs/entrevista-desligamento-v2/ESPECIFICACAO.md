# Entrevista de Desligamento V2: especificação para o Claude Code

## Como usar

1. Abra o Claude Code na pasta do repositório da WAP onde o formulário vai entrar.
2. Copie esta pasta (`ESPECIFICACAO.md` e `prototipo-formulario.html`) para dentro do repositório, por exemplo em `docs/entrevista-desligamento-v2/`.
3. Cole o pedido abaixo, ajustando o que estiver entre colchetes.

> Leia `docs/entrevista-desligamento-v2/ESPECIFICACAO.md` e o protótipo `prototipo-formulario.html`. Antes de escrever código, explore este repositório e me diga em que stack, banco de dados, autenticação e padrão de telas vamos encaixar o módulo. Depois proponha um plano curto e espere minha aprovação. Implemente o módulo "Entrevista de Desligamento V2" seguindo a especificação, usando o padrão do repositório. [Informe aqui o que já souber: stack, banco, onde fica o menu.]

## O que é

Formulário usado pelo time de People para conduzir e registrar entrevistas de desligamento, com indicadores para visão macro e exportação em Excel. Substitui o formato "ATUAL 2024" (25 perguntas, muito texto livre, difícil de comparar). O protótipo em `prototipo-formulario.html` foi feito como página única e mostra o comportamento esperado.

O protótipo usa um armazenamento do ambiente onde foi criado (`window.claude.use("db")`, `"downloads"` e `"sample"`). Esses três pontos precisam ser trocados pelo banco, pelo download de arquivo e, se desejado, pelo resumo de comentários do sistema da WAP.

## Telas

1. **Nova entrevista**: formulário em seções, com perguntas condicionais e validação.
2. **Indicadores**: visão macro, com filtro por unidade e por período.
3. **Respostas**: lista das entrevistas salvas, detalhe de cada uma, exclusão com confirmação e botão **Baixar Excel**.

## Campos e regras do formulário

Fonte das opções: Google Forms "V2 Entrevista de Desligamento - WAP | WAAW by Alok" (páginas vistas até a seção 7 de 7). Todas as perguntas marcadas com * são obrigatórias quando visíveis.

### Seção 1: Identificação
| Campo | Tipo | Opções |
|---|---|---|
| Data * | data | padrão: hoje |
| Nome do Entrevistador * | escolha única | Ana Beatriz Capistrano Esteves; Ana Maria Oliveira Silva Moreira; Angelica Caroline Andrade; Amanda Batista dos Santos; Ayanne Barroncas Maquine; Hyan Borsoneli Nardi; Miriane Macedo do Valle; Giovana Laureano Lopes Pontes; Fernanda Mendes da Silva; Outro (pede o nome) |
| Unidade * | escolha única | Wap \| Afonso Pena; Wap \| São Marcos; Wap \| Eusébio; Wap \| Linhares; Wap \| Serra |
| Nome completo do colaborador * | texto curto | |
| Setor do colaborador * | busca com lista (digitar ou abrir a lista; só aceita valor da lista) | Adm de Vendas; Agendamento; Almox de Pós Vendas; Auditoria Interna; Contabilidade; Customer Experience; Dados; Design; Diretoria; DTM; E-commerce; Expedição; Facilities; Financeiro; Fiscal; FP&A; Garantia ADM; Garantia Tecnica; Inventario; Internacional; Jurídico; Logistica; Marketing - Conteúdo; Marketing - Growth; Marketing - Performance; Marketing - Vídeo; Operações Ecom; P&D; People; PMO&BPM; Produção; Qualidade; Recebimento Fiscal; Recepção e Conservação; Segurança do Trabalho; Suprimentos; TI; Trade MKT; Vendas; Vendas Internas |
| Gestor Direto * | texto curto | |

### Seção 2: Desligamento
| Campo | Tipo | Opções |
|---|---|---|
| De quem foi a iniciativa do desligamento? * | escolha única | Demissão voluntária (colaborador); Demissão involuntária (empresa) |
| O colaborador aceitou participar da entrevista de desligamento? * | escolha única | Sim; Não |

Regras: se a resposta for **Não**, mostrar só as seções de identificação, desligamento e registro do entrevistador, e salvar assim mesmo (a recusa conta nos indicadores). Hipótese a confirmar: a ordem e a posição dessa pergunta no Google Forms.

### Seção 3: Em caso de saída voluntária
Aparece quando a iniciativa é voluntária **e** o colaborador aceitou participar.

| Campo | Tipo | Opções |
|---|---|---|
| Qual foi o principal fator que influenciou sua decisão de sair da WAP? * | escolha única | Remuneração e/ou Benefícios; Liderança; Clima e/ou Cultura; Desenvolvimento e/ou crescimento na carreira; Equilíbrio entre vida pessoal e profissional; Atividades ou responsabilidades; Falta de reconhecimento; Mudança pessoal ou familiar; Outro (pede texto) |
| Existiram fatores secundários que contribuíram para sua decisão de sair da WAP? | texto curto, opcional | |

### Seção 4: Em caso de saída involuntária
Aparece quando a iniciativa é involuntária (mesmo se o colaborador recusar a entrevista; hipótese a confirmar).

| Campo | Tipo | Opções |
|---|---|---|
| Qual foi o motivo do desligamento involuntário? * | escolha única | Baixa performance (entrega); Comportamentos desalinhados aos valores; Conduta em desacordo com normas internas (compliance); Redução de quadro; Outro (pede texto) |

### Seção 5: Experiência do Colaborador
Só se aceitou participar. Todas com escala **Excelente / Bom / Regular / Ruim**, obrigatórias:

1. Qual a sua opinião sobre o clima no ambiente de trabalho dentro da sua grande área?
2. Qual a sua opinião sobre o clima no ambiente de trabalho na empresa como um todo?
3. Como você avalia seu relacionamento com seu gestor direto?
4. Nos últimos 6 meses, quantas vezes você recebeu feedback do seu gestor direto? (**Nenhuma vez; 1 a 2 vezes; 3 a 5 vezes; 6 vezes ou mais**)
5. Como você avalia o salário que recebe atualmente em relação às suas responsabilidades?
6. Como você avalia nossos benefícios?
7. Como você avalia as oportunidades de desenvolvimento e crescimento profissional que teve na WAP?
8. Como você avalia o equilíbrio entre sua vida pessoal e profissional durante o período em que trabalhou na WAP?

### Seção 6: Saída e Recomendação
Só se aceitou participar.

| Campo | Tipo |
|---|---|
| Caso tivesse a oportunidade, você voltaria a trabalhar na empresa? * | Sim / Não |
| Em uma escala de 0 a 10, o quanto você recomenda a WAP \| WAAW by Alok como uma boa empresa para se trabalhar? * | nota inteira de **0 a 10** |
| Se pudesse mudar uma coisa na WAP para melhorar a experiência dos colaboradores, o que mudaria? | texto longo, opcional |

Atenção: na captura do Google Forms a escala aparece de **1 a 10**, mas a pergunta diz 0 a 10. O protótipo usa 0 a 10. Corrigir o Forms ou confirmar a regra com People antes de produção.

### Seção 7: Registro do Entrevistador
| Campo | Tipo |
|---|---|
| Observações gerais do entrevistador | texto longo, opcional; é o último campo do formulário |

## Modelo de dados

Uma entrevista por registro. Campos ausentes quando a pergunta não foi exibida.

| Campo | Tipo | Observação |
|---|---|---|
| id | identificador | gerado pelo sistema |
| criadoEm | data e hora (ISO) | registrado pelo sistema |
| data | data (AAAA-MM-DD) | informada |
| entrevistador, unidade, colaborador, setor, gestor | texto | |
| iniciativa | texto | uma das duas opções |
| aceitou | "Sim" ou "Não" | |
| principalFator | texto | quando "Outro", gravar `Outro: <texto digitado>` |
| secundarios | texto | |
| motivoInvoluntario | texto | quando "Outro", gravar `Outro: <texto digitado>` |
| climaArea, climaEmpresa, gestorRel, salario, beneficios, desenvolvimento, equilibrio | texto | Excelente, Bom, Regular ou Ruim |
| feedback | texto | uma das quatro faixas |
| voltaria | "Sim" ou "Não" | |
| nps | número inteiro 0 a 10 | |
| mudaria, obs | texto | |

Sugestão: guardar também o nome do entrevistador autenticado (usuário logado), em vez de depender só da lista.

## Indicadores (aba Indicadores)

Filtros: unidade (todas ou uma) e período (todo, 30 dias, 90 dias, 12 meses), aplicados sobre `data` (ou `criadoEm` se faltar).

- **Cartões**: total de entrevistas; % que aceitou responder; % de saídas por iniciativa do colaborador; eNPS; % que voltaria a trabalhar na WAP (entre quem respondeu).
- **eNPS** (regra definida por People): detratores 0 a 6; neutros 7 e 8; promotores 9 e 10. `eNPS = % promotores − % detratores`, arredondado, em pontos, calculado sobre quem deu nota. Mostrar também as três faixas com contagem e porcentagem.
- **Principal fator da saída**: contagem e % entre quem respondeu (agrupar "Outro: ..." em "Outro").
- **Motivo do desligamento involuntário**: contagem e % entre os desligamentos involuntários.
- **Experiência**: para cada dimensão (clima da área, clima da empresa, gestor, salário, benefícios, desenvolvimento, equilíbrio), barra empilhada Excelente/Bom/Regular/Ruim e o % de Bom ou Excelente.
- **Feedback do gestor nos últimos 6 meses**: distribuição pelas quatro faixas.
- **Por unidade**: entrevistas, % aceitaram, eNPS, % voltariam, % clima da área bom ou excelente.
- **O que os colaboradores estão dizendo**: palavras mais frequentes e comentários recentes de "o que mudaria" e "fatores secundários" (sem nome do colaborador). Opcional: botão que pede a um modelo de IA para resumir até 5 temas, usando só o texto dos comentários e sem inventar números. Só incluir se a WAP aprovar enviar esses comentários a um serviço de IA.

Mostrar estado vazio claro quando não houver entrevistas ou quando o filtro não retornar nada.

## Exportação para Excel

Botão **Baixar Excel** na aba Respostas. Arquivo `.xlsx` com duas abas:

1. **Entrevistas**: uma linha por entrevista, em ordem cronológica, uma coluna por campo (rótulos em português, com "Data", "Registrado em" na sequência e "Observações gerais do entrevistador" como penúltima), mais a coluna **Classificação eNPS** (Promotor, Neutro, Detrator) no fim.
2. **Indicadores**: totais e porcentagens do conjunto completo (entrevistas, % aceitaram, % voluntárias, eNPS, contagem das três faixas, % voltariam, % Bom ou Excelente por dimensão).

Nome sugerido: `entrevistas-desligamento-v2-AAAA-MM-DD.xlsx`.

## Armazenamento

- As entrevistas ficam guardadas até alguém excluir. Exclusão com confirmação em dois cliques.
- Trocar o armazenamento do protótipo por tabelas no banco da WAP.
- Atualização ao vivo: no protótipo os indicadores se atualizam assim que uma entrevista é salva. No sistema real basta recarregar os dados após salvar.

## Segurança e privacidade (decidir antes de produção)

- Os dados são sensíveis (RH, opinião sobre gestores, motivo de demissão). Restringir o acesso ao time de People e a quem ela autorizar, com a autenticação do sistema da WAP.
- Registrar quem criou e quem excluiu cada entrevista.
- Avaliar com o jurídico/DPO o tempo de guarda e a exibição do nome do colaborador nos indicadores. Os indicadores do protótipo não mostram nomes; a lista na aba Respostas mostra.
- Texto livre pode conter dados pessoais. Tratar como dado sensível, inclusive ao enviar a qualquer serviço externo.
- Escapar todo texto digitado ao exibir (o protótipo usa `textContent`).

## Identidade visual

Segue o design system WAP Group: fonte Inter, preto `#1A1A1A`, azul-petróleo `#0094A1`, cereja `#CB2A44`, amarelo `#F8AD0E`, verde `#79B446`, cinzas `#F5F5F5` e `#E6E6E6`. O símbolo de quatro barras (nessa ordem) acompanha os títulos de seção. Funciona em celular e tem tema claro e escuro. Se o sistema da WAP já tiver componentes e tokens próprios, usar os do sistema em vez de copiar o CSS do protótipo.

## Pendências e hipóteses

- Escala de recomendação do Google Forms mostra 1 a 10; protótipo e eNPS usam 0 a 10.
- Posição da pergunta "aceitou participar" e regra de exibir o motivo involuntário mesmo com recusa foram deduzidas.
- A lista de entrevistadores é fixa no protótipo; no sistema real, vir dos usuários de People.
- Lista de setores e unidades: avaliar vir do cadastro de RH em vez de ficar fixa no código.
- O "baseline" de comparação com a base antiga (388 entrevistas respondidas de 481 registradas, set/2024 a out/2026) está no deck de apresentação; não é necessário migrar a base antiga para o módulo novo, a menos que People peça.
- Treinamento de qualificação para entrevistadores é o passo 2 do plano e acontece antes das primeiras entrevistas no V2.
