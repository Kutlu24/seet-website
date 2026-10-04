#!/usr/bin/env node
// Generates the admin panel's translation fields from i18n.json.
//
//   node tools/sync-admin-i18n.js
//
// What it does (idempotent):
//   1. reads i18n.json (flat or already grouped), validates de/en/fr key parity
//   2. groups every key at its first underscore: nav_start -> { nav: { start: … } }
//      (a group name that is itself a key, e.g. quote / quote_attr, stays flat)
//   3. rewrites i18n.json in the grouped shape — the site is unaffected because
//      i18n.js flattens with '_' before looking keys up
//   4. regenerates the field list in admin/config.yml between the markers
//      "# i18n-fields:begin / # i18n-fields:end"
//
// Run it whenever a key is added to or removed from i18n.json.

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var I18N_FILE = path.join(ROOT, 'i18n.json');
var CONFIG_FILE = path.join(ROOT, 'admin', 'config.yml');
var BEGIN = '# i18n-fields:begin';
var END = '# i18n-fields:end';
var LOCALES = ['de', 'en', 'fr'];

// Sidebar order for the generated groups; unknown groups are appended A-Z.
var GROUP_ORDER = [
  'nav', 'menu', 'lang', 'site', 'hero', 'section',
  'card1', 'card2', 'card3', 'stats',
  'pillars', 'pillar1', 'pillar2', 'pillar3',
  'photo1', 'photo2', 'photo3',
  'apply', 'social', 'newsletter', 'btn', 'copy', 'quote', 'learn', 'read',
  'prog', 'blog', 'faq', 'about', 'team', 'area', 'role',
  'join', 'way1', 'way2', 'way3', 'way4', 'way5',
  'contact', 'title', 'footer',
  'resources', 'resource1', 'resource2', 'resource3', 'error404'
];

var GROUP_LABELS = {
  nav: 'Navigation (Desktop-Menü)',
  menu: 'Mobiles Menü',
  lang: 'Sprachumschalter',
  site: 'Website-Titel (Tab)',
  hero: 'Startseite — Hero',
  section: 'Startseite — Abschnittsüberschriften',
  card1: 'Startseite — Meldung 1',
  card2: 'Startseite — Meldung 2',
  card3: 'Startseite — Meldung 3',
  stats: 'Startseite — Statistik-Labels',
  pillars: 'Startseite — Werte',
  pillar1: 'Startseite — Wert 1',
  pillar2: 'Startseite — Wert 2',
  pillar3: 'Startseite — Wert 3',
  photo1: 'Startseite — Foto 1',
  photo2: 'Startseite — Foto 2',
  photo3: 'Startseite — Foto 3',
  apply: 'Startseite — Bewerbungsfeld',
  social: 'Startseite — Social Media',
  newsletter: 'Startseite — Newsletter',
  btn: 'Buttons (gemeinsam)',
  copy: 'Copy-Button',
  quote: 'Zitat',
  learn: 'Weiterlesen-Link',
  read: 'Lesen-Link',
  prog: 'Programm-Seite',
  blog: 'Blog-Seite',
  faq: 'FAQ-Seite',
  about: 'Über-uns-Seite',
  team: 'Team-Seite',
  area: 'Fachbereiche',
  role: 'Rollen (Team & Kontakt)',
  join: 'Mitmachen-Seite',
  way1: 'Mitmachen — Weg 1',
  way2: 'Mitmachen — Weg 2',
  way3: 'Mitmachen — Weg 3',
  way4: 'Mitmachen — Weg 4',
  way5: 'Mitmachen — Weg 5',
  contact: 'Kontakt-Seite',
  title: 'Browser-Titel je Seite',
  footer: 'Footer',
  resources: 'Ressourcen (Überschrift)',
  resource1: 'Ressource 1',
  resource2: 'Ressource 2',
  resource3: 'Ressource 3',
  error404: '404-Seite'
};

