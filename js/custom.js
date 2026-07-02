/**
 * Cinder's Notebook — interaction layer
 * Progressive enhancement: the blog remains readable if JavaScript is disabled.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var isHome = Boolean(document.querySelector('.home-intro'));
  var isPost = Boolean(document.querySelector('.post-content .markdown-body'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  body.dataset.pageType = isHome ? 'index' : isPost ? 'post' : 'page';

  function showToast(message) {
    var toast = document.querySelector('.ui-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'ui-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 1800);
  }

  function updateScrollUI() {
    var navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.classList.toggle('is-scrolled', window.scrollY > 24);
    }

    var progress = document.getElementById('reading-progress');
    if (progress) {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progress.style.width = Math.min(100, Math.max(0, percentage)) + '%';
    }
  }

  var scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        updateScrollUI();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
  updateScrollUI();

  // Mark the current navigation item.
  var currentPath = window.location.pathname.replace(/index\.html$/, '');
  document.querySelectorAll('#navbarSupportedContent .nav-item > a[href]').forEach(function (link) {
    var linkPath;
    try {
      linkPath = new URL(link.href, window.location.origin).pathname.replace(/index\.html$/, '');
    } catch (error) {
      return;
    }

    var isRoot = linkPath === '/' && currentPath === '/';
    var isSection = linkPath !== '/' && currentPath.indexOf(linkPath) === 0;
    if (isRoot || isSection) {
      link.parentElement.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  function openSearch() {
    var modal = document.getElementById('modalSearch');
    if (!modal || typeof window.jQuery === 'undefined') return;
    window.jQuery(modal).modal('show');
    window.setTimeout(function () {
      var input = document.getElementById('local-search-input');
      if (input) input.focus();
    }, 320);
  }

  document.querySelectorAll('.js-open-search').forEach(function (button) {
    button.addEventListener('click', openSearch);
  });

  // "/" opens search, Escape closes it. Inputs keep their normal typing behavior.
  document.addEventListener('keydown', function (event) {
    var activeTag = document.activeElement && document.activeElement.tagName;
    var isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';
    if (event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      openSearch();
    }
  });

  // Reader font controls are saved for the next article.
  var article = document.querySelector('.markdown-body');
  var fontKey = 'cinder-reader-font-size';
  var storedFontSize = Number(window.localStorage.getItem(fontKey));
  var fontSize = storedFontSize >= 15 && storedFontSize <= 23 ? storedFontSize : 18;

  function applyFontSize(value, shouldNotify) {
    fontSize = Math.min(23, Math.max(15, value));
    root.style.setProperty('--reader-font-size', fontSize + 'px');
    window.localStorage.setItem(fontKey, String(fontSize));
    if (shouldNotify) showToast('正文字号：' + fontSize + 'px');
  }

  if (article) applyFontSize(fontSize, false);

  document.querySelectorAll('[data-font-action]').forEach(function (button) {
    button.addEventListener('click', function () {
      var action = button.dataset.fontAction;
      if (action === 'increase') applyFontSize(fontSize + 1, true);
      if (action === 'decrease') applyFontSize(fontSize - 1, true);
      if (action === 'reset') applyFontSize(18, true);
    });
  });

  document.querySelectorAll('[data-copy-link]').forEach(function (button) {
    button.addEventListener('click', function () {
      var url = window.location.href.split('#')[0];
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(function () {
          showToast('文章链接已复制');
        });
      } else {
        var helper = document.createElement('textarea');
        helper.value = url;
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        helper.remove();
        showToast('文章链接已复制');
      }
    });
  });

  // External links open safely in a new tab.
  document.querySelectorAll('.markdown-body a[href^="http"]').forEach(function (link) {
    if (link.hostname !== window.location.hostname) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  });

  // A restrained entrance animation for post rows.
  var cards = document.querySelectorAll('.index-card');
  if (cards.length && !reduceMotion && 'IntersectionObserver' in window) {
    cards.forEach(function (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var card = entry.target;
        card.animate([
          { opacity: 0, transform: 'translateY(16px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 520,
          easing: 'cubic-bezier(.2,.7,.2,1)',
          fill: 'forwards'
        });
        observer.unobserve(card);
      });
    }, { threshold: 0.08 });

    cards.forEach(function (card) {
      observer.observe(card);
    });
  }

  document.querySelectorAll('.footer-backtop').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
})();
