(() => {
  const config = window.CAPITAL_CONFIG || {};
  const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey && !config.supabaseAnonKey.includes("COLE_AQUI"));
  const db = configured && window.supabase ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
  const feedback = document.getElementById("loginFeedback");
  const dashboard = document.getElementById("dashboard");
  const form = document.getElementById("loginForm");
  const say = (id, message) => {
    const target = document.getElementById(id);
    if (target) target.textContent = message;
  };

  if (!form || !dashboard) return;

  async function checkAdmin() {
    if (!db) return;
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;
    const { data, error } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (error || !data) {
      await db.auth.signOut();
      feedback.textContent = "Esta conta não possui autorização administrativa.";
      return;
    }
    form.hidden = true;
    dashboard.hidden = false;
    await loadApplications();
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!db) {
      feedback.textContent = "O acesso administrativo está indisponível no momento.";
      return;
    }
    const submit = form.querySelector('button[type="submit"]');
    const values = Object.fromEntries(new FormData(form).entries());
    submit.disabled = true;
    feedback.textContent = "Verificando acesso…";
    const { error } = await db.auth.signInWithPassword(values);
    submit.disabled = false;
    if (error) {
      feedback.textContent = "Não foi possível entrar. Confira suas credenciais.";
      return;
    }
    await checkAdmin();
  });

  async function loadApplications() {
    const list = document.getElementById("applicationList");
    if (!db || !list) return;
    const { data, error } = await db.from("applications").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) {
      list.textContent = "Não foi possível carregar as inscrições.";
      return;
    }
    if (!data?.length) {
      list.textContent = "Nenhuma inscrição recebida.";
      return;
    }
    list.replaceChildren(...data.map(item => {
      const card = document.createElement("article");
      card.className = "announcement-item";
      const title = document.createElement("h3");
      title.textContent = item.roblox_username + " — " + item.department;
      const reason = document.createElement("p");
      reason.textContent = item.reason;
      const meta = document.createElement("p");
      meta.textContent = "Discord: " + (item.discord_tag || "Não informado") + " · Situação: " + (item.status || "Pendente");
      const actions = document.createElement("div");
      ["Aprovada", "Recusada", "Pendente"].forEach(status => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "button secondary";
        button.textContent = status;
        button.addEventListener("click", async () => {
          button.disabled = true;
          const { error: updateError } = await db.from("applications").update({ status }).eq("id", item.id);
          if (updateError) {
            button.disabled = false;
            say("adminFeedback", "Não foi possível atualizar a inscrição. Verifique as permissões do banco.");
          } else {
            await loadApplications();
          }
        });
        actions.append(button);
      });
      card.append(title, reason, meta, actions);
      return card;
    }));
  }

  const announcementForm = document.getElementById("announcementForm");
  announcementForm?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!db) return;
    const submit = announcementForm.querySelector('button[type="submit"]');
    const values = Object.fromEntries(new FormData(announcementForm).entries());
    submit.disabled = true;
    say("adminFeedback", "Publicando comunicado…");
    const { error } = await db.from("announcements").insert({ ...values, published: true });
    submit.disabled = false;
    say("adminFeedback", error ? "Não foi possível publicar. Verifique as permissões do banco." : "Comunicado publicado.");
    if (!error) announcementForm.reset();
  });

  document.getElementById("logoutButton")?.addEventListener("click", async () => {
    if (db) await db.auth.signOut();
    window.location.reload();
  });

  checkAdmin();
})();