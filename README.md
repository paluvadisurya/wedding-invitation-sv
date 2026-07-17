# Srivalli & Surya — Wedding Invitation 🌸

A cinematic, bilingual (English · తెలుగు) wedding invitation website — a kolam that draws
itself in light, drifting gold dust, petal showers, a living diya, and every date, venue and
word driven by **one config file**.

Built as a fully static site: no build step, no framework, no backend. Open it, edit one
JSON file, deploy anywhere.

---

## Run it locally

Any static file server works (the site loads `config.json` over HTTP, so don't open
`index.html` straight from disk):

```bash
npx serve            # or: python3 -m http.server 8000
```

Then open the printed URL.

## Deploy it (pick one)

- **GitHub Pages** — repo Settings → Pages → deploy from branch. Done.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder or connect the repo.
  No build command, no output directory — it's already a website.

After deploying, do two small things:

1. In `config.json`, set `meta.siteUrl` to your final URL (used in share messages).
2. In `index.html`, change the `og:image` meta tag to the **absolute** URL
   (e.g. `https://your-site.example/assets/og-image.png`) so WhatsApp link previews
   always show the gold share card.

---

## Everything lives in `config.json`

Open `config.json` — it is deliberately human-readable. Any other couple can reuse this
site by editing that one file. Text fields that guests see come in pairs:
`{ "en": "English text", "te": "తెలుగు పాఠ్యం" }`.

| Section | What it controls |
|---|---|
| `couple` | Names (both scripts), hashtag, which town belongs to which side |
| `wedding.muhurthamISO` | The muhurtham moment — drives the hero date, live countdown and “Save the date” |
| `events[]` | Every ceremony: name, tagline, date/time, duration, town, side, venue, maps link, dress code |
| `towns` | Town names, states and Google Maps links |
| `photos` | Paths + alt text for the couple's 3 photos |
| `story` | Intro line + three timeline beats |
| `travel[]` | How to reach each town (air / rail / road) + accommodation notes |
| `rsvp` | WhatsApp number and/or email that receives RSVPs, deadline, privacy note |
| `livestream.url` | Optional — adds “Watch live” buttons when filled |
| `contacts[]` | Per-side coordinator names and phone numbers |
| `music` | Optional background audio (opt-in only, never autoplays) |
| `blessing`, `invocation` | The శతమానం భవతి blessing and the opening shloka |
| `palette` | Override the gold/pastel colour tokens |
| `strings` | Every interface label, in both languages |

### Common edits

- **Fill in a venue** — find the event in `events[]`, set `venueName.en` / `venueName.te`
  and its `mapsUrl` (share link from Google Maps). The “Venue to be announced” state
  disappears automatically, and calendar exports update themselves.
- **Set the wedding town (26 Aug)** — the muhurtham event has `"town": ""`. Set it to
  `"wanaparthy"` or `"vinukonda"` (or add a new town under `towns`).
- **Receive RSVPs & wishes on WhatsApp** — set `rsvp.whatsappNumber` with country code,
  digits only, e.g. `"919876543210"`. Guests' responses arrive as WhatsApp messages;
  nothing is stored on the site. (With no number and no email set, guests get a graceful
  copy-to-clipboard fallback.)
- **Add an event** — copy any object in `events[]`, change the fields. The timeline,
  day grouping, countdown and calendar buttons all render from this array.
- **Add gallery photos later** — drop files in `assets/photos/` and list them under
  `photos.galleryExtra` as `{ "src": "assets/photos/xyz.jpg", "alt": { "en": "…", "te": "…" } }`.

## The couple's 3 photos

Drop them into **`assets/photos/`** as:

- `hero.jpg` — hero portrait (portrait orientation looks best in the gold arch)
- `story.jpg` — the “Our story” photo
- `finale.jpg` — gallery finale

Until the files exist the site shows intentional “photo coming soon” placeholders —
nothing ever looks broken. See `assets/photos/README.txt` for tips.

## Optional music

Put a licensed, gentle track (soft nadaswaram / veena works beautifully) at
`assets/audio/theme.mp3` and set `music.src` in the config. A mute/unmute lotus appears
in the top bar; audio only ever starts when a guest taps it.

## Analytics

[Vercel Web Analytics](https://vercel.com/docs/analytics) is wired in via
`assets/js/vercel-analytics.mjs` — a vendored copy of `@vercel/analytics`'s
framework-agnostic build, imported directly by the browser in `index.html` (no bundler
needed, keeping the site dependency-free at runtime). It's a no-op until you enable
**Web Analytics** for the project in the Vercel dashboard after deploying.

---

## Craft notes

- **Mobile-first** — designed for a one-handed WhatsApp open on a mid-range phone;
  desktop scales the same scenes up with a center-spine timeline, sticky story photo
  and a custom gold cursor.
- **Accessible** — respects `prefers-reduced-motion` (all particles, showers and letter
  animation switch off; content appears instantly), strong text contrast throughout,
  keyboard-focus styles, semantic headings, `aria` labels on interactive icons.
- **Fast** — self-hosted variable fonts (~330 KB total, subset per script), two small
  canvases that sleep when idle or hidden, zero dependencies, lazy-loaded images.
- **Add to calendar** — every event offers Google Calendar and a downloadable `.ics`
  (Apple/Outlook), generated on the fly from the config in IST.
- **Fonts** — Cormorant Garamond, Outfit, Noto Serif/Sans Telugu (SIL Open Font License,
  self-hosted in `assets/fonts/`). All motifs (kolam, gopuram skyline, toranam, diya,
  peacock feather, event icons) are hand-drawn SVG in `index.html` — no stock art.

మీ జీవితం శతమానం భవతి 🪔
