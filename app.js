(() => {
  const cfg = window.CAPITAL_CONFIG || {};
  const ready = cfg.supabaseUrl && cfg.supabaseAnonKey && !cfg.supabaseAnonKey.includes("COLE_AQUI");
  const client = ready && window.supabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
  const feedback = document.getElementById("formFeedback");

  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("navigation")?.classList.toggle("open");
  });
  document.querySelectorAll("#navigation a").forEach(a => a.addEventListener("click", () => document.getElementById("navigation").classList.remove("open")));

  async function loadAnnouncements() {
    const list = document.getElementById("announcementList");
    if (!client) return;
    const { data, error } = await client.from("announcements").select("title,body,created_at").eq("published", true).order("created_at", { ascending: false }).limit(10);
    if (error || !data?.length) return;
    list.replaceChildren(...data.map(item => {
      const article = document.createElement("article"); article.className = "announcement-item";
      const title = document.createElement("h3"); title.textContent = item.title;
      const date = document.createElement("time"); date.textContent = new Date(item.created_at).toLocaleDateString("pt-BR");
      const body = document.createElement("p"); body.textContent = item.body;
      article.append(date, title, body); return article;
    }));
  }

  document.getElementById("applicationForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!client) { feedback.textContent = "O formulário está aguardando a configuração da chave pública do Supabase."; return; }
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    values.discord_tag = values.discord_tag || null;
    feedback.textContent = "Enviando inscrição...";
    const { error } = await client.from("applications").insert(values);
    if (error) { feedback.textContent = "Não foi possível enviar agora. Verifique os campos e tente novamente."; return; }
    form.reset(); feedback.textContent = "Inscrição enviada! Obrigado pelo interesse na Capital Roleplay.";
  });
  loadAnnouncements();
})();