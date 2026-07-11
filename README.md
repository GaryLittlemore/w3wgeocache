# Three Word Trails

A static geocaching site. Caches are listed with a plain-text [what3words](https://what3words.com) address — no API, no map plotting, just the three words as text.

## How it works

- `index.html` — browse/search page. Reads `data/caches.json` and renders it client-side.
- `submit.html` — instructions + link out to your intake form (Google Form recommended).
- `data/caches.json` — the actual list of caches. This is the only file you edit to add or remove entries.
- `css/style.css`, `js/app.js` — styling and search/filter logic. Shouldn't need touching.

There's no backend. Everything lives in `caches.json` and gets rebuilt whenever GitHub Pages redeploys.

## Adding a new cache (the moderation step)

1. **Set up an intake form.** A Google Form is the simplest option — free, no code, and responses land automatically in a Google Sheet you can read at a glance. Create fields matching the schema below, then paste the form's link into the button in `submit.html` (replace `REPLACE-WITH-YOUR-FORM-LINK`).
2. **Review submissions** in the Sheet as they come in. Check the what3words address actually resolves to somewhere sensible (paste it into what3words.com to confirm — this manual check replaces needing the API) and that it follows the etiquette listed on the submit page.
3. **Add an entry to `data/caches.json`**, following this shape:

   ```json
   {
     "id": "short-unique-slug",
     "title": "Cache name",
     "area": "Town, County",
     "w3w": ["word", "word", "word"],
     "difficulty": "Easy",
     "size": "Small",
     "description": "One or two sentences.",
     "hint": "Optional.",
     "submittedBy": "Name or blank",
     "dateAdded": "2026-07-11"
   }
