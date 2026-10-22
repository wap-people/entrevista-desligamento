// Edge Function "admin-users": cadastro e gestão de usuários da Entrevista de Desligamento V2.
// Só administradores ativos (public.members.is_admin) podem chamar.
// Publicada com verify_jwt = false: a própria função confere a sessão (auth.getUser) e o papel de admin.
// Ações (POST JSON):
//   { action: "invite", email, full_name, is_admin, redirect_to? }  cria o usuário sem senha e devolve o link de convite
//   { action: "link", user_id, redirect_to? }                       devolve um link para a pessoa criar uma nova senha
//   { action: "create", email, password, full_name, is_admin }      (antigo: com senha provisória)
//   { action: "update", user_id, full_name?, is_admin?, active?, password? }
// Os links NÃO são enviados por e-mail pelo Supabase: a administradora os envia pelo próprio Outlook.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Para onde o link leva depois de validado: só o site publicado ou um servidor local de teste.
const SITE = "https://wap-people.github.io/entrevista-desligamento/";
function destino(v: unknown): string {
  const s = String(v || "");
  return /^https:\/\/wap-people\.github\.io\/entrevista-desligamento\/?$/.test(s) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(s) ? s : SITE;
}

// Chave de servidor: a nova (SUPABASE_SECRET_KEYS, JSON { nome: "sb_secret_..." }) ou a legada (service_role).
function serverKey(): string {
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const k = keys.default || Object.values(keys)[0];
    if (typeof k === "string" && k) return k;
  } catch { /* usa a legada */ }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, serverKey(), { auth: { persistSession: false, autoRefreshToken: false } });

  // quem está chamando?
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: caller, error: callerErr } = await admin.auth.getUser(token);
  if (callerErr || !caller?.user) return json({ error: "Sessão inválida. Entre novamente." }, 401);
  const callerId = caller.user.id;

  const { data: me } = await admin.from("members").select("is_admin, active").eq("user_id", callerId).maybeSingle();
  if (!me || !me.active || !me.is_admin) return json({ error: "Apenas administradores podem gerenciar usuários." }, 403);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Requisição inválida." }, 400); }

  if (body.action === "invite") {
    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.full_name || "").trim();
    const isAdmin = body.is_admin === true;
    if (!EMAIL_RE.test(email)) return json({ error: "E-mail inválido." }, 400);
    if (!fullName) return json({ error: "Informe o nome." }, 400);

    const { data: gen, error } = await admin.auth.admin.generateLink({
      type: "invite", email, options: { data: { full_name: fullName }, redirectTo: destino(body.redirect_to) },
    });
    if (error || !gen?.user || !gen.properties?.action_link) {
      const msg = /already|registered|exists/i.test(error?.message || "")
        ? "Já existe um usuário com este e-mail. Use “Link de nova senha” na lista abaixo."
        : ("Não foi possível criar o convite: " + (error?.message || "erro"));
      return json({ error: msg }, 400);
    }
    const { error: mErr } = await admin.from("members").upsert({
      user_id: gen.user.id, email, full_name: fullName, is_admin: isAdmin, active: true, created_by: callerId,
    });
    if (mErr) return json({ error: "Convite criado, mas falhou ao registrar o acesso: " + mErr.message }, 500);
    return json({ ok: true, user_id: gen.user.id, link: gen.properties.action_link });
  }

  if (body.action === "link") {
    const userId = String(body.user_id || "");
    if (!userId) return json({ error: "Usuário não informado." }, 400);
    const { data: u, error: uErr } = await admin.auth.admin.getUserById(userId);
    if (uErr || !u?.user?.email) return json({ error: "Usuário não encontrado." }, 404);
    const { data: m } = await admin.from("members").select("active").eq("user_id", userId).maybeSingle();
    if (!m || !m.active) return json({ error: "Este usuário está desativado. Reative antes de enviar um link." }, 400);
    const { data: gen, error } = await admin.auth.admin.generateLink({
      type: "recovery", email: u.user.email, options: { redirectTo: destino(body.redirect_to) },
    });
    if (error || !gen?.properties?.action_link) return json({ error: "Não foi possível gerar o link: " + (error?.message || "erro") }, 400);
    return json({ ok: true, link: gen.properties.action_link });
  }

  if (body.action === "create") {
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const fullName = String(body.full_name || "").trim();
    const isAdmin = body.is_admin === true;
    if (!EMAIL_RE.test(email)) return json({ error: "E-mail inválido." }, 400);
    if (!fullName) return json({ error: "Informe o nome." }, 400);
    if (password.length < 8) return json({ error: "A senha precisa ter pelo menos 8 caracteres." }, 400);

    const { data: created, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: fullName },
    });
    if (error || !created?.user) {
      const msg = /already|registered|exists/i.test(error?.message || "")
        ? "Já existe um usuário com este e-mail."
        : ("Não foi possível criar o usuário: " + (error?.message || "erro"));
      return json({ error: msg }, 400);
    }
    const { error: mErr } = await admin.from("members").upsert({
      user_id: created.user.id, email, full_name: fullName, is_admin: isAdmin, active: true, created_by: callerId,
    });
    if (mErr) return json({ error: "Usuário criado, mas falhou ao registrar o acesso: " + mErr.message }, 500);
    return json({ ok: true, user_id: created.user.id });
  }

  if (body.action === "update") {
    const userId = String(body.user_id || "");
    if (!userId) return json({ error: "Usuário não informado." }, 400);
    const self = userId === callerId;
    if (self && (body.active === false || body.is_admin === false)) {
      return json({ error: "Você não pode desativar nem tirar o próprio acesso de administrador." }, 400);
    }

    const patch: Record<string, unknown> = {};
    if (typeof body.full_name === "string" && body.full_name.trim()) patch.full_name = body.full_name.trim();
    if (typeof body.is_admin === "boolean") patch.is_admin = body.is_admin;
    if (typeof body.active === "boolean") patch.active = body.active;

    const authPatch: Record<string, unknown> = {};
    if (typeof body.password === "string" && body.password) {
      if (body.password.length < 8) return json({ error: "A senha precisa ter pelo menos 8 caracteres." }, 400);
      authPatch.password = body.password;
    }
    if (typeof body.active === "boolean") authPatch.ban_duration = body.active ? "none" : "876000h"; // desativado = bloqueado
    if (patch.full_name) authPatch.user_metadata = { full_name: patch.full_name };

    if (Object.keys(authPatch).length) {
      const { error } = await admin.auth.admin.updateUserById(userId, authPatch);
      if (error) return json({ error: "Não foi possível atualizar: " + error.message }, 400);
    }
    if (Object.keys(patch).length) {
      const { error } = await admin.from("members").update(patch).eq("user_id", userId);
      if (error) return json({ error: "Não foi possível atualizar: " + error.message }, 400);
    }
    return json({ ok: true });
  }

  return json({ error: "Ação desconhecida." }, 400);
});
