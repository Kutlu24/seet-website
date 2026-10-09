#!/usr/bin/env node
/**
 * Builds the blog from content/articles.json (single source of truth):
 *   - one page per article:  blog-<slug>.html   (DE / EN / FR blocks, switched by the language buttons)
 *   - the blog list:         content/blog.json  (cards on blog.html)
 *
 *   node tools/build-articles.js && node tools/sync-partials.js
 *
 * Article bodies are HTML. Placeholders: {{IMG:file}} -> img/blog/file, {{DOC:file}} -> docs/file,
 * {{PAGE:slug#anchor}} -> page of this site, {{POST:slug}} -> another article, {{HOME}}.
 * If an article has no English text the German text is shown with a note (French always falls back to German).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const BASE = 'https://kutlu24.github.io/seet-website/';
const arts = JSON.parse(fs.readFileSync(path.join(root, 'content/articles.json'), 'utf8'));
const tpl = fs.readFileSync(path.join(__dirname, 'templates/article.html'), 'utf8');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PAGES = { mitmachen: 'mitmachen.html', faqs: 'faqs.html', kontakt: 'kontakt.html', programm: 'programm.html' };
const NOTE = {
  en: 'This article is only available in German.',
  fr: 'Cet article n’est disponible qu’en allemand.',
};

function resolve(html) {
  return html
    .replace(/\{\{IMG:([^}]+)\}\}/g, 'img/blog/$1')
    .replace(/\{\{DOC:([^}]+)\}\}/g, 'docs/$1')
    .replace(/\{\{PAGE:([^#}]+)(#[^}]*)?\}\}/g, (m, p, a) => (PAGES[p] || p + '.html') + (a || ''))
    .replace(/\{\{POST:([^}]+)\}\}/g, 'blog-$1.html')
    .replace(/\{\{HOME\}\}/g, './');
}
const pageName = a => 'blog-' + a.slug + '.html';
const pick = (obj, lang) => (obj && obj[lang]) || obj.de;

const cards = [];
for (const a of arts) {
  const hasEn = !!(a.content.en);
  const h1s = ['de', 'en', 'fr'].map(l => `<h1 class="lang-block" data-lang="${l}">${esc(pick(a.title, l))}</h1>`).join('\n      ');
  const bodies = ['de', 'en', 'fr'].map(l => {
    const own = l === 'de' || (l === 'en' && hasEn);
    const body = resolve(own ? a.content[l] : a.content.de);
    const note = own ? '' : `<p class="article-note"><em>${esc(NOTE[l])}</em></p>`;
    return `<div class="entry-content lang-block" data-lang="${l}">${note}\n${body}\n</div>`;
  }).join('\n      ');
  const img = a.image ? `img/blog/${a.image}` : '';
  const inBody = a.image && (a.content.de + (a.content.en || '')).includes('{{IMG:' + a.image + '}}');
  const featured = img && !inBody ? `<div class="media article-media"><img src="${img}" alt="" width="1100" loading="eager"></div>` : '';
  const desc = a.excerpt.de.replace(/…$/, '');
  const out = tpl
    .replace(/\{\{TITLE\}\}/g, esc(a.title.de + ' — SEET'))
    .replace(/\{\{URL\}\}/g, BASE + pageName(a))
    .replace(/\{\{DESC\}\}/g, esc(desc))
    .replace(/\{\{OGIMG\}\}/g, img ? BASE + img : BASE + 'img/og-cover.jpg')
    .replace('{{DATE}}', a.date)
    .replace('{{H1S}}', h1s)
    .replace('{{FEATURED}}', featured)
    .replace('{{BODIES}}', bodies);
  fs.writeFileSync(path.join(root, pageName(a)), out);
  cards.push({
    id: a.slug, date: a.date, image: img, webp: img, link: pageName(a),
    title: a.title.de, title_en: pick(a.title, 'en'), title_fr: a.title.fr || a.title.de,
    excerpt: a.excerpt.de, excerpt_en: pick(a.excerpt, 'en'), excerpt_fr: a.excerpt.fr || a.excerpt.de,
  });
}
fs.writeFileSync(path.join(root, 'content/blog.json'), JSON.stringify({ posts: cards }, null, 2) + '\n');
console.log(`${arts.length} articles built`);
