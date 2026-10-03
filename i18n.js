// i18n system
var I18N = (function() {
  var lang = localStorage.getItem('seet_lang') || 'de';
  var translations = {};
  var cmsTexts = {};      // overrides from content/site.json (CMS), language-agnostic
  var ready = false;
  var pending = [];
  var readyCallbacks = [];

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

  // A key resolves to the CMS override first, then to the translation.
  function lookup(key) {
    if (Object.prototype.hasOwnProperty.call(cmsTexts, key) && cmsTexts[key] !== '') {
      return cmsTexts[key];
    }
    return translations[lang] ? translations[lang][key] : undefined;
  }

  function markReady() {
    ready = true;
    pending.forEach(function (fn) { fn(); });
    pending = [];
    readyCallbacks.forEach(function (fn) { fn(); });
    readyCallbacks = [];
  }

  // i18n.json may be grouped for the CMS editor ({ nav: { start: … } }) or flat
  // ({ nav_start: … }). Either way a key is the underscore-joined path, so both
  // shapes resolve to the same data-i18n attribute names.
  function flattenLocale(obj) {
    var out = {};
    (function walk(node, prefix) {
      Object.keys(node).forEach(function (k) {
        var v = node[k];
        var key = prefix ? prefix + '_' + k : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key);
        else out[key] = v;
      });
    })(obj, '');
    return out;
  }

  function flattenAll(data) {
    var out = {};
    Object.keys(data).forEach(function (loc) {
      out[loc] = flattenLocale(data[loc]);
    });
    return out;
  }

  function init() {
    fetch(siteUrl('/i18n.json'))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        translations = flattenAll(data);
        setLanguage(lang);
        markReady();
      })
      .catch(function (err) {
        console.error('i18n: could not load translations', err);
        // Still mark ready so dependent scripts (CMS content) can run.
        markReady();
      });
  }

  // Run fn once translations are available (immediately if they already are).
  function onReady(fn) {
    if (ready) fn();
    else readyCallbacks.push(fn);
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
      var text = lookup(el.getAttribute('data-i18n'));
      if (text === undefined) return;
      if (el.tagName === 'A' && el.getAttribute('data-i18n-title')) {
        el.setAttribute('title', text);
      } else {
        el.innerHTML = text;
      }
    });

    // Update aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var text = lookup(el.getAttribute('data-i18n-aria'));
      if (text !== undefined) el.setAttribute('aria-label', text);
    });

    // Update image alt texts
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var text = lookup(el.getAttribute('data-i18n-alt'));
      if (text !== undefined) el.setAttribute('alt', text);
    });

    // Update input placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var text = lookup(el.getAttribute('data-i18n-placeholder'));
      if (text !== undefined) el.setAttribute('placeholder', text);
    });

    // Update the page title (pages declare data-i18n on <title>)
    var titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      var pageTitle = lookup(titleEl.getAttribute('data-i18n'));
      if (pageTitle) document.title = pageTitle;
    } else if (lookup('site_title')) {
      document.title = lookup('site_title');
    }

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Update active language button
    document.querySelectorAll('.lang-switch button').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  // Register texts edited through the CMS; they win over i18n.json and are
  // re-applied on every language switch.
  function setCmsTexts(obj) {
    cmsTexts = obj || {};
  }

  function get(key) {
    var text = lookup(key);
    return text === undefined || text === null || text === '' ? key : text;
  }

  return {
    init: init,
    setLanguage: setLanguage,
    setCmsTexts: setCmsTexts,
    onReady: onReady,
    get: get,
    getLang: function () { return lang; },
    isReady: function () { return ready; }
  };
})();

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', I18N.init);
} else {
  I18N.init();
}
