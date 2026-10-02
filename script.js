(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- mobile navigation ---- */
  var burger = document.querySelector('.burger');
  var panel = document.querySelector('.mobile-panel');
  if (burger && panel) {
    burger.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        panel.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- active nav link ---- */
  var here = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('.nav a, .mobile-panel a').forEach(function (a) {
    var target = a.getAttribute('href').split('#')[0].replace(/\/$/, '');
    if (target === here || (here === '/' && target === '/index.html')) {
      a.classList.add('active');
    }
  });

  /* ---- scroll reveal with stagger ---- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.classList.add('in');
          }, index * 40);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---- count-up ---- */
  var counters = document.querySelectorAll('[data-count]');
  function setFinal(el) {
    el.textContent = Number(el.dataset.count).toLocaleString('de-CH');
  }
  if (reduceMotion || !('IntersectionObserver' in window)) {
    counters.forEach(setFinal);
  } else {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        cio.unobserve(el);
        var target = Number(el.dataset.count);
        var start = null;
        var duration = 1200;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('de-CH');
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- language switcher (pages without their own inline handler) ---- */
  if (!window.__seetLangBound) {
    document.querySelectorAll('.lang-switch button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.getAttribute('data-lang');
        if (window.I18N && typeof window.I18N.setLanguage === 'function') {
          window.I18N.setLanguage(lang);
        }
      });
    });
  }

  /* ---- copy to clipboard ---- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        var original = btn.textContent;
        btn.textContent = 'Kopiert!';
        setTimeout(function () { btn.textContent = original; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  });

  /* ---- newsletter form ---- */
  var form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('input[name="name"]').value;
      var email = form.querySelector('input[name="email"]').value;
      var msg = document.getElementById('form-message');

      if (!name || !email) return;

      form.style.display = 'none';
      msg.style.display = 'block';
      msg.textContent = 'Vielen Dank! Du erhältst in Kürze eine Bestätigungsmail.';
      setTimeout(function () {
        form.reset();
        form.style.display = 'flex';
        msg.style.display = 'none';
      }, 3000);
    });
  }
})();
