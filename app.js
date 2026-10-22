// Entrevista de Desligamento V2: login, formulário, indicadores, respostas, Excel e usuários.
// Dados no Supabase (tabela public.entrevistas). Todo texto digitado é exibido com textContent.
// Modo demonstração: abrir com ?demo=1 usa uma base em memória (nada é salvo) e pula o login.
(function () {
  var UNIDADES = ["Wap | Afonso Pena", "Wap | São Marcos", "Wap | Eusébio", "Wap | Linhares", "Wap | Serra"];
  var SETORES = ["Adm de Vendas", "Agendamento", "Almox de Pós Vendas", "Auditoria Interna", "Contabilidade", "Customer Experience", "Dados", "Design", "Diretoria", "DTM", "E-commerce", "Expedição", "Facilities", "Financeiro", "Fiscal", "FP&A", "Garantia ADM", "Garantia Técnica", "Inventário", "Internacional", "Jurídico", "Logística", "Marketing - Conteúdo", "Marketing - Growth", "Marketing - Performance", "Marketing - Vídeo", "Operações Ecom", "P&D", "People", "PMO&BPM", "Produção", "Qualidade", "Recebimento Fiscal", "Recepção e Conservação", "Segurança do Trabalho", "Suprimentos", "TI", "Trade MKT", "Vendas", "Vendas Internas"];
  var INIC = ["Demissão voluntária (colaborador)", "Demissão involuntária (empresa)"];
  var FATORES = ["Remuneração e/ou Benefícios", "Liderança", "Clima e/ou Cultura", "Desenvolvimento e/ou crescimento na carreira", "Equilíbrio entre vida pessoal e profissional", "Atividades ou responsabilidades", "Falta de reconhecimento", "Mudança pessoal ou familiar", "Outro"];
  var MOTIVOS = ["Baixa performance (entrega)", "Comportamentos desalinhados aos valores", "Conduta em desacordo com normas internas (compliance)", "Redução de quadro", "Outro"];
  var ESCALA = ["Excelente", "Bom", "Regular", "Ruim"];
  var FEEDBACK = ["Nenhuma vez", "1 a 2 vezes", "3 a 5 vezes", "6 vezes ou mais"];
  var SN = ["Sim", "Não"];
  var ENTREV = ["Ana Beatriz Capistrano Esteves", "Ana Maria Oliveira Silva Moreira", "Angelica Caroline Andrade", "Amanda Batista dos Santos", "Ayanne Barroncas Maquine", "Hyan Borsoneli Nardi", "Miriane Macedo do Valle", "Giovana Laureano Lopes Pontes", "Fernanda Mendes da Silva", "Outro"];

  var participa = function (s) { return s.aceitou === "Sim"; };
  var voluntaria = function (s) { return participa(s) && s.iniciativa === INIC[0]; };
  var involuntaria = function (s) { return s.iniciativa === INIC[1]; };

  var Q = {
    climaArea: "Qual a sua opinião sobre o clima no ambiente de trabalho dentro da sua grande área?",
    climaEmpresa: "Qual a sua opinião sobre o clima no ambiente de trabalho na empresa como um todo?",
    gestorRel: "Como você avalia seu relacionamento com seu gestor direto?",
    feedback: "Nos últimos 6 meses, quantas vezes você recebeu feedback do seu gestor direto?",
    salario: "Como você avalia o salário que recebe atualmente em relação às suas responsabilidades?",
    beneficios: "Como você avalia nossos benefícios?",
    desenvolvimento: "Como você avalia as oportunidades de desenvolvimento e crescimento profissional que teve na WAP?",
    equilibrio: "Como você avalia o equilíbrio entre sua vida pessoal e profissional durante o período em que trabalhou na WAP?"
  };

  var F = [
    { sec: "Identificação", c: "--p1" },
    { id: "data", label: "Data", type: "date", req: 1 },
    { id: "entrevistador", label: "Nome do Entrevistador", type: "radio", options: ENTREV, req: 1 },
    { id: "entrevistadorOutro", label: "Outro: nome do entrevistador", type: "text", req: 1, when: function (s) { return s.entrevistador === "Outro"; } },
    { id: "unidade", label: "Unidade", type: "radio", options: UNIDADES, req: 1 },
    { id: "colaborador", label: "Nome completo do colaborador", type: "text", req: 1 },
    { id: "gestor", label: "Gestor direto", type: "gestor", req: 1 },
    { id: "setor", label: "Setor do colaborador", type: "combo", options: SETORES, req: 1 },
    { sec: "Desligamento", c: "--p2" },
    { id: "iniciativa", label: "De quem foi a iniciativa do desligamento?", type: "radio", options: INIC, req: 1 },
    { id: "aceitou", label: "O colaborador aceitou participar da entrevista de desligamento?", type: "radio", options: SN, req: 1 },
    { sec: "Em caso de saída voluntária", c: "--p4", when: voluntaria },
    { id: "principalFator", label: "Qual foi o principal fator que influenciou sua decisão de sair da WAP?", type: "radio", options: FATORES, req: 1, when: voluntaria },
    { id: "principalFatorOutro", label: "Outro: qual foi o principal fator?", type: "text", req: 1, when: function (s) { return voluntaria(s) && s.principalFator === "Outro"; } },
    { id: "secundarios", label: "Existiram fatores secundários que contribuíram para sua decisão de sair da WAP?", type: "text", when: voluntaria },
    { sec: "Em caso de saída involuntária", c: "--p2", when: involuntaria },
    { id: "motivoInvoluntario", label: "Qual foi o motivo do desligamento involuntário?", type: "radio", options: MOTIVOS, req: 1, when: involuntaria },
    { id: "motivoInvoluntarioOutro", label: "Outro: qual foi o motivo?", type: "text", req: 1, when: function (s) { return involuntaria(s) && s.motivoInvoluntario === "Outro"; } },
    { sec: "Experiência do Colaborador", c: "--p3", when: participa },
    { id: "climaArea", label: Q.climaArea, type: "radio", options: ESCALA, req: 1, when: participa },
    { id: "climaEmpresa", label: Q.climaEmpresa, type: "radio", options: ESCALA, req: 1, when: participa },
    { id: "gestorRel", label: Q.gestorRel, type: "radio", options: ESCALA, req: 1, when: participa },
    { id: "feedback", label: Q.feedback, type: "radio", options: FEEDBACK, req: 1, when: participa },
    { id: "salario", label: Q.salario, type: "radio", options: ESCALA, req: 1, when: participa },
    { id: "beneficios", label: Q.beneficios, type: "radio", options: ESCALA, req: 1, when: participa },
    { id: "beneficioMelhor", label: "Qual benefício mais te atendia?", type: "text", req: 1, when: participa },
    { id: "beneficioMelhoria", label: "Qual benefício tem maior oportunidade de melhoria?", type: "text", req: 1, when: participa },
    { id: "desenvolvimento", label: Q.desenvolvimento, type: "radio", options: ESCALA, req: 1, when: participa },
    { id: "equilibrio", label: Q.equilibrio, type: "radio", options: ESCALA, req: 1, when: participa },
    { sec: "Saída e Recomendação", c: "--p4", when: participa },
    { id: "voltaria", label: "Caso tivesse a oportunidade, você voltaria a trabalhar na empresa?", type: "radio", options: SN, req: 1, when: participa },
    { id: "nps", label: "Em uma escala de 0 a 10, o quanto você recomenda a WAP | WAAW by Alok como uma boa empresa para se trabalhar?", type: "nps", req: 1, when: participa },
    { id: "mudaria", label: "Se pudesse mudar uma coisa na WAP para melhorar a experiência dos colaboradores, o que mudaria?", type: "textarea", when: participa },
    { sec: "Registro do Entrevistador", c: "--p1" },
    { id: "obs", label: "Observações gerais do entrevistador", type: "textarea" }
  ];

  var COLS = [
    ["data", "Data"], ["criadoEm", "Registrado em"], ["origem", "Origem"], ["entrevistador", "Entrevistador"], ["unidade", "Unidade"], ["colaborador", "Colaborador"], ["setor", "Setor"], ["gestor", "Gestor direto"],
    ["iniciativa", "Iniciativa do desligamento"], ["aceitou", "Aceitou participar"], ["principalFator", "Principal fator da saída"], ["secundarios", "Fatores secundários"],
    ["motivoInvoluntario", "Motivo do desligamento involuntário"], ["climaArea", "Clima na grande área"], ["climaEmpresa", "Clima na empresa"],
    ["gestorRel", "Relacionamento com o gestor"], ["feedback", "Feedback nos últimos 6 meses"], ["salario", "Salário"], ["beneficios", "Benefícios"],
    ["beneficioMelhor", "Benefício que mais atendia"], ["beneficioMelhoria", "Benefício com maior oportunidade de melhoria"],
    ["desenvolvimento", "Desenvolvimento e crescimento"], ["equilibrio", "Equilíbrio vida pessoal e profissional"], ["voltaria", "Voltaria a trabalhar na WAP"],
    ["nps", "Recomendação (0 a 10)"], ["mudaria", "O que mudaria"], ["legado", "Respostas da base 2024"], ["obs", "Observações gerais do entrevistador"]
  ];
  // Respostas que só existiam no formulário antigo (jsonb { rótulo: resposta }).
  function legadoTxt(v, sep) { return Object.keys(v || {}).map(function (k) { return k + ": " + v[k]; }).join(sep); }
  var DIM = [["climaArea", "Clima na grande área"], ["climaEmpresa", "Clima na empresa"], ["gestorRel", "Relacionamento com o gestor"], ["salario", "Salário"], ["beneficios", "Benefícios"], ["desenvolvimento", "Desenvolvimento e crescimento"], ["equilibrio", "Equilíbrio vida e trabalho"]];

  var $ = function (s) { return document.querySelector(s); };
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k]; else if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function today() { var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); }
  function brDate(s) { return s ? String(s).split("-").reverse().join("/") : ""; }
  function brDateTime(s) { return s ? new Date(s).toLocaleString("pt-BR") : ""; }
  // Nomes de pessoas: primeira letra maiúscula e o resto minúsculo, preposições em minúsculo ("JOÃO DA SILVA" → "João da Silva")
  var PREP = { de: 1, da: 1, "do": 1, das: 1, dos: 1, e: 1, di: 1, du: 1 };
  function nomeProprio(s) {
    s = String(s || "").trim().replace(/\s+/g, " ");
    if (!s || /^não informad[oa]$/i.test(s)) return s;
    return s.toLowerCase().split(" ").map(function (w, i) {
      if (i > 0 && PREP[w]) return w;
      return w.replace(/(^|[-'’])(\S)/g, function (m, sep, c) { return sep + c.toUpperCase(); });
    }).join(" ");
  }
  var NOMES = ["colaborador", "gestor", "entrevistador"];
  function nomesPadrao(x) { NOMES.forEach(function (k) { if (x[k]) x[k] = nomeProprio(x[k]); }); return x; }
  // banco usa snake_case; a página usa camelCase (como no protótipo)
  function toCamel(k) { return k.replace(/_([a-z])/g, function (m, c) { return c.toUpperCase(); }); }
  function toSnake(k) { return k.replace(/[A-Z]/g, function (c) { return "_" + c.toLowerCase(); }); }
  function fromRow(r) { var o = {}; Object.keys(r).forEach(function (k) { if (r[k] !== null) o[toCamel(k)] = r[k]; }); return o; }
  function toRow(d) { var o = {}; Object.keys(d).forEach(function (k) { o[toSnake(k)] = d[k]; }); return o; }
  function warn(msg) { var w = $("#dbwarn"); w.textContent = msg || ""; w.hidden = !msg; }

  /* ---------- Acesso aos dados ---------- */
  var CFG = window.APP_CONFIG || {};
  var DEMO = /[?&]demo=1\b/.test(location.search);
  var sb = null;
  var me = null; // { user_id, email, full_name, is_admin }

  var store = DEMO ? demoStore() : {
    list: function () {
      var all = [], size = 1000;
      function page(from) {
        return sb.from("entrevistas").select("*").order("criado_em", { ascending: false }).range(from, from + size - 1).then(function (r) {
          if (r.error) throw r.error;
          all = all.concat(r.data);
          return r.data.length === size ? page(from + size) : all;
        });
      }
      return page(0).then(function (rows) { return rows.map(fromRow); });
    },
    insert: function (doc) {
      return sb.from("entrevistas").insert(toRow(doc)).then(function (r) { if (r.error) throw r.error; });
    },
    remove: function (id) {
      return sb.from("entrevistas").delete().eq("id", id).select("id").then(function (r) {
        if (r.error) throw r.error;
        if (!r.data || !r.data.length) throw { message: "Sem permissão para excluir." };
      });
    },
    members: function () {
      return sb.from("members").select("*").order("full_name").then(function (r) { if (r.error) throw r.error; return r.data; });
    },
    // Auditoria em duas listas separadas (200 mais recentes de cada): inclusões e exclusões
    audit: function () {
      var q = function (acao) { return sb.from("auditoria").select("*").eq("acao", acao).order("em", { ascending: false }).limit(200).then(function (r) { if (r.error) throw r.error; return r.data; }); };
      return Promise.all([q("criou"), q("excluiu")]).then(function (v) { return { criou: v[0], excluiu: v[1] }; });
    },
    // Rascunho da entrevista em andamento, no servidor (um por usuária)
    // Gestores (cargos de liderança do TOTVS): só nome, cargo, área e unidade
    lideres: function () {
      return sb.from("lideres").select("nome, cargo, area, unidade, atualizado_em").order("nome").then(function (r) { if (r.error) throw r.error; return r.data; });
    },
    lideresReplace: function (rows) {
      return sb.from("lideres").delete().gt("id", 0).then(function (r) {
        if (r.error) throw r.error;
        return sb.from("lideres").insert(rows).then(function (r2) { if (r2.error) throw r2.error; });
      });
    },
    draftGet: function () {
      return sb.from("rascunhos").select("dados, atualizado_em").eq("user_id", me.user_id).maybeSingle().then(function (r) { if (r.error) throw r.error; return r.data; });
    },
    draftSave: function (dados) {
      return sb.from("rascunhos").upsert({ user_id: me.user_id, dados: dados, atualizado_em: new Date().toISOString() }, { onConflict: "user_id" }).then(function (r) { if (r.error) throw r.error; });
    },
    draftDelete: function () {
      return sb.from("rascunhos").delete().eq("user_id", me.user_id).then(function (r) { if (r.error) throw r.error; });
    },
    admin: function (payload) {
      return sb.functions.invoke("admin-users", { body: payload }).then(function (r) {
        if (r.error) {
          var ctx = r.error.context;
          if (ctx && ctx.json) return ctx.json().then(function (b) { throw { message: (b && b.error) || r.error.message }; }, function () { throw r.error; });
          throw r.error;
        }
        if (r.data && r.data.error) throw { message: r.data.error };
        return r.data;
      });
    }
  };

  // ?demo=1&exemplo=1: começa com 120 entrevistas fictícias (V2 e base 2024) para ver os indicadores.
  function demoSeed() {
    var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var pickR = function (a) { return a[Math.floor(rnd() * a.length)]; };
    var out = [];
    for (var i = 0; i < 120; i++) {
      var old = i % 3 === 0, d = new Date(2026, 9, 20); d.setDate(d.getDate() - Math.floor(rnd() * 600));
      var x = { id: "ex-" + i, origem: old ? "Base 2024" : "V2", criadoEm: d.toISOString(), data: d.toISOString().slice(0, 10),
        entrevistador: pickR(ENTREV.slice(0, 5)), unidade: pickR(UNIDADES), colaborador: "Colaborador " + (i + 1), setor: pickR(["Produção", "Logística", "Qualidade", "TI", "Vendas", "People"]),
        gestor: pickR(["Gestor A", "GESTOR A", "Gestora B", "Gestor C", "Gestora D"]), iniciativa: rnd() < 0.4 ? INIC[0] : INIC[1], aceitou: rnd() < 0.8 ? "Sim" : "Não" };
      if (old && x.aceitou === "Não" && rnd() < 0.5) delete x.iniciativa;
      if (x.iniciativa === INIC[1]) x.motivoInvoluntario = pickR(MOTIVOS.slice(0, 4).concat(["Outro: Término de contrato"]));
      if (x.aceitou === "Sim") {
        if (x.iniciativa === INIC[0]) { x.principalFator = pickR(FATORES.slice(0, 8)); if (rnd() < 0.5) x.secundarios = pickR(["salário abaixo do mercado", "pouco reconhecimento", "distância de casa"]); }
        ["climaArea", "gestorRel", "salario", "beneficios", "desenvolvimento"].concat(old ? [] : ["climaEmpresa", "equilibrio"]).forEach(function (k) { x[k] = pickR(ESCALA); });
        x.feedback = pickR(FEEDBACK); x.voltaria = rnd() < 0.7 ? "Sim" : "Não";
        if (!old) { x.nps = Math.floor(rnd() * 11); x.beneficioMelhor = pickR(["Plano de saúde", "plano de saude", "Vale alimentação", "Gympass"]); x.beneficioMelhoria = pickR(["Vale alimentação", "VALE ALIMENTACAO", "Plano odontológico"]); }
        if (rnd() < 0.6) x.mudaria = pickR(["Mais feedback da liderança", "Plano de carreira claro", "Melhorar a comunicação entre áreas"]);
        if (old) x.legado = { "Opinião sobre a infraestrutura da empresa": pickR(ESCALA), "Competência do líder para a função": pickR(["Altamente capacitado", "Capacitado", "Pouco capacitado"]), "Defina a WAP em uma palavra": pickR(["Aprendizado", "aprendizado", "Gratidão", "Oportunidade"]), "Conselho para quem vai ocupar a posição": "Conselho de exemplo " + i };
      }
      if (rnd() < 0.6) x.obs = pickR(["Relatou que o gestor não dava feedback e se sentia desvalorizado pela liderança.", "Agradeceu a oportunidade; gostou muito da equipe e do ambiente de trabalho.", "Comentou que o salário estava abaixo do mercado e o vale alimentação é baixo.", "Saída por mudança de cidade para ficar perto da família.", "Reclamou da sobrecarga e da pressão no turno da noite; muito retrabalho por falta de processos.", "Sentiu falta de plano de carreira e de treinamentos; quer crescer profissionalmente.", "Desligamento por desempenho abaixo do esperado; recebeu feedbacks e advertências.", "Elogiou o time de People; disse que a comunicação entre áreas precisa melhorar."]) + " (exemplo " + i + ")";
      out.push(x);
    }
    return out;
  }
  function demoStore() {
    var rows = /[?&]exemplo=1\b/.test(location.search) ? demoSeed() : [], log = [], seq = 0, draft = null;
    // Gestores fictícios para o modo demonstração (nomes inventados)
    var lideresDemo = [["Ana Fictícia Lopes", "Coordenador de Logística", "Logística", "Wap | Linhares"], ["Bruno Exemplo Dias", "Líder de Produção", "Produção", "Wap | Linhares"], ["Carla Teste Ramos", "Supervisor de Qualidade", "Qualidade", "Wap | Linhares"], ["Diego Modelo Souza", "Gerente de Logística", "Logística", "Wap | São Marcos"], ["Elisa Amostra Reis", "Head de Marketing", "Marketing", "Wap | São Marcos"], ["Fábio Demo Nunes", "Coordenador de Produção", "Produção", "Wap | São Marcos"], ["Gabriela Simulada Melo", "Coordenador de Logística", "Logística", "Wap | Serra"], ["Hugo Ensaio Costa", "Supervisor de Logística", "Logística", "Wap | Eusébio"]].map(function (a) { return { nome: a[0], cargo: a[1], area: a[2], unidade: a[3], atualizado_em: new Date().toISOString() }; });
    var users = [{ user_id: "demo", email: "demo@wap.ind.br", full_name: "Ana Beatriz Capistrano Esteves", is_admin: true, active: true }];
    var ok = function (v) { return Promise.resolve(v); };
    return {
      list: function () { return ok(rows.slice().sort(function (a, b) { return a.criadoEm < b.criadoEm ? 1 : -1; })); },
      insert: function (doc) {
        var d = Object.assign({ id: "demo-" + (++seq), criadoEm: new Date().toISOString() }, doc);
        rows.push(d); log.unshift({ em: d.criadoEm, acao: "criou", entrevista_id: d.id, entrevista_desc: [d.colaborador, brDate(d.data), d.unidade].join(" · "), ator_nome: me.full_name });
        return ok();
      },
      remove: function (id) {
        var gone = rows.filter(function (x) { return x.id === id; })[0];
        rows = rows.filter(function (x) { return x.id !== id; });
        log.unshift({ em: new Date().toISOString(), acao: "excluiu", entrevista_id: id, entrevista_desc: gone ? [gone.colaborador, brDate(gone.data), gone.unidade].join(" · ") : "", ator_nome: me.full_name });
        return ok();
      },
      members: function () { return ok(users); },
      audit: function () { return ok({ criou: log.filter(function (a) { return a.acao === "criou"; }), excluiu: log.filter(function (a) { return a.acao === "excluiu"; }) }); },
      lideres: function () { return ok(lideresDemo); },
      lideresReplace: function (rs) { lideresDemo = rs.map(function (r) { return Object.assign({ atualizado_em: new Date().toISOString() }, r); }); return ok(); },
      draftGet: function () { return ok(draft); },
      draftSave: function (dados) { draft = { dados: JSON.parse(JSON.stringify(dados)), atualizado_em: new Date().toISOString() }; return ok(); },
      draftDelete: function () { draft = null; return ok(); },
      admin: function () { return Promise.reject({ message: "Indisponível no modo demonstração." }); }
    };
  }

  /* ---------- Formulário ---------- */
  var S = {};
  var nodes = [];
  var form = $("#f");

  function chip(name, value, label) {
    var i = el("input", { type: "radio", name: name, value: value });
    return el("label", { class: "chip" }, [i, el("span", { text: label })]);
  }

  F.forEach(function (f) {
    var node;
    if (f.sec) {
      node = el("h2", { class: "sec", text: f.sec });
      node.style.setProperty("--c", "var(" + f.c + ")");
    } else {
      node = el("div", { class: "q", id: "q-" + f.id });
      var body;
      var optTag = f.req ? null : el("span", { class: "opt", text: "opcional" });
      if (f.type === "radio" || f.type === "nps") {
        var lg = el("legend", { text: f.label }); if (optTag) lg.appendChild(optTag);
        var wrap;
        if (f.type === "nps") {
          wrap = el("div", { class: "nps" });
          for (var k = 0; k <= 10; k++) wrap.appendChild(chip(f.id, String(k), String(k)));
        } else {
          wrap = el("div", { class: "chips" });
          f.options.forEach(function (o) { wrap.appendChild(chip(f.id, o, o)); });
        }
        var kids = [lg, wrap];
        if (f.type === "nps") kids.push(el("div", { class: "ends" }, [el("span", { text: "0 = não recomendo" }), el("span", { text: "10 = recomendo muito" })]));
        body = el("fieldset", null, kids);
      } else {
        var lb = el("label", { class: "lbl", for: "f-" + f.id, text: f.label }); if (optTag) lb.appendChild(optTag);
        var inp, extra = null;
        if (f.type === "combo") {
          inp = el("input", { id: "f-" + f.id, type: "text", list: "dl-" + f.id, autocomplete: "off", placeholder: "Digite ou escolha a área" });
          inp.setAttribute("data-combo", "1");
          extra = el("datalist", { id: "dl-" + f.id });
          f.options.forEach(function (o) { extra.appendChild(el("option", { value: o })); });
        } else if (f.type === "gestor") {
          // Caixa com sugestões de gestores (ver "Campo Gestor direto" mais abaixo); aceita nome fora da lista
          inp = el("input", { id: "f-" + f.id, type: "text", autocomplete: "off", role: "combobox", "aria-autocomplete": "list", "aria-expanded": "false", "aria-controls": "gl-list", placeholder: "Digite o nome ou escolha da lista" });
          extra = el("ul", { id: "gl-list", class: "ac-list", role: "listbox", hidden: "" });
        } else if (f.type === "textarea") {
          inp = el("textarea", { id: "f-" + f.id, rows: "4" });
        } else {
          inp = el("input", { id: "f-" + f.id, type: f.type });
        }
        inp.setAttribute("data-f", f.id);
        body = el("div", f.type === "gestor" ? { class: "ac" } : null, [lb, inp, extra]);
      }
      node.appendChild(body);
      node.appendChild(el("p", { class: "err", text: f.type === "combo" ? "Escolha uma área da lista." : "Responda esta pergunta.", hidden: "" }));
    }
    node._f = f;
    nodes.push(node);
    form.appendChild(node);
  });

  form.appendChild(el("div", { class: "bar" }, [
    el("div", { class: "bar-info" }, [el("p", { class: "prog", id: "prog", "aria-live": "polite" }), el("p", { class: "draft-st", id: "draftSt", "aria-live": "polite" })]),
    el("button", { class: "btn", type: "submit", id: "save", text: "Salvar entrevista" })
  ]));

  function visible(f) { return !f.when || f.when(S); }
  function missing() {
    return F.filter(function (f) { return f.id && f.req && visible(f) && (S[f.id] === undefined || S[f.id] === ""); });
  }
  function applyVisibility() {
    nodes.forEach(function (n) { n.hidden = !visible(n._f); });
    var miss = missing();
    $("#prog").textContent = miss.length ? (miss.length === 1 ? "Falta 1 resposta" : "Faltam " + miss.length + " respostas") : "Tudo respondido";
  }

  form.addEventListener("input", function (e) {
    var t = e.target;
    if (t.type === "radio") S[t.name] = t.name === "nps" ? Number(t.value) : t.value;
    else if (t.getAttribute("data-f")) {
      var val = t.value;
      if (t.getAttribute("data-combo")) {
        var low = val.trim().toLowerCase(), hit = "";
        SETORES.forEach(function (o) { if (fold(o) === fold(low)) hit = o; }); // "logistica" = "Logística"
        val = hit;
      }
      S[t.getAttribute("data-f")] = val;
    }
    var q = t.closest(".q"); if (q) { q.classList.remove("bad"); q.querySelector(".err").hidden = true; }
    applyVisibility();
    scheduleDraft();
  });

  /* ---------- Campo "Gestor direto": sugestões de gestores ----------
     Sem digitar: gestores da unidade marcada, os da mesma área primeiro.
     Digitando: busca em todas as unidades (os da unidade marcada primeiro).
     Sempre dá para usar um nome que não está na lista (ex.: gestor que já saiu). */
  var lideres = [];
  var acInp = $("#f-gestor"), acList = $("#gl-list"), acItems = [], acActive = -1;
  function mesmaArea(area, setor) { var a = fold(area), s = fold(setor); return !!(a && s && (a.indexOf(s) >= 0 || s.indexOf(a) >= 0)); }
  function acOpen(open) { acList.hidden = !open; acInp.setAttribute("aria-expanded", String(open)); if (!open) { acActive = -1; acInp.removeAttribute("aria-activedescendant"); } }
  // Regiões: no TOTVS, São Marcos (matriz, PR) e Afonso Pena (CD na mesma região, PR) ficam no mesmo
  // estabelecimento, então os gestores das duas aparecem juntos. Linhares, Serra e Eusébio têm os seus.
  var REGIAO = { "Wap | São Marcos": "PR", "Wap | Afonso Pena": "PR", "Wap | Linhares": "Linhares", "Wap | Serra": "Serra", "Wap | Eusébio": "Eusébio" };
  var NOME_REGIAO = { PR: "do Paraná (São Marcos e Afonso Pena)" };
  // Áreas presentes no CD de Afonso Pena: sobem na lista quando a área ainda não foi marcada
  var AREAS_AFONSO = /produc|exped|qualid|logist/;
  function acRender() {
    var q = fold(acInp.value), un = S.unidade, setor = S.setor, reg = REGIAO[un];
    var perto = function (l) { return !!reg && REGIAO[l.unidade] === reg; };
    var areaPrior = function (l) { return setor ? mesmaArea(l.area, setor) : (un === "Wap | Afonso Pena" && AREAS_AFONSO.test(fold(l.area))); };
    var rank = function (l) { return (perto(l) ? 2 : 0) + (areaPrior(l) ? 1 : 0); };
    var ordena = function (a, b) { return rank(b) - rank(a) || a.nome.localeCompare(b.nome, "pt-BR"); };
    var nomeLocal = un ? (NOME_REGIAO[reg] || "de " + un.replace("Wap | ", "")) : "";
    var prioridade = setor ? " · área " + setor + " primeiro" : un === "Wap | Afonso Pena" ? " · Produção, Expedição, Qualidade e Logística primeiro" : "";
    var grupos = [], lim = 40;
    if (!q) {
      if (!un) { grupos.push({ titulo: "Marque a unidade para ver os gestores dela, ou digite um nome para buscar em todas.", itens: [] }); }
      else {
        var daUn = lideres.filter(perto).sort(ordena);
        grupos.push({ titulo: daUn.length ? "Gestores " + nomeLocal + " (" + daUn.length + ")" + prioridade : "Nenhum gestor " + nomeLocal + " na lista. Digite um nome para buscar em todas as unidades.", itens: daUn.slice(0, lim) });
        if (daUn.length > lim) grupos.push({ titulo: "Digite para ver os outros " + (daUn.length - lim) + ".", itens: [] });
      }
    } else {
      var termos = q.split(" ").filter(Boolean);
      var achados = lideres.filter(function (l) { var n = fold(l.nome); return termos.every(function (t) { return n.indexOf(t) >= 0; }); }).sort(ordena);
      var aqui = achados.filter(perto), fora = achados.filter(function (l) { return !perto(l); });
      if (aqui.length) grupos.push({ titulo: "Gestores " + nomeLocal, itens: aqui.slice(0, 20) });
      if (fora.length) grupos.push({ titulo: un ? "Outras unidades" : "Gestores encontrados", itens: fora.slice(0, 20) });
      if (!achados.length) grupos.push({ titulo: "Nenhum gestor da lista com esse nome.", itens: [] });
    }
    acList.textContent = ""; acItems = [];
    grupos.forEach(function (g) {
      acList.appendChild(el("li", { class: "ac-h", role: "presentation", text: g.titulo }));
      g.itens.forEach(function (l) {
        var li = el("li", { class: "ac-o", role: "option", id: "gl-o" + acItems.length }, [el("b", { text: l.nome }), el("span", { text: [l.cargo, l.area, perto(l) ? "" : String(l.unidade || "").replace("Wap | ", "")].filter(Boolean).join(" · ") })]);
        acItems.push({ el: li, nome: l.nome }); acList.appendChild(li);
      });
    });
    var txt = acInp.value.trim();
    if (txt && !lideres.some(function (l) { return fold(l.nome) === fold(txt); })) {
      var livre = el("li", { class: "ac-o ac-free", role: "option", id: "gl-o" + acItems.length, text: "Usar “" + txt + "” (não está na lista)" });
      acItems.push({ el: livre, nome: txt }); acList.appendChild(livre);
    }
    acItems.forEach(function (it, i) { it.el.addEventListener("mousedown", function (e) { e.preventDefault(); acPick(i); }); });
    acActive = -1; acOpen(true);
  }
  function acHighlight(i) {
    acItems.forEach(function (it, k) { it.el.classList.toggle("on", k === i); it.el.setAttribute("aria-selected", String(k === i)); });
    acActive = i;
    if (i >= 0) { acInp.setAttribute("aria-activedescendant", acItems[i].el.id); acItems[i].el.scrollIntoView({ block: "nearest" }); }
  }
  // Área do TOTVS → setor do formulário ("Produção Beneficiamento" → "Produção", "DADOS" → "Dados").
  // Sem correspondência clara (ex.: "Marketing", que tem vários setores), não preenche.
  var AREA_SETOR = { "almoxarifado de pos vendas": "Almox de Pós Vendas", "pmo": "PMO&BPM", "bpm": "PMO&BPM", "dho": "People", "operacoes de rh": "People",
    "international": "Internacional", "operacoes ecom": "Operações Ecom", "producao injecao": "Produção", "producao beneficiamento": "Produção" };
  function setorDoLider(area) {
    var a = fold(area); if (!a) return "";
    if (AREA_SETOR[a]) return AREA_SETOR[a];
    var hit = SETORES.filter(function (s) { return fold(s) === a; });
    return hit.length === 1 ? hit[0] : "";
  }
  var acPicking = false, setorAuto = "";
  function acPick(i) {
    acInp.value = acItems[i].nome;
    acPicking = true; acInp.dispatchEvent(new Event("input", { bubbles: true })); acPicking = false; // grava em S, valida e salva o rascunho
    acOpen(false);
    // Gestor da lista: o setor do colaborador já vem com a área do gestor (pode ser trocado).
    // Não sobrescreve um setor escolhido à mão; só o que foi preenchido por outro gestor.
    var l = lideres.filter(function (x) { return fold(x.nome) === fold(acItems[i].nome); })[0];
    var s = l ? setorDoLider(l.area) : "";
    if (s && (!S.setor || S.setor === setorAuto)) {
      var si = $("#f-setor"); si.value = s; si.dispatchEvent(new Event("input", { bubbles: true })); setorAuto = s;
    }
  }
  acInp.addEventListener("focus", acRender);
  acInp.addEventListener("input", function () { if (!acPicking) acRender(); });
  acInp.addEventListener("blur", function () { setTimeout(function () { acOpen(false); }, 120); });
  acInp.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); if (acList.hidden) acRender();
      if (!acItems.length) return;
      var n = acItems.length, i = acActive < 0 ? (e.key === "ArrowDown" ? 0 : n - 1) : (acActive + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
      acHighlight(i);
    } else if (e.key === "Enter" && !acList.hidden && acActive >= 0) { e.preventDefault(); acPick(acActive); }
    else if (e.key === "Escape") { acOpen(false); }
  });
  function loadLideres() { return store.lideres().then(function (r) { lideres = r || []; renderLideresAdmin(); }).catch(function () { lideres = []; }); }

  /* ---------- Rascunho no servidor ----------
     Salva a entrevista em andamento ~1 s depois de cada resposta (e ao sair da aba).
     Ao entrar, oferece retomar ou descartar. Enquanto houver um rascunho anterior sem decisão,
     o salvamento automático fica parado para não sobrescrevê-lo. */
  var draftTimer = null, draftOn = false, draftRetry = null;
  function hora(iso) { return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
  function draftSay(t, bad) { var s = $("#draftSt"); s.textContent = t || ""; s.classList.toggle("bad", !!bad); }
  // Há algo além do que o formulário já traz preenchido (data e entrevistador)?
  function hasContent(s) { return Object.keys(s || {}).some(function (k) { return k !== "data" && k !== "entrevistador" && s[k] !== "" && s[k] !== undefined; }); }
  function draftData() { return { S: S, setorTexto: ($("#f-setor") || {}).value || "" }; }
  function scheduleDraft() {
    if (!me || !draftOn) return;
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 1000);
  }
  function saveDraft() {
    clearTimeout(draftTimer); draftTimer = null; clearTimeout(draftRetry);
    if (!me || !draftOn || !hasContent(S)) return Promise.resolve();
    draftSay("Salvando rascunho…");
    return store.draftSave(draftData()).then(function () { draftSay("Rascunho salvo às " + hora(new Date().toISOString()) + ". Se a página fechar, você retoma daqui."); })
      .catch(function () { draftSay("Rascunho não salvo: sem conexão com o servidor. Tentando de novo…", true); draftRetry = setTimeout(saveDraft, 10000); });
  }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden" && draftTimer) saveDraft(); });
  function restoreDraft(d) {
    S = Object.assign({}, d.S || {});
    form.reset();
    Object.keys(S).forEach(function (k) {
      var v = S[k];
      var r = form.querySelector('input[type=radio][name="' + CSS.escape(k) + '"][value="' + CSS.escape(String(v)) + '"]');
      if (r) { r.checked = true; return; }
      var i = $("#f-" + k); if (i) i.value = v;
    });
    // Setor: o nome oficial da lista quando a digitação bateu; senão, o texto que estava digitado
    if ($("#f-setor")) $("#f-setor").value = S.setor || d.setorTexto || "";
    applyVisibility();
  }
  function offerDraft() {
    var box = $("#draftBanner"); box.hidden = true; draftOn = false;
    return store.draftGet().then(function (r) {
      if (!r || !r.dados || !hasContent(r.dados.S)) { draftOn = true; return; }
      var nome = r.dados.S.colaborador ? "de " + r.dados.S.colaborador : "sem nome do colaborador";
      var d = new Date(r.atualizado_em);
      $("#draftTxt").textContent = "Você tem uma entrevista em andamento " + nome + ", salva em " + d.toLocaleDateString("pt-BR") + " às " + hora(r.atualizado_em) + ".";
      box.hidden = false;
      var discard = $("#draftDiscard"); discard.textContent = "Descartar rascunho"; discard.dataset.armed = "";
      $("#draftResume").onclick = function () { restoreDraft(r.dados); box.hidden = true; draftOn = true; draftSay("Rascunho retomado. As próximas respostas continuam sendo salvas."); };
      discard.onclick = function () {
        if (!discard.dataset.armed) { discard.dataset.armed = "1"; discard.textContent = "Confirmar descarte"; return; }
        store.draftDelete().then(function () { box.hidden = true; draftOn = true; draftSay("Rascunho descartado."); scheduleDraft(); })
          .catch(function () { draftSay("Não foi possível descartar o rascunho agora.", true); });
      };
      draftSay("Há um rascunho anterior: retome ou descarte para o salvamento automático continuar.", true);
    }).catch(function () { draftOn = true; draftSay("Não foi possível verificar rascunhos salvos agora.", true); });
  }

  function reset() {
    S = {};
    form.reset();
    var d = $("#f-data"); d.value = today(); S.data = d.value;
    // entrevistador: já marcado com o usuário logado, quando ele está na lista
    if (me && ENTREV.indexOf(me.full_name) >= 0) {
      var r = form.querySelector('input[name="entrevistador"][value="' + CSS.escape(me.full_name) + '"]');
      if (r) { r.checked = true; S.entrevistador = me.full_name; }
    }
    applyVisibility();
  }

  var TABS = ["nova", "ind", "resp", "usr"];
  function showTab(which) {
    TABS.forEach(function (t) {
      $("#p-" + t).hidden = t !== which;
      $("#tab-" + t).setAttribute("aria-selected", String(t === which));
    });
    if (which === "usr") loadUsers();
    window.scrollTo(0, 0);
  }
  TABS.forEach(function (t) { $("#tab-" + t).addEventListener("click", function () { showTab(t); }); });
  $("#seeind").addEventListener("click", function () { showTab("ind"); });
  $("#again").addEventListener("click", function () { $("#done").hidden = true; form.hidden = false; reset(); window.scrollTo(0, 0); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var miss = missing();
    if (miss.length) {
      miss.forEach(function (f) { var q = $("#q-" + f.id); q.classList.add("bad"); q.querySelector(".err").hidden = false; });
      $("#q-" + miss[0].id).scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    var doc = {};
    F.forEach(function (f) {
      if (!f.id || !visible(f)) return;
      var v = S[f.id];
      if (v === undefined || v === "") return;
      doc[f.id] = typeof v === "string" ? v.trim() : v;
    });
    if (doc.entrevistador === "Outro" && doc.entrevistadorOutro) doc.entrevistador = doc.entrevistadorOutro;
    delete doc.entrevistadorOutro;
    if (doc.principalFator === "Outro" && doc.principalFatorOutro) doc.principalFator = "Outro: " + doc.principalFatorOutro;
    delete doc.principalFatorOutro;
    if (doc.motivoInvoluntario === "Outro" && doc.motivoInvoluntarioOutro) doc.motivoInvoluntario = "Outro: " + doc.motivoInvoluntarioOutro;
    delete doc.motivoInvoluntarioOutro;
    nomesPadrao(doc);
    doc.criadoPor = me.user_id;
    var btn = $("#save"); btn.disabled = true; btn.textContent = "Salvando";
    warn("");
    clearTimeout(draftTimer); draftTimer = null; clearTimeout(draftRetry);
    store.insert(doc).then(function () {
      // Entrevista gravada: o rascunho deixa de ser necessário
      store.draftDelete().then(function () { draftSay(""); }, function () { draftSay(""); });
      $("#donetxt").textContent = "Entrevista de " + doc.colaborador + " salva";
      form.hidden = true; $("#done").hidden = false; window.scrollTo(0, 0);
      return loadEntries();
    }).catch(function (err) {
      warn("Não foi possível salvar. " + ((err && err.message) || "Tente de novo em instantes."));
    }).then(function () { btn.disabled = false; btn.textContent = "Salvar entrevista"; });
  });

  /* ---------- Dados e indicadores ---------- */
  var entries = [];
  var armed = null, openId = null;
  var memberNames = {};

  var fu = $("#fu");
  fu.appendChild(el("option", { value: "", text: "Todas as unidades" }));
  UNIDADES.forEach(function (u) { fu.appendChild(el("option", { value: u, text: u })); });
  fu.addEventListener("change", renderAll);
  // Tipo de saída: botões no topo dos indicadores
  var tipoAtual = "";
  document.querySelectorAll("#ftseg button").forEach(function (b) {
    b.addEventListener("click", function () {
      tipoAtual = b.getAttribute("data-t");
      document.querySelectorAll("#ftseg button").forEach(function (o) { o.setAttribute("aria-checked", String(o === b)); });
      renderAll();
    });
  });
  $("#fclear").addEventListener("click", function () {
    fu.value = ""; $("#fo").value = ""; FILTROS.forEach(function (f) { f.clear(); }); renderAll();
  });
  // Etiquetas com os filtros ativos, visíveis com o painel fechado
  function updateChips() {
    var host = $("#fchips"); host.textContent = "";
    var on = [];
    if (fu.value) on.push(fu.value);
    if ($("#fo").value) on.push($("#fo").value === "V2" ? "Só V2" : "Só base 2024");
    FILTROS.forEach(function (f) { var d = f.describe(); if (d) on.push(d); });
    if (!on.length) { host.appendChild(el("span", { class: "fchip off", text: "nenhum filtro ativo" })); return; }
    on.forEach(function (t) { host.appendChild(el("span", { class: "fchip", text: t })); });
  }
  $("#fo").addEventListener("change", renderAll);

  // Chave para agrupar nomes digitados de jeitos diferentes ("JOÃO SILVA", "Joao  Silva").
  function fold(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase(); }
  // De { grafia: vezes }, a mais usada; no empate, a que não é toda maiúscula e tem acento.
  function bestName(names) {
    var nice = function (s) { return (s !== s.toUpperCase() ? 2 : 0) + (s !== fold(s) && /[^\x00-\x7f]/.test(s) ? 1 : 0); };
    return Object.keys(names).sort(function (a, b) { return names[b] - names[a] || nice(b) - nice(a); })[0];
  }

  // Filtro de seleção múltipla com busca. Nada marcado = todos.
  // field: nome do campo ou função; o.format: rótulo a partir do valor; o.newest: ordem decrescente (meses).
  function multiSelect(host, title, field, plural, o) {
    o = o || {};
    var get = typeof field === "function" ? field : function (x) { return x[field]; };
    var sel = {}, opts = [];
    var summary = el("summary", { text: "Todos" });
    var search = el("input", { type: "search", placeholder: "Buscar", "aria-label": "Buscar " + plural });
    var list = el("div", { class: "ms-o" });
    var all = el("button", { class: "lnk", type: "button", text: "Marcar os visíveis" });
    var none = el("button", { class: "lnk", type: "button", text: "Limpar" });
    var det = el("details", null, [summary, el("div", { class: "ms-p" }, [search, el("div", { class: "row" }, [all, none]), list])]);
    host.appendChild(el("div", { class: "ms" }, [el("span", { class: "ms-l", text: title }), det]));

    function count() { return Object.keys(sel).length; }
    function label() {
      var n = count();
      if (!n) return "Todos";
      if (n === 1) { var k = Object.keys(sel)[0]; var o = opts.filter(function (x) { return x.key === k; })[0]; return o ? o.label : "1 selecionado"; }
      return n + " selecionados";
    }
    function draw() {
      var q = fold(search.value);
      list.textContent = "";
      opts.forEach(function (o) {
        if (q && fold(o.label).indexOf(q) < 0) return;
        var cb = el("input", { type: "checkbox" }); cb.checked = !!sel[o.key];
        cb.addEventListener("change", function () { if (cb.checked) sel[o.key] = 1; else delete sel[o.key]; changed(); });
        list.appendChild(el("label", { class: "check" }, [cb, document.createTextNode(o.label), el("span", { class: "ms-n", text: String(o.n) })]));
      });
      if (!list.childNodes.length) list.appendChild(el("p", { class: "hint", text: "Nada encontrado." }));
    }
    function changed() { summary.textContent = label(); renderAll(); }
    search.addEventListener("input", draw);
    all.addEventListener("click", function () {
      var q = fold(search.value);
      opts.forEach(function (o) { if (!q || fold(o.label).indexOf(q) >= 0) sel[o.key] = 1; });
      draw(); changed();
    });
    none.addEventListener("click", function () { sel = {}; draw(); changed(); });
    document.addEventListener("click", function (e) { if (det.open && !det.contains(e.target)) det.open = false; });

    return {
      // opções = valores distintos nas entrevistas, com o nome mais usado de cada grupo
      refresh: function (rows) {
        var g = {};
        rows.forEach(function (x) {
          var v = get(x); if (!v) return;
          var k = fold(v); if (o.format) v = o.format(v); g[k] = g[k] || { key: k, n: 0, names: {} };
          g[k].n++; g[k].names[v] = (g[k].names[v] || 0) + 1;
        });
        opts = Object.keys(g).map(function (k) {
          return { key: k, n: g[k].n, label: bestName(g[k].names) };
        }).sort(o.newest ? function (a, b) { return a.key < b.key ? 1 : -1; } : function (a, b) { return a.label.localeCompare(b.label, "pt-BR"); });
        Object.keys(sel).forEach(function (k) { if (!g[k]) delete sel[k]; });
        summary.textContent = label(); draw();
      },
      test: function (x) { return !count() || !!sel[fold(get(x))]; },
      describe: function () { return count() ? title.charAt(0) + title.slice(1).toLowerCase() + ": " + label() : ""; },
      clear: function () { sel = {}; search.value = ""; summary.textContent = label(); draw(); }
    };
  }
  var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  var fMes = multiSelect($("#fms"), "MÊS", function (x) { return entryDate(x).slice(0, 7); }, "meses",
    { newest: 1, format: function (m) { return MESES[Number(m.slice(5, 7)) - 1] + "/" + m.slice(0, 4); } });
  var fGestor = multiSelect($("#fms"), "GESTOR", "gestor", "gestores");
  var fSetor = multiSelect($("#fms"), "ÁREA", "setor", "áreas");
  var fEntrev = multiSelect($("#fms"), "ENTREVISTADOR", "entrevistador", "entrevistadores");
  var fColab = multiSelect($("#fms"), "COLABORADOR", "colaborador", "colaboradores");
  var FILTROS = [fMes, fGestor, fSetor, fEntrev, fColab];

  function pct(a, b) { return b ? Math.round((a / b) * 100) : null; }
  function fmt(v, suf) { return v === null || v === undefined ? "-" : v + (suf || ""); }
  function entryDate(x) { return x.data || (x.criadoEm || "").slice(0, 10); }

  // skipTipo: mesmo recorte sem o tipo de saída (base do "% do total")
  function filtered(skipTipo) {
    var u = fu.value, o = $("#fo").value, t = skipTipo ? "" : tipoAtual;
    var tipo = { vol: function (x) { return x.iniciativa === INIC[0]; }, inv: function (x) { return x.iniciativa === INIC[1]; }, sem: function (x) { return !x.iniciativa; } }[t];
    return entries.filter(function (x) {
      return (!u || x.unidade === u) && (!o || (x.origem || "V2") === o) && (!tipo || tipo(x)) && FILTROS.every(function (f) { return f.test(x); });
    });
  }
  /* ---------- Indicadores: contas ---------- */
  var isVol = function (x) { return x.iniciativa === INIC[0]; };
  var isInv = function (x) { return x.iniciativa === INIC[1]; };
  var isResp = function (x) { return x.aceitou === "Sim"; };
  function npsClass(n) { return n >= 9 ? "Promotor" : n >= 7 ? "Neutro" : "Detrator"; }
  // "12 (34%)" e "12 de 35 (34%)": todo indicador mostra a quantidade junto da porcentagem
  function np(n, d) { var p = pct(n, d); return n + (p === null ? "" : " (" + p + "%)"); }
  function nOf(n, d) { var p = pct(n, d); return n + " de " + d + (p === null ? "" : " (" + p + "%)"); }

  function stats(list) {
    var resp = list.filter(isResp);
    var notas = resp.filter(function (x) { return typeof x.nps === "number"; });
    var pro = notas.filter(function (x) { return x.nps >= 9; }).length;
    var det = notas.filter(function (x) { return x.nps <= 6; }).length;
    var volt = resp.filter(function (x) { return x.voltaria; });
    var voltaSim = volt.filter(function (x) { return x.voltaria === "Sim"; }).length;
    var nVol = list.filter(isVol).length, nInv = list.filter(isInv).length;
    var nInic = nVol + nInv; // base 2024 tem recusas sem iniciativa
    return {
      n: list.length, resp: resp, nResp: resp.length,
      adesao: pct(resp.length, list.length),
      nVol: nVol, nInv: nInv, nInic: nInic, nSem: list.length - nInic,
      vol: pct(nVol, nInic),
      nps: notas.length ? Math.round(((pro - det) / notas.length) * 100) : null,
      pro: pro, det: det, neu: notas.length - pro - det, npsN: notas.length,
      voltaSim: voltaSim, voltaN: volt.length, volta: pct(voltaSim, volt.length)
    };
  }
  function goodN(list, key) { return list.filter(function (x) { return x[key] === "Excelente" || x[key] === "Bom"; }).length; }
  function answered(list, key) { return list.filter(function (x) { return x[key] !== undefined && x[key] !== ""; }); }
  function good(list, key) { return pct(goodN(list, key), answered(list, key).length); }
  // Respostas abertas num padrão só: primeira letra maiúscula e o resto minúsculo,
  // mantendo siglas curtas (VA, VR, TI, PLR). "VALE ALIMENTACAO" e "Vale Alimentação" viram "Vale alimentação".
  function sentence(s) {
    var out = String(s).trim().split(/(\s+)/).map(function (w) { return /^[A-ZÀ-Ý]{2,3}$/.test(w) ? w : w.toLowerCase(); }).join("");
    return out.charAt(0).toUpperCase() + out.slice(1);
  }
  // Na resposta aberta, a grafia exibida é a mais caprichada (com acento, sem tudo maiúsculo), não a mais frequente.
  function niceName(names) {
    var nice = function (s) { return (s !== s.toUpperCase() ? 2 : 0) + (/[^\x00-\x7f]/.test(s) ? 1 : 0); };
    return Object.keys(names).sort(function (a, b) { return nice(b) - nice(a) || names[b] - names[a]; })[0];
  }
  function pl(n, um, varios) { return n === 1 ? um : varios; }
  function outroTxt(l) { return l === "Outro" ? "Outro (textos variados)" : l; }
  // Número com sinal tipográfico: +33, 0, −55 (o mesmo sinal de menos da escala do medidor)
  function signed(v) { return v > 0 ? "+" + v : v < 0 ? "−" + Math.abs(v) : "0"; }
  // Agrupa respostas ("Outro: ..." vira "Outro"; grafias iguais juntas). Devolve [{label, n}] e o total.
  // text: resposta aberta (padroniza maiúsculas e escolhe a grafia com acento).
  function tally(list, get, order, text) {
    var g = {}, tot = 0;
    list.forEach(function (x) {
      var v = get(x); if (v === undefined || v === null || v === "") return;
      v = String(v); if (v.indexOf("Outro: ") === 0) v = "Outro";
      var k = fold(v); g[k] = g[k] || { n: 0, names: {} }; g[k].n++; g[k].names[v] = (g[k].names[v] || 0) + 1; tot++;
    });
    var items = Object.keys(g).map(function (k) { return { key: k, label: text ? sentence(niceName(g[k].names)) : bestName(g[k].names), n: g[k].n }; });
    if (order) {
      items = order.map(function (o) { var it = items.filter(function (i) { return i.key === fold(o); })[0]; return { key: fold(o), label: o, n: it ? it.n : 0 }; })
        .concat(items.filter(function (i) { return order.map(fold).indexOf(i.key) < 0; }));
    } else items.sort(function (a, b) { return b.n - a.n || a.label.localeCompare(b.label, "pt-BR"); });
    return { items: items, tot: tot };
  }
  function field(key) { return function (x) { return x[key]; }; }
  function legacy(key) { return function (x) { return x.legado ? x.legado[key] : undefined; }; }

  /* ---------- Indicadores: peças visuais ---------- */
  var expanded = {}; // listas abertas em "Mostrar todos" (sobrevive ao redesenho)
  function chart(title, hint) {
    var box = el("div", { class: "chart" }, [el("h3", { text: title })]);
    if (hint) box.appendChild(el("p", { class: "hint", text: hint }));
    return box;
  }
  function barRow(label, n, tot, color, key) {
    var p = tot ? Math.round((n / tot) * 100) : 0;
    var fl = el("div", { class: "fl" }); grow(fl, "br:" + (key || "") + ":" + label, "width", p + "%", "0%"); if (color) fl.style.background = "var(" + color + ")";
    return el("div", { class: "br" }, [el("span", { text: label }), el("div", { class: "tr" }, [fl]), el("span", { class: "n", text: n + " (" + p + "%)" })]);
  }
  function moreToggle(box, key, total, limit) {
    if (total <= limit) return;
    var b = el("button", { class: "lnk", type: "button", text: expanded[key] ? "Mostrar menos" : "Mostrar todos (" + total + ")" });
    b.addEventListener("click", function () { expanded[key] = !expanded[key]; renderAll(); });
    box.appendChild(b);
  }
  // Barras com quantidade e %, base declarada. limit: mostra os N maiores e "Mostrar todos".
  function bars(title, hint, list, get, opts) {
    opts = opts || {};
    var t = tally(list, get, opts.order, opts.text);
    var box = chart(title, (hint ? hint + " " : "") + "Base: " + t.tot + pl(t.tot, " resposta.", " respostas.") + smallBase(t.tot));
    if (!t.tot) { box.appendChild(el("p", { class: "hint", text: "Sem respostas neste filtro." })); return box; }
    var key = "bars:" + (opts.id || title), lim = opts.limit || 999;
    t.items.slice(0, expanded[key] ? 9999 : lim).forEach(function (it, i) { box.appendChild(barRow(it.label, it.n, t.tot, opts.colors && opts.colors[i], key)); });
    moreToggle(box, key, t.items.length, lim);
    return box;
  }
  function tile(v, label, sub) { return el("div", { class: "tile" }, [el("b", { text: v }), el("span", { text: label }), sub ? el("small", { text: sub }) : null]); }

  function heading(title, color) { var h = el("h2", { class: "sec", text: title }); h.style.setProperty("--c", "var(" + color + ")"); return h; }
  function table(head, rows, numFrom) {
    var th = head.map(function (h, i) { return el("th", { class: i >= numFrom ? "num" : "", text: h }); });
    var tb = el("tbody");
    rows.forEach(function (r) { tb.appendChild(el("tr", null, r.map(function (c, i) { return el("td", { class: i >= numFrom ? "num" : "", text: c }); }))); });
    return el("div", { class: "tw" }, [el("table", null, [el("thead", null, [el("tr", null, th)]), tb])]);
  }

  function npsBlock(st, list, title) {
    var box = chart(title || "Recomendação (eNPS)", "Nota de 0 a 10 para recomendar a WAP como lugar para trabalhar. Detratores: 0 a 6. Neutros: 7 e 8. Promotores: 9 e 10. eNPS = % de promotores menos % de detratores.");
    if (!st.npsN) { box.appendChild(el("p", { class: "hint", text: "Sem notas neste filtro (a base 2024 não tinha esta pergunta)." })); return box; }
    box.appendChild(el("p", { class: "lead", text: "eNPS " + st.nps + " pontos, calculado sobre " + st.npsN + (st.npsN === 1 ? " nota." : " notas.") + smallBase(st.npsN) }));
    [["Promotores (9 e 10)", st.pro, "--s1"], ["Neutros (7 e 8)", st.neu, "--s3"], ["Detratores (0 a 6)", st.det, "--s4"]].forEach(function (g) { box.appendChild(barRow(g[0], g[1], st.npsN, g[2], "nps")); });
    var notas = list.filter(function (x) { return isResp(x) && typeof x.nps === "number"; });
    // Distribuição por nota, com fundo leve por faixa (detrator, neutro, promotor)
    var cls = function (k) { return k <= 6 ? "nd" : k <= 8 ? "nn" : "npr"; };
    var hr = el("tr"), br = el("tr");
    for (var k = 0; k <= 10; k++) {
      var n = notas.filter(function (x) { return x.nps === k; }).length;
      hr.appendChild(el("th", { class: "num " + cls(k), text: String(k) }));
      br.appendChild(el("td", { class: "num " + cls(k), text: np(n, notas.length) }));
    }
    box.appendChild(el("p", { class: "hint", text: "Distribuição por nota", style: "margin:16px 0 0" }));
    var lg = el("div", { class: "legend" });
    [["nd", "Detratores (0 a 6)"], ["nn", "Neutros (7 e 8)"], ["npr", "Promotores (9 e 10)"]].forEach(function (g) { lg.appendChild(el("span", null, [el("i", { class: g[0] }), document.createTextNode(g[1])])); });
    box.appendChild(lg);
    box.appendChild(el("div", { class: "tw" }, [el("table", { class: "nps-t" }, [el("thead", null, [hr]), el("tbody", null, [br])])]));
    return box;
  }

  // Experiência: cada dimensão numa barra empilhada, com quantidade e % de cada avaliação sempre à vista.
  // Ordem: da mais bem avaliada para a mais mal avaliada. À direita: avaliações positivas (bom ou excelente).
  function expTable(resp) {
    var dims = DIM.map(function (d) {
      var a = answered(resp, d[0]);
      return { key: d[0], label: d[1], n: a.length, g: goodN(a, d[0]), c: ESCALA.map(function (k) { return a.filter(function (x) { return x[d[0]] === k; }).length; }) };
    }).filter(function (d) { return d.n; }).sort(function (a, b) { return b.g / b.n - a.g / a.n; });
    var minN = dims.reduce(function (m, d) { return Math.min(m, d.n); }, Infinity);
    var box = chart("Como avaliam a experiência", "Quem aceitou participar. Ordenado da dimensão mais bem avaliada para a mais mal avaliada. À direita, as avaliações positivas (bom ou excelente) sobre quem respondeu." + smallBase(minN));
    if (!dims.length) { box.appendChild(el("p", { class: "hint", text: "Sem respostas neste filtro." })); return box; }
    var lg = el("div", { class: "legend" });
    ESCALA.forEach(function (k, i) { lg.appendChild(el("span", null, [el("i", { style: "background:var(--s" + (i + 1) + ")" }), document.createTextNode(k)])); });
    box.appendChild(lg);
    box.appendChild(el("div", { class: "xp xp-h" }, [el("span", { text: "Dimensão" }), el("span", { text: "Distribuição" }), el("span", { text: "Positivas" })]));
    dims.forEach(function (d) {
      var stack = el("div", { class: "xp-bar" });
      d.c.forEach(function (n, i) {
        if (!n) return;
        var p = Math.round((n / d.n) * 100);
        var s = el("div", { class: "seg s" + (i + 1), title: ESCALA[i] + ": " + n + " de " + d.n + " (" + p + "%)" });
        grow(s, "xp:" + d.key + ":" + i, "width", (n / d.n) * 100 + "%", "0%");
        if (p >= 14) s.textContent = n + " · " + p + "%"; else if (p >= 6) s.textContent = String(n);
        stack.appendChild(s);
      });
      // Linha com todos os números só quando alguma faixa é estreita demais para mostrar quantidade e %
      var cramped = d.c.some(function (n) { return n && Math.round((n / d.n) * 100) < 14; });
      var detail = cramped ? el("small", { class: "xp-d", text: ESCALA.map(function (k, i) { return k + " " + np(d.c[i], d.n); }).join(" · ") }) : null;
      box.appendChild(el("div", { class: "xp" }, [
        el("span", { class: "xp-l" }, [document.createTextNode(d.label), el("small", { text: d.n + (d.n === 1 ? " resposta" : " respostas") })]),
        el("div", null, [stack, detail]),
        el("span", { class: "xp-p" }, [el("b", { text: pct(d.g, d.n) + "%" }), el("small", { text: d.g + " de " + d.n })])
      ]));
    });
    return box;
  }
  // Aviso de base pequena: abaixo de 20 respostas, % muda muito com poucas pessoas.
  function smallBase(n) { return n > 0 && n < 20 && n !== Infinity ? " Base pequena (" + n + "): leia com cautela." : ""; }

  // Comentários completos, com contexto. Mostra 5 e "Mostrar todos".
  function quotes(title, hint, list, key, metaFn) {
    var items = list.filter(function (x) { return x[key] && String(x[key]).trim().length > 1 && String(x[key]).trim() !== "-"; })
      .sort(function (a, b) { return entryDate(a) < entryDate(b) ? 1 : -1; });
    var box = chart(title + " (" + items.length + ")", hint);
    if (!items.length) { box.appendChild(el("p", { class: "hint", text: "Sem respostas neste filtro." })); return box; }
    var k = "q:" + title, lim = 5;
    items.slice(0, expanded[k] ? 9999 : lim).forEach(function (x) {
      box.appendChild(el("blockquote", { class: "quote" }, [el("p", { text: String(x[key]).trim() }), el("small", { text: metaFn(x) })]));
    });
    moreToggle(box, k, items.length, lim);
    return box;
  }
  function ctx(x, extra) {
    return [extra, x.setor, x.unidade, brDate(entryDate(x)), typeof x.nps === "number" ? "nota " + x.nps + " (" + npsClass(x.nps) + ")" : "", x.origem === "Base 2024" ? "base 2024" : ""].filter(Boolean).join(" · ");
  }

  // Perguntas do formulário, aplicadas ao recorte do filtro (todas, voluntárias ou involuntárias).
  function questions(list) {
    var st = stats(list), resp = st.resp, wrap = el("div");
    if (list.some(isVol)) wrap.appendChild(bars("Principal fator da saída voluntária", "Quem pediu para sair e aceitou a entrevista.", resp.filter(isVol), field("principalFator"), { id: "fator" }));
    if (list.some(isInv)) wrap.appendChild(bars("Motivo do desligamento involuntário", "Todos os desligamentos por iniciativa da empresa, mesmo com recusa da entrevista.", list.filter(isInv), field("motivoInvoluntario"), { id: "motivo" }));
    // "Aceitou participar" e "Voltaria" ficam nos cartões (sim e não, com quantidade e %).
    wrap.appendChild(npsBlock(st, list));
    wrap.appendChild(expTable(resp));
    wrap.appendChild(bars("Feedback do gestor nos últimos 6 meses", "Na base 2024 a pergunta era “recebeu feedbacks no período?” (Nunca / Às vezes / Sempre), convertida de forma aproximada.", resp, field("feedback"), { id: "fb", order: FEEDBACK }));
    // Benefícios lado a lado: o que funcionava e o que precisa melhorar
    var ben = el("div", { class: "duo" }, [
      bars("Benefício que mais atendia", "Resposta aberta; grafias diferentes contam juntas.", resp, field("beneficioMelhor"), { id: "bm", limit: 6, text: 1 }),
      bars("Benefício a melhorar", "Resposta aberta; grafias diferentes contam juntas.", resp, field("beneficioMelhoria"), { id: "bo", limit: 6, text: 1 })
    ]);
    wrap.appendChild(ben);
    return wrap;
  }

  // O que dizem: comentários completos, com o motivo ou fator de cada pessoa ao lado.
  function why(x) { return isVol(x) ? "voluntária · " + (x.principalFator || "sem fator") : isInv(x) ? "involuntária · " + (x.motivoInvoluntario || "sem motivo") : "sem iniciativa"; }
  function sayings(list) {
    var resp = list.filter(isResp), wrap = el("div");
    var outro = function (key) {
      return list.filter(function (x) { return String(x[key] || "").indexOf("Outro: ") === 0; }).map(function (x) { var o = Object.assign({}, x); o._o = x[key].slice(7); return o; });
    };
    if (list.some(isVol)) wrap.appendChild(quotes("Fatores descritos como “Outro”", null, outro("principalFator"), "_o", function (x) { return ctx(x, ""); }));
    if (list.some(isInv)) wrap.appendChild(quotes("Motivos descritos como “Outro”", null, outro("motivoInvoluntario"), "_o", function (x) { return ctx(x, ""); }));
    if (list.some(isVol)) wrap.appendChild(quotes("Fatores secundários da saída", null, resp.filter(isVol), "secundarios", function (x) { return ctx(x, why(x)); }));
    wrap.appendChild(quotes("O que mudaria na WAP", "“Se pudesse mudar uma coisa na WAP para melhorar a experiência dos colaboradores, o que mudaria?”", resp, "mudaria", function (x) { return ctx(x, why(x)); }));
    wrap.appendChild(quotes("Benefício a melhorar", null, resp, "beneficioMelhoria", function (x) { return ctx(x, why(x)); }));
    return wrap;
  }
  function commentCount(list) {
    var n = 0, resp = list.filter(isResp);
    ["mudaria", "beneficioMelhoria", "secundarios"].forEach(function (k) { n += resp.filter(function (x) { return x[k]; }).length; });
    return n;
  }

  /* ---------- Observações gerais do entrevistador: interpretação ----------
     Leitura automática por palavras-chave, feita aqui no navegador (nenhum texto sai para serviços externos).
     Cada observação recebe os temas que cita e um tom (positivo, negativo, misto ou neutro).
     É um apoio à leitura: os números orientam onde olhar; o texto completo fica logo abaixo. */
  var TEMAS = [
    { id: "lider", nome: "Liderança e gestão", re: /\b(lider|gestor|gestora|gestao|gerente|coordenador|coordenadora|supervisor|supervisora|chefe|chefia|diretor)/ },
    { id: "remun", nome: "Remuneração", re: /\b(salari|remunera|aumento|dissidio|reajuste|plr|bonus|defasad|ganhar mais|financeir)/ },
    { id: "benef", nome: "Benefícios", re: /\b(benefici|vale[ -]?alimenta|vale[ -]?refei|vale[ -]?transporte|va\b|vr\b|plano de saude|plano odont|convenio|gympass|refeitorio|cesta|auxilio|almoco|comida)/ },
    { id: "carreira", nome: "Carreira e desenvolvimento", re: /\b(carreira|crescimento|crescer|promoc|promovid|desenvolviment|treinament|capacita|aprendiz|aprendeu|aprender)/ },
    { id: "clima", nome: "Clima e equipe", re: /\b(clima|equipe|colegas|ambiente|amizade|companheir|acolh|time\b(?! de people)|pares)/ },
    { id: "reconh", nome: "Reconhecimento", re: /\b(reconhec|valoriz|desvaloriz)/ },
    { id: "carga", nome: "Carga de trabalho e horários", re: /\b(sobrecarg|pressao|carga|horario|turno|hora extra|horas extras|escala|jornada|cansa|estress|esgot|acumul|demanda)/ },
    { id: "proc", nome: "Processos e organização", re: /\b(processo|organiza|desorganiz|retrabalho|estrutura|planejament|prazo|sistema|ferramenta)/ },
    { id: "comun", nome: "Comunicação e feedback", re: /\b(comunica|feedback|alinhament|alinhad|transparen|escuta|ouvid|sem retorno|demora nos retornos)/ },
    { id: "pessoal", nome: "Motivos pessoais", re: /\b(pessoal|pessoais|familia|filho|filha|bebe|gravid|(?<!plano de )saude|mudanca de cidade|cidade natal|mudar de cidade|estud|faculdade|distancia|sonho)/ },
    { id: "conduta", nome: "Desempenho e conduta", re: /\b(desempenho|performance|comportament|conduta|atraso|absente|advertenc|faltas|resistencia)/ }
  ];
  var TOM_POS = /\b(agradec|gratid|grato|grata|excelente|otim|gostou|gosta d|satisfeit|elogi|positiv|carinho|feliz|orgulh|recomend|respeit|apoio|suporte necessario|bem recebid|admira)/;
  var TOM_NEG = /\b(insatisf|frustr|triste|tristeza|decepc|reclam|chatead|desmotiv|abandon|injust|ruim|pessim|desrespeit|descaso|dificuldade|problema|nao gost|falta de|mal trat|maltrat|desconfort|abalad|irritad|desanim|desvaloriz|inseguro|insegura|abaixo do mercado|baixo|baixa|insuficient|defasad|nao dava|nao tinha|nunca|sentiu falta|sentia falta|sobrecarg|retrabalho|desorganiz|cobranca excessiva)/;
  function lerObs(x) {
    var t = fold(x.obs);
    var temas = TEMAS.filter(function (m) { return m.re.test(t); }).map(function (m) { return m.id; });
    var p = TOM_POS.test(t), n = TOM_NEG.test(t);
    return { temas: temas, tom: p && n ? "Misto" : n ? "Negativo" : p ? "Positivo" : "Neutro" };
  }
  var TOM_ORDEM = ["Negativo", "Misto", "Positivo", "Neutro"];
  var obsTema = ""; // tema escolhido no filtro das observações
  function temaNome(id) { return TEMAS.filter(function (m) { return m.id === id; })[0].nome; }

  function observacoes(list) {
    var wrap = el("div");
    var obs = list.filter(function (x) { return x.obs && String(x.obs).trim().length > 3; }).map(function (x) { return { x: x, l: lerObs(x) }; });
    if (!obs.length) { wrap.appendChild(el("p", { class: "hint", text: "Sem observações neste filtro." })); return wrap; }
    var N = obs.length;
    var conta = function (arr, id) { return arr.filter(function (o) { return o.l.temas.indexOf(id) >= 0; }).length; };
    var rank = TEMAS.map(function (m) { return { id: m.id, nome: m.nome, n: conta(obs, m.id) }; }).filter(function (r) { return r.n; }).sort(function (a, b) { return b.n - a.n; });
    var tons = {}; TOM_ORDEM.forEach(function (k) { tons[k] = obs.filter(function (o) { return o.l.tom === k; }).length; });

    // Interpretação em texto, a partir dos números
    var pts = [];
    var semTema = obs.filter(function (o) { return !o.l.temas.length; }).length;
    // "40% (28 de 70)": porcentagem primeiro, quantidade e base entre parênteses
    var cit = function (n, base) { return pct(n, base) + "% (" + n + " de " + base + ")"; };
    var top3 = rank.slice(0, 3);
    if (top3.length) { var tp = ["Temas mais presentes: "]; top3.forEach(function (r, i) { tp.push([r.nome], " em " + cit(r.n, N) + (i === top3.length - 1 ? "." : i === top3.length - 2 ? "; e " : "; ")); }); pts.push(tp); }
    pts.push(["Tom das observações: ", [pct(tons.Negativo, N) + "%"], " negativas, ", [pct(tons.Misto, N) + "%"], " mistas, ", [pct(tons.Positivo, N) + "%"], " positivas e " + pct(tons.Neutro, N) + "% neutras (base: " + N + ")."]);
    // Tema que mais aparece junto de tom negativo (mín. 5 citações, para não exagerar casos isolados)
    var neg = rank.filter(function (r) { return r.n >= 5; }).map(function (r) { var c = obs.filter(function (o) { return o.l.temas.indexOf(r.id) >= 0; }); return { nome: r.nome, n: c.length, ng: c.filter(function (o) { return o.l.tom === "Negativo" || o.l.tom === "Misto"; }).length }; })
      .sort(function (a, b) { return b.ng / b.n - a.ng / a.n; })[0];
    if (neg && neg.ng) pts.push(["Tema com mais carga negativa: ", [neg.nome], " — " + cit(neg.ng, neg.n) + " das observações que o citam têm tom negativo ou misto."]);
    var vo = obs.filter(function (o) { return isVol(o.x); }), io = obs.filter(function (o) { return isInv(o.x); });
    var topDe = function (arr) { return TEMAS.map(function (m) { return { nome: m.nome, n: conta(arr, m.id) }; }).sort(function (a, b) { return b.n - a.n; })[0]; };
    if (vo.length >= 5 && io.length >= 5) { var tv = topDe(vo), ti = topDe(io); if (tv.n && ti.n) pts.push(["Nas voluntárias, o tema mais citado é ", [tv.nome], " — " + cit(tv.n, vo.length) + "; nas involuntárias, ", [ti.nome], " — " + cit(ti.n, io.length) + "."]); }
    if (semTema) pts.push([np(semTema, N) + " não citam nenhum dos temas e ficam só na lista abaixo."]);
    var lead = [[N + pl(N, " observação", " observações")], " registradas pelos entrevistadores neste filtro."];
    wrap.appendChild(insight("--p1", "Interpretação automática", lead, pts));
    wrap.appendChild(el("p", { class: "hint", style: "margin-top:8px", text: "Leitura por palavras-chave, feita no próprio site; serve para orientar a leitura, não para substituí-la. Uma observação pode citar vários temas." }));

    // Temas (quantidade e %) e tom
    var temasBox = chart("Temas citados", "Base: " + N + pl(N, " observação.", " observações.") + smallBase(N));
    rank.forEach(function (r) { temasBox.appendChild(barRow(r.nome, r.n, N, null, "obs-tema")); });
    var tomBox = chart("Tom das observações", "Base: " + N + pl(N, " observação.", " observações."));
    var tomCor = { Negativo: "--s4", Misto: "--p3", Positivo: "--s1", Neutro: "--line-strong" };
    TOM_ORDEM.forEach(function (k) { tomBox.appendChild(barRow(k, tons[k], N, tomCor[k], "obs-tom")); });
    wrap.appendChild(el("div", { class: "duo" }, [temasBox, tomBox]));

    // Voluntárias x involuntárias, tema a tema
    if (vo.length && io.length) {
      var cmp = chart("Temas por tipo de saída", "% das observações de cada grupo que citam o tema.");
      cmp.appendChild(table(["Tema", "Voluntárias (" + vo.length + ")", "Involuntárias (" + io.length + ")"], rank.map(function (r) { return [r.nome, np(conta(vo, r.id), vo.length), np(conta(io, r.id), io.length)]; }), 1));
      wrap.appendChild(cmp);
    }

    // Observações completas, filtráveis por tema
    var lista = chart("Observações", "Escolha um tema para ler só as observações que o citam. Registro de quem conduziu a entrevista; pode citar pessoas.");
    if (obsTema && !rank.some(function (r) { return r.id === obsTema; })) obsTema = "";
    var chips = el("div", { class: "chips obs-chips" });
    [{ id: "", nome: "Todas", n: N }].concat(rank).forEach(function (r) {
      var b = el("button", { type: "button", class: "chipbtn" + (obsTema === r.id ? " on" : ""), text: r.nome + " · " + r.n });
      b.addEventListener("click", function () { obsTema = r.id; expanded["q:obs"] = false; renderAll(); });
      chips.appendChild(b);
    });
    lista.appendChild(chips);
    var sel = obs.filter(function (o) { return !obsTema || o.l.temas.indexOf(obsTema) >= 0; }).sort(function (a, b) { return entryDate(a.x) < entryDate(b.x) ? 1 : -1; });
    var lim = 5;
    sel.slice(0, expanded["q:obs"] ? 9999 : lim).forEach(function (o) {
      var tags = el("span", { class: "obs-tags" }, o.l.temas.map(function (id) { return el("span", { class: "obs-tag", text: temaNome(id) }); }).concat([el("span", { class: "obs-tag tom-" + fold(o.l.tom), text: "tom " + o.l.tom.toLowerCase() })]));
      lista.appendChild(el("blockquote", { class: "quote" }, [el("p", { text: String(o.x.obs).trim() }), el("small", { text: ctx(o.x, why(o.x)) }), tags]));
    });
    moreToggle(lista, "q:obs", sel.length, lim);
    wrap.appendChild(lista);

    // Os demais comentários (dos colaboradores) continuam disponíveis, recolhidos
    wrap.appendChild(collapsible("outros-com", "Outros comentários dos colaboradores", commentCount(list) + " comentários: o que mudaria, benefício a melhorar, fatores secundários e “Outro”", sayings(list)));
    return wrap;
  }

  // Seção recolhível: abre ao clicar e continua aberta ao trocar filtros.
  function collapsible(id, title, sub, content) {
    var d = el("details", { class: "fold" }, [el("summary", null, [el("span", { text: title }), sub ? el("small", { text: sub }) : null]), el("div", { class: "fold-b" }, [content])]);
    if (printMode || expanded["sec:" + id]) d.open = true;
    d.addEventListener("toggle", function () { expanded["sec:" + id] = d.open; });
    return d;
  }

  // Tabela de quebra (unidade, área, gestor...): saídas, voluntárias, involuntárias, aceitaram, eNPS, voltariam.
  function breakdown(title, hint, list, get, limit) {
    var g = {};
    list.forEach(function (x) { var v = get(x) || "Não informado"; var k = fold(v); g[k] = g[k] || { names: {}, rows: [] }; g[k].names[v] = (g[k].names[v] || 0) + 1; g[k].rows.push(x); });
    var keys = Object.keys(g).sort(function (a, b) { return g[b].rows.length - g[a].rows.length; });
    var k = "bd:" + title, lim = limit || 999;
    var rows = keys.slice(0, expanded[k] ? 9999 : lim).map(function (key) {
      var l = g[key].rows, s = stats(l);
      return [bestName(g[key].names), np(s.n, list.length), np(s.nVol, s.n), np(s.nInv, s.n), np(s.nResp, s.n), s.npsN ? s.nps + " (" + s.npsN + ")" : "-", s.voltaN ? np(s.voltaSim, s.voltaN) : "-"];
    });
    var box = chart(title, hint);
    box.appendChild(table([title.replace("Por ", ""), "Saídas (% do total)", "Voluntárias", "Involuntárias", "Aceitaram", "eNPS (notas)", "Voltariam"], rows, 1));
    moreToggle(box, k, keys.length, lim);
    return box;
  }

  function byMonth(list) {
    var g = {};
    list.forEach(function (x) { var m = entryDate(x).slice(0, 7); g[m] = g[m] || []; g[m].push(x); });
    var k = "bd:mes", keys = Object.keys(g).sort().reverse(), lim = 12;
    var rows = keys.slice(0, expanded[k] ? 9999 : lim).map(function (m) { var s = stats(g[m]); return [m.split("-").reverse().join("/"), String(s.n), np(s.nVol, s.n), np(s.nInv, s.n), np(s.nResp, s.n)]; });
    var box = chart("Por mês", "Mês da entrevista, do mais recente para o mais antigo.");
    box.appendChild(table(["Mês", "Saídas", "Voluntárias", "Involuntárias", "Aceitaram"], rows, 1));
    moreToggle(box, k, keys.length, lim);
    return box;
  }

  // Perguntas que só existiam no formulário antigo (guardadas em "legado").
  var LEG_CAT = [
    ["Você foi informado do motivo do desligamento?", SN],
    ["Os objetivos da sua função estavam claros?", SN],
    ["Opinião sobre a infraestrutura da empresa", ESCALA],
    ["Competência do líder para a função", ["Altamente capacitado", "Capacitado", "Pouco capacitado"]],
    ["Como avalia a cultura da empresa", ESCALA],
    ["Opinião sobre os canais de comunicação interna", ESCALA],
    ["Como avalia o time de People", ESCALA],
    ["Recebeu feedbacks no período? (original)", ["Sempre", "Às vezes", "Nunca"]],
    ["A empresa ofereceu oportunidades de desenvolvimento? (original)", SN],
    ["Principal fortaleza da empresa", null],
    ["Principal oportunidade de melhoria (categoria)", null],
    ["Defina a WAP em uma palavra", null]
  ];
  function legacyBlock(old) {
    var wrap = el("div");
    wrap.appendChild(el("p", { class: "hint", text: "Perguntas que existiam só no formulário antigo. Valem para as " + old.length + " entrevistas da base 2024 neste filtro e não têm equivalente no V2." }));
    LEG_CAT.forEach(function (q) {
      wrap.appendChild(bars(q[0], q[1] ? null : "Respostas iguais escritas de jeitos diferentes contam juntas.", old, legacy(q[0]), { id: "leg:" + q[0], order: q[1] || null, limit: q[1] ? 0 : 10, text: !q[1] }));
    });
    var conselho = old.filter(function (x) { return x.legado && x.legado["Conselho para quem vai ocupar a posição"]; })
      .map(function (x) { var o = Object.assign({}, x); o._c = x.legado["Conselho para quem vai ocupar a posição"]; return o; });
    wrap.appendChild(quotes("Conselho para quem vai ocupar a posição", null, conselho, "_c", function (x) { return ctx(x, why(x)); }));
    return wrap;
  }

  // Resumo em cartão: uma frase principal e os detalhes em tópicos, números em destaque.
  // Partes: texto simples ou [texto] para destacar.
  function rich(parts) { var p = el("span"); parts.forEach(function (t) { p.appendChild(Array.isArray(t) ? el("b", { text: t[0] }) : document.createTextNode(t)); }); return p; }
  function insight(color, label, lead, points) {
    var card = el("div", { class: "insight" }, [el("span", { class: "insight-l", text: label }), el("p", { class: "insight-lead" }, [rich(lead)])]);
    card.style.setProperty("--c", "var(" + color + ")");
    var ul = el("ul"); points.filter(Boolean).forEach(function (pt) { ul.appendChild(el("li", null, [rich(pt)])); });
    if (ul.childNodes.length) card.appendChild(ul);
    return card;
  }
  // Melhor e pior dimensão da experiência no recorte.
  function extremes(resp) {
    var r = DIM.map(function (d) { var a = answered(resp, d[0]); return { label: d[1], n: a.length, g: goodN(a, d[0]), p: pct(goodN(a, d[0]), a.length) }; }).filter(function (x) { return x.n; });
    // Só compara dimensões com base suficiente: 1 resposta com 100% não pode "ganhar" de 400 respostas.
    var maxN = r.reduce(function (m, x) { return Math.max(m, x.n); }, 0);
    r = r.filter(function (x) { return x.n >= Math.min(20, maxN) && x.n >= 0.2 * maxN; });
    if (r.length < 2) return null;
    r.sort(function (a, b) { return b.p - a.p; });
    return { best: r[0], worst: r[r.length - 1] };
  }

  /* ---------- Indicadores: painel ---------- */
  // Mini-gráficos em SVG (cores pelos tokens do tema).
  var SVGNS = "http://www.w3.org/2000/svg";
  function svg(w, h, kids) { var s = document.createElementNS(SVGNS, "svg"); s.setAttribute("viewBox", "0 0 " + w + " " + h); s.setAttribute("aria-hidden", "true"); (kids || []).forEach(function (k) { s.appendChild(k); }); return s; }
  function sv(tag, attrs) { var n = document.createElementNS(SVGNS, tag); Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); }); return n; }
  // Linha de tendência dos últimos 12 meses (com área suave).
  function spark(values) {
    var w = 120, h = 36, max = Math.max.apply(null, values.concat([1])), step = values.length > 1 ? w / (values.length - 1) : w;
    var pts = values.map(function (v, i) { return [i * step, h - 3 - (v / max) * (h - 8)]; });
    var line = pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
    var last = pts[pts.length - 1];
    return svg(w, h, [
      sv("polygon", { points: "0," + h + " " + line + " " + w + "," + h, class: "sp-a" }),
      sv("polyline", { points: line, class: "sp-l" }),
      sv("circle", { cx: last[0], cy: last[1], r: 3, class: "sp-d" })
    ]);
  }
  // Gráficos "respondentes": ao mudar o número, o elemento desliza do valor anterior até o novo.
  // Guarda o último valor de cada peça (pela chave) e aplica o novo no quadro seguinte, para a transição do CSS animar.
  var prevViz = {};
  function grow(node, key, prop, to, initial) {
    if (printMode) { prevViz[key] = to; node.style[prop] = to; return; } // no PDF, sem animação
    var from = key in prevViz ? prevViz[key] : initial;
    prevViz[key] = to;
    if (from === undefined || from === to) { node.style[prop] = to; return; }
    node.style[prop] = from;
    requestAnimationFrame(function () { requestAnimationFrame(function () { node.style[prop] = to; }); });
  }
  // Rosca: partes [{n, cls}]
  function donut(parts, key) {
    var tot = parts.reduce(function (a, p) { return a + p.n; }, 0) || 1, r = 15.915, off = 25, kids = [sv("circle", { cx: 21, cy: 21, r: r, class: "dn-bg" })];
    key = key || "dn";
    parts.forEach(function (p) {
      if (!p.n) { prevViz[key + p.cls + ":a"] = "0 100"; return; }
      var len = (p.n / tot) * 100, c = sv("circle", { cx: 21, cy: 21, r: r, class: "dn " + p.cls });
      grow(c, key + p.cls + ":a", "strokeDasharray", len + " " + (100 - len), "0 100");
      grow(c, key + p.cls + ":o", "strokeDashoffset", String(off), "25");
      kids.push(c);
      off -= len;
    });
    return svg(42, 42, kids);
  }
  // Medidor do eNPS (−100 a +100). Geometria num lugar só; o marcador gira em torno do centro do arco,
  // com o ângulo calculado do valor: −100 → −90°, 0 → 0°, +100 → +90°. O número fica dentro do arco.
  var GAUGE = { w: 264, h: 146, cx: 132, cy: 126, r: 88, label: 27, min: -100, max: 100 };
  // Zonas de leitura do eNPS (definidas por People). O medidor usa as mesmas faixas e cores da legenda.
  var NPS_ZONAS = [
    { nome: "Zona Crítica", de: -100, ate: 0, cls: "z1", txt: "Alerta aceso. Alto índice de insatisfação; exige ações imediatas de melhoria no clima organizacional." },
    { nome: "Zona de Aperfeiçoamento", de: 1, ate: 50, cls: "z2", txt: "Ponto de atenção. A empresa tem pontos positivos, mas há oportunidades claras de evolução." },
    { nome: "Zona de Qualidade", de: 51, ate: 75, cls: "z3", txt: "Bom resultado. Os colaboradores estão engajados e a cultura interna está no caminho certo." },
    { nome: "Zona de Excelência", de: 76, ate: 100, cls: "z4", txt: "Cenário ideal. Alto nível de lealdade e orgulho em pertencer; a empresa é uma marca empregadora forte." }
  ];
  function npsZona(v) { return v === null ? null : NPS_ZONAS.filter(function (z) { return v >= z.de && v <= z.ate; })[0]; }
  // Legenda discreta das zonas, com a zona atual destacada
  function zonasLegenda(v) {
    var atual = npsZona(v);
    return el("ul", { class: "zonas" }, NPS_ZONAS.map(function (z) {
      return el("li", { class: z === atual ? "on" : "" }, [el("i", { class: z.cls }), el("span", null, [el("b", { text: z.nome.replace("Zona de ", "").replace("Zona ", "") }), document.createTextNode(" " + signed(z.de) + " a " + signed(z.ate) + ". " + z.txt)])]);
    }));
  }
  function gaugeAngle(v) { var c = Math.max(GAUGE.min, Math.min(GAUGE.max, v)); return ((c - GAUGE.min) / (GAUGE.max - GAUGE.min)) * 180 - 90; }
  function gaugePoint(v, r) { var a = gaugeAngle(v) * Math.PI / 180; return [GAUGE.cx + r * Math.sin(a), GAUGE.cy - r * Math.cos(a)]; }
  function gauge(v, n) {
    var G = GAUGE, gap = 1.5;
    var arc = function (x0, x1, cls) {
      var p0 = gaugePoint(x0 + gap, G.r), p1 = gaugePoint(x1 - gap, G.r);
      return sv("path", { d: "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " A" + G.r + " " + G.r + " 0 0 1 " + p1[0].toFixed(2) + " " + p1[1].toFixed(2), class: "gg " + cls });
    };
    // Arcos nas fronteiras das zonas: −100 · 0 · 50 · 75 · +100
    var kids = [arc(-100, 0, "z1"), arc(0, 50, "z2"), arc(50, 75, "z3"), arc(75, 100, "z4")];
    [-100, 0, 50, 75, 100].forEach(function (x) {
      var p = gaugePoint(x, G.r + G.label), t = sv("text", { x: p[0].toFixed(1), y: (p[1] + (Math.abs(x) === 100 ? 14 : 4)).toFixed(1), class: "gg-t", "text-anchor": "middle" });
      t.textContent = x > 0 ? "+" + x : x < 0 ? "−" + Math.abs(x) : "0";
      kids.push(t);
    });
    if (v !== null) {
      // Marcador no topo do arco, girado em torno do centro: fica exatamente sobre o valor na escala.
      var m = sv("g", { class: "gg-m" });
      m.appendChild(sv("circle", { cx: G.cx, cy: G.cy - G.r, r: 7, class: "gg-dot" }));
      // Triângulo do lado de dentro do arco, apontando para ele (não esbarra nas marcas da escala nem no número)
      m.appendChild(sv("path", { d: "M" + (G.cx - 6) + " " + (G.cy - G.r + 24) + " L" + (G.cx + 6) + " " + (G.cy - G.r + 24) + " L" + G.cx + " " + (G.cy - G.r + 13) + " Z", class: "gg-tri" }));
      m.style.transformOrigin = G.cx + "px " + G.cy + "px";
      grow(m, "gauge", "transform", "rotate(" + gaugeAngle(v) + "deg)", "rotate(-90deg)");
      kids.push(m);
    }
    var s = svg(G.w, G.h, kids); s.setAttribute("class", "gauge");
    var val = el("div", { class: "gauge-v" }, [el("b", { text: v === null ? "–" : signed(v) }), el("span", { class: "gauge-z" + (npsZona(v) ? " t-" + npsZona(v).cls : ""), text: npsZona(v) ? npsZona(v).nome : "" }), el("span", { text: n ? n + pl(n, " nota", " notas") : "sem notas" })]);
    return el("div", { class: "gauge-w", role: "img", "aria-label": v === null ? "eNPS sem notas" : "eNPS " + v + " numa escala de −100 a +100" }, [s, val]);
  }
  if (DEMO) window.__wapTest = { gauge: gauge, gaugeAngle: gaugeAngle, gaugePoint: gaugePoint, GAUGE: GAUGE, reset: function () { reset(); }, offerDraft: function () { return offerDraft(); }, state: function () { return S; } }; // só no modo demonstração, para validar medidor e rascunho
  // Barrinha empilhada para os cartões: partes [{n, cls, label}]
  function minibar(parts, key) {
    var tot = parts.reduce(function (a, p) { return a + p.n; }, 0), b = el("div", { class: "mb" });
    key = key || "mb:" + parts.map(function (p) { return p.label; }).join("|");
    parts.forEach(function (p) {
      if (!p.n) { prevViz[key + ":" + p.label] = "0%"; return; }
      var s = el("i", { class: p.cls, title: p.label + ": " + np(p.n, tot) });
      grow(s, key + ":" + p.label, "width", (p.n / tot) * 100 + "%", "0%");
      b.appendChild(s);
    });
    return b;
  }
  // Lista dos cartões: uma linha por categoria (cor · rótulo · quantidade e %), números alinhados à direita.
  // big: % em destaque na cor da categoria (cartão do eNPS).
  function legendRow(parts, big) {
    var tot = parts.reduce(function (a, p) { return a + p.n; }, 0);
    return el("ul", { class: "kl" + (big ? " kl-big" : "") }, parts.map(function (p) {
      var pc = tot ? Math.round((p.n / tot) * 100) : 0;
      return el("li", null, big
        ? [el("i", { class: p.cls }), el("b", { class: "kl-p t-" + p.cls, text: pc + "%" }), el("span", { class: "kl-n", text: p.label }), el("span", { class: "kl-v", text: String(p.n) })]
        : [el("i", { class: p.cls }), el("span", { class: "kl-n", text: p.label }), el("span", { class: "kl-v", text: p.n + " (" + pc + "%)" })]);
    }));
  }
  function months12(list) {
    var now = new Date(), keys = [];
    for (var i = 11; i >= 0; i--) { var d = new Date(now.getFullYear(), now.getMonth() - i, 1); keys.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")); }
    return keys.map(function (k) { return { k: k, n: list.filter(function (x) { return entryDate(x).slice(0, 7) === k; }).length }; });
  }
  // Cartão de indicador, padrão único (referência: Voluntárias):
  // rótulo · número principal + gráfico em área fixa · lista ou texto de apoio.
  function kpi(cls, label, value, sub, viz) {
    return el("div", { class: "kpi " + (cls || "") }, [
      el("span", { class: "kpi-l", text: label }),
      el("div", { class: "kpi-r" }, [el("b", { class: "kpi-v", text: value }), viz ? el("div", { class: "kpi-viz" }, [viz]) : null]),
      sub ? el("div", { class: "kpi-s" }, [typeof sub === "string" ? document.createTextNode(sub) : sub]) : null
    ]);
  }

  // Módulo: cartão com o número principal; ao clicar, abre o detalhe em largura total (um por vez).
  var openMod = null;
  function mod(id, title, value, sub, viz, build) {
    var card = el("button", { class: "mod-c", type: "button", "aria-expanded": String(openMod === id), "aria-controls": "mod-" + id }, [
      el("span", { class: "mod-t", text: title }),
      el("b", { class: "mod-v" + (/^[-+–]?[0-9–]/.test(value) ? "" : " txt"), text: value }),
      el("span", { class: "mod-s", text: sub }),
      viz || null,
      el("span", { class: "mod-go", text: openMod === id ? "Fechar detalhe" : "Ver detalhe" })
    ]);
    card.addEventListener("click", function () { openMod = openMod === id ? null : id; renderAll(); if (openMod) setTimeout(function () { var p = document.getElementById("mod-" + id); if (p) p.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 30); });
    var wrap = el("div", { class: "mod" + (openMod === id ? " on" : "") }, [card]);
    // No PDF, todos os módulos saem abertos
    return { card: wrap, panel: (printMode || openMod === id) ? el("section", { class: "mod-p" + (openMod === id ? "" : " print-only"), id: "mod-" + id, "aria-label": title }, [el("div", { class: "mod-ph" }, [el("h3", { text: title }), el("button", { class: "lnk", type: "button", text: "Fechar" })]), build()]) : null };
  }

  /* ---------- Indicadores: a história ---------- */
  var TIPOS = {
    "": { titulo: "Visão geral", cor: "--p1", rotulo: "Resumo de todas as saídas" },
    vol: { titulo: "Saídas voluntárias", cor: "--p4", rotulo: "Resumo das saídas voluntárias" },
    inv: { titulo: "Saídas involuntárias", cor: "--p2", rotulo: "Resumo das saídas involuntárias" },
    sem: { titulo: "Sem iniciativa registrada", cor: "--p3", rotulo: "Resumo" }
  };
  function renderMain(list) {
    var host = $("#ind-main"); host.textContent = "";
    if (!entries.length) { host.appendChild(el("div", { class: "empty", text: "Nenhuma entrevista salva ainda. Preencha a primeira na aba Nova entrevista e os indicadores aparecem aqui." })); return; }
    if (!list.length) { host.appendChild(el("div", { class: "empty", text: "Nenhuma entrevista neste filtro. Troque o tipo de saída ou ajuste os filtros." })); return; }
    var t = tipoAtual, T = TIPOS[t], st = stats(list), base = stats(filtered(true)), resp = st.resp;

    // 1. Resumo em cartão
    var lead, pts = [];
    if (!t) {
      lead = ["De ", [st.n + pl(st.n, " saída", " saídas")], ", ", [np(st.nVol, st.n)], pl(st.nVol, " foi voluntária e ", " foram voluntárias e "), [np(st.nInv, st.n)], pl(st.nInv, " involuntária.", " involuntárias.")];
      if (st.nSem) pts.push([[np(st.nSem, st.n)], pl(st.nSem, " não tem a iniciativa registrada (recusa da base 2024).", " não têm a iniciativa registrada (recusas da base 2024).")]);
    } else if (t === "sem") {
      lead = [[String(st.n)], pl(st.n, " entrevista sem iniciativa registrada, ", " entrevistas sem iniciativa registrada, "), [pct(st.n, base.n) + "% das saídas"], " no filtro."];
    } else {
      var vol = t === "vol", key = vol ? "principalFator" : "motivoInvoluntario", tl = tally(vol ? resp : list, field(key)), top = tl.items;
      lead = [[String(st.n)], vol ? pl(st.n, " saída por iniciativa do colaborador, ", " saídas por iniciativa do colaborador, ") : pl(st.n, " desligamento por iniciativa da empresa, ", " desligamentos por iniciativa da empresa, "), [pct(st.n, base.n) + "% das saídas"], " no filtro (" + st.n + " de " + base.n + ")."];
      if (top[0]) pts.push([vol ? "Principal fator: " : "Motivo mais registrado: ", ["“" + top[0].label + "”"], " em ", [nOf(top[0].n, tl.tot)], vol ? " de quem respondeu" : " dos casos", top[1] ? "; em seguida, “" + top[1].label + "”, com " + np(top[1].n, tl.tot) + "." : "."]);
    }
    var ex = extremes(resp);
    if (ex) pts.push(["Experiência mais bem avaliada: ", [ex.best.label], ", com " + np(ex.best.g, ex.best.n) + " bom ou excelente; a mais mal avaliada: ", [ex.worst.label], ", com " + np(ex.worst.g, ex.worst.n) + "."]);
    host.appendChild(insight(T.cor, T.rotulo, lead, pts));

    // 2. Faixa de indicadores: mesmo padrão de cartão para todos (referência: Voluntárias)
    var m12 = months12(list), lastM = m12[m12.length - 1], prevM = m12[m12.length - 2];
    var comp = [{ n: st.nVol, cls: "c-vol", label: "Voluntárias" }, { n: st.nInv, cls: "c-inv", label: "Involuntárias" }].concat(st.nSem ? [{ n: st.nSem, cls: "c-sem", label: "Sem iniciativa" }] : []);
    var aceit = [{ n: st.nResp, cls: "c-ok", label: "Aceitaram" }, { n: st.n - st.nResp, cls: "c-no", label: pl(st.n - st.nResp, "Recusou", "Recusaram") }];
    var volta = [{ n: st.voltaSim, cls: "c-ok", label: "Voltariam" }, { n: st.voltaN - st.voltaSim, cls: "c-no", label: "Não voltariam" }];
    var npsParts = [{ n: st.pro, cls: "c-pro", label: "Promotores" }, { n: st.neu, cls: "c-neu", label: "Neutros" }, { n: st.det, cls: "c-det", label: "Detratores" }];
    var saidasSub = el("div", { class: "kpi-trend" }, [spark(m12.map(function (x) { return x.n; })),
      el("span", { text: t ? nOf(st.n, base.n) + " do total" : "Últimos 12 meses · " + MESES[Number(lastM.k.slice(5)) - 1] + ": " + lastM.n + (prevM ? " (anterior: " + prevM.n + ")" : "") })]);
    var npsCard = el("div", { class: "kpi kpi-nps" }, [
      el("span", { class: "kpi-l", text: "eNPS · recomendação" }),
      el("div", { class: "nps-body" }, [
        gauge(st.npsN ? st.nps : null, st.npsN),
        st.npsN ? el("div", { class: "nps-side" }, [legendRow(npsParts, true),
          el("p", { class: "kpi-s" + (st.npsN < 20 ? " kpi-w" : ""), text: (st.npsN < 20 ? "Base pequena: " : "Base: ") + st.npsN + pl(st.npsN, " nota", " notas") + (st.npsN < 20 ? ". Leia com cautela." : ". eNPS = % promotores − % detratores.") })])
          : el("p", { class: "kpi-s", text: "Sem notas no filtro. A base 2024 não tinha esta pergunta; o eNPS vem das entrevistas do V2." })
      ]),
      zonasLegenda(st.npsN ? st.nps : null)
    ]);
    var strip = el("div", { class: "kpis" + (t ? " kpis-4" : "") }, [
      kpi("", t ? T.titulo : "Saídas", String(st.n), saidasSub, null),
      !t ? kpi("", "Voluntárias", fmt(pct(st.nVol, st.n), "%"), legendRow(comp), donut(comp, "dn-comp")) : null,
      kpi("", "Aceitaram a entrevista", fmt(st.adesao, "%"), legendRow(aceit), donut(aceit, "dn-aceit")),
      kpi("", "Voltariam a trabalhar na WAP", fmt(st.volta, "%"), st.voltaN ? legendRow(volta) : "Sem respostas", st.voltaN ? donut(volta, "dn-volta") : null),
      npsCard
    ].filter(Boolean));
    host.appendChild(strip);

    // 3. Módulos: número principal no cartão, detalhe ao clicar
    var mods = [];
    var vols = list.filter(isVol), invs = list.filter(isInv);
    if (vols.length) {
      var tf = tally(resp.filter(isVol), field("principalFator"));
      mods.push(mod("fator", "Por que pediram para sair", tf.items[0] ? pct(tf.items[0].n, tf.tot) + "%" : "–", tf.items[0] ? outroTxt(tf.items[0].label) + " · " + nOf(tf.items[0].n, tf.tot) : "Sem respostas", minibar(tf.items.slice(0, 5).map(function (it, i) { return { n: it.n, cls: "c" + i, label: it.label }; })), function () {
        var w = el("div"); w.appendChild(bars("Principal fator da saída voluntária", "Quem pediu para sair e aceitou a entrevista.", resp.filter(isVol), field("principalFator"), { id: "fator" })); return w;
      }));
    }
    if (invs.length) {
      var tm = tally(invs, field("motivoInvoluntario"));
      mods.push(mod("motivo", "Por que a empresa desligou", tm.items[0] ? pct(tm.items[0].n, tm.tot) + "%" : "–", tm.items[0] ? outroTxt(tm.items[0].label) + " · " + nOf(tm.items[0].n, tm.tot) : "Sem motivo registrado", minibar(tm.items.slice(0, 5).map(function (it, i) { return { n: it.n, cls: "c" + i, label: it.label }; })), function () {
        var w = el("div"); w.appendChild(bars("Motivo do desligamento involuntário", "Todos os desligamentos por iniciativa da empresa, mesmo com recusa da entrevista.", invs, field("motivoInvoluntario"), { id: "motivo" })); return w;
      }));
    }
    var dimsAll = DIM.map(function (d) { var a = answered(resp, d[0]); return { n: a.length, g: goodN(a, d[0]) }; }).filter(function (d) { return d.n; });
    // Média ponderada pelo número de respostas de cada dimensão
    var sumN = dimsAll.reduce(function (s, d) { return s + d.n; }, 0), sumG = dimsAll.reduce(function (s, d) { return s + d.g; }, 0);
    var avgPos = pct(sumG, sumN);
    mods.push(mod("exp", "Experiência", fmt(avgPos, "%"), ex ? "positivas em média · pior: " + ex.worst.label + " (" + ex.worst.p + "%)" : "positivas em média", minibar(ESCALA.map(function (k, i) { return { n: DIM.reduce(function (s, d) { return s + resp.filter(function (x) { return x[d[0]] === k; }).length; }, 0), cls: "s" + (i + 1), label: k }; })), function () { return expTable(resp); }));
    if (st.npsN) mods.push(mod("nps", "Recomendação (eNPS)", signed(st.nps), st.npsN + pl(st.npsN, " nota · ", " notas · ") + np(st.det, st.npsN) + pl(st.det, " detrator", " detratores"), minibar([{ n: st.pro, cls: "c-pro", label: "Promotores" }, { n: st.neu, cls: "c-neu", label: "Neutros" }, { n: st.det, cls: "c-det", label: "Detratores" }]), function () { return npsBlock(st, list); }));
    var fb = answered(resp, "feedback"), fb0 = fb.filter(function (x) { return x.feedback === "Nenhuma vez"; }).length;
    mods.push(mod("fb", "Feedback do gestor", fb.length ? pct(fb0, fb.length) + "%" : "–", fb.length ? "sem nenhum feedback em 6 meses · " + nOf(fb0, fb.length) : "Sem respostas", minibar(FEEDBACK.map(function (k, i) { return { n: fb.filter(function (x) { return x.feedback === k; }).length, cls: "f" + i, label: k }; })), function () {
      var w = el("div"); w.appendChild(bars("Feedback do gestor nos últimos 6 meses", "Na base 2024 a pergunta era “recebeu feedbacks no período?” (Nunca / Às vezes / Sempre), convertida de forma aproximada.", resp, field("feedback"), { id: "fb", order: FEEDBACK })); return w;
    }));
    var bm = tally(resp, field("beneficioMelhor"), null, 1), bo = tally(resp, field("beneficioMelhoria"), null, 1);
    mods.push(mod("ben", "Benefícios", bo.items[0] ? bo.items[0].label : "–", bo.items[0] ? "o mais citado para melhorar · " + nOf(bo.items[0].n, bo.tot) + (bm.items[0] ? " · atende: " + bm.items[0].label : "") : "Perguntas novas do V2", null, function () {
      return el("div", { class: "duo" }, [
        bars("Benefício que mais atendia", "Resposta aberta; grafias diferentes contam juntas.", resp, field("beneficioMelhor"), { id: "bm", limit: 6, text: 1 }),
        bars("Benefício a melhorar", "Resposta aberta; grafias diferentes contam juntas.", resp, field("beneficioMelhoria"), { id: "bo", limit: 6, text: 1 })
      ]);
    }));
    var tu = tally(list, field("unidade")), ta = tally(list, field("setor"));
    mods.push(mod("quem", "Quem saiu", tu.items[0] ? tu.items[0].label : "–", (tu.items[0] ? "unidade com mais saídas · " + np(tu.items[0].n, tu.tot) : "") + (ta.items[0] ? " · área: " + ta.items[0].label + " (" + ta.items[0].n + ")" : ""), null, function () {
      var q = el("div");
      q.appendChild(breakdown("Por unidade", null, list, field("unidade")));
      q.appendChild(breakdown("Por área", "Setor do colaborador.", list, field("setor"), 10));
      q.appendChild(breakdown("Por gestor", "Gestor direto. Nomes escritos de jeitos diferentes contam juntos.", list, field("gestor"), 10));
      q.appendChild(breakdown("Por entrevistador", null, list, field("entrevistador"), 10));
      return q;
    }));
    mods.push(mod("mes", "Linha do tempo", String(lastM.n), pl(lastM.n, "saída em ", "saídas em ") + MESES[Number(lastM.k.slice(5)) - 1] + "/" + lastM.k.slice(0, 4) + " · média de " + (Math.round(m12.reduce(function (s, x) { return s + x.n; }, 0) / 12 * 10) / 10).toLocaleString("pt-BR") + " por mês nos últimos 12 meses", spark(m12.map(function (x) { return x.n; })), function () { return byMonth(list); }));
    if (!t) {
      var sv0 = stats(vols), si0 = stats(invs);
      mods.push(mod("cmp", "Voluntárias x involuntárias", (sv0.volta === null ? "–" : sv0.volta + "%") + " x " + (si0.volta === null ? "–" : si0.volta + "%"), "voltariam, em cada grupo · compare todas as respostas", minibar([{ n: st.nVol, cls: "c-vol", label: "Voluntárias" }, { n: st.nInv, cls: "c-inv", label: "Involuntárias" }]), function () {
        var line = function (label, f) { return [label, f(sv0), f(si0), f(st)]; };
        var rows = [
          line("Saídas", function (x) { return np(x.n, st.n); }),
          line("Aceitaram a entrevista", function (x) { return np(x.nResp, x.n); }),
          line("Promotores (9 e 10)", function (x) { return np(x.pro, x.npsN); }),
          line("Neutros (7 e 8)", function (x) { return np(x.neu, x.npsN); }),
          line("Detratores (0 a 6)", function (x) { return np(x.det, x.npsN); }),
          line("eNPS", function (x) { return fmt(x.nps); }),
          line("Voltariam", function (x) { return x.voltaN ? np(x.voltaSim, x.voltaN) : "-"; })
        ];
        DIM.forEach(function (d) { rows.push(line(d[1] + ": bom ou excelente", function (x) { var a = answered(x.resp, d[0]); return a.length ? np(goodN(a, d[0]), a.length) : "-"; })); });
        var c = el("div");
        c.appendChild(el("p", { class: "hint", text: "Cada célula mostra a quantidade e a % dentro do grupo." }));
        c.appendChild(table(["Indicador", "Voluntárias", "Involuntárias", "Total"], rows, 1));
        return c;
      }));
    }
    var old = list.filter(function (x) { return x.origem === "Base 2024"; });
    if (old.length) mods.push(mod("leg", "Perguntas da base 2024", String(old.length), pl(old.length, "entrevista", "entrevistas") + " do formulário antigo · infraestrutura, cultura, liderança e mais", null, function () { return legacyBlock(old); }));
    // Último módulo: observações gerais do entrevistador, com interpretação
    var obsL = list.filter(function (x) { return x.obs && String(x.obs).trim().length > 3; }), obsLidas = obsL.map(lerObs);
    var obsTop = TEMAS.map(function (m) { return { nome: m.nome, n: obsLidas.filter(function (l) { return l.temas.indexOf(m.id) >= 0; }).length }; }).sort(function (a, b) { return b.n - a.n; });
    mods.push(mod("obs", "Observações gerais do entrevistador", String(obsL.length), obsL.length ? pl(obsL.length, "observação", "observações") + " · mais citados: " + obsTop.slice(0, 2).filter(function (o) { return o.n; }).map(function (o) { return o.nome + " (" + pct(o.n, obsL.length) + "%)"; }).join(", ") : "sem observações neste filtro",
      obsL.length ? minibar(TOM_ORDEM.map(function (k) { return { n: obsLidas.filter(function (l) { return l.tom === k; }).length, cls: "tom-" + fold(k), label: "Tom " + k.toLowerCase() }; }), "mb-obs") : null, function () { return observacoes(list); }));

    // Grade: o detalhe aberto entra logo depois da linha do cartão clicado (largura total)
    var grid = el("div", { class: "mods" });
    mods.forEach(function (m) {
      grid.appendChild(m.card);
      if (m.panel) { m.panel.querySelector(".mod-ph .lnk").addEventListener("click", function () { openMod = null; renderAll(); }); grid.appendChild(m.panel); }
    });
    host.appendChild(el("h2", { class: "mods-h", text: "Explore os indicadores" }));
    host.appendChild(el("p", { class: "hint", text: "Clique em um cartão para abrir o detalhe. Os números seguem o tipo de saída e os filtros escolhidos." }));
    host.appendChild(grid);
  }

  /* ---------- Respostas: busca por nome e filtros por coluna, como no Excel (independentes dos Indicadores) ---------- */
  function resultadoTxt(x) { return x.aceitou === "Sim" ? (typeof x.nps === "number" ? "Nota " + x.nps : "Respondeu") : "Recusou"; }
  // v: valor da célula e do filtro; sv: valor para classificar; ord: textos de classificação
  var AZ = ["Classificar de A a Z", "Classificar de Z a A"];
  var RCOLS = [
    { k: "data", t: "Data", v: function (x) { return entryDate(x).slice(0, 7); }, sv: entryDate,
      fmt: function (m) { return MESES[Number(m.slice(5, 7)) - 1] + "/" + m.slice(0, 4); }, desc: 1,
      ord: ["Da mais antiga para a mais nova", "Da mais nova para a mais antiga"] },
    { k: "colaborador", t: "Colaborador", v: function (x) { return x.colaborador; } },
    { k: "unidade", t: "Unidade", v: function (x) { return x.unidade; } },
    { k: "setor", t: "Área", v: function (x) { return x.setor; } },
    { k: "gestor", t: "Gestor", v: function (x) { return x.gestor; } },
    { k: "entrevistador", t: "Entrevistador", v: function (x) { return x.entrevistador; } },
    { k: "iniciativa", t: "Iniciativa", v: function (x) { return x.iniciativa; } },
    { k: "resultado", t: "Resultado", v: resultadoTxt,
      sv: function (x) { return x.aceitou === "Sim" ? (typeof x.nps === "number" ? x.nps : 11) : 12; },
      ord: ["Da menor para a maior nota", "Da maior para a menor nota"] },
    { k: "origem", t: "Origem", v: function (x) { return x.origem || "V2"; } }
  ];
  RCOLS.forEach(function (c) { c.sv = c.sv || function (x) { return fold(c.v(x)); }; c.ord = c.ord || AZ; });
  var rf = {}, rsort = null; // rf[coluna] = { keys: {chave: 1}, labels: [...] }; rsort = { k, dir: 1 | -1 }
  function cmpV(a, b) { return typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b), "pt-BR"); }
  var rqTimer = null;
  $("#rq").addEventListener("input", function () { clearTimeout(rqTimer); rqTimer = setTimeout(function () { openId = null; renderResp(); }, 120); });
  function respAtivos() { return !!($("#rq").value.trim() || Object.keys(rf).length); }
  function respLimpar() { $("#rq").value = ""; rf = {}; openId = null; fecharFiltro(); renderResp(); }
  // Nome: todas as palavras digitadas precisam aparecer, sem diferença de maiúsculas ou acentos ("joao silva" acha "JOÃO DA SILVA").
  // exceto: ignora o filtro dessa coluna (as opções de uma coluna seguem as outras colunas, como no Excel).
  function respFiltradas(exceto) {
    var termos = fold($("#rq").value).split(" ").filter(Boolean);
    var cols = RCOLS.filter(function (c) { return rf[c.k] && c.k !== exceto; });
    return entries.filter(function (x) {
      var n = fold(x.colaborador);
      return termos.every(function (w) { return n.indexOf(w) >= 0; }) && cols.every(function (c) { return !!rf[c.k].keys[fold(c.v(x))]; });
    });
  }
  // Lista na ordem da tela (e do Excel baixado). Vazias ficam sempre no fim.
  function respLista() {
    var l = respFiltradas();
    if (!rsort) return l;
    var c = RCOLS.filter(function (c) { return c.k === rsort.k; })[0];
    return l.slice().sort(function (a, b) {
      var va = c.v(a) ? c.sv(a) : null, vb = c.v(b) ? c.sv(b) : null;
      if (va === null || vb === null) return va === vb ? 0 : va === null ? 1 : -1;
      return cmpV(va, vb) * rsort.dir;
    });
  }

  // Menu da coluna: classificar, limpar filtro, pesquisar, (Selecionar tudo), valores com quantidade, OK e Cancelar
  var xf = el("div", { class: "xf", role: "dialog" }); xf.hidden = true; document.body.appendChild(xf);
  var xfCol = null, xfBtn = null;
  function fecharFiltro(foco) {
    if (!xfCol) return;
    xf.hidden = true; xf.textContent = ""; xfCol = null;
    if (xfBtn) {
      // a tabela pode ter sido redesenhada: devolve o foco ao botão novo da mesma coluna
      var k = xfBtn.getAttribute("data-k"), b = document.querySelector('.xf-b[data-k="' + k + '"]') || xfBtn;
      b.setAttribute("aria-expanded", "false"); if (foco) b.focus();
    }
  }
  function abrirFiltro(c, btn) {
    if (xfCol === c.k) { fecharFiltro(); return; }
    fecharFiltro(); xfCol = c.k; xfBtn = btn; btn.setAttribute("aria-expanded", "true");
    xf.setAttribute("aria-label", "Filtrar e classificar " + c.t);
    var g = {};
    respFiltradas(c.k).forEach(function (x) {
      var v = c.v(x) || "", k = fold(v);
      g[k] = g[k] || { key: k, n: 0, names: {}, sv: v ? c.sv(x) : null };
      g[k].n++; g[k].names[v] = (g[k].names[v] || 0) + 1;
    });
    var opts = Object.keys(g).map(function (k) {
      var nm = bestName(g[k].names);
      return { key: k, n: g[k].n, sv: g[k].sv, label: !k ? "(Vazias)" : c.fmt ? c.fmt(nm) : nm };
    }).sort(function (a, b) {
      if (!a.key || !b.key) return !a.key ? 1 : -1;
      return cmpV(a.sv, b.sv) * (c.desc ? -1 : 1);
    });
    var atual = rf[c.k], marc = {};
    opts.forEach(function (o) { if (!atual || atual.keys[o.key]) marc[o.key] = 1; });

    function ordBtn(i, dir) {
      var on = !!(rsort && rsort.k === c.k && rsort.dir === dir);
      var b = el("button", { type: "button", class: "xf-a" + (on ? " on" : ""), "aria-pressed": on ? "true" : "false" }, [el("span", { class: "xf-ic " + (dir > 0 ? "up" : "down"), "aria-hidden": "true" }), document.createTextNode(c.ord[i])]);
      b.addEventListener("click", function () { rsort = on ? null : { k: c.k, dir: dir }; renderResp(); fecharFiltro(true); });
      return b;
    }
    var limpa = el("button", { type: "button", class: "xf-a", text: "Limpar filtro de “" + c.t + "”" });
    if (!atual) limpa.disabled = true;
    limpa.addEventListener("click", function () { delete rf[c.k]; openId = null; renderResp(); fecharFiltro(true); });
    var busca = el("input", { type: "search", placeholder: "Pesquisar", "aria-label": "Pesquisar valores de " + c.t, autocomplete: "off" });
    var tudo = el("input", { type: "checkbox" });
    var tudoTxt = document.createTextNode("(Selecionar tudo)");
    var lista = el("div", { class: "xf-o" });
    var ok = el("button", { type: "button", class: "btn sm", text: "OK" });
    var cancela = el("button", { type: "button", class: "btn ghost sm", text: "Cancelar" });

    function visiveis() { var q = fold(busca.value); return opts.filter(function (o) { return !q || fold(o.label).indexOf(q) >= 0; }); }
    function estado() {
      var vis = visiveis(), n = vis.filter(function (o) { return marc[o.key]; }).length;
      tudo.checked = !!vis.length && n === vis.length; tudo.indeterminate = n > 0 && n < vis.length;
      tudoTxt.nodeValue = busca.value.trim() ? "(Selecionar todos os resultados da pesquisa)" : "(Selecionar tudo)";
      ok.disabled = !n;
    }
    function draw() {
      lista.textContent = "";
      var vis = visiveis();
      vis.forEach(function (o) {
        var cb = el("input", { type: "checkbox" }); cb.checked = !!marc[o.key];
        cb.addEventListener("change", function () { if (cb.checked) marc[o.key] = 1; else delete marc[o.key]; estado(); });
        lista.appendChild(el("label", { class: "check" }, [cb, el("span", { class: "xf-v", text: o.label }), el("span", { class: "ms-n", text: String(o.n) })]));
      });
      if (!vis.length) lista.appendChild(el("p", { class: "hint", text: "Nada encontrado." }));
      estado();
    }
    tudo.addEventListener("change", function () {
      var on = tudo.checked;
      visiveis().forEach(function (o) { if (on) marc[o.key] = 1; else delete marc[o.key]; });
      draw();
    });
    busca.addEventListener("input", draw);
    function aplicar() {
      // Com pesquisa, vale o que está marcado entre os resultados dela (como no Excel)
      var esc = visiveis().filter(function (o) { return marc[o.key]; });
      if (!esc.length) return;
      if (!busca.value.trim() && esc.length === opts.length) delete rf[c.k];
      else {
        var keys = {}; esc.forEach(function (o) { keys[o.key] = 1; });
        rf[c.k] = { keys: keys, labels: esc.map(function (o) { return o.label; }) };
      }
      openId = null; renderResp(); fecharFiltro(true);
    }
    ok.addEventListener("click", aplicar);
    cancela.addEventListener("click", function () { fecharFiltro(true); });
    busca.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); aplicar(); } });

    xf.appendChild(el("div", { class: "xf-s" }, [ordBtn(0, 1), ordBtn(1, -1)]));
    xf.appendChild(el("div", { class: "xf-s" }, [limpa]));
    xf.appendChild(busca);
    xf.appendChild(el("label", { class: "check xf-all" }, [tudo, tudoTxt]));
    xf.appendChild(lista);
    xf.appendChild(el("div", { class: "xf-f" }, [ok, cancela]));
    draw();
    xf.hidden = false;
    posFiltro();
    busca.focus();
  }
  function posFiltro() {
    var r = xfBtn.getBoundingClientRect(), w = xf.offsetWidth, h = xf.offsetHeight, vw = document.documentElement.clientWidth;
    var top = r.bottom + 6;
    if (top + h > window.innerHeight - 8 && r.top - h - 6 > 8) top = r.top - h - 6;
    xf.style.top = Math.max(8, top) + "px";
    xf.style.left = Math.max(8, Math.min(r.left, vw - w - 8)) + "px";
  }
  document.addEventListener("click", function (e) { if (xfCol && !xf.contains(e.target) && !(xfBtn && xfBtn.contains(e.target))) fecharFiltro(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && xfCol) { e.preventDefault(); fecharFiltro(true); } });
  window.addEventListener("resize", function () { fecharFiltro(); });
  document.addEventListener("scroll", function (e) { if (xfCol && !xf.contains(e.target)) fecharFiltro(); }, true);
  // Cabeçalho da coluna: nome + seta; funil quando filtrada; ↑/↓ quando classificada
  function respHead(c) {
    var filt = !!rf[c.k], ord = rsort && rsort.k === c.k ? rsort.dir : 0;
    var desc = c.t + (filt ? ", filtrada" : "") + (ord ? (ord > 0 ? ", classificada em ordem crescente" : ", classificada em ordem decrescente") : "");
    var b = el("button", { type: "button", class: "xf-b" + (filt ? " on" : ""), "data-k": c.k, "aria-haspopup": "dialog", "aria-expanded": xfCol === c.k ? "true" : "false", "aria-label": "Filtrar e classificar " + desc, title: "Filtrar e classificar" }, [
      el("span", { text: c.t }),
      ord ? el("span", { class: "xf-ic " + (ord > 0 ? "up" : "down"), "aria-hidden": "true" }) : null,
      el("span", { class: "xf-ic " + (filt ? "funil" : "seta"), "aria-hidden": "true" })
    ]);
    b.addEventListener("click", function () { abrirFiltro(c, b); });
    var th = el("th", null, [b]);
    if (ord) th.setAttribute("aria-sort", ord > 0 ? "ascending" : "descending");
    return th;
  }

  /* ---------- Respostas ---------- */
  function renderResp() {
    var host = $("#resp-body"); host.textContent = "";
    $("#cnt").textContent = String(entries.length);
    var lista = respLista(), ativos = respAtivos();
    $("#xls").hidden = !lista.length;
    $("#xls").textContent = ativos ? "Baixar Excel (" + lista.length + ")" : "Baixar Excel";
    var info = $("#respinfo"); info.textContent = "";
    if (!entries.length) info.textContent = "Todas as entrevistas salvas aparecem aqui.";
    else if (ativos) {
      info.appendChild(document.createTextNode("Mostrando " + lista.length + " de " + entries.length + pl(entries.length, " entrevista.", " entrevistas.") + " "));
      // uma etiqueta por coluna filtrada, com × para tirar só aquele filtro
      RCOLS.forEach(function (c) {
        var f = rf[c.k]; if (!f) return;
        var b = el("button", { class: "rchip", type: "button", "aria-label": "Tirar o filtro de " + c.t, title: f.labels.join(", ") }, [
          el("span", { text: c.t + ": " + (f.labels.length === 1 ? f.labels[0] : f.labels.length + " valores") }), el("span", { class: "x", "aria-hidden": "true", text: "×" })]);
        b.addEventListener("click", function () { delete rf[c.k]; openId = null; renderResp(); });
        info.appendChild(b);
      });
      var lim = el("button", { class: "lnk", type: "button", text: "Limpar filtros" }); lim.addEventListener("click", respLimpar); info.appendChild(lim);
    } else info.textContent = entries.length + pl(entries.length, " entrevista salva.", " entrevistas salvas.") + " Elas ficam guardadas até uma administradora excluir.";
    if (!entries.length) {
      host.appendChild(el("div", { class: "empty", text: "Nenhuma entrevista salva ainda. Preencha a primeira na aba Nova entrevista." }));
      return;
    }
    if (!lista.length) {
      host.appendChild(el("div", { class: "empty", text: "Nenhuma entrevista encontrada com essa busca ou esses filtros." }));
      return;
    }
    var tb = el("tbody");
    lista.forEach(function (x) {
      var acts = [];
      var ver = el("button", { class: "lnk", type: "button", text: openId === x.id ? "Fechar" : "Ver" });
      ver.addEventListener("click", function () { openId = openId === x.id ? null : x.id; renderResp(); });
      acts.push(ver);
      if (me && me.is_admin) {
        // Exclusão em dois passos: o 1º clique pede confirmação (15 s, com aviso); o 2º exclui e confirma na tela.
        var del = el("button", { class: armed === x.id ? "btn sm danger" : "lnk", type: "button", text: armed === x.id ? "Confirmar exclusão" : "Excluir" });
        del.addEventListener("click", function () {
          if (armed !== x.id) {
            armed = x.id; renderResp();
            say("Clique em “Confirmar exclusão” para excluir a entrevista de " + (x.colaborador || "colaborador") + ". Depois de excluída, ela não pode ser recuperada.");
            setTimeout(function () { if (armed === x.id) { armed = null; say(""); renderResp(); } }, 15000);
            return;
          }
          armed = null; del.disabled = true; del.textContent = "Excluindo…";
          store.remove(x.id).then(function () { say("Entrevista de " + (x.colaborador || "colaborador") + " excluída."); return loadEntries(); })
            .catch(function (err) { say(""); warn("Não foi possível excluir. " + ((err && err.message) || "")); renderResp(); });
        });
        acts.push(del);
        if (armed === x.id) {
          var cancel = el("button", { class: "lnk", type: "button", text: "Cancelar" });
          cancel.addEventListener("click", function () { armed = null; say(""); renderResp(); });
          acts.push(cancel);
        }
      }
      var dt = el("td", { text: brDate(entryDate(x)) });
      if (x.origem === "Base 2024") dt.appendChild(el("span", { class: "tag", text: "2024" }));
      tb.appendChild(el("tr", null, [
        dt, el("td", { class: "nm", text: x.colaborador || "" }), el("td", { text: x.unidade || "" }), el("td", { text: x.setor || "" }),
        el("td", { text: x.gestor || "" }), el("td", { text: x.entrevistador || "" }),
        el("td", { text: x.iniciativa || "" }), el("td", { text: resultadoTxt(x) }), el("td", { text: x.origem || "V2" }),
        el("td", { class: "act" }, acts)
      ]));
      if (openId === x.id) {
        var dl = el("dl");
        COLS.forEach(function (c) {
          var v = x[c[0]]; if (v === undefined || v === "") return;
          if (c[0] === "data") v = brDate(v);
          if (c[0] === "criadoEm") v = brDateTime(v);
          if (c[0] === "legado") v = legadoTxt(v, "\n");
          dl.appendChild(el("dt", { text: c[1] })); dl.appendChild(el("dd", { text: String(v) }));
        });
        if (x.criadoPor && memberNames[x.criadoPor]) { dl.appendChild(el("dt", { text: "Registrado por" })); dl.appendChild(el("dd", { text: memberNames[x.criadoPor] })); }
        tb.appendChild(el("tr", { class: "det" }, [el("td", { colspan: String(RCOLS.length + 1) }, [dl])]));
      }
    });
    var head = RCOLS.map(respHead).concat([el("th", null, [el("span", { class: "sr", text: "Ações" })])]);
    host.appendChild(el("div", { class: "tw" }, [el("table", { class: "rtab" }, [el("thead", null, [el("tr", null, head)]), tb])]));
  }

  function renderAll() {
    updateChips();
    var list = filtered();
    renderMain(list);
    renderResp();
  }

  function loadEntries() {
    return store.list().then(function (rows) { entries = rows.map(nomesPadrao); FILTROS.forEach(function (f) { f.refresh(rows); }); renderAll(); })
      .catch(function (err) { warn("Não foi possível carregar as entrevistas. " + ((err && err.message) || "Recarregue a página.")); });
  }
  $("#reload").addEventListener("click", loadEntries);

  /* ---------- Excel ---------- */
  function say(msg) { var m = $("#dlmsg"); m.textContent = msg; m.hidden = !msg; }
  function sheet(aoa, cols) { var ws = XLSX.utils.aoa_to_sheet(aoa); if (cols) ws["!cols"] = cols.map(function (w) { return { wch: w }; }); return ws; }
  // Uma linha por entrevista, em ordem cronológica, rótulos em português; "Classificação eNPS" no fim.
  function entrevistasSheet(rows) {
    var asc = rows.slice().sort(function (a, b) { return entryDate(a) < entryDate(b) ? -1 : entryDate(a) > entryDate(b) ? 1 : (a.criadoEm < b.criadoEm ? -1 : 1); });
    var aoa = [COLS.map(function (c) { return c[1]; }).concat(["Classificação eNPS"])];
    asc.forEach(function (x) {
      aoa.push(COLS.map(function (c) {
        var v = x[c[0]];
        if (v === undefined) return "";
        if (c[0] === "data") return brDate(v);
        if (c[0] === "criadoEm") return brDateTime(v);
        if (c[0] === "legado") return legadoTxt(v, " | ");
        return v;
      }).concat([typeof x.nps === "number" ? npsClass(x.nps) : ""]));
    });
    return sheet(aoa, COLS.map(function (c) { return Math.min(40, Math.max(12, c[1].length + 2)); }).concat([20]));
  }
  // Indicadores: quantidade, base e % de cada um, para total, voluntárias e involuntárias.
  function indicadoresSheet(rows) {
    var ind = [["Grupo", "Indicador", "Quantidade", "Base", "%"]];
    var put = function (g, label, n, base) { ind.push([g, label, n, base, pct(n, base) === null ? "" : pct(n, base)]); };
    var tot = stats(rows);
    put("Total", "Saídas voluntárias", tot.nVol, tot.n); put("Total", "Saídas involuntárias", tot.nInv, tot.n); put("Total", "Sem iniciativa registrada", tot.nSem, tot.n);
    [["Total", rows], ["Voluntárias", rows.filter(isVol)], ["Involuntárias", rows.filter(isInv)]].forEach(function (gr) {
      var g = gr[0], l = gr[1], s = stats(l);
      put(g, "Saídas", s.n, tot.n);
      put(g, "Aceitaram a entrevista", s.nResp, s.n);
      put(g, "Promotores (9 e 10)", s.pro, s.npsN); put(g, "Neutros (7 e 8)", s.neu, s.npsN); put(g, "Detratores (0 a 6)", s.det, s.npsN);
      ind.push([g, "eNPS (pontos)", s.nps === null ? "" : s.nps, s.npsN, ""]);
      ind.push([g, "Zona do eNPS", s.npsN ? npsZona(s.nps).nome : "", s.npsN, ""]);
      put(g, "Voltariam a trabalhar na WAP", s.voltaSim, s.voltaN);
      DIM.forEach(function (d) { var a = answered(s.resp, d[0]); ESCALA.forEach(function (k) { put(g, d[1] + ": " + k, a.filter(function (x) { return x[d[0]] === k; }).length, a.length); }); });
      var fb = answered(s.resp, "feedback"); FEEDBACK.forEach(function (k) { put(g, "Feedback 6 meses: " + k, fb.filter(function (x) { return x.feedback === k; }).length, fb.length); });
      if (g !== "Involuntárias") { var tf = tally(s.resp, field("principalFator")); tf.items.forEach(function (it) { put(g, "Principal fator: " + it.label, it.n, tf.tot); }); }
      if (g !== "Voluntárias") { var tm = tally(l, field("motivoInvoluntario")); tm.items.forEach(function (it) { put(g, "Motivo involuntário: " + it.label, it.n, tm.tot); }); }
      ["beneficioMelhor", "beneficioMelhoria"].forEach(function (k) { var tb = tally(s.resp, field(k), null, 1); tb.items.forEach(function (it) { put(g, (k === "beneficioMelhor" ? "Benefício que mais atendia: " : "Benefício a melhorar: ") + it.label, it.n, tb.tot); }); });
    });
    return sheet(ind, [14, 60, 12, 10, 8]);
  }
  // Observações do entrevistador, com a interpretação (temas e tom) de cada uma.
  function observacoesSheet(rows) {
    var aoa = [["Data", "Unidade", "Área", "Gestor", "Tipo de saída", "Fator ou motivo", "Temas", "Tom", "Observação"]];
    rows.filter(function (x) { return x.obs && String(x.obs).trim().length > 3; }).sort(function (a, b) { return entryDate(a) < entryDate(b) ? 1 : -1; }).forEach(function (x) {
      var l = lerObs(x);
      aoa.push([brDate(entryDate(x)), x.unidade || "", x.setor || "", x.gestor || "", isVol(x) ? "Voluntária" : isInv(x) ? "Involuntária" : "Sem iniciativa", x.principalFator || x.motivoInvoluntario || "", l.temas.map(temaNome).join("; "), l.tom, String(x.obs).trim()]);
    });
    return sheet(aoa, [11, 18, 18, 22, 14, 30, 40, 10, 100]);
  }
  function temasSheet(rows) {
    var obs = rows.filter(function (x) { return x.obs && String(x.obs).trim().length > 3; }), lidas = obs.map(function (x) { return { x: x, l: lerObs(x) }; });
    var vo = lidas.filter(function (o) { return isVol(o.x); }), io = lidas.filter(function (o) { return isInv(o.x); });
    var c = function (arr, id) { return arr.filter(function (o) { return o.l.temas.indexOf(id) >= 0; }).length; };
    var aoa = [["Tema", "Observações", "% do total", "Voluntárias", "% voluntárias", "Involuntárias", "% involuntárias"]];
    TEMAS.forEach(function (m) { aoa.push([m.nome, c(lidas, m.id), pct(c(lidas, m.id), lidas.length), c(vo, m.id), pct(c(vo, m.id), vo.length), c(io, m.id), pct(c(io, m.id), io.length)]); });
    aoa.push([]); aoa.push(["Tom", "Observações", "%"]);
    TOM_ORDEM.forEach(function (k) { var n = lidas.filter(function (o) { return o.l.tom === k; }).length; aoa.push([k, n, pct(n, lidas.length)]); });
    aoa.push([]); aoa.push(["Leitura automática por palavras-chave; uma observação pode citar vários temas."]);
    return sheet(aoa, [32, 13, 11, 12, 13, 13, 15]);
  }
  // Filtros em uso, para o arquivo dizer de que recorte os números vêm.
  function recorteTexto() {
    var on = [{ "": "Todas", vol: "Voluntárias", inv: "Involuntárias", sem: "Sem iniciativa registrada" }[tipoAtual]];
    if (fu.value) on.push(fu.value);
    if ($("#fo").value) on.push($("#fo").value === "V2" ? "Só V2" : "Só base 2024");
    FILTROS.forEach(function (f) { var d = f.describe(); if (d) on.push(d); });
    return on.join(" · ");
  }
  function semXlsx() { if (window.XLSX) return false; alert("Não foi possível carregar o gerador de Excel. Verifique a conexão e recarregue a página."); return true; }
  // Respostas: todas as entrevistas
  $("#xls").addEventListener("click", function () {
    say("");
    if (!window.XLSX) { say("Não foi possível carregar o gerador de Excel. Verifique a conexão e recarregue a página."); return; }
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, entrevistasSheet(respLista()), "Entrevistas");
    XLSX.utils.book_append_sheet(wb, indicadoresSheet(respLista()), "Indicadores");
    XLSX.writeFile(wb, "entrevistas-desligamento-v2-" + today() + ".xlsx");
  });
  // Indicadores: o recorte que está na tela
  function xlsRecorte() {
    if (semXlsx()) return;
    var rows = filtered(), wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet([["Indicadores · Entrevista de Desligamento V2"], ["Gerado em", brDateTime(new Date().toISOString())], ["Recorte", recorteTexto()], ["Entrevistas no recorte", rows.length]], [24, 90]), "Filtros");
    XLSX.utils.book_append_sheet(wb, indicadoresSheet(rows), "Indicadores");
    XLSX.utils.book_append_sheet(wb, temasSheet(rows), "Temas das observações");
    XLSX.utils.book_append_sheet(wb, observacoesSheet(rows), "Observações");
    XLSX.utils.book_append_sheet(wb, entrevistasSheet(rows), "Entrevistas");
    XLSX.writeFile(wb, "indicadores-desligamento-" + today() + ".xlsx");
  }
  // PDF: abre a impressão com todos os módulos abertos e layout de papel; o navegador oferece "Salvar como PDF".
  var printMode = false;
  function pdfPagina() {
    printMode = true;
    $("#printHead").textContent = "Indicadores · Entrevista de Desligamento V2 · gerado em " + brDateTime(new Date().toISOString()) + " · Recorte: " + recorteTexto() + " · " + filtered().length + " entrevistas";
    document.body.classList.add("printing");
    renderAll();
    setTimeout(function () { window.print(); sairDoPdf(); }, 120);
  }
  // A tela volta exatamente como estava; o "afterprint" fica só de reserva
  function sairDoPdf() { if (!printMode) return; printMode = false; document.body.classList.remove("printing"); renderAll(); }
  window.addEventListener("afterprint", sairDoPdf);
  $("#dlPdf").addEventListener("click", function () { $("#dlmenu").open = false; pdfPagina(); });
  $("#dlXls").addEventListener("click", function () { $("#dlmenu").open = false; xlsRecorte(); });
  document.addEventListener("click", function (e) { var d = $("#dlmenu"); if (d.open && !d.contains(e.target)) d.open = false; });

  /* ---------- Usuários (só admins) ---------- */
  var pwFor = null;
  function usrSay(msg, isErr) { var m = $("#usrmsg"); m.textContent = msg || ""; m.className = "notice " + (isErr ? "warn" : "ok"); m.hidden = !msg; }

  function loadMembers() {
    return store.members().then(function (list) {
      memberNames = {};
      list.forEach(function (m) { memberNames[m.user_id] = m.full_name || m.email; });
      return list;
    });
  }

  function loadUsers() {
    if (!me || !me.is_admin) return;
    loadMembers().then(renderUsers).catch(function (err) { usrSay("Não foi possível carregar os usuários. " + ((err && err.message) || ""), true); });
    store.audit().then(renderAudit).catch(function () { $("#aud-body").textContent = "Não foi possível carregar a auditoria."; });
  }

  function adminCall(payload, okMsg) {
    usrSay("");
    return store.admin(payload).then(function () { usrSay(okMsg); pwFor = null; loadUsers(); })
      .catch(function (err) { usrSay((err && err.message) || "Não foi possível concluir.", true); });
  }

  function renderUsers(list) {
    var host = $("#usr-body"); host.textContent = "";
    var tb = el("tbody");
    list.forEach(function (m) {
      var self = m.user_id === me.user_id;
      var name = el("td", null, [document.createTextNode(m.full_name || "")]);
      if (m.is_admin) name.appendChild(el("span", { class: "tag", text: "admin" }));
      if (!m.active) name.appendChild(el("span", { class: "tag", text: "inativo" }));
      var acts = [];
      var pw = el("button", { class: "lnk", type: "button", text: pwFor === m.user_id ? "Cancelar" : "Nova senha" });
      pw.addEventListener("click", function () { pwFor = pwFor === m.user_id ? null : m.user_id; renderUsers(list); });
      acts.push(pw);
      if (!self) {
        var adm = el("button", { class: "lnk", type: "button", text: m.is_admin ? "Tirar admin" : "Tornar admin" });
        adm.addEventListener("click", function () { adminCall({ action: "update", user_id: m.user_id, is_admin: !m.is_admin }, "Permissão atualizada."); });
        var act = el("button", { class: "lnk", type: "button", text: m.active ? "Desativar" : "Reativar" });
        act.addEventListener("click", function () { adminCall({ action: "update", user_id: m.user_id, active: !m.active }, m.active ? "Usuário desativado." : "Usuário reativado."); });
        acts.push(adm, act);
      }
      tb.appendChild(el("tr", { class: m.active ? "" : "off" }, [name, el("td", { text: m.email }), el("td", { class: "act" }, acts)]));
      if (pwFor === m.user_id) {
        var inp = el("input", { type: "password", autocomplete: "new-password", placeholder: "Nova senha (mín. 8 caracteres)" });
        var save = el("button", { class: "btn sm", type: "button", text: "Salvar senha" });
        save.addEventListener("click", function () {
          if (inp.value.length < 8) { usrSay("A senha precisa ter pelo menos 8 caracteres.", true); return; }
          adminCall({ action: "update", user_id: m.user_id, password: inp.value }, "Senha alterada. Informe a nova senha à pessoa por um canal seguro.");
        });
        tb.appendChild(el("tr", { class: "det" }, [el("td", { colspan: "3" }, [el("div", { class: "row" }, [inp, save])])]));
      }
    });
    var head = ["Nome", "E-mail", ""].map(function (h) { return el("th", { text: h }); });
    host.appendChild(el("div", { class: "tw" }, [el("table", null, [el("thead", null, [el("tr", null, head)]), tb])]));
  }

  // Auditoria em duas abas separadas: quem incluiu e quem excluiu entrevistas.
  var audTab = "criou", audData = { criou: [], excluiu: [] };
  function renderAudit(data) {
    if (data) audData = data;
    var host = $("#aud-body"); host.textContent = "";
    var abas = [["criou", "Inclusões", "Quem registrou cada entrevista."], ["excluiu", "Exclusões", "Quem excluiu cada entrevista. Só administradoras podem excluir."]];
    var tabs = el("div", { class: "seg aud-tabs", role: "tablist", "aria-label": "Auditoria" });
    abas.forEach(function (a) {
      var b = el("button", { type: "button", role: "tab", "aria-selected": String(audTab === a[0]), text: a[1] + " · " + audData[a[0]].length });
      b.addEventListener("click", function () { audTab = a[0]; renderAudit(); });
      tabs.appendChild(b);
    });
    host.appendChild(tabs);
    var atual = abas.filter(function (a) { return a[0] === audTab; })[0], list = audData[audTab];
    host.appendChild(el("p", { class: "hint", style: "margin-top:12px", text: atual[2] + " Mostra os 200 eventos mais recentes." }));
    if (!list.length) { host.appendChild(el("p", { class: "hint", text: audTab === "criou" ? "Nenhuma inclusão registrada." : "Nenhuma exclusão registrada." })); return; }
    var tb = el("tbody");
    list.forEach(function (a) {
      var alvo = a.entrevista_desc || (audTab === "excluiu" ? "(identificação não guardada: exclusão anterior a 22/10/2026)" : "(entrevista excluída depois)");
      tb.appendChild(el("tr", null, [el("td", { text: brDateTime(a.em) }), el("td", { text: a.ator_nome || a.ator_email || "" }), el("td", { text: alvo })]));
    });
    var head = ["Quando", audTab === "criou" ? "Registrou" : "Excluiu", "Entrevista (colaborador · data · unidade)"].map(function (h) { return el("th", { text: h }); });
    host.appendChild(el("div", { class: "tw" }, [el("table", null, [el("thead", null, [el("tr", null, head)]), tb])]));
  }

  $("#newUser").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#nuName").value.trim(), email = $("#nuEmail").value.trim(), pass = $("#nuPass").value;
    if (!name || !email) { usrSay("Informe nome e e-mail.", true); return; }
    if (pass.length < 8) { usrSay("A senha precisa ter pelo menos 8 caracteres.", true); return; }
    var btn = $("#nuBtn"); btn.disabled = true;
    adminCall({ action: "create", email: email, password: pass, full_name: name, is_admin: $("#nuAdmin").checked }, "Usuário criado. Passe a senha provisória por um canal seguro.")
      .then(function () { if (!$("#usrmsg").classList.contains("warn")) $("#newUser").reset(); btn.disabled = false; });
  });

  /* ---------- Lista de gestores: atualização pelo relatório do TOTVS (só admins) ----------
     O XML (planilha do Excel 2003 exportada do TOTVS) é lido no navegador. Só nome, cargo, área e unidade
     de quem tem cargo de liderança são enviados ao banco; o resto do arquivo não sai do computador. */
  var UNID_TOTVS = { "1": "Wap | São Marcos", "3": "Wap | Eusébio", "9": "Wap | Eusébio", "11": "Wap | Linhares", "12": "Wap | Serra" };
  var CARGO_LIDER = /(lider|supervis|coorden|gerent|head|diret)|^ceo$|^cfo$/;
  function tituloNome(s) {
    var peq = { de: 1, da: 1, "do": 1, das: 1, dos: 1, e: 1, em: 1, a: 1, o: 1, no: 1, na: 1, nos: 1, nas: 1 };
    var sigla = /^(ceo|cfo|ti|ia|rh|pcp|pmo&bpm|r&s|t&d|dho|comex|jr|pl|sr)$/;
    return String(s).trim().replace(/\s+/g, " ").toLowerCase().split(" ").map(function (w, i) {
      if (i > 0 && peq[w]) return w; if (sigla.test(w)) return w.toUpperCase(); return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
  }
  function lerTotvs(texto) {
    var NS = "urn:schemas-microsoft-com:office:spreadsheet";
    var doc = new DOMParser().parseFromString(texto, "text/xml");
    if (doc.getElementsByTagName("parsererror").length) throw { message: "O arquivo não é um XML válido." };
    var linhas = [].map.call(doc.getElementsByTagNameNS(NS, "Row"), function (row) {
      var out = [], col = 0;
      [].forEach.call(row.getElementsByTagNameNS(NS, "Cell"), function (c) {
        var idx = c.getAttributeNS(NS, "Index"); if (idx) col = Number(idx) - 1;
        var d = c.getElementsByTagNameNS(NS, "Data")[0]; out[col] = d ? d.textContent.trim() : ""; col++;
      });
      return out;
    });
    var h = linhas.findIndex(function (l) { return l.indexOf("Nome") >= 0 && l.some(function (c) { return /^Cargo/.test(c || ""); }); });
    if (h < 0) throw { message: "Não encontrei as colunas “Nome” e “Cargo” — é o relatório de colaboradores ativos do TOTVS?" };
    var cab = linhas[h], iN = cab.indexOf("Nome"), iC = cab.findIndex(function (c) { return /^Cargo/.test(c || ""); }),
      iA = cab.findIndex(function (c) { return /^Centro Custo-Desc/.test(c || ""); }), iE = cab.indexOf("Estabelecimento");
    var lid = [], semUnidade = {}, total = 0;
    linhas.slice(h + 1).forEach(function (l) {
      if (!l[iN]) return; total++;
      if (!CARGO_LIDER.test(fold(l[iC]))) return;
      var un = UNID_TOTVS[String(l[iE] || "").trim()];
      if (!un) semUnidade[l[iE] || "(vazio)"] = (semUnidade[l[iE] || "(vazio)"] || 0) + 1;
      lid.push({ nome: tituloNome(l[iN]), cargo: tituloNome(l[iC]), area: (l[iA] || "").trim() || null, unidade: un || "Não identificada" });
    });
    return { lideres: lid, total: total, semUnidade: semUnidade };
  }
  function porUnidade(rows) { var m = {}; rows.forEach(function (r) { m[r.unidade] = (m[r.unidade] || 0) + 1; }); return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).map(function (k) { return k.replace("Wap | ", "") + " " + m[k]; }).join(" · "); }
  function renderLideresAdmin() {
    var info = $("#lidInfo"); if (!info) return;
    if (!lideres.length) { info.textContent = "Nenhum gestor cadastrado ainda."; return; }
    var quando = lideres.reduce(function (m, l) { return l.atualizado_em > m ? l.atualizado_em : m; }, "");
    info.textContent = lideres.length + " gestores · atualizada em " + brDateTime(quando) + " · " + porUnidade(lideres);
  }
  $("#lidFile").addEventListener("change", function (e) {
    var f = e.target.files[0], prev = $("#lidPrev"); prev.textContent = ""; usrSay("");
    if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      var r;
      try { r = lerTotvs(rd.result); } catch (err) { usrSay((err && err.message) || "Não foi possível ler o arquivo.", true); e.target.value = ""; return; }
      var sem = Object.keys(r.semUnidade);
      prev.appendChild(el("div", { class: "notice" }, [
        el("p", { text: "Arquivo com " + r.total + " colaboradores. Encontrei " + r.lideres.length + " gestores (líder, supervisor, coordenador, gerente, head, diretor, CEO, CFO): " + porUnidade(r.lideres) + "." }),
        sem.length ? el("p", { class: "err", text: "Estabelecimentos sem unidade definida (os gestores entram como “Não identificada”): " + sem.map(function (k) { return k + " (" + r.semUnidade[k] + ")"; }).join(", ") + "." }) : null,
        el("p", { text: "Isso substitui a lista atual de " + lideres.length + " gestores." })
      ]));
      var ok = el("button", { class: "btn sm", type: "button", text: "Substituir lista (" + r.lideres.length + " gestores)" });
      var no = el("button", { class: "lnk", type: "button", text: "Cancelar" });
      no.addEventListener("click", function () { prev.textContent = ""; e.target.value = ""; });
      ok.addEventListener("click", function () {
        ok.disabled = true; ok.textContent = "Gravando…";
        store.lideresReplace(r.lideres).then(function () { prev.textContent = ""; e.target.value = ""; usrSay("Lista de gestores atualizada: " + r.lideres.length + " gestores."); return loadLideres(); })
          .catch(function (err) { ok.disabled = false; ok.textContent = "Substituir lista"; usrSay("Não foi possível gravar: " + ((err && err.message) || ""), true); });
      });
      prev.appendChild(el("div", { class: "row", style: "margin-top:8px" }, [ok, no]));
    };
    rd.readAsText(f, "utf-8");
  });

  /* ---------- Login e início ---------- */
  function showAuth(msg) {
    $("#app").hidden = true; $("#auth").hidden = false;
    var m = $("#loginMsg"); m.textContent = msg || ""; m.hidden = !msg;
  }

  function enter(member) {
    me = member;
    $("#auth").hidden = true; $("#app").hidden = false;
    $("#whoName").textContent = me.full_name || me.email;
    $("#tab-usr").hidden = !me.is_admin;
    if (DEMO) warn("Modo demonstração: nada é salvo e os dados somem ao recarregar.");
    reset();
    offerDraft();
    loadLideres();
    renderAll();
    loadEntries();
    loadMembers().then(renderResp).catch(function () {});
  }

  function onSession(session) {
    if (!session) { me = null; showAuth(); return; }
    sb.from("members").select("user_id, email, full_name, is_admin, active").eq("user_id", session.user.id).maybeSingle().then(function (r) {
      if (r.error || !r.data || !r.data.active) {
        sb.auth.signOut();
        showAuth("Seu usuário não tem acesso a este sistema. Fale com uma administradora.");
        return;
      }
      if (!me || me.user_id !== r.data.user_id) enter(r.data);
    });
  }

  $("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("#loginEmail").value.trim(), password = $("#loginPassword").value;
    if (!email || !password) { showAuth("Informe e-mail e senha."); return; }
    var btn = $("#loginBtn"); btn.disabled = true; btn.textContent = "Entrando";
    sb.auth.signInWithPassword({ email: email, password: password }).then(function (r) {
      if (r.error) showAuth(/invalid/i.test(r.error.message) ? "E-mail ou senha incorretos." : "Não foi possível entrar: " + r.error.message);
    }).then(function () { btn.disabled = false; btn.textContent = "Entrar"; });
  });

  $("#logoutBtn").addEventListener("click", function () {
    if (DEMO) { location.href = location.pathname; return; }
    // salva o rascunho pendente antes de sair
    (draftTimer ? saveDraft() : Promise.resolve()).then(function () { return sb.auth.signOut(); }).then(function () { location.reload(); });
  });

  if (DEMO) { enter({ user_id: "demo", email: "demo@wap.ind.br", full_name: "Ana Beatriz Capistrano Esteves", is_admin: true }); return; }
  if (!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY || /COLE_AQUI/.test(CFG.SUPABASE_ANON_KEY) || !window.supabase) { $("#cfgwarn").hidden = false; return; }
  sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  sb.auth.onAuthStateChange(function (event, session) {
    // adia para fora do callback (recomendação do supabase-js)
    setTimeout(function () { onSession(session); }, 0);
  });
})();
