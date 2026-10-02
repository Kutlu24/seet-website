// CMS content overrides — fetched from content/site.json (edited via /admin/)
// Falls back silently to the values in i18n.json when the file is missing.
// Runs after i18n is ready so CMS edits are never overwritten by the
// translation pass, and re-applies on every language switch.
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

  function apply(c) {
    if (!c) return;

    // Texts: hand them to the i18n layer so language switches keep them.
    if (window.I18N && typeof I18N.setCmsTexts === 'function') {
      I18N.setCmsTexts(c.texts || {});
      I18N.setLanguage(I18N.getLang());
    }

    // Stats
    var nums = document.querySelectorAll('.stats .num');
    (c.stats || []).forEach(function (s, i) {
      if (!nums[i] || s.value === undefined || s.value === null) return;
      nums[i].setAttribute('data-count', s.value);
      nums[i].textContent = s.value;
    });

    // Application link
    if (c.apply_url) {
      document.querySelectorAll('a[data-i18n="apply_btn"]').forEach(function (a) {
        a.setAttribute('href', c.apply_url);
      });
    }

    // Team groups — rendered from CMS content, replacing static markup.
    var groups = c.team_groups;
    if (!groups || !groups.length) return;
    var container = document.getElementById('team-groups');
    if (!container) return;
    var html = '';
    groups.forEach(function (g) {
      html += '<div class="team-group reveal">';
      html += '<h3 data-i18n="' + g.id + '">' + I18N.get(g.id) + '</h3><div class="team-grid">';
      (g.members || []).forEach(function (m) {
        html += '<div class="member">'
          + '<div class="member-photo"><img src="' + m.photo + '" alt="' + m.name + '" loading="lazy"></div>'
          + '<span class="member-name">' + m.name + '</span>'
          + '<span class="member-role">' + (m.role || I18N.get(m.role_key)) + '</span>'
          + '</div>';
      });
      html += '</div></div>';
    });
    container.innerHTML = html;
    I18N.setLanguage(I18N.getLang());
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    container.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  var data = null;
  var i18nReady = false;
  function maybeApply() {
    if (!i18nReady) return;
    if (data) apply(data);
  }

  // Fetch in parallel with the translations, apply only once i18n is ready
  // so the translation pass can never overwrite CMS edits.
  fetch(siteUrl('/content/site.json'))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (json) { data = json; maybeApply(); })
    .catch(function () {});

  if (window.I18N && typeof I18N.onReady === 'function') {
    I18N.onReady(function () { i18nReady = true; maybeApply(); });
  } else {
    i18nReady = true;
    maybeApply();
  }
})();
