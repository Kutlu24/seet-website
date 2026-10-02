// i18n system
var I18N = (function() {
  var lang = localStorage.getItem('seet_lang') || 'de';
  var translations = {};

  function init() {
    fetch('/i18n.json')
      .then(r => r.json())
      .then(data => {
        translations = data;
        setLanguage(lang);
      });
  }

  function setLanguage(newLang) {
    if (!translations[newLang]) return;
    lang = newLang;
    localStorage.setItem('seet_lang', lang);

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = translations[lang][key];
      if (text === undefined) return;
      if (el.tagName === 'A' && el.getAttribute('data-i18n-title')) {
        el.setAttribute('title', text);
      } else {
        el.innerHTML = text;
      }
    });

    // Update image alt texts
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const text = translations[lang][el.getAttribute('data-i18n-alt')];
      if (text !== undefined) el.setAttribute('alt', text);
    });

    // Update page title
    if (translations[lang]['site_title']) {
      document.title = translations[lang]['site_title'];
    }

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Update active language button
    document.querySelectorAll('.lang-switch button').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  function get(key) {
    return translations[lang] && translations[lang][key] || key;
  }

  return { init, setLanguage, get, getLang: () => lang };
})();

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', I18N.init);
} else {
  I18N.init();
}
