// Configuração do Supabase.
// Os dois valores abaixo são PÚBLICOS: vão para o navegador de todo usuário.
// Quem protege os dados são as regras de acesso (RLS) de supabase/migrations/001_schema.sql.
// Onde achar: painel do Supabase > Project Settings > API (Project URL e chave "anon" / "publishable").
// NUNCA coloque aqui a chave "service_role".
window.APP_CONFIG = {
  SUPABASE_URL: 'https://zitxglgcizmqnkxhttac.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_igbTqSugdVWlcwWj-wSIpQ_daWxk69C'
};