// Field-name -> German label. Unknown names are humanised.
var FIELD_LABELS = {
  title: 'Titel', desc: 'Beschreibung', sub: 'Untertitel', kicker: 'Kleiner Titel',
  tag: 'Etiket', cap: 'Bildunterschrift', text: 'Text', attr: 'Autor:in',
  q: 'Frage', a: 'Antwort', url: 'Link', name: 'Name', value: 'Wert',
  open: 'Menü öffnen', close: 'Menü schließen', home: 'Startseite',
  program: 'Programm', about: 'Über uns', join: 'Mitmachen', blog: 'Blog',
  faq: 'FAQ', team: 'Team', contact: 'Kontakt', donate: 'Spenden',
  status: 'Status', deadline: 'Frist', qr_caption: 'QR-Code-Bildunterschrift',
  address: 'Adresse', bank: 'Bankverbindung', email: 'E-Mail',
  de: 'Deutsch', en: 'Englisch', fr: 'Französisch'
};

function humanize(name) {
  if (FIELD_LABELS[name]) return FIELD_LABELS[name];
  // tl_2018 -> "Zeitleiste 2018", mission_p2 -> "Mission — Absatz 2"
  if (/^tl_\d{4}$/.test(name)) return 'Zeitleiste ' + name.slice(3);
  var mp = name.match(/^mission_p(\d+)$/);
  if (mp) return 'Mission — Absatz ' + mp[1];
  // article1_title -> "Artikel 1 — Titel", q2 -> "Frage 2", btn3 -> "Button 3"
  var m = name.match(/^(article|q|a|btn|way|resource|pillar|photo|card|member|value|section|stat|nav|prog|team|faq)(\d+)_(title|desc|tag|cap)$/) ||
          name.match(/^(q|a|btn|way|resource|pillar|photo|card|member|value|section|stat)(\d+)$/);
  if (m) {
    var nouns = { article: 'Artikel', q: 'Frage', a: 'Antwort', btn: 'Button', way: 'Weg',
      resource: 'Ressource', pillar: 'Wert', photo: 'Foto', card: 'Meldung',
      member: 'Feld', value: 'Wert', section: 'Abschnitt', stat: 'Statistik',
      nav: 'Link', prog: 'Feld', team: 'Feld', faq: 'Feld' };
    var words = { title: 'Titel', desc: 'Beschreibung', tag: 'Etiket', cap: 'Bildunterschrift' };
    var base = (nouns[m[1]] || m[1]) + ' ' + m[2];
    if (m[3]) base += ' — ' + (words[m[3]] || m[3]);
    return base;
  }
  return name.replace(/_/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); });
}

function isLeaf(v) {
  return v === null || typeof v !== 'object' || Array.isArray(v);
}

// ---- 1. read + validate -------------------------------------------------

var raw = fs.readFileSync(I18N_FILE, 'utf8');
var data = JSON.parse(raw);
var flat = {};

LOCALES.forEach(function (loc) {
  if (!data[loc]) throw new Error('i18n.json: missing locale "' + loc + '"');
  var out = {};
  (function walk(obj, prefix) {
    Object.keys(obj).forEach(function (k) {
      var v = obj[k];
      var key = prefix ? prefix + '_' + k : k;
      if (isLeaf(v)) {
        if (out[key] !== undefined) throw new Error('i18n.json: duplicate key "' + key + '"');
        if (typeof v !== 'string') throw new Error('i18n.json: ' + loc + '.' + key + ' is not a string');
        out[key] = v;
      } else {
        walk(v, key);
      }
    });
  })(data[loc], '');
  flat[loc] = out;
});

var keys = Object.keys(flat.de);
LOCALES.forEach(function (loc) {
  var missing = keys.filter(function (k) { return flat[loc][k] === undefined; });
  var extra = Object.keys(flat[loc]).filter(function (k) { return flat.de[k] === undefined; });
  if (missing.length || extra.length) {
    throw new Error('i18n.json: ' + loc + ' differs from de (missing: ' +
      missing.slice(0, 5).join(', ') + ' | extra: ' + extra.slice(0, 5).join(', ') + ')');
  }
});

// ---- 2. group -----------------------------------------------------------

var groups = {};   // groupName -> [fieldPart]
var flatKeys = []; // keys that must stay top level (no underscore, or conflict)
var conflicts = [];

keys.forEach(function (key) {
  var i = key.indexOf('_');
  if (i < 1) { flatKeys.push(key); return; }
  var group = key.slice(0, i);
  if (flatKeys.indexOf(group) !== -1 || keys.indexOf(group) !== -1) {
    // group name is itself a key (quote / quote_attr): keep the whole group flat
    if (conflicts.indexOf(group) === -1) conflicts.push(group);
    flatKeys.push(key);
    return;
  }
  if (conflicts.indexOf(group) !== -1) { flatKeys.push(key); return; }
  (groups[group] = groups[group] || []).push(key.slice(i + 1));
});

