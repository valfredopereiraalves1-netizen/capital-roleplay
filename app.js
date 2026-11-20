(() => {
  const config = window.CAPITAL_CONFIG || {};
  const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey && !config.supabaseAnonKey.includes("COLE_AQUI"));
  const db = configured && window.supabase ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
  const form = document.getElementById("applicationForm");
  const feedback = document.getElementById("formFeedback");

  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!db) {
      feedback.textContent = "O formulário está temporariamente indisponível. Tente novamente mais tarde.";
      return;
    }
    const submit = form.querySelector('button[type="submit"]');
    const values = Object.fromEntries(new FormData(form).entries());
    values.discord_tag = values.discord_tag || null;
    submit.disabled = true;
    feedback.textContent = "Enviando inscrição…";
    try {
      const { error } = await db.from("applications").insert(values);
      if (error) throw error;
      form.reset();
      feedback.textContent = "Inscrição recebida. A equipe responsável fará a análise.";
    } catch (error) {
      feedback.textContent = "Não foi possível enviar sua inscrição. Confira os dados e tente novamente.";
    } finally {
      submit.disabled = false;
    }
  });
})();