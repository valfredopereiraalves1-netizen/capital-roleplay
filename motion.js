/* Capital Roleplay — animações de entrada e navegação */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  if (reduceMotion) return;
  document.body.classList.add('motion-ready');
  const selectors = [
    '.hero-copy', '.page-heading', '.section-heading', '.about-lead',
    '.about-grid > div', '.feature-link', '.department-row',
    '.announcement-item', '.form-intro', '.form-card', '.admin-card',
    '.dashboard-heading', '.admin-publish'
  ];
  const elements = [...new Set(selectors.flatMap(selector => [...document.querySelectorAll(selector)]))];
  elements.forEach((element, index) => {
    element.classList.add('motion-reveal');
    if (element.matches('.hero-copy')) element.classList.add('motion-hero');
    element.style.setProperty('--motion-delay', `${Math.min(index % 6, 5) * 75}ms`);
  });
  if (!('IntersectionObserver' in window)) {
    elements.forEach(element => element.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  elements.forEach(element => observer.observe(element));
})();