(() => {
  const config = window.CAPITAL_CONFIG || {};
  const form = document.getElementById("applicationForm");
  const feedback = document.getElementById("formFeedback");
  if (!form || !feedback) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase) {
      feedback.textContent = "Formulário temporariamente indisponível. Tente novamente mais tarde.";
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const values = Object.fromEntries(new FormData(form).entries());
    const payload = {
      roblox_username: String(values.roblox_username || "").trim(),
      discord_tag: String(values.discord_tag || "").trim(),
      department: String(values.department || "").trim(),
      reason: String(values.reason || "").trim()
    };

    button.disabled = true;
    feedback.textContent = "Enviando inscrição…";

    try {
      const db = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
      const { error: saveError } = await db.from("applications").insert({
        ...payload,
        discord_tag: payload.discord_tag || null
      });
      if (saveError) throw new Error("SAVE: " + saveError.message);

      feedback.textContent = "Inscrição salva. Avisando a administração…";

      const response = await fetch(config.supabaseUrl + "/functions/v1/submit-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": config.supabaseAnonKey,
          "Authorization": "Bearer " + config.supabaseAnonKey
        },
        body: JSON.stringify(payload),
        cache: "no-store"
      });

      let result = {};
      try { result = await response.json(); } catch (_) {}
      if (!response.ok || result.ok !== true) {
        throw new Error("NOTIFY: " + (result.error || ("HTTP " + response.status)));
      }

      form.reset();
      feedback.textContent = "Inscrição recebida! A administração foi avisada pelo Discord.";
    } catch (error) {
      console.error("Capital Roleplay registration:", error);
      const message = String(error && error.message || "");
      if (message.startsWith("SAVE:")) {
        feedback.textContent = "Não foi possível salvar a inscrição. Confira os dados e tente novamente.";
      } else {
        feedback.textContent = "Inscrição salva, mas o aviso no Discord falhou. A administração precisa verificar a integração.";
      }
    } finally {
      button.disabled = false;
    }
  });
})();
