// i18n system
var I18N = (function() {
  var lang = localStorage.getItem('seet_lang') || 'de';
  var translations = {};
  var ready = false;
  var pending = [];

  // Resolve a path relative to the site root, so the site works both at
  // a domain root and under a GitHub Pages project subpath (/seet-website/).
  function siteUrl(path) {
    var base = document.querySelector('base[href]');
    if (base) return base.getAttribute('href').replace(/\/$/, '') + path;
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src') || '';
      if (/(^|\/)i18n\.js(\?|$)/.test(src)) {
        return src.replace(/i18n\.js(\?.*)?$/, '') + path.replace(/^\//, '');
      }
    }
    return path;
  }

  function init() {
    fetch(siteUrl('/i18n.json'))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        translations = data;
        ready = true;
        setLanguage(lang);
        pending.forEach(function (fn) { fn(); });
        pending = [];
      })
      .catch(function (err) {
        console.error('i18n: could not load translations', err);
      });
  }

  function setLanguage(newLang) {
    if (!translations[newLang]) {
      // Translations not loaded yet — remember the choice and apply it later.
      if (!ready) {
        lang = newLang;
        localStorage.setItem('seet_lang', lang);
        pending.push(function () { setLanguage(newLang); });
      }
      return;
    }
    lang = newLang;
    localStorage.setItem('seet_lang', lang);

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var text = translations[lang][key];
      if (text === undefined) return;
      if (el.tagName === 'A' && el.getAttribute('data-i18n-title')) {
        el.setAttribute('title', text);
      } else {
        el.innerHTML = text;
      }
    });

    // Update image alt texts
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var text = translations[lang][el.getAttribute('data-i18n-alt')];
      if (text !== undefined) el.setAttribute('alt', text);
    });

    // Update page title
    if (translations[lang]['site_title']) {
      document.title = translations[lang]['site_title'];
    }

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Update active language button
    document.querySelectorAll('.lang-switch button').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  function get(key) {
    return translations[lang] && translations[lang][key] || key;
  }

  return { init: init, setLanguage: setLanguage, get: get, getLang: function () { return lang; } };
})();

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', I18N.init);
} else {
  I18N.init();
}
