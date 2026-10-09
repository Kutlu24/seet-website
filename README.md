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

## Blog articles, application deadline, Notion

- The 27 articles from seet.ch (German; English where seet.ch had it) live in `content/articles.json`, images in `img/blog/`, linked PDFs
  in `docs/`. Run `node tools/build-articles.js && node tools/sync-partials.js` to regenerate `blog-<slug>.html` and `content/blog.json`.
  To add an article, append an entry to `articles.json` (body is HTML; `{{IMG:file}}`, `{{POST:slug}}`, `{{PAGE:mitmachen#mentoring}}` placeholders)
  and re-run. Editing cards in `/admin/` only changes the list, not the article text.
- The application block closes itself after `apply_until` in `content/site.json` (last open day, Europe/Zurich): it then shows the "closed" texts
  (`apply_closed_*` in `i18n.json`) and hides button, QR code and deadline line. Set the next date there when a new round opens.
- Forms run on Notion: `apply_url` is the application form, `newsletter_url` (empty for now) is a public Notion form for newsletter sign-ups.
  While it is empty the newsletter box points to communication@seet.ch.
