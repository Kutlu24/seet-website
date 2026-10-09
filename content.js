// CMS content — fetched from content/*.json (edited via /admin/)
//   content/site.json  homepage texts, stats, application link, team, gallery
//   content/blog.json  blog cards
//   content/faq.json   FAQ sections
// Each block falls back silently to the static markup / i18n.json when its
// file is missing. Runs after i18n is ready so the translation pass can never
// overwrite CMS edits, and rebuilds on every language switch.
(function () {
  function siteUrl(path) {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src') || '';
      if (/(^|\/)content\.js(\?|$)/.test(src)) {
        return src.replace(/content\.js(\?.*)?$/, '') + path.replace(/^\//, '');
      }
    }
    return path;
  }

  // Path prefix of the deployment, without the origin: "/seet-website/" on
  // GitHub Pages, "/" (or "" for a relative script) on a root deployment.
  var SITE_BASE = (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src') || '';
      if (/(^|\/)content\.js(\?|$)/.test(src)) {
        return src.replace(/content\.js(\?.*)?$/, '').replace(/^[a-z]+:\/\/[^/]+/, '');
      }
    }
    var base = document.querySelector('base[href]');
    if (base) return base.getAttribute('href').replace(/^[a-z]+:\/\/[^/]+/, '');
    return '';
  })();

  // The CMS stores media paths as site-rooted ("/img/…", or "/seet-website/
  // img/…" for uploads), which resolves to a 404 when the site is served from
  // a subpath. Re-root every media path at the current deployment instead.
  function resolvePath(path) {
    if (!path) return path;
    if (/^(https?:)?\/\//.test(path) || path.indexOf('data:') === 0) return path;
    var p = path.charAt(0) === '/' ? path : '/' + path;
    if (SITE_BASE && p.indexOf(SITE_BASE) === 0) return p;
    return SITE_BASE + p.slice(1);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isSafeUrl(url) {
    if (!url) return false;
    var u = String(url).trim();
    if (/^(https?:|mailto:|tel:)/i.test(u)) return true;
    return !/^[a-z][a-z0-9+.\-]*:/i.test(u) && u.indexOf('//') !== 0;
  }

  function lang() {
    return (window.I18N && typeof I18N.getLang === 'function') ? I18N.getLang() : 'de';
  }

  // de / en / fr triple as stored by the CMS, with the German text as fallback.
  function pick(de, en, fr) {
    var l = lang();
    if (l === 'en' && en) return en;
    if (l === 'fr' && fr) return fr;
    return de;
  }

  function observeReveal(container) {
    var nodes = container.querySelectorAll('.reveal');
    if (!window.IntersectionObserver) {
      Array.prototype.forEach.call(nodes, function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(nodes, function (el) { io.observe(el); });
  }

  function picture(src, webp, alt, extra) {
    return '<picture>'
      + (webp ? '<source type="image/webp" srcset="' + esc(resolvePath(webp)) + '">' : '')
      + '<img src="' + esc(resolvePath(src)) + '" alt="' + esc(alt) + '"' + (extra || '') + ' loading="lazy">'
      + '</picture>';
  }

  // ---- team (static markup on ueber-uns.html is the fallback) ------------
  function renderTeam(c) {
    var groups = c && c.team_groups;
    var container = document.getElementById('team-groups');
    if (!groups || !groups.length || !container) return;
    var html = '';
    groups.forEach(function (g) {
      html += '<div class="team-group reveal">';
      html += '<h3 data-i18n="' + esc(g.id) + '">' + esc(I18N.get(g.id)) + '</h3><div class="team-grid">';
      (g.members || []).forEach(function (m) {
        var roleAttr = (!m.role && m.role_key) ? ' data-i18n="' + esc(m.role_key) + '"' : '';
        html += '<div class="member">'
          + '<div class="member-photo"><img src="' + esc(resolvePath(m.photo)) + '" alt="' + esc(m.name) + '" loading="lazy"></div>'
          + '<span class="member-name">' + esc(m.name) + '</span>'
          + '<span class="member-role"' + roleAttr + '>'
          + esc(m.role || (m.role_key ? I18N.get(m.role_key) : '')) + '</span>'
          + '</div>';
      });
      html += '</div></div>';
    });
    container.innerHTML = html;
    I18N.setLanguage(I18N.getLang());
    observeReveal(container);
  }

  // ---- gallery (photo strip on the homepage) -----------------------------
  function renderPhotos(c) {
    var host = document.getElementById('photo-strip');
    if (!host || !c || !c.photos || !c.photos.length) return;
    host.innerHTML = c.photos.map(function (p) {
      var cap = pick(p.caption, p.caption_en, p.caption_fr) || '';
      var size = (p.width ? ' width="' + esc(p.width) + '"' : '')
        + (p.height ? ' height="' + esc(p.height) + '"' : '');
      return '<figure class="media media-captioned">'
        + picture(p.image, p.webp, cap, size)
        + '<figcaption>' + esc(cap) + '</figcaption></figure>';
    }).join('');
    observeReveal(host);
  }

  // ---- blog cards --------------------------------------------------------
  function renderBlog() {
    var grid = document.getElementById('blog-grid');
    if (!grid || !blogData || !blogData.posts || !blogData.posts.length) return;
    grid.innerHTML = blogData.posts.map(function (p) {
      var title = pick(p.title, p.title_en, p.title_fr) || '';
      var head = (p.link && isSafeUrl(p.link))
        ? '<h3><a href="' + esc(p.link) + '">' + esc(title) + '</a></h3>'
        : '<h3>' + esc(title) + '</h3>';
      return '<article class="blog-card reveal">'
        + '<div class="blog-thumb">' + picture(p.image, p.webp, title) + '</div>'
        + '<div class="blog-body">'
        + '<span class="blog-date">' + esc(p.date) + '</span>'
        + head
        + '<p class="blog-excerpt">' + esc(pick(p.excerpt, p.excerpt_en, p.excerpt_fr) || '') + '</p>'
        + '</div></article>';
    }).join('');
    observeReveal(grid);
  }

  // ---- FAQ ---------------------------------------------------------------
  var faqOpen = {};

  function bindFaq(host) {
    if (host.__bound) return;
    host.__bound = true;
    host.addEventListener('click', function (e) {
      var el = e.target;
      var q = null;
      while (el && el !== host) {
        if (el.className && String(el.className).indexOf('faq-question') !== -1) { q = el; break; }
        el = el.parentNode;
      }
      if (!q) return;
      q.classList.toggle('open');
      var item = q.parentNode;
      var answer = item.querySelector ? item.querySelector('.faq-answer') : null;
      if (answer) answer.classList.toggle('open');
      var key = item.getAttribute && item.getAttribute('data-key');
      if (key) faqOpen[key] = q.classList.contains('open');
    });
  }

  function renderFaq() {
    var host = document.getElementById('faq-sections');
    if (!host || !faqData || !faqData.sections || !faqData.sections.length) return;
    bindFaq(host);
    host.innerHTML = faqData.sections.map(function (s, si) {
      var html = '<div class="reveal"><h2 class="faq-section-title">'
        + esc(pick(s.title, s.title_en, s.title_fr) || '') + '</h2>';
      (s.items || []).forEach(function (it, ii) {
        var key = si + '-' + ii;
        var open = faqOpen[key] ? ' open' : '';
        html += '<div class="faq-item" data-key="' + esc(key) + '">'
          + '<div class="faq-question' + open + '">'
          + '<span>' + esc(pick(it.q, it.q_en, it.q_fr) || '') + '</span>'
          + '<span class="faq-icon">▼</span></div>'
          + '<div class="faq-answer' + open + '">'
          + '<div class="faq-answer-content">' + esc(pick(it.a, it.a_en, it.a_fr) || '') + '</div>'
          + '</div></div>';
      });
      return html + '</div>';
    }).join('');
    observeReveal(host);
  }


  // ---- application block: closes itself after c.apply_until (Europe/Zurich) --
  function zurichToday() {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(new Date()); }
    catch (e) { return new Date().toISOString().slice(0, 10); }
  }

  function applyExpiry(c) {
    if (!c || !c.apply_until || zurichToday() <= c.apply_until) return;
    var swap = { apply_status: 'apply_closed_status', apply_title: 'apply_closed_title', apply_desc: 'apply_closed_desc' };
    Object.keys(swap).forEach(function (key) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-i18n="' + key + '"]'), function (el) {
        el.setAttribute('data-i18n', swap[key]);
      });
    });
    ['.apply-deadline', '.apply-qr', 'a[data-i18n="apply_btn"]'].forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { el.hidden = true; });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.apply-status'), function (el) { el.classList.add('is-closed'); });
    if (window.I18N) I18N.setLanguage(I18N.getLang());
  }

  // ---- newsletter: with a Notion form link configured, the inline form becomes a button
  function renderNewsletter(c) {
    var form = document.getElementById('newsletter-form');
    if (!form || !c || !c.newsletter_url || !isSafeUrl(c.newsletter_url) || form.__notion) return;
    form.__notion = true;
    var btn = form.querySelector('button[type="submit"]');
    Array.prototype.forEach.call(form.querySelectorAll('input'), function (i) { i.hidden = true; });
    if (btn) btn.hidden = true;
    var a = document.createElement('a');
    a.className = 'btn btn-primary';
    a.href = c.newsletter_url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('data-i18n', 'newsletter_btn');
    a.textContent = I18N.get('newsletter_btn') || 'Newsletter';
    form.insertBefore(a, form.firstChild);
    form.addEventListener('submit', function (e) { e.preventDefault(); }, true);
  }

  // ---- homepage texts, stats, application link ---------------------------
  function apply(c) {
    // Texts: hand them to the i18n layer so language switches keep them.
    if (window.I18N && typeof I18N.setCmsTexts === 'function') {
      I18N.setCmsTexts(c.texts || {});
      I18N.setLanguage(I18N.getLang());
    }

    // Stats
    var nums = document.querySelectorAll('.stats .num');
    Array.prototype.forEach.call(nums, function (num, i) {
      var s = (c.stats || [])[i];
      if (!s || s.value === undefined || s.value === null) return;
      num.setAttribute('data-count', s.value);
      num.textContent = s.value;
    });

    // Application link
    if (c.apply_url && isSafeUrl(c.apply_url)) {
      Array.prototype.forEach.call(document.querySelectorAll('a[data-i18n="apply_btn"]'), function (a) {
        a.setAttribute('href', c.apply_url);
      });
    }

    applyExpiry(c);
    renderNewsletter(c);
    renderTeam(c);
  }

  var data = null;
  var blogData = null;
  var faqData = null;
  var i18nReady = false;

  function maybeApply() {
    if (!i18nReady) return;
    if (data) apply(data);
    renderPhotos(data);
    renderBlog();
    renderFaq();
  }

  function load(path, assign) {
    fetch(siteUrl(path))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) { assign(json); maybeApply(); })
      .catch(function () {});
  }

  // Fetch in parallel with the translations, apply only once i18n is ready.
  load('/content/site.json', function (json) { data = json; });
  load('/content/blog.json', function (json) { blogData = json; });
  load('/content/faq.json', function (json) { faqData = json; });

  // Blocks that carry no data-i18n attributes build their markup for the
  // current language themselves, so rebuild them on a language switch.
  document.addEventListener('seet:langchange', function () {
    renderPhotos(data);
    renderBlog();
    renderFaq();
  });

  if (window.I18N && typeof I18N.onReady === 'function') {
    I18N.onReady(function () { i18nReady = true; maybeApply(); });
  } else {
    i18nReady = true;
    maybeApply();
  }
})();
