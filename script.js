(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function t(key, fallback) {
    if (window.I18N && typeof window.I18N.get === 'function') {
      var v = window.I18N.get(key);
      if (v && v !== key) return v;
    }
    return fallback;
  }

  /* ---- mobile navigation ---- */
  var burger = document.querySelector('.burger');
  var panel = document.querySelector('.mobile-panel');
  if (burger && panel) {
    burger.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', t(open ? 'menu_close' : 'menu_open', open ? 'Menü schliessen' : 'Menü öffnen'));
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        panel.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', t('menu_open', 'Menü öffnen'));
      });
    });
  }

  /* ---- active nav link ----
     Links are relative so the site works at a domain root and under a
     project subpath, so compare the last path segment of each href with
     the last segment of the current pathname. */
  function pageName(path) {
    var last = path.split('/').pop();
    return (last === '' || last === '.' || last === '..') ? 'index.html' : last;
  }
  var here = pageName(window.location.pathname);
  document.querySelectorAll('.nav a, .mobile-panel a').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href.split('#')[0].indexOf(':') !== -1) return; // mailto:, http(s):
    if (pageName(href.split('#')[0]) === here) {
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

  /* ---- language switcher ---- */
  document.querySelectorAll('.lang-switch button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (window.I18N && typeof window.I18N.setLanguage === 'function') {
        window.I18N.setLanguage(btn.getAttribute('data-lang'));
      }
    });
  });

  /* ---- copy to clipboard ---- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        var original = btn.textContent;
        btn.textContent = t('copy_done', 'Kopiert!');
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

  /* ---- newsletter form ----
     Wire it up by setting window.SEET_NEWSLETTER_ENDPOINT (in the page
     head) or a data-endpoint attribute on the form to any URL that
     accepts a POST (Formspree, Buttondown, Mailchimp, …). Without an
     endpoint the form falls back to an email link so visitors still have
     a way to subscribe. */
  var form = document.getElementById('newsletter-form');
  if (form) {
    var msg = document.getElementById('form-message');
    var endpoint = form.getAttribute('data-endpoint') || window.SEET_NEWSLETTER_ENDPOINT || '';

    function showMessage(html) {
      if (!msg) return;
      form.style.display = 'none';
      msg.style.display = 'block';
      msg.innerHTML = html;
      setTimeout(function () {
        form.reset();
        form.style.display = 'flex';
        msg.style.display = 'none';
      }, 6000);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('input[name="name"]');
      var email = form.querySelector('input[name="email"]');
      if (!name.value.trim() || !email.value.trim()) return;

      if (!endpoint) {
        showMessage(t('newsletter_hint',
          'Für den Newsletter schreib uns einfach: <a href="mailto:communication@seet.ch">communication@seet.ch</a>'));
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          showMessage(t('newsletter_ok', 'Vielen Dank! Du erhältst in Kürze eine Bestätigungsmail.'));
        })
        .catch(function () {
          showMessage(t('newsletter_fail',
            'Das hat leider nicht geklappt — schreib uns an <a href="mailto:communication@seet.ch">communication@seet.ch</a>.'));
        })
        .then(function () {
          if (button) button.disabled = false;
        });
    });
  }

  /* ---- scroll progress indicator (rAF-throttled) ---- */
  var scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  document.body.appendChild(scrollProgress);

  var progressTicking = false;
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var percentage = max > 0 ? (window.scrollY / max) * 100 : 0;
    scrollProgress.style.width = percentage + '%';
    progressTicking = false;
  }
  window.addEventListener('scroll', function () {
    if (progressTicking) return;
    progressTicking = true;
    requestAnimationFrame(updateProgress);
  }, { passive: true });

  /* ---- smooth scroll for in-page anchors ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;
      var target;
      try {
        target = document.querySelector(href);
      } catch (err) {
        return;
      }
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      if (history.replaceState) history.replaceState(null, '', href);
    });
  });

  /* ---- reduced motion hint for CSS ---- */
  if (reduceMotion) {
    document.documentElement.setAttribute('data-reduced-motion', 'true');
  }
})();
