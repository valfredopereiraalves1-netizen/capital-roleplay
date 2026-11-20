/* Capital Roleplay — navegação móvel compartilhada */
(() => {
  const init = () => {
    const header = document.querySelector('.site-header');
    const button = document.getElementById('menuToggle');
    const nav = document.getElementById('navigation');
    if (!header || !button || !nav || button.dataset.menuReady === 'true') return;
    button.dataset.menuReady = 'true';
    const close = () => {
      nav.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Abrir menu');
    };
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const opening = !nav.classList.contains('open');
      nav.classList.toggle('open', opening);
      button.setAttribute('aria-expanded', String(opening));
      button.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { close(); button.focus(); }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 680) close();
    }, {passive:true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
