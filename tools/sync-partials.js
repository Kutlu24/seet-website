#!/usr/bin/env node
/**
 * Copies partials/header.html and partials/footer.html into every page.
 *
 *   node tools/sync-partials.js
 *
 * The header and footer are duplicated across all pages so they can be
 * plain static HTML (good for SEO and for browsing without JS). Edit the
 * partials instead of the pages, then run this script once.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const header = fs.readFileSync(path.join(root, 'partials', 'header.html'), 'utf8').trim();
const footerSrc = fs.readFileSync(path.join(root, 'partials', 'footer.html'), 'utf8').trim();

const HEADER_MARK = '<!-- header:begin (generated — edit partials/header.html) -->\n'
  + header + '\n<!-- header:end -->';
const FOOTER_MARK = '<!-- footer:begin (generated — edit partials/footer.html) -->\n'
  + footerSrc + '\n<!-- footer:end -->';

// Either the generated markers, or a raw header/footer block from a page
// that has not been converted yet.
const HEADER_RE = /<!-- header:begin[^>]* -->[\s\S]*?<!-- header:end -->|<header class="site-header">[\s\S]*?<\/header>/;
const FOOTER_RE = /<!-- footer:begin[^>]* -->[\s\S]*?<!-- footer:end -->|<footer class="site-footer">[\s\S]*?<\/footer>/;

const pages = fs.readdirSync(root).filter(f => f.endsWith('.html'));
let changed = 0;

for (const file of pages) {
  const p = path.join(root, file);
  const before = fs.readFileSync(p, 'utf8');
  let after = before.replace(HEADER_RE, HEADER_MARK).replace(FOOTER_RE, FOOTER_MARK);
  if (after !== before) {
    fs.writeFileSync(p, after);
    changed++;
    console.log('updated  ' + file);
  }
}

console.log(changed ? `${changed} page(s) updated` : 'all pages already in sync');
