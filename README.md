# seet-website

Static website of **SEET – Support Education, Empower Together**, a Swiss association
supporting refugees on their way into higher education. Plain HTML/CSS/JS, no build
step. Languages: DE (default), EN, FR.

Live: https://kutlu24.github.io/seet-website/ (also deployable via `render.yaml` as a static site).

## Layout

| Path | Purpose |
|---|---|
| `*.html` | Pages (`index`, `ueber-uns`, `programm`, `team`, `mitmachen`, `faqs`, `blog`, `kontakt`, `404`) |
| `i18n.json`, `i18n.js` | Translations and the client-side language switcher (`data-i18n` attributes) |
| `content/*.json`, `content.js` | CMS-managed content (site texts, blog, FAQ); pages fall back to static markup if a file is missing |
| `admin/` | Decap-CMS style admin panel (`config.yml`); its translation fields are generated |
| `partials/` | Source of the shared header and footer |
| `tools/` | Maintenance scripts (Node, no dependencies) |

## Editing

- **Header/footer:** edit `partials/header.html` / `footer.html`, then run
  `node tools/sync-partials.js` – they are copied into every page so the site works without JS.
- **Translations:** edit `i18n.json`, then run `node tools/sync-admin-i18n.js`. It checks that
  de/en/fr have the same keys and regenerates the admin panel's field list.
- **Content (blog, FAQ, homepage stats, team):** via `/admin/` or directly in `content/*.json`.

## Preview locally

```bash
python3 -m http.server 8000
```

## Legal pages, redirects, fonts

- `impressum.html` and `datenschutz.html` are separate pages in DE/EN/FR (keys `impressum_*`, `privacy_*` in `i18n.json`).
  Have the board check the privacy policy and the address in the Impressum against the commercial register before launch.
- Old seet.ch URLs: `render.yaml` defines redirect routes for Render; on GitHub Pages `404.html` loads
  `legacy-redirects.js`, which forwards the same paths. Blog article URLs forward to `blog.html#<slug>`.
- Fonts are self-hosted (`fonts/`, `fonts.css`); the site makes no requests to Google. The admin panel (`/admin/`) still loads
  Decap CMS from unpkg.com.
- The blog cards link to the original articles on seet.ch (`content/blog.json`, `link`).
- The newsletter form has no backend. Without `SEET_NEWSLETTER_ENDPOINT` it points people to communication@seet.ch.
