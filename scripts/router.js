export function setupRouter() {
  const render = () => {
    const hash = window.location.hash.slice(1) || 'home';
    document.querySelectorAll('[data-view]').forEach(el => {
      el.style.display = el.id === hash ? 'block' : 'none';
    });
  };

  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', render);

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const href = a.getAttribute('href');
      if (href) window.location.hash = href;
    });
  });

  render();
}
