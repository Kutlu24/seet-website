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
