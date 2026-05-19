document.addEventListener('DOMContentLoaded', function () {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');

  // active link
  const links = document.querySelectorAll('.sidebar-link');
  links.forEach(l => {
    if (l.getAttribute('href') === '/' + location.pathname.split('/')[1]) {
      l.classList.add('active');
    }
  });

  // sidebar open/close — starts open, toggle closes/opens
  const savedOpen = localStorage.getItem('sidebarOpen');
  if (savedOpen === 'false') {
    sidebar.classList.remove('open');
    toggle.classList.remove('shifted');
  } else {
    sidebar.classList.add('open');
    toggle.classList.add('shifted');
  }

  toggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    toggle.classList.toggle('shifted', open);
    localStorage.setItem('sidebarOpen', open);
  });

  // theme
  const saved = localStorage.getItem('theme') || 'mocha';
  applyTheme(saved);

  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'latte' ? 'mocha' : 'latte';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    themeLabel.textContent = t;
  }
});
