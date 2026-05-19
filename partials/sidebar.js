document.addEventListener('DOMContentLoaded', function () {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const a11yToggle = document.getElementById('a11yToggle');
  const a11yOverlay = document.getElementById('a11yOverlay');
  const a11yClose = document.getElementById('a11yClose');

  // active link
  const links = document.querySelectorAll('.sidebar-link');
  links.forEach(l => {
    if (l.getAttribute('href') === '/' + location.pathname.split('/')[1]) {
      l.classList.add('active');
    }
  });

  // sidebar open/close
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

  // accessibility modal open/close
  a11yToggle.addEventListener('click', () => {
    a11yOverlay.classList.add('open');
  });

  a11yClose.addEventListener('click', () => {
    a11yOverlay.classList.remove('open');
  });

  a11yOverlay.addEventListener('click', (e) => {
    if (e.target === a11yOverlay) a11yOverlay.classList.remove('open');
  });

  // apply saved prefs on load
  applyA11y('bg',   localStorage.getItem('a11y-bg')   || 'on');
  applyA11y('font', localStorage.getItem('a11y-font') || 'default');
  applyA11y('size', localStorage.getItem('a11y-size') || 'default');

  // pill clicks
  document.querySelectorAll('.a11y-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const val = btn.dataset.val;
      localStorage.setItem('a11y-' + key, val);
      applyA11y(key, val);
    });
  });

  function applyA11y(key, val) {
    // update active pill highlight
    document.querySelectorAll(`.a11y-pill[data-key="${key}"]`).forEach(b => {
      b.classList.toggle('active', b.dataset.val === val);
    });

    if (key === 'bg') {
      document.body.classList.toggle('no-bg', val === 'off');
    }

    if (key === 'font') {
      document.body.classList.toggle('dyslexic-font', val === 'dyslexic');
    }

    if (key === 'size') {
      document.documentElement.classList.remove('font-small', 'font-large');
      if (val !== 'default') document.documentElement.classList.add('font-' + val);
    }
  }
});
