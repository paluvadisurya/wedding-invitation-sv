# Srivalli & Surya — wedding invitation

A one-page invitation for a wedding across two towns in Telangana and Andhra
Pradesh, 23–28 August 2026.

**If you only read one thing:** everything you are likely to want to change
lives in `src/config/`. You do not need to know how to code to edit it.

---

## Changing the content

| What you want to change | File |
|---|---|
| Names, families, muhurtham, towns, phone numbers | `src/config/wedding.ts` |
| Ceremonies — times, venues, meanings, travel, stay | `src/config/events.ts` |
| Every other word on the site | `src/config/copy.ts` |
| Turning whole sections on and off, page title | `src/config/site.ts` |

Lines marked `← FILL IN` are the ones still waiting on you.

**Blanks are safe.** Anywhere the config says `null`, the site draws a
deliberate "not settled yet" state instead of breaking or leaving a hole. You
can publish today with half of it unfilled and fill the rest in as you go.
Never type `TBD` — write `null` and let the page say it properly.

**Times** are 24-hour and Indian Standard Time. `'07:00'` is 7 AM, `'17:00'` is
5 PM. Where a ceremony really ends at "lunch", still give `end` a best-guess
time — calendar apps need one — and put the word guests should see in
`endLabel`.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

Everything works with no configuration and no secrets.

## Deploying

Push to GitHub and import the repository at [vercel.com/new](https://vercel.com/new).
No settings to change. To redeploy after editing the config, commit and push —
Vercel rebuilds automatically.

Once you have a real domain, set `NEXT_PUBLIC_SITE_URL` in the Vercel project
settings (e.g. `https://srivalliandsurya.com`, no trailing slash) so shared
links preview correctly.

### Privacy

The site is **unlisted** by default: anyone with the link opens it instantly,
but search engines are told to stay away, because this page carries phone
numbers and home towns. That is the `indexable: false` line in
`src/config/site.ts`. Change it only if you want the site in Google forever.

## Notes for whoever maintains this

- Design reasoning — palette, type, the thread, what was rejected — is in
  [`DESIGN.md`](./DESIGN.md). Read it before overturning a decision.
- Fonts are self-hosted, subset and committed. `scripts/build-fonts.sh`
  regenerates them; a normal build never needs to.
- `tools/lines.cjs` checks that the thread running down the timeline is
  unbroken at any width. Run it against a dev server after layout changes.
- `npm audit` reports advisories in `sharp` and `postcss`. Both are build-time
  dependencies of Next.js itself and neither is reachable from this site at
  runtime. `npm audit fix --force` "resolves" them by downgrading Next to
  version 9, which would be far worse. Left alone deliberately.
