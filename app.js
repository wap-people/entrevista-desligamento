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
    ["data", "Data"], ["criadoEm", "Registrado em"], ["entrevistador", "Entrevistador"], ["unidade", "Unidade"], ["colaborador", "Colaborador"], ["setor", "Setor"], ["gestor", "Gestor direto"],
    ["iniciativa", "Iniciativa do desligamento"], ["aceitou", "Aceitou participar"], ["principalFator", "Principal fator da saída"], ["secundarios", "Fatores secundários"],
    ["motivoInvoluntario", "Motivo do desligamento involuntário"], ["climaArea", "Clima na grande área"], ["climaEmpresa", "Clima na empresa"],
    ["gestorRel", "Relacionamento com o gestor"], ["feedback", "Feedback nos últimos 6 meses"], ["salario", "Salário"], ["beneficios", "Benefícios"],
    ["desenvolvimento", "Desenvolvimento e crescimento"], ["equilibrio", "Equilíbrio vida pessoal e profissional"], ["voltaria", "Voltaria a trabalhar na WAP"],
    ["nps", "Recomendação (0 a 10)"], ["mudaria", "O que mudaria"], ["obs", "Observações gerais do entrevistador"]
  ];
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

  function demoStore() {
    var rows = [], log = [], seq = 0;
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

  function pct(a, b) { return b ? Math.round((a / b) * 100) : null; }
  function fmt(v, suf) { return v === null || v === undefined ? "-" : v + (suf || ""); }
  function entryDate(x) { return x.data || (x.criadoEm || "").slice(0, 10); }

  function filtered() {
    var u = fu.value, days = Number($("#fp").value);
    var cut = null;
    if (days) { var d = new Date(); d.setDate(d.getDate() - days); cut = d.toISOString().slice(0, 10); }
    return entries.filter(function (x) { return (!u || x.unidade === u) && (!cut || entryDate(x) >= cut); });
  }
  function stats(list) {
    var resp = list.filter(function (x) { return x.aceitou === "Sim"; });
    var nps = resp.filter(function (x) { return typeof x.nps === "number"; });
    var pro = nps.filter(function (x) { return x.nps >= 9; }).length;
    var det = nps.filter(function (x) { return x.nps <= 6; }).length;
    var volt = resp.filter(function (x) { return x.voltaria; });
    return {
      n: list.length, resp: resp,
      adesao: pct(resp.length, list.length),
      vol: pct(list.filter(function (x) { return x.iniciativa === INIC[0]; }).length, list.length),
      nps: nps.length ? Math.round(((pro - det) / nps.length) * 100) : null,
      pro: pro, det: det, neu: nps.length - pro - det, npsN: nps.length,
      volta: pct(volt.filter(function (x) { return x.voltaria === "Sim"; }).length, volt.length)
    };
  }
  function good(list, key) {
    var a = list.filter(function (x) { return x[key]; });
    return pct(a.filter(function (x) { return x[key] === "Excelente" || x[key] === "Bom"; }).length, a.length);
  }
  function count(list, key) {
    var m = {};
    list.forEach(function (x) {
      var v = x[key];
      if (v === undefined || v === "") return;
      if (typeof v === "string" && v.indexOf("Outro: ") === 0) v = "Outro";
      m[v] = (m[v] || 0) + 1;
    });
    return m;
  }
  function bars(title, hint, list, key, order) {
    var m = count(list, key);
    var tot = Object.keys(m).reduce(function (a, k) { return a + m[k]; }, 0);
    var keys = order || Object.keys(m).sort(function (a, b) { return m[b] - m[a]; });
    var box = el("div", { class: "chart" }, [el("h3", { text: title })]);
    if (hint) box.appendChild(el("p", { class: "hint", text: hint }));
    if (!tot) { box.appendChild(el("p", { class: "hint", text: "Sem respostas neste filtro." })); return box; }
    keys.forEach(function (k) {
      var v = m[k] || 0, p = Math.round((v / tot) * 100);
      var fl = el("div", { class: "fl" }); fl.style.width = p + "%";
      box.appendChild(el("div", { class: "br" }, [el("span", { text: k }), el("div", { class: "tr" }, [fl]), el("span", { class: "n", text: v + " (" + p + "%)" })]));
    });
    return box;
  }
  function tile(v, label) { return el("div", { class: "tile" }, [el("b", { text: v }), el("span", { text: label })]); }

  function renderMain(list) {
    var host = $("#ind-main"); host.textContent = "";
    if (!entries.length) {
      host.appendChild(el("div", { class: "empty", text: "Nenhuma entrevista salva ainda. Preencha a primeira na aba Nova entrevista e os indicadores aparecem aqui." }));
      return;
    }
    if (!list.length) {
      host.appendChild(el("div", { class: "empty", text: "Nenhuma entrevista neste filtro. Troque a unidade ou o período." }));
      return;
    }
    var st = stats(list);
    host.appendChild(el("div", { class: "tiles" }, [
      tile(String(st.n), "entrevistas"),
      tile(fmt(st.adesao, "%"), "aceitaram responder"),
      tile(fmt(st.vol, "%"), "saídas por iniciativa do colaborador"),
      tile(fmt(st.nps), "eNPS (% promotores menos % detratores)"),
      tile(fmt(st.volta, "%"), "voltariam a trabalhar na WAP")
    ]));

    var resp = st.resp;
    var nb = el("div", { class: "chart" }, [el("h3", { text: "eNPS: detratores, neutros e promotores" }), el("p", { class: "hint", text: "Detratores: notas 0 a 6. Neutros: 7 e 8. Promotores: 9 e 10. O eNPS é a porcentagem de promotores menos a de detratores." })]);
    if (!st.npsN) {
      nb.appendChild(el("p", { class: "hint", text: "Sem notas de recomendação neste filtro." }));
    } else {
      [["Detratores (0 a 6)", st.det, "--s4"], ["Neutros (7 e 8)", st.neu, "--s3"], ["Promotores (9 e 10)", st.pro, "--s1"]].forEach(function (g) {
        var p = Math.round((g[1] / st.npsN) * 100);
        var fl = el("div", { class: "fl" }); fl.style.width = p + "%"; fl.style.background = "var(" + g[2] + ")";
        nb.appendChild(el("div", { class: "br" }, [el("span", { text: g[0] }), el("div", { class: "tr" }, [fl]), el("span", { class: "n", text: g[1] + " (" + p + "%)" })]));
      });
    }
    host.appendChild(nb);
    host.appendChild(bars("Principal fator da saída", "Colaboradores que pediram para sair e responderam.", resp.filter(function (x) { return x.principalFator; }), "principalFator"));
    host.appendChild(bars("Motivo do desligamento involuntário", "Desligamentos por iniciativa da empresa.", list.filter(function (x) { return x.motivoInvoluntario; }), "motivoInvoluntario"));

    var sb2 = el("div", { class: "chart" }, [el("h3", { text: "Como avaliam a experiência" }), el("p", { class: "hint", text: "Cada barra soma 100%. O número à direita é a parcela de Bom ou Excelente." })]);
    var lg = el("div", { class: "legend" });
    ESCALA.forEach(function (k, i) { lg.appendChild(el("span", null, [el("i", { style: "background:var(--s" + (i + 1) + ")" }), document.createTextNode(k)])); });
    sb2.appendChild(lg);
    DIM.forEach(function (d) {
      var a = resp.filter(function (x) { return x[d[0]]; }), tot = a.length;
      var tr = el("div", { class: "tr" });
      ESCALA.forEach(function (k, i) {
        var n = a.filter(function (x) { return x[d[0]] === k; }).length;
        if (!n) return;
        var s = el("div", { class: "seg", title: k + ": " + n }); s.style.width = (n / tot) * 100 + "%"; s.style.background = "var(--s" + (i + 1) + ")";
        tr.appendChild(s);
      });
      sb2.appendChild(el("div", { class: "br" }, [el("span", { text: d[1] }), tr, el("span", { class: "n", text: fmt(good(resp, d[0]), "%") })]));
    });
    host.appendChild(sb2);
    host.appendChild(bars("Feedback do gestor nos últimos 6 meses", null, resp, "feedback", FEEDBACK));

    var tb = el("tbody");
    UNIDADES.forEach(function (u) {
      var l = list.filter(function (x) { return x.unidade === u; });
      if (!l.length) return;
      var s = stats(l);
      tb.appendChild(el("tr", null, [el("td", { text: u }), el("td", { class: "num", text: String(s.n) }), el("td", { class: "num", text: fmt(s.adesao, "%") }), el("td", { class: "num", text: fmt(s.nps) }), el("td", { class: "num", text: fmt(s.volta, "%") }), el("td", { class: "num", text: fmt(good(s.resp, "climaArea"), "%") })]));
    });
    var th = ["Unidade", "Entrevistas", "Aceitaram", "eNPS", "Voltariam", "Clima bom ou excelente"].map(function (h, i) { return el("th", { class: i ? "num" : "", text: h }); });
    host.appendChild(el("div", { class: "chart" }, [el("h3", { text: "Por unidade" }), el("div", { class: "tw" }, [el("table", null, [el("thead", null, [el("tr", null, th)]), tb])])]));
  }

  var STOP = "para com uma uns umas que por mais mas como dos das nos nas aos seu sua seus suas nao não sim muito muita muitos muitas tem ter tinha foi ser são era ele ela eles elas isso isto essa esse esses essas este esta estes estas aqui ali onde quando porque pois também tambem ainda sobre entre até ate depois antes sempre nunca pouco pouca mesmo mesma melhor melhorar poderia deveria seria mudaria mudar acho acredito falta faltou ter tido tem têm vai vão está estão estava estavam fazer feito fazem coisa coisas empresa wap pessoas pessoa colaboradores colaborador todos todas toda todo cada outro outra outros outras forma bem bom boa ruim sendo apenas só sobre dentro fora já ja nem seus minha meu meus minhas nosso nossa nossos nossas deles delas".split(" ");
  var STOPSET = {}; STOP.forEach(function (w) { STOPSET[w] = 1; });
  function comments(list) {
    var out = [];
    list.forEach(function (x) {
      ["mudaria", "secundarios"].forEach(function (k) {
        var t = x[k] ? String(x[k]).trim() : "";
        if (t.length > 3) out.push({ t: t, u: x.unidade || "", s: x.setor || "", nps: x.nps, k: k });
      });
    });
    return out;
  }
  function renderVoz(list) {
    var cm = comments(list);
    var terms = $("#voz-terms"); terms.textContent = "";
    var q = $("#voz-quotes"); q.textContent = "";
    if (!cm.length) {
      terms.appendChild(el("p", { class: "hint", text: "Ainda não há comentários neste filtro." }));
      return;
    }
    var freq = {};
    cm.forEach(function (c) {
      var seen = {};
      c.t.toLowerCase().split(/[^a-zà-ÿ]+/).forEach(function (w) {
        if (w.length < 4 || STOPSET[w] || seen[w]) return;
        seen[w] = 1; freq[w] = (freq[w] || 0) + 1;
      });
    });
    var top = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a] || (a < b ? -1 : 1); }).slice(0, 14);
    top.forEach(function (w) { terms.appendChild(el("span", { class: "term" }, [document.createTextNode(w), el("b", { text: String(freq[w]) })])); });
    q.appendChild(el("h3", { text: "Comentários recentes", style: "font-size:18px;margin:0 0 12px" }));
    cm.slice(0, 8).forEach(function (c) {
      var meta = [c.k === "mudaria" ? "O que mudaria" : "Fator secundário", c.s, c.u].filter(Boolean).join(" · ");
      q.appendChild(el("blockquote", { class: "quote" }, [el("p", { text: c.t }), el("small", { text: meta })]));
    });
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
      tb.appendChild(el("tr", null, [
        el("td", { text: brDate(entryDate(x)) }), el("td", { text: x.colaborador || "" }), el("td", { text: x.unidade || "" }),
        el("td", { text: x.iniciativa || "" }), el("td", { text: x.aceitou === "Sim" ? (typeof x.nps === "number" ? "Nota " + x.nps : "Respondeu") : "Recusou" }),
        el("td", { class: "act" }, acts)
      ]));
      if (openId === x.id) {
        var dl = el("dl");
        COLS.forEach(function (c) {
          var v = x[c[0]]; if (v === undefined || v === "") return;
          if (c[0] === "data") v = brDate(v);
          if (c[0] === "criadoEm") v = brDateTime(v);
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
    renderVoz(list);
    renderResp();
  }

  function loadEntries() {
    return store.list().then(function (rows) { entries = rows; renderAll(); })
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
        return v;
      }).concat([typeof x.nps === "number" ? (x.nps >= 9 ? "Promotor" : x.nps >= 7 ? "Neutro" : "Detrator") : ""]));
    });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = COLS.map(function (c) { return { wch: Math.min(40, Math.max(12, c[1].length + 2)) }; }).concat([{ wch: 20 }]);
    var st = stats(entries);
    var ind = [["Indicador", "Valor"], ["Entrevistas", st.n], ["Aceitaram responder (%)", st.adesao === null ? "" : st.adesao], ["Saídas por iniciativa do colaborador (%)", st.vol === null ? "" : st.vol], ["eNPS", st.nps === null ? "" : st.nps], ["Promotores (notas 9 e 10)", st.pro], ["Neutros (notas 7 e 8)", st.neu], ["Detratores (notas 0 a 6)", st.det], ["Voltariam a trabalhar na WAP (%)", st.volta === null ? "" : st.volta]];
    DIM.forEach(function (d) { var g = good(st.resp, d[0]); ind.push([d[1] + ": Bom ou Excelente (%)", g === null ? "" : g]); });
    var wi = XLSX.utils.aoa_to_sheet(ind);
    wi["!cols"] = [{ wch: 48 }, { wch: 12 }];
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
