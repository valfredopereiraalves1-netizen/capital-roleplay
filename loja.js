(() => {
  const config = window.CAPITAL_CONFIG || {};
  const feedback = document.getElementById("storeFeedback");
  const loginButton = document.getElementById("discordLogin");
  const logoutButton = document.getElementById("discordLogout");
  const name = document.getElementById("accountName");
  const status = document.getElementById("accountStatus");
  const avatar = document.getElementById("accountAvatar");
  const productGrid = document.getElementById("productGrid");
  if (!window.supabase || !config.supabaseUrl || !config.supabaseAnonKey) {
    feedback.textContent = "O login está temporariamente indisponível. Tente novamente mais tarde.";
    loginButton.disabled = true;
    return;
  }
  const db = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  const redirectTo = "https://valfredopereiraalves1-netizen.github.io/capital-roleplay/loja.html";
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
    const identity = (user.identities || []).find(item => item.provider === "discord");
    const profile = identity?.identity_data || user.user_metadata || {};
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
      feedback.textContent = "Não foi possível iniciar o login. Verifique a configuração do Discord e tente novamente.";
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
  const products = Array.isArray(window.CAPITAL_PRODUCTS) ? window.CAPITAL_PRODUCTS : [];
  function renderProducts() {
    productGrid.replaceChildren();
    products.forEach(product => {
      const card = document.createElement("article");
      card.className = "store-card";
      const category = document.createElement("span");
      category.className = "store-category";
      category.textContent = product.category || "Capital Roleplay";
      const title = document.createElement("h2");
      title.textContent = product.name || "Produto";
      const description = document.createElement("p");
      description.textContent = product.description || "Consulte os detalhes com a equipe.";
      const price = document.createElement("strong");
      price.className = "store-price";
      price.textContent = product.price || "Valor a confirmar";
      const buy = document.createElement("button");
      buy.className = "store-button";
      buy.type = "button";
      buy.textContent = "Ver produtos para comprar";
      buy.addEventListener("click", async () => {
        const { data: { session }, error: sessionError } = await db.auth.getSession();
        if (sessionError || !session) {
          feedback.textContent = "Entre com sua conta Discord antes de iniciar uma compra.";
          return;
        }
        buy.disabled = true;
        feedback.textContent = "Enviando sua solicitação e preparando o ticket privado…";
        try {
          const { data, error } = await db.functions.invoke("open-purchase-ticket", {
            body: {
              productName: product.name,
              category: product.category || "Capital Roleplay",
              price: product.price || "A confirmar"
            }
          });
          if (error) throw error;
          feedback.textContent = data?.message || "Solicitação enviada. O ticket será criado no Discord em instantes.";
        } catch (error) {
          console.error("Falha ao abrir ticket de compra:", error);
          feedback.textContent = "Não foi possível abrir o ticket agora. A integração do Discord precisa estar configurada; tente novamente mais tarde.";
        } finally {
          buy.disabled = false;
        }
      });
      card.append(category, title, description, price, buy);
      productGrid.append(card);
    });
    if (!products.length) {
      const empty = document.createElement("p");
      empty.className = "store-feedback";
      empty.textContent = "Nenhuma oferta cadastrada no momento.";
      productGrid.append(empty);
    }
  }
  renderProducts();
  db.auth.onAuthStateChange(() => refreshAccount());
  refreshAccount();
})();