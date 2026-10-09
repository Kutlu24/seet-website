/* Old seet.ch paths -> pages of this site. Loaded by 404.html so that hosts without
   server-side redirects (GitHub Pages) still forward old links. Render uses render.yaml. */
(function () {
  var MAP = {
  "/foerderung": "programm.html",
  "/foerderung/foerdererprogramm": "programm.html",
  "/foerderung/bewerbungsablauf": "programm.html",
  "/foerderung/bewerbungsformular": "mitmachen.html",
  "/unterstuetze-uns": "mitmachen.html",
  "/unterstuetze-uns/werde-mentorin": "mitmachen.html#mentoring",
  "/unterstuetze-uns/werde-frewilliger": "mitmachen.html#team",
  "/unterstuetze-uns/werde-vereinsmitglied": "mitmachen.html#mitglied",
  "/unterstuetze-uns/werde-goennerin": "mitmachen.html#spenden",
  "/unterstuetze-uns/werde-partner": "mitmachen.html#partner",
  "/ueber-uns": "ueber-uns.html",
  "/ueber-uns/unsere-mission": "ueber-uns.html",
  "/ueber-uns/unsere-geschichte": "geschichte.html",
  "/ueber-uns/unser-team": "team.html",
  "/ueber-uns/unsere-awards": "awards.html",
  "/ueber-uns/unsere-partner": "partner.html",
  "/ueber-uns/unsere-goenner": "goenner.html",
  "/ueber-uns/faqs": "faqs.html",
  "/blog": "blog.html",
  "/blog/seetlinge": "blog.html",
  "/geschichten/seetlinge": "blog.html",
  "/kontakt": "kontakt.html",
  "/impressum": "impressum.html",
  "/datenschutzerklaerung": "datenschutz.html",
  "/en": "./?lang=en",
  "/die-teilnahme-an-diesem-seet-programm-hat-meine-erwartungen-uebertroffen": "blog.html#die-teilnahme-an-diesem-seet-programm-hat-meine-erwartungen-uebertroffen",
  "/eine-kleine-aber-bedeutungsvolle-moeglichkeit-etwas-zurckzugeben": "blog.html#eine-kleine-aber-bedeutungsvolle-moeglichkeit-etwas-zurckzugeben",
  "/der-seet-jahrgang-202627-startet-seine-mentoring-reise": "blog.html#der-seet-jahrgang-202627-startet-seine-mentoring-reise",
  "/der-jahresbericht-2025-von-seet-ist-jetzt-online-verfuegbar": "blog.html#der-jahresbericht-2025-von-seet-ist-jetzt-online-verfuegbar",
  "/das-mentoring-programm-ist-anspruchsvoll-aber-sehr-bereichernd": "blog.html#das-mentoring-programm-ist-anspruchsvoll-aber-sehr-bereichernd",
  "/seets-vergangenheit-gegenwart-und-zukunft-vereinen-sich-an-einem-besonderen-abend": "blog.html#seets-vergangenheit-gegenwart-und-zukunft-vereinen-sich-an-einem-besonderen-abend",
  "/seet-richtet-sich-an-zukuenftige-study-support-mentorinnen-bei-eth-diversity-veranstaltung": "blog.html#seet-richtet-sich-an-zukuenftige-study-support-mentorinnen-bei-eth-diversity-veranstaltung",
  "/teilnehmende-des-seet-studienfoerderprogramms-halten-inne": "blog.html#teilnehmende-des-seet-studienfoerderprogramms-halten-inne",
  "/trauma-verstehen-seet-workshop-zu-trauma-und-ptsd": "blog.html#trauma-verstehen-seet-workshop-zu-trauma-und-ptsd",
  "/wiedersehen-mit-freunden-am-kick-off-2025-26": "blog.html#wiedersehen-mit-freunden-am-kick-off-2025-26"
};
  var path = location.pathname.replace(/\/+$/, '');
  var keys = Object.keys(MAP).sort(function (a, b) { return b.length - a.length; });
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (path.slice(-k.length) === k) {
      var base = path.slice(0, path.length - k.length) + '/';
      var t = MAP[k];
      location.replace(t.charAt(0) === '.' ? base + t.slice(2) : base + t);
      return;
    }
  }
})();