// any group whose name turned out to be a key: ungroup it entirely
conflicts.forEach(function (g) {
  var fieldParts = groups[g] || [];
  delete groups[g];
  fieldParts.forEach(function (part) {
    var key = g + '_' + part;
    if (flatKeys.indexOf(key) === -1) flatKeys.push(key);
  });
});

var orderedGroups = GROUP_ORDER.filter(function (g) { return groups[g]; });
Object.keys(groups).sort().forEach(function (g) {
  if (orderedGroups.indexOf(g) === -1) orderedGroups.push(g);
});

function sortFields(parts) {
  return parts.slice().sort(function (a, b) {
    var na = a.match(/(\d+)/), nb = b.match(/(\d+)/);
    if (na && nb && na[1] !== nb[1]) return Number(na[1]) - Number(nb[1]);
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

// ---- 3. write nested i18n.json -----------------------------------------

function buildNested(locale) {
  var out = {};
  orderedGroups.forEach(function (g) {
    var obj = {};
    sortFields(groups[g]).forEach(function (part) { obj[part] = flat[locale][g + '_' + part]; });
    out[g] = obj;
  });
  flatKeys.forEach(function (key) { out[key] = flat[locale][key]; });
  return out;
}

var nested = {};
LOCALES.forEach(function (loc) { nested[loc] = buildNested(loc); });
var nestedJson = JSON.stringify(nested, null, 2) + '\n';
if (nestedJson !== raw) fs.writeFileSync(I18N_FILE, nestedJson);

// ---- 4. YAML field list -------------------------------------------------

function yamlStr(s) {
  return JSON.stringify(s); // valid YAML double-quoted scalar
}

function widgetFor(value) {
  return value.length > 90 ? 'text' : 'string';
}

var lines = [];
lines.push('          ' + BEGIN + ' — generated by tools/sync-admin-i18n.js, do not edit');
orderedGroups.forEach(function (g) {
  lines.push('          - name: ' + yamlStr(g));
  lines.push('            label: ' + yamlStr(GROUP_LABELS[g] || humanize(g)));
  lines.push('            widget: object');
  lines.push('            i18n: true');
  lines.push('            collapsed: true');
  lines.push('            fields:');
  sortFields(groups[g]).forEach(function (part) {
    lines.push('              - name: ' + yamlStr(part));
    lines.push('                label: ' + yamlStr(humanize(part)));
    lines.push('                widget: ' + widgetFor(flat.de[g + '_' + part]));
    lines.push('                i18n: true');
    lines.push('                hint: ' + yamlStr(g + '_' + part));
  });
});
if (flatKeys.length) {
  lines.push('          # single keys without a group');
  flatKeys.slice().sort().forEach(function (key) {
    lines.push('          - name: ' + yamlStr(key));
    lines.push('            label: ' + yamlStr(humanize(key)));
    lines.push('            widget: ' + widgetFor(flat.de[key]));
    lines.push('            i18n: true');
    lines.push('            hint: ' + yamlStr(key));
  });
}
lines.push('          ' + END);

var config = fs.readFileSync(CONFIG_FILE, 'utf8');
var b = config.indexOf(BEGIN);
var e = config.indexOf(END);
if (b < 0 || e < 0 || e < b) throw new Error('admin/config.yml: markers "' + BEGIN + '" / "' + END + '" not found');
// replace whole lines, markers included
var from = config.lastIndexOf('\n', b) + 1;
var to = config.indexOf('\n', e);
if (to < 0) to = config.length;
var updated = config.slice(0, from) + lines.join('\n') + '\n' + config.slice(to + 1);
if (updated !== config) fs.writeFileSync(CONFIG_FILE, updated);

// ---- summary ------------------------------------------------------------

var fieldCount = keys.length;
console.log('i18n.json  : %d keys x %d locales -> %d groups + %d single keys%s',
  fieldCount, LOCALES.length, orderedGroups.length, flatKeys.length,
  nestedJson === raw ? ' (already grouped)' : ' (regrouped)');
if (conflicts.length) console.log('kept flat (group name is also a key): %s', conflicts.join(', '));
console.log('config.yml : %d fields written between markers', fieldCount);
