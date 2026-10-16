#!/bin/sh
# Rebuilds the static search index (pagefind/) used by suche.html. Run after changing page or
# blog content, then commit the pagefind/ folder (the site is served as-is, no build step).
cd "$(dirname "$0")/.." && npx --yes pagefind@1.5.2 --site . --glob "*.html" --output-path pagefind
