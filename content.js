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
  }

  fetch(siteUrl('/content/site.json'))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(apply)
    .catch(function () {});
})();
