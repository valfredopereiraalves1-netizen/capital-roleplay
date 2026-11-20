(() => {
  const config = window.CAPITAL_CONFIG || {};
  const feedback = document.getElementById("storeFeedback");
  const loginButton = document.getElementById("discordLogin");
  const logoutButton = document.getElementById("discordLogout");
  const name = document.getElementById("accountName");
  const status = document.getElementById("accountStatus");
  const avatar = document.getElementById("accountAvatar");
  if (!window.supabase || !config.supabaseUrl || !config.supabaseAnonKey) {
    feedback.textContent = "O login está temporariamente indisponível. Tente novamente mais tarde.";
    loginButton.disabled = true;
    return;
  }
  const db = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  const redirectTo = window.location.origin + window.location.pathname;
  async function refreshAccount() {
    const { data: { session }, error } = await db.auth.getSession();
    if (error) feedback.textContent = "Não foi possível verificar sua sessão. Atualize a página.";
    const user = session?.user;
    if (!user) {
      name.textContent = "Você ainda não entrou";
      status.textContent = "Entre com Discord para continuar.";
      avatar.hidden = true;
      loginButton.hidden = false;
      logoutButton.hidden = true;
      return;
    }
    const discordIdentity = (user.identities || []).find(item => item.provider === "discord");
    const profile = discordIdentity?.identity_data || user.user_metadata || {};
    name.textContent = profile.global_name || profile.full_name || profile.name || profile.username || "Conta conectada";
    status.textContent = "Discord conectado · login confirmado";
    if (profile.avatar_url || profile.picture) {
      avatar.src = profile.avatar_url || profile.picture;
      avatar.hidden = false;
    }
    loginButton.hidden = true;
    logoutButton.hidden = false;
  }
  loginButton.addEventListener("click", async () => {
    loginButton.disabled = true;
    feedback.textContent = "Abrindo a autenticação segura do Discord…";
    const { error } = await db.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo, scopes: "identify" }
    });
    if (error) {
      feedback.textContent = "Não foi possível iniciar o login: " + error.message;
      loginButton.disabled = false;
    }
  });
  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    const { error } = await db.auth.signOut();
    feedback.textContent = error ? "Não foi possível sair da conta." : "Você saiu da sua conta Discord.";
    logoutButton.disabled = false;
    await refreshAccount();
  });
  db.auth.onAuthStateChange(() => refreshAccount());
  refreshAccount();
})();