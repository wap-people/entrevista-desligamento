// Entrevista de Desligamento V2: login, formulário, indicadores, respostas, Excel e usuários.
// Dados no Supabase (tabela public.entrevistas). Todo texto digitado é exibido com textContent.
// Modo demonstração: abrir com ?demo=1 usa uma base em memória (nada é salvo) e pula o login.
(function () {
  var UNIDADES = ["Wap | Afonso Pena", "Wap | São Marcos", "Wap | Eusébio", "Wap | Linhares", "Wap | Serra"];
  var SETORES = ["Adm de Vendas", "Agendamento", "Almox de Pós Vendas", "Auditoria Interna", "Contabilidade", "Customer Experience", "Dados", "Design", "Diretoria", "DTM", "E-commerce", "Expedição", "Facilities", "Financeiro", "Fiscal", "FP&A", "Garantia ADM", "Garantia Tecnica", "Inventario", "Internacional", "Jurídico", "Logistica", "Marketing - Conteúdo", "Marketing - Growth", "Marketing - Performance", "Marketing - Vídeo", "Operações Ecom", "P&D", "People", "PMO&BPM", "Produção", "Qualidade", "Recebimento Fiscal", "Recepção e Conservação", "Segurança do Trabalho", "Suprimentos", "TI", "Trade MKT", "Vendas", "Vendas Internas"];
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
    { id: "setor", label: "Setor do colaborador", type: "combo", options: SETORES, req: 1 },
    { id: "gestor", label: "Gestor direto", type: "text", req: 1 },
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
    { id: "beneficioMelhor", label: "Qual benefício mais te atendia?", type: "text", when: participa },
    { id: "beneficioMelhoria", label: "Qual benefício tem maior oportunidade de melhoria?", type: "text", when: participa },
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
    audit: function () {
      return sb.from("auditoria").select("*").order("em", { ascending: false }).limit(200).then(function (r) { if (r.error) throw r.error; return r.data; });
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
        entrevistador: pickR(ENTREV.slice(0, 5)), unidade: pickR(UNIDADES), colaborador: "Colaborador " + (i + 1), setor: pickR(["Produção", "Logistica", "Qualidade", "TI", "Vendas", "People"]),
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
      if (rnd() < 0.5) x.obs = "Observação fictícia do entrevistador " + i;
      out.push(x);
    }
    return out;
  }
  function demoStore() {
    var rows = /[?&]exemplo=1\b/.test(location.search) ? demoSeed() : [], log = [], seq = 0;
    var users = [{ user_id: "demo", email: "demo@wap.ind.br", full_name: "Ana Beatriz Capistrano Esteves", is_admin: true, active: true }];
    var ok = function (v) { return Promise.resolve(v); };
    return {
      list: function () { return ok(rows.slice().sort(function (a, b) { return a.criadoEm < b.criadoEm ? 1 : -1; })); },
      insert: function (doc) {
        var d = Object.assign({ id: "demo-" + (++seq), criadoEm: new Date().toISOString() }, doc);
        rows.push(d); log.unshift({ em: d.criadoEm, acao: "criou", entrevista_id: d.id, ator_nome: me.full_name });
        return ok();
      },
      remove: function (id) {
        rows = rows.filter(function (x) { return x.id !== id; });
        log.unshift({ em: new Date().toISOString(), acao: "excluiu", entrevista_id: id, ator_nome: me.full_name });
        return ok();
      },
      members: function () { return ok(users); },
      audit: function () { return ok(log); },
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
        } else if (f.type === "textarea") {
          inp = el("textarea", { id: "f-" + f.id, rows: "4" });
        } else {
          inp = el("input", { id: "f-" + f.id, type: f.type });
        }
        inp.setAttribute("data-f", f.id);
        body = el("div", null, [lb, inp, extra]);
      }
      node.appendChild(body);
      node.appendChild(el("p", { class: "err", text: f.type === "combo" ? "Escolha uma área da lista." : "Responda esta pergunta.", hidden: "" }));
    }
    node._f = f;
    nodes.push(node);
    form.appendChild(node);
  });

  form.appendChild(el("div", { class: "bar" }, [
    el("p", { class: "prog", id: "prog", "aria-live": "polite" }),
    el("button", { class: "btn", type: "submit", id: "save", text: "Salvar entrevista" })
  ]));

  function visible(f) { return !f.when || f.when(S); }
  function missing() {
    return F.filter(function (f) { return f.id && f.req && visible(f) && (S[f.id] === undefined || S[f.id] === ""); });
  }
  function applyVisibility() {
    nodes.forEach(function (n) { n.hidden = !visible(n._f); });
    var miss = missing();
    $("#prog").textContent = miss.length ? "Faltam " + miss.length + (miss.length === 1 ? " resposta" : " respostas") : "Tudo respondido";
  }

  form.addEventListener("input", function (e) {
    var t = e.target;
    if (t.type === "radio") S[t.name] = t.name === "nps" ? Number(t.value) : t.value;
    else if (t.getAttribute("data-f")) {
      var val = t.value;
      if (t.getAttribute("data-combo")) {
        var low = val.trim().toLowerCase(), hit = "";
        SETORES.forEach(function (o) { if (o.toLowerCase() === low) hit = o; });
        val = hit;
      }
      S[t.getAttribute("data-f")] = val;
    }
    var q = t.closest(".q"); if (q) { q.classList.remove("bad"); q.querySelector(".err").hidden = true; }
    applyVisibility();
  });

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
    doc.criadoPor = me.user_id;
    var btn = $("#save"); btn.disabled = true; btn.textContent = "Salvando";
    warn("");
    store.insert(doc).then(function () {
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
  $("#fp").addEventListener("change", renderAll);
  $("#fo").addEventListener("change", renderAll);

  // Chave para agrupar nomes digitados de jeitos diferentes ("JOÃO SILVA", "Joao  Silva").
  function fold(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase(); }
  // De { grafia: vezes }, a mais usada; no empate, a que não é toda maiúscula e tem acento.
  function bestName(names) {
    var nice = function (s) { return (s !== s.toUpperCase() ? 2 : 0) + (s !== fold(s) && /[^\x00-\x7f]/.test(s) ? 1 : 0); };
    return Object.keys(names).sort(function (a, b) { return names[b] - names[a] || nice(b) - nice(a); })[0];
  }

  // Filtro de seleção múltipla com busca. Nada marcado = todos.
  function multiSelect(host, title, field, plural) {
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
          var v = x[field]; if (!v) return;
          var k = fold(v); g[k] = g[k] || { key: k, n: 0, names: {} };
          g[k].n++; g[k].names[v] = (g[k].names[v] || 0) + 1;
        });
        opts = Object.keys(g).map(function (k) {
          return { key: k, n: g[k].n, label: bestName(g[k].names) };
        }).sort(function (a, b) { return a.label.localeCompare(b.label, "pt-BR"); });
        Object.keys(sel).forEach(function (k) { if (!g[k]) delete sel[k]; });
        summary.textContent = label(); draw();
      },
      test: function (x) { return !count() || !!sel[fold(x[field])]; }
    };
  }
  var fGestor = multiSelect($("#fms"), "GESTOR", "gestor", "gestores");
  var fSetor = multiSelect($("#fms"), "ÁREA", "setor", "áreas");

  function pct(a, b) { return b ? Math.round((a / b) * 100) : null; }
  function fmt(v, suf) { return v === null || v === undefined ? "-" : v + (suf || ""); }
  function entryDate(x) { return x.data || (x.criadoEm || "").slice(0, 10); }

  function filtered() {
    var u = fu.value, days = Number($("#fp").value), o = $("#fo").value;
    var cut = null;
    if (days) { var d = new Date(); d.setDate(d.getDate() - days); cut = d.toISOString().slice(0, 10); }
    return entries.filter(function (x) { return (!u || x.unidade === u) && (!cut || entryDate(x) >= cut) && (!o || (x.origem || "V2") === o) && fGestor.test(x) && fSetor.test(x); });
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
  // Agrupa respostas ("Outro: ..." vira "Outro"; grafias iguais juntas). Devolve [{label, n}] e o total.
  function tally(list, get, order) {
    var g = {}, tot = 0;
    list.forEach(function (x) {
      var v = get(x); if (v === undefined || v === null || v === "") return;
      v = String(v); if (v.indexOf("Outro: ") === 0) v = "Outro";
      var k = fold(v); g[k] = g[k] || { n: 0, names: {} }; g[k].n++; g[k].names[v] = (g[k].names[v] || 0) + 1; tot++;
    });
    var items = Object.keys(g).map(function (k) { return { key: k, label: bestName(g[k].names), n: g[k].n }; });
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
  function barRow(label, n, tot, color) {
    var p = tot ? Math.round((n / tot) * 100) : 0;
    var fl = el("div", { class: "fl" }); fl.style.width = p + "%"; if (color) fl.style.background = "var(" + color + ")";
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
    var t = tally(list, get, opts.order);
    var box = chart(title, (hint ? hint + " " : "") + "Base: " + t.tot + (t.tot === 1 ? " resposta." : " respostas."));
    if (!t.tot) { box.appendChild(el("p", { class: "hint", text: "Sem respostas neste filtro." })); return box; }
    var key = "bars:" + (opts.id || title), lim = opts.limit || 999;
    t.items.slice(0, expanded[key] ? 9999 : lim).forEach(function (it, i) { box.appendChild(barRow(it.label, it.n, t.tot, opts.colors && opts.colors[i])); });
    moreToggle(box, key, t.items.length, lim);
    return box;
  }
  function tile(v, label, sub) { return el("div", { class: "tile" }, [el("b", { text: v }), el("span", { text: label }), sub ? el("small", { text: sub }) : null]); }
  function story(text) { return el("p", { class: "story", text: text }); }
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
    box.appendChild(el("p", { class: "lead", text: "eNPS " + st.nps + " pontos, calculado sobre " + st.npsN + (st.npsN === 1 ? " nota." : " notas.") }));
    [["Promotores (9 e 10)", st.pro, "--s1"], ["Neutros (7 e 8)", st.neu, "--s3"], ["Detratores (0 a 6)", st.det, "--s4"]].forEach(function (g) { box.appendChild(barRow(g[0], g[1], st.npsN, g[2])); });
    var notas = list.filter(function (x) { return isResp(x) && typeof x.nps === "number"; });
    var row = [];
    for (var k = 0; k <= 10; k++) { var n = notas.filter(function (x) { return x.nps === k; }).length; row.push(np(n, notas.length)); }
    box.appendChild(el("p", { class: "hint", text: "Distribuição por nota", style: "margin:16px 0 0" }));
    box.appendChild(table(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], [row], 0));
    return box;
  }

  // Experiência: cada dimensão com Excelente/Bom/Regular/Ruim em quantidade e %.
  function expTable(resp) {
    var box = chart("Como avaliam a experiência", "Quem aceitou participar. Cada linha mostra quantas pessoas deram cada avaliação e a porcentagem sobre quem respondeu aquela pergunta. O número ao lado da barra é a parcela de bom ou excelente.");
    var lg = el("div", { class: "legend" });
    ESCALA.forEach(function (k, i) { lg.appendChild(el("span", null, [el("i", { style: "background:var(--s" + (i + 1) + ")" }), document.createTextNode(k)])); });
    box.appendChild(lg);
    var rows = [];
    DIM.forEach(function (d) {
      var a = answered(resp, d[0]);
      var stack = el("div", { class: "tr" });
      ESCALA.forEach(function (k, i) {
        var n = a.filter(function (x) { return x[d[0]] === k; }).length; if (!n) return;
        var s = el("div", { class: "seg", title: k + ": " + n }); s.style.width = (n / a.length) * 100 + "%"; s.style.background = "var(--s" + (i + 1) + ")"; stack.appendChild(s);
      });
      box.appendChild(el("div", { class: "br" }, [el("span", { text: d[1] }), stack, el("span", { class: "n", text: a.length ? pct(goodN(a, d[0]), a.length) + "%" : "-" })]));
      rows.push([d[1]].concat(ESCALA.map(function (k) { return np(a.filter(function (x) { return x[d[0]] === k; }).length, a.length); }), [String(a.length), np(goodN(a, d[0]), a.length)]));
    });
    box.appendChild(table(["Dimensão", "Excelente", "Bom", "Regular", "Ruim", "Responderam", "Bom ou excelente"], rows, 1));
    return box;
  }

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

  // Bloco de um grupo de saídas (voluntárias ou involuntárias): números, todas as perguntas e o que dizem.
  function groupBlock(kind, list, all) {
    var vol = kind === "vol", st = stats(list), wrap = el("div");
    wrap.appendChild(heading(vol ? "Saídas voluntárias" : "Saídas involuntárias", vol ? "--p4" : "--p2"));
    if (!list.length) { wrap.appendChild(el("p", { class: "hint", text: "Nenhuma saída deste tipo no filtro." })); return wrap; }
    var resp = st.resp, recusas = st.n - st.nResp;
    var topKey = vol ? "principalFator" : "motivoInvoluntario";
    var topBase = vol ? resp : list, top = tally(topBase, field(topKey)).items[0], topTot = tally(topBase, field(topKey)).tot;
    var s = (vol ? "Foram " + np(st.n, all.n) + " saídas por iniciativa do colaborador. " : "Foram " + np(st.n, all.n) + " desligamentos por iniciativa da empresa. ");
    if (top) s += (vol ? "O principal fator citado foi " : "O motivo mais registrado foi ") + "“" + top.label + "”" + (top.label === "Outro" ? " (textos variados, listados abaixo)" : "") + ", em " + nOf(top.n, topTot) + (vol ? " de quem respondeu. " : " dos casos com motivo. ");
    s += nOf(st.nResp, st.n) + " aceitaram participar da entrevista e " + recusas + " recusaram.";
    if (st.npsN) s += " eNPS " + st.nps + " (" + st.pro + " promotores, " + st.neu + " neutros, " + st.det + " detratores).";
    if (st.voltaN) s += " " + nOf(st.voltaSim, st.voltaN) + " voltariam a trabalhar na WAP.";
    wrap.appendChild(story(s));
    wrap.appendChild(el("div", { class: "tiles" }, [
      tile(String(st.n), vol ? "saídas voluntárias" : "saídas involuntárias", np(st.n, all.n) + " do total"),
      tile(fmt(st.adesao, "%"), "aceitaram a entrevista", nOf(st.nResp, st.n)),
      tile(fmt(st.nps), "eNPS", st.npsN ? st.npsN + " notas" : "sem notas"),
      tile(fmt(st.volta, "%"), "voltariam", st.voltaN ? nOf(st.voltaSim, st.voltaN) : "sem respostas")
    ]));
    if (vol) wrap.appendChild(bars("Principal fator da saída", "Quem pediu para sair e respondeu.", resp, field("principalFator"), { id: "fator" }));
    else wrap.appendChild(bars("Motivo do desligamento involuntário", "Todos os desligamentos por iniciativa da empresa, mesmo com recusa da entrevista.", list, field("motivoInvoluntario"), { id: "motivo" }));
    // O que foi escrito em cada "Outro", para não esconder o contexto atrás da categoria
    var outros = (vol ? resp : list).filter(function (x) { return String(x[topKey] || "").indexOf("Outro: ") === 0; })
      .map(function (x) { var o = Object.assign({}, x); o._o = x[topKey].slice(7); return o; });
    wrap.appendChild(quotes(vol ? "Fatores descritos como “Outro”" : "Motivos descritos como “Outro”", null, outros, "_o", function (x) { return ctx(x, ""); }));
    wrap.appendChild(bars("Aceitou participar da entrevista?", null, list, field("aceitou"), { id: kind + "aceitou", order: SN, colors: ["--s1", "--s4"] }));
    wrap.appendChild(npsBlock(st, list));
    wrap.appendChild(expTable(resp));
    wrap.appendChild(bars("Feedback do gestor nos últimos 6 meses", "Na base 2024 a pergunta era “recebeu feedbacks no período?” (Nunca / Às vezes / Sempre), convertida de forma aproximada.", resp, field("feedback"), { id: kind + "fb", order: FEEDBACK }));
    wrap.appendChild(bars("Voltaria a trabalhar na WAP?", null, resp, field("voltaria"), { id: kind + "volta", order: SN, colors: ["--s1", "--s4"] }));
    wrap.appendChild(bars("Benefício que mais atendia", "Resposta aberta; respostas iguais escritas de jeitos diferentes contam juntas.", resp, field("beneficioMelhor"), { id: kind + "bm", limit: 8 }));
    wrap.appendChild(bars("Benefício com maior oportunidade de melhoria", "Resposta aberta; respostas iguais escritas de jeitos diferentes contam juntas.", resp, field("beneficioMelhoria"), { id: kind + "bo", limit: 8 }));

    wrap.appendChild(el("h3", { class: "sub-h", text: vol ? "O que os voluntários estão dizendo" : "O que os involuntários estão dizendo" }));
    var why = function (x) { return vol ? (x.principalFator || "") : (x.motivoInvoluntario || ""); };
    if (vol) wrap.appendChild(quotes("Fatores secundários da saída", null, resp, "secundarios", function (x) { return ctx(x, why(x)); }));
    wrap.appendChild(quotes("O que mudaria na WAP", "“Se pudesse mudar uma coisa na WAP para melhorar a experiência dos colaboradores, o que mudaria?”", resp, "mudaria", function (x) { return ctx(x, why(x)); }));
    wrap.appendChild(quotes("Benefício a melhorar (comentários)", null, resp, "beneficioMelhoria", function (x) { return ctx(x, why(x)); }));
    wrap.appendChild(quotes("Observações do entrevistador", "Registro de quem conduziu a entrevista. Pode citar pessoas.", list, "obs", function (x) { return ctx(x, why(x)); }));
    return wrap;
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
    ["Recebeu feedbacks no período? (original)", ["Sempre", "As vezes", "Nunca"]],
    ["A empresa ofereceu oportunidades de desenvolvimento? (original)", SN],
    ["Principal fortaleza da empresa", null],
    ["Principal oportunidade de melhoria (categoria)", null],
    ["Defina a WAP em uma palavra", null]
  ];
  function legacyBlock(list) {
    var old = list.filter(function (x) { return x.origem === "Base 2024"; });
    var wrap = el("div");
    if (!old.length) return wrap;
    wrap.appendChild(heading("Perguntas da base 2024", "--p3"));
    wrap.appendChild(story("Perguntas que existiam só no formulário antigo. Valem para as " + old.length + " entrevistas da base 2024 neste filtro e não têm equivalente no V2."));
    LEG_CAT.forEach(function (q) {
      wrap.appendChild(bars(q[0], q[1] ? null : "Respostas iguais escritas de jeitos diferentes contam juntas.", old, legacy(q[0]), { id: "leg:" + q[0], order: q[1] || null, limit: q[1] ? 0 : 10 }));
    });
    var conselho = old.filter(function (x) { return x.legado && x.legado["Conselho para quem vai ocupar a posição"]; })
      .map(function (x) { var o = Object.assign({}, x); o._c = x.legado["Conselho para quem vai ocupar a posição"]; return o; });
    wrap.appendChild(quotes("Conselho para quem vai ocupar a posição", null, conselho, "_c", function (x) { return ctx(x, isVol(x) ? "voluntária" : isInv(x) ? "involuntária" : ""); }));
    return wrap;
  }

  /* ---------- Indicadores: a história ---------- */
  function renderMain(list) {
    var host = $("#ind-main"); host.textContent = "";
    if (!entries.length) { host.appendChild(el("div", { class: "empty", text: "Nenhuma entrevista salva ainda. Preencha a primeira na aba Nova entrevista e os indicadores aparecem aqui." })); return; }
    if (!list.length) { host.appendChild(el("div", { class: "empty", text: "Nenhuma entrevista neste filtro. Troque a unidade, o período, o gestor ou a área." })); return; }
    var st = stats(list), vols = list.filter(isVol), invs = list.filter(isInv), sv = stats(vols), si = stats(invs);

    host.appendChild(heading("Visão geral", "--p1"));
    var s = "De " + st.n + (st.n === 1 ? " saída" : " saídas") + ", " + np(st.nVol, st.n) + " foram voluntárias e " + np(st.nInv, st.n) + " involuntárias";
    s += st.nSem ? ", e " + np(st.nSem, st.n) + " não têm a iniciativa registrada (recusas da base 2024). " : ". ";
    s += nOf(st.nResp, st.n) + " aceitaram participar da entrevista.";
    if (st.npsN) s += " Entre quem deu nota, o eNPS é " + st.nps + ": " + np(st.pro, st.npsN) + " promotores, " + np(st.neu, st.npsN) + " neutros e " + np(st.det, st.npsN) + " detratores.";
    if (st.voltaN) s += " " + nOf(st.voltaSim, st.voltaN) + " voltariam a trabalhar na WAP.";
    host.appendChild(story(s));
    host.appendChild(el("div", { class: "tiles" }, [
      tile(String(st.n), "saídas"),
      tile(String(st.nVol), "voluntárias", np(st.nVol, st.n)),
      tile(String(st.nInv), "involuntárias", np(st.nInv, st.n)),
      tile(fmt(st.adesao, "%"), "aceitaram a entrevista", nOf(st.nResp, st.n)),
      tile(fmt(st.nps), "eNPS", st.npsN ? np(st.pro, st.npsN) + " promotores · " + np(st.neu, st.npsN) + " neutros · " + np(st.det, st.npsN) + " detratores" : "sem notas"),
      tile(fmt(st.volta, "%"), "voltariam", st.voltaN ? nOf(st.voltaSim, st.voltaN) : "sem respostas")
    ]));

    // Comparação lado a lado: a mesma pergunta para cada grupo.
    var cmp = chart("Voluntárias e involuntárias lado a lado", "Cada célula mostra a quantidade e a % dentro do grupo. Avaliações: base = quem respondeu a pergunta.");
    var line = function (label, f) { return [label, f(sv, vols), f(si, invs), f(st, list)]; };
    var rows = [
      line("Saídas", function (x) { return np(x.n, st.n); }),
      line("Aceitaram a entrevista", function (x) { return np(x.nResp, x.n); }),
      line("Notas de recomendação", function (x) { return String(x.npsN); }),
      line("Promotores (9 e 10)", function (x) { return np(x.pro, x.npsN); }),
      line("Neutros (7 e 8)", function (x) { return np(x.neu, x.npsN); }),
      line("Detratores (0 a 6)", function (x) { return np(x.det, x.npsN); }),
      line("eNPS", function (x) { return fmt(x.nps); }),
      line("Voltariam", function (x) { return x.voltaN ? np(x.voltaSim, x.voltaN) : "-"; })
    ];
    DIM.forEach(function (d) { rows.push(line(d[1] + ": bom ou excelente", function (x) { var a = answered(x.resp, d[0]); return a.length ? np(goodN(a, d[0]), a.length) : "-"; })); });
    rows.push(line("Feedback: nenhuma vez em 6 meses", function (x) { var a = answered(x.resp, "feedback"); return a.length ? np(a.filter(function (y) { return y.feedback === "Nenhuma vez"; }).length, a.length) : "-"; }));
    cmp.appendChild(table(["Indicador", "Voluntárias", "Involuntárias", "Total"], rows, 1));
    host.appendChild(cmp);
    host.appendChild(npsBlock(st, list, "Recomendação (eNPS) de todas as saídas"));

    host.appendChild(groupBlock("vol", vols, st));
    host.appendChild(groupBlock("inv", invs, st));

    host.appendChild(heading("Quem saiu", "--p1"));
    host.appendChild(breakdown("Por unidade", null, list, field("unidade")));
    host.appendChild(breakdown("Por área", "Setor do colaborador.", list, field("setor"), 10));
    host.appendChild(breakdown("Por gestor", "Gestor direto. Nomes escritos de jeitos diferentes contam juntos.", list, field("gestor"), 10));
    host.appendChild(breakdown("Por entrevistador", null, list, field("entrevistador"), 10));
    host.appendChild(byMonth(list));

    host.appendChild(legacyBlock(list));
  }

  /* ---------- Respostas ---------- */
  function renderResp() {
    var host = $("#resp-body"); host.textContent = "";
    $("#cnt").textContent = String(entries.length);
    $("#xls").hidden = !entries.length;
    $("#respinfo").textContent = entries.length ? entries.length + (entries.length === 1 ? " entrevista salva." : " entrevistas salvas.") + " Elas ficam guardadas até uma administradora excluir." : "Todas as entrevistas salvas aparecem aqui.";
    if (!entries.length) {
      host.appendChild(el("div", { class: "empty", text: "Nenhuma entrevista salva ainda. Preencha a primeira na aba Nova entrevista." }));
      return;
    }
    var tb = el("tbody");
    entries.forEach(function (x) {
      var acts = [];
      var ver = el("button", { class: "lnk", type: "button", text: openId === x.id ? "Fechar" : "Ver" });
      ver.addEventListener("click", function () { openId = openId === x.id ? null : x.id; renderResp(); });
      acts.push(ver);
      if (me && me.is_admin) {
        var del = el("button", { class: "lnk" + (armed === x.id ? " danger" : ""), type: "button", text: armed === x.id ? "Confirmar exclusão" : "Excluir" });
        del.addEventListener("click", function () {
          if (armed !== x.id) { armed = x.id; renderResp(); setTimeout(function () { if (armed === x.id) { armed = null; renderResp(); } }, 4000); return; }
          armed = null; del.disabled = true;
          store.remove(x.id).then(loadEntries).catch(function (err) { warn("Não foi possível excluir. " + ((err && err.message) || "")); renderResp(); });
        });
        acts.push(del);
      }
      var dt = el("td", { text: brDate(entryDate(x)) });
      if (x.origem === "Base 2024") dt.appendChild(el("span", { class: "tag", text: "2024" }));
      tb.appendChild(el("tr", null, [
        dt, el("td", { text: x.colaborador || "" }), el("td", { text: x.unidade || "" }),
        el("td", { text: x.iniciativa || "" }), el("td", { text: x.aceitou === "Sim" ? (typeof x.nps === "number" ? "Nota " + x.nps : "Respondeu") : "Recusou" }),
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
        tb.appendChild(el("tr", { class: "det" }, [el("td", { colspan: "6" }, [dl])]));
      }
    });
    var head = ["Data", "Colaborador", "Unidade", "Iniciativa", "Resultado", ""].map(function (h) { return el("th", { text: h }); });
    host.appendChild(el("div", { class: "tw" }, [el("table", null, [el("thead", null, [el("tr", null, head)]), tb])]));
  }

  function renderAll() {
    var list = filtered();
    renderMain(list);
    renderResp();
  }

  function loadEntries() {
    return store.list().then(function (rows) { entries = rows; fGestor.refresh(rows); fSetor.refresh(rows); renderAll(); })
      .catch(function (err) { warn("Não foi possível carregar as entrevistas. " + ((err && err.message) || "Recarregue a página.")); });
  }
  $("#reload").addEventListener("click", loadEntries);

  /* ---------- Excel ---------- */
  function say(msg) { var m = $("#dlmsg"); m.textContent = msg; m.hidden = !msg; }
  $("#xls").addEventListener("click", function () {
    say("");
    if (!window.XLSX) { say("Não foi possível carregar o gerador de Excel. Verifique a conexão e recarregue a página."); return; }
    var asc = entries.slice().sort(function (a, b) { return entryDate(a) < entryDate(b) ? -1 : entryDate(a) > entryDate(b) ? 1 : (a.criadoEm < b.criadoEm ? -1 : 1); });
    var aoa = [COLS.map(function (c) { return c[1]; }).concat(["Classificação eNPS"])];
    asc.forEach(function (x) {
      aoa.push(COLS.map(function (c) {
        var v = x[c[0]];
        if (v === undefined) return "";
        if (c[0] === "data") return brDate(v);
        if (c[0] === "criadoEm") return brDateTime(v);
        if (c[0] === "legado") return legadoTxt(v, " | ");
        return v;
      }).concat([typeof x.nps === "number" ? (x.nps >= 9 ? "Promotor" : x.nps >= 7 ? "Neutro" : "Detrator") : ""]));
    });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = COLS.map(function (c) { return { wch: Math.min(40, Math.max(12, c[1].length + 2)) }; }).concat([{ wch: 20 }]);
    // Indicadores do conjunto completo: quantidade, base e % de cada um, para total, voluntárias e involuntárias.
    var ind = [["Grupo", "Indicador", "Quantidade", "Base", "%"]];
    var put = function (g, label, n, base) { ind.push([g, label, n, base, pct(n, base) === null ? "" : pct(n, base)]); };
    var tot = stats(entries);
    put("Total", "Saídas voluntárias", tot.nVol, tot.n); put("Total", "Saídas involuntárias", tot.nInv, tot.n); put("Total", "Sem iniciativa registrada", tot.nSem, tot.n);
    [["Total", entries], ["Voluntárias", entries.filter(isVol)], ["Involuntárias", entries.filter(isInv)]].forEach(function (gr) {
      var g = gr[0], l = gr[1], s = stats(l);
      put(g, "Saídas", s.n, tot.n);
      put(g, "Aceitaram a entrevista", s.nResp, s.n);
      put(g, "Promotores (9 e 10)", s.pro, s.npsN); put(g, "Neutros (7 e 8)", s.neu, s.npsN); put(g, "Detratores (0 a 6)", s.det, s.npsN);
      ind.push([g, "eNPS (pontos)", s.nps === null ? "" : s.nps, s.npsN, ""]);
      put(g, "Voltariam a trabalhar na WAP", s.voltaSim, s.voltaN);
      DIM.forEach(function (d) { var a = answered(s.resp, d[0]); ESCALA.forEach(function (k) { put(g, d[1] + ": " + k, a.filter(function (x) { return x[d[0]] === k; }).length, a.length); }); });
      var fb = answered(s.resp, "feedback"); FEEDBACK.forEach(function (k) { put(g, "Feedback 6 meses: " + k, fb.filter(function (x) { return x.feedback === k; }).length, fb.length); });
      if (g !== "Involuntárias") { var tf = tally(s.resp, field("principalFator")); tf.items.forEach(function (it) { put(g, "Principal fator: " + it.label, it.n, tf.tot); }); }
      if (g !== "Voluntárias") { var tm = tally(l, field("motivoInvoluntario")); tm.items.forEach(function (it) { put(g, "Motivo involuntário: " + it.label, it.n, tm.tot); }); }
    });
    var wi = XLSX.utils.aoa_to_sheet(ind);
    wi["!cols"] = [{ wch: 14 }, { wch: 56 }, { wch: 12 }, { wch: 10 }, { wch: 8 }];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Entrevistas");
    XLSX.utils.book_append_sheet(wb, wi, "Indicadores");
    XLSX.writeFile(wb, "entrevistas-desligamento-v2-" + today() + ".xlsx");
  });

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

  function renderAudit(list) {
    var host = $("#aud-body"); host.textContent = "";
    if (!list.length) { host.appendChild(el("p", { class: "hint", text: "Nenhum evento ainda." })); return; }
    var byId = {};
    entries.forEach(function (x) { byId[x.id] = x; });
    var tb = el("tbody");
    list.forEach(function (a) {
      var e = byId[a.entrevista_id];
      var alvo = e ? (e.colaborador + " · " + brDate(entryDate(e))) : "(entrevista excluída)";
      tb.appendChild(el("tr", null, [el("td", { text: brDateTime(a.em) }), el("td", { text: a.acao }), el("td", { text: a.ator_nome || a.ator_email || "" }), el("td", { text: alvo })]));
    });
    var head = ["Quando", "Ação", "Quem", "Entrevista"].map(function (h) { return el("th", { text: h }); });
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
    sb.auth.signOut().then(function () { location.reload(); });
  });

  if (DEMO) { enter({ user_id: "demo", email: "demo@wap.ind.br", full_name: "Ana Beatriz Capistrano Esteves", is_admin: true }); return; }
  if (!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY || /COLE_AQUI/.test(CFG.SUPABASE_ANON_KEY) || !window.supabase) { $("#cfgwarn").hidden = false; return; }
  sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  sb.auth.onAuthStateChange(function (event, session) {
    // adia para fora do callback (recomendação do supabase-js)
    setTimeout(function () { onSession(session); }, 0);
  });
})();
