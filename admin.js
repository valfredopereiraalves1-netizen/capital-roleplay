(() => {
  const cfg = window.CAPITAL_CONFIG || {};
  const ready = cfg.supabaseUrl && cfg.supabaseAnonKey && !cfg.supabaseAnonKey.includes("COLE_AQUI");
  const db = ready && window.supabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
  const feedback = document.getElementById("loginFeedback");
  const dashboard = document.getElementById("dashboard");
  const form = document.getElementById("loginForm");
  const say = (id, message) => { document.getElementById(id).textContent = message; };

  async function checkAdmin() {
    if (!db) return;
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;
    const { data, error } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (error || !data) { await db.auth.signOut(); feedback.textContent = "Esta conta não possui autorização administrativa."; return; }
    form.hidden = true; dashboard.hidden = false; loadApplications();
  }
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!db) { feedback.textContent = "Configure a chave anon/public em config.js antes de entrar."; return; }
    const values = Object.fromEntries(new FormData(form).entries());
    feedback.textContent = "Verificando acesso...";
    const { error } = await db.auth.signInWithPassword(values);
    if (error) { feedback.textContent = "Não foi possível entrar. Confira suas credenciais."; return; }
    await checkAdmin();
  });
  async function loadApplications() {
    const list = document.getElementById("applicationList");
    const { data, error } = await db.from("applications").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) { list.textContent = "Não foi possível carregar as inscrições."; return; }
    if (!data.length) { list.textContent = "Nenhuma inscrição recebida ainda."; return; }
    list.replaceChildren(...data.map(item => {
      const card = document.createElement("article"); card.className = "announcement-item";
      const title = document.createElement("h3"); title.textContent = item.roblox_username + " — " + item.department;
      const body = document.createElement("p"); body.textContent = item.reason;
      const meta = document.createElement("p"); meta.textContent = "Discord: " + (item.discord_tag || "Não informado") + " • Status: " + item.status;
      const actions = document.createElement("div"); actions.style.cssText = "display:flex;gap:10px;margin-top:15px;flex-wrap:wrap";
      ["Aprovada","Recusada","Pendente"].forEach(status => {
        const btn = document.createElement("button"); btn.className = "button"; btn.style.cssText = "background:#28241b;color:#e7ca8b;padding:9px 12px"; btn.textContent = status;
        btn.addEventListener("click", async () => { const { error } = await db.from("applications").update({status}).eq("id", item.id); if (error) alert("Não foi possível atualizar. Verifique as políticas RLS."); else loadApplications(); });
        actions.append(btn);
      });
      card.append(title, body, meta, actions); return card;
    }));
  }
  document.getElementById("announcementForm").addEventListener("submit", async e => {
    e.preventDefault(); const values = Object.fromEntries(new FormData(e.currentTarget).entries());
    const { error } = await db.from("announcements").insert({...values, published:true});
    say("adminFeedback", error ? "Falha ao publicar. Verifique as permissões do banco." : "Comunicado publicado com sucesso.");
    if (!error) e.currentTarget.reset();
  });
  document.getElementById("logoutButton").addEventListener("click", async () => { await db.auth.signOut(); location.reload(); });
  checkAdmin();
})();