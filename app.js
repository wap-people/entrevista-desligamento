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
  var FILTROS = [fMes, fGestor, fSetor, fEntrev];

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
    var t = tally(list, get, opts.order, opts.text);
    var box = chart(title, (hint ? hint + " " : "") + "Base: " + t.tot + pl(t.tot, " resposta.", " respostas.") + smallBase(t.tot));
    if (!t.tot) { box.appendChild(el("p", { class: "hint", text: "Sem respostas neste filtro." })); return box; }
    var key = "bars:" + (opts.id || title), lim = opts.limit || 999;
    t.items.slice(0, expanded[key] ? 9999 : lim).forEach(function (it, i) { box.appendChild(barRow(it.label, it.n, t.tot, opts.colors && opts.colors[i])); });
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
    [["Promotores (9 e 10)", st.pro, "--s1"], ["Neutros (7 e 8)", st.neu, "--s3"], ["Detratores (0 a 6)", st.det, "--s4"]].forEach(function (g) { box.appendChild(barRow(g[0], g[1], st.npsN, g[2])); });
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
        s.style.width = (n / d.n) * 100 + "%";
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
    wrap.appendChild(quotes("Observações do entrevistador", "Registro de quem conduziu a entrevista. Pode citar pessoas.", list, "obs", function (x) { return ctx(x, why(x)); }));
    return wrap;
  }
  function commentCount(list) {
    var n = 0, resp = list.filter(isResp);
    ["mudaria", "beneficioMelhoria", "secundarios"].forEach(function (k) { n += resp.filter(function (x) { return x[k]; }).length; });
    return n + list.filter(function (x) { return x.obs; }).length;
  }

  // Seção recolhível: abre ao clicar e continua aberta ao trocar filtros.
  function collapsible(id, title, sub, content) {
    var d = el("details", { class: "fold" }, [el("summary", null, [el("span", { text: title }), sub ? el("small", { text: sub }) : null]), el("div", { class: "fold-b" }, [content])]);
    if (expanded["sec:" + id]) d.open = true;
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
  // Rosca: partes [{n, cls}]
  function donut(parts) {
    var tot = parts.reduce(function (a, p) { return a + p.n; }, 0) || 1, r = 15.915, off = 25, kids = [sv("circle", { cx: 21, cy: 21, r: r, class: "dn-bg" })];
    parts.forEach(function (p) {
      if (!p.n) return;
      var len = (p.n / tot) * 100;
      kids.push(sv("circle", { cx: 21, cy: 21, r: r, class: "dn " + p.cls, "stroke-dasharray": len + " " + (100 - len), "stroke-dashoffset": off }));
      off -= len;
    });
    return svg(42, 42, kids);
  }
  // Medidor de -100 a +100 para o eNPS.
  function gauge(v) {
    var a = function (x) { var t = Math.PI * (1 - (x + 100) / 200); return [50 + 40 * Math.cos(t), 50 - 40 * Math.sin(t)]; };
    var arc = function (x0, x1, cls) { var p0 = a(x0), p1 = a(x1); return sv("path", { d: "M" + p0[0] + " " + p0[1] + " A40 40 0 0 1 " + p1[0] + " " + p1[1], class: "gg " + cls }); };
    var kids = [arc(-100, 0, "gg-d"), arc(0, 50, "gg-n"), arc(50, 100, "gg-p")];
    if (v !== null) { var p = a(Math.max(-100, Math.min(100, v))); kids.push(sv("line", { x1: 50, y1: 50, x2: p[0], y2: p[1], class: "gg-h" }), sv("circle", { cx: 50, cy: 50, r: 4, class: "gg-c" })); }
    return svg(100, 56, kids);
  }
  // Barrinha empilhada para os cartões: partes [{n, cls, label}]
  function minibar(parts) {
    var tot = parts.reduce(function (a, p) { return a + p.n; }, 0), b = el("div", { class: "mb" });
    parts.forEach(function (p) { if (!p.n) return; var s = el("i", { class: p.cls, title: p.label + ": " + np(p.n, tot) }); s.style.width = (p.n / tot) * 100 + "%"; b.appendChild(s); });
    return b;
  }
  function legendRow(parts) {
    var tot = parts.reduce(function (a, p) { return a + p.n; }, 0);
    return el("div", { class: "kl" }, parts.map(function (p) { return el("span", null, [el("i", { class: p.cls }), document.createTextNode(p.label + " " + np(p.n, tot))]); }));
  }
  function months12(list) {
    var now = new Date(), keys = [];
    for (var i = 11; i >= 0; i--) { var d = new Date(now.getFullYear(), now.getMonth() - i, 1); keys.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")); }
    return keys.map(function (k) { return { k: k, n: list.filter(function (x) { return entryDate(x).slice(0, 7) === k; }).length }; });
  }
  function kpi(cls, label, value, sub, viz) {
    return el("div", { class: "kpi " + (cls || "") }, [el("span", { class: "kpi-l", text: label }), el("div", { class: "kpi-r" }, [el("b", { class: "kpi-v", text: value }), viz || null]), sub ? el("div", { class: "kpi-s" }, [typeof sub === "string" ? document.createTextNode(sub) : sub]) : null]);
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
    return { card: wrap, panel: openMod === id ? el("section", { class: "mod-p", id: "mod-" + id, "aria-label": title }, [el("div", { class: "mod-ph" }, [el("h3", { text: title }), el("button", { class: "lnk", type: "button", text: "Fechar" })]), build()]) : null };
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

    // 2. Faixa de indicadores com mini-gráficos
    var m12 = months12(list), lastM = m12[m12.length - 1], prevM = m12[m12.length - 2];
    var comp = [{ n: st.nVol, cls: "c-vol", label: "Voluntárias" }, { n: st.nInv, cls: "c-inv", label: "Involuntárias" }].concat(st.nSem ? [{ n: st.nSem, cls: "c-sem", label: "Sem iniciativa" }] : []);
    var strip = el("div", { class: "kpis" }, [
      kpi("", t ? T.titulo : "Saídas", String(st.n), t ? nOf(st.n, base.n) + " do total" : "Últimos 12 meses · " + MESES[Number(lastM.k.slice(5)) - 1] + ": " + lastM.n + (prevM ? " (mês anterior: " + prevM.n + ")" : ""), spark(m12.map(function (x) { return x.n; }))),
      !t ? kpi("", "Voluntárias", fmt(pct(st.nVol, st.n), "%"), legendRow(comp), donut(comp)) : null,
      kpi("", "Aceitaram a entrevista", fmt(st.adesao, "%"), nOf(st.nResp, st.n) + " · " + (st.n - st.nResp) + pl(st.n - st.nResp, " recusou", " recusaram"), minibar([{ n: st.nResp, cls: "c-ok", label: "Aceitaram" }, { n: st.n - st.nResp, cls: "c-no", label: "Recusaram" }])),
      kpi("kpi-nps", "eNPS", st.npsN ? (st.nps > 0 ? "+" : "") + st.nps : "–", st.npsN ? legendRow([{ n: st.pro, cls: "c-pro", label: "Promotores" }, { n: st.neu, cls: "c-neu", label: "Neutros" }, { n: st.det, cls: "c-det", label: "Detratores" }]) : "Sem notas no filtro (a base 2024 não tinha esta pergunta)", gauge(st.npsN ? st.nps : null)),
      kpi("", "Voltariam a trabalhar na WAP", fmt(st.volta, "%"), st.voltaN ? nOf(st.voltaSim, st.voltaN) + " · " + (st.voltaN - st.voltaSim) + pl(st.voltaN - st.voltaSim, " não voltaria", " não voltariam") : "Sem respostas", minibar([{ n: st.voltaSim, cls: "c-ok", label: "Voltariam" }, { n: st.voltaN - st.voltaSim, cls: "c-no", label: "Não voltariam" }]))
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
    var avgPos = dimsAll.length ? Math.round(dimsAll.reduce(function (s, d) { return s + d.g / d.n; }, 0) / dimsAll.length * 100) : null;
    mods.push(mod("exp", "Experiência", fmt(avgPos, "%"), ex ? "positivas em média · pior: " + ex.worst.label + " (" + ex.worst.p + "%)" : "positivas em média", minibar(ESCALA.map(function (k, i) { return { n: DIM.reduce(function (s, d) { return s + resp.filter(function (x) { return x[d[0]] === k; }).length; }, 0), cls: "s" + (i + 1), label: k }; })), function () { return expTable(resp); }));
    if (st.npsN) mods.push(mod("nps", "Recomendação (eNPS)", (st.nps > 0 ? "+" : "") + st.nps, st.npsN + pl(st.npsN, " nota · ", " notas · ") + np(st.det, st.npsN) + pl(st.det, " detrator", " detratores"), minibar([{ n: st.pro, cls: "c-pro", label: "Promotores" }, { n: st.neu, cls: "c-neu", label: "Neutros" }, { n: st.det, cls: "c-det", label: "Detratores" }]), function () { return npsBlock(st, list); }));
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
    var nCom = commentCount(list), lastCom = list.filter(function (x) { return isResp(x) && x.mudaria; }).sort(function (a, b) { return entryDate(a) < entryDate(b) ? 1 : -1; })[0];
    mods.push(mod("dizem", "O que estão dizendo", String(nCom), lastCom ? pl(nCom, "comentário", "comentários") + " · último: “" + String(lastCom.mudaria).slice(0, 60) + (String(lastCom.mudaria).length > 60 ? "…”" : "”") : "comentários com contexto", null, function () { return sayings(list); }));
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
    updateChips();
    var list = filtered();
    renderMain(list);
    renderResp();
  }

  function loadEntries() {
    return store.list().then(function (rows) { entries = rows; FILTROS.forEach(function (f) { f.refresh(rows); }); renderAll(); })
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
