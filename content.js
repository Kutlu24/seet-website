// CMS content overrides — fetched from content/site.json (edited via /admin/)
// Falls back silently to the values in i18n.json when the file is missing.
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
    var t = c.texts || {};
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t[el.getAttribute('data-i18n')];
      if (v !== undefined && v !== '') el.innerHTML = v;
    });
    var nums = document.querySelectorAll('.stats .num');
    (c.stats || []).forEach(function (s, i) {
      if (!nums[i] || s.value === undefined || s.value === null) return;
      nums[i].setAttribute('data-count', s.value);
      nums[i].textContent = s.value;
    });
    if (c.apply_url) {
      document.querySelectorAll('a[data-i18n="apply_btn"]').forEach(function (a) {
        a.setAttribute('href', c.apply_url);
      });
    }

    // Render team groups from CMS content, replacing the static markup.
    var groups = c.team_groups;
    if (!groups || !groups.length) return;
    var container = document.getElementById('team-groups');
    if (!container) return;
    var html = '';
    groups.forEach(function (g, gi) {
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
    if (window.I18N) I18N.setLanguage(I18N.getLang());
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    container.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  fetch(siteUrl('/content/site.json'))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(apply)
    .catch(function () {});
})();
