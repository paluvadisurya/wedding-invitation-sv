# Design notes — Srivalli & Surya

This document is the argument behind the site. It records what was considered,
what was killed, and why the surviving idea is the right one. If you are
changing something here later, read the reasoning before you overturn it.

---

## 1. The fact the site is built around

The schedule is not a list. Until 25 August there are **two weddings happening
at once**, three hundred kilometres apart — Srivalli's in Wanaparthy, Surya's in
Vinukonda — mirroring each other morning for morning. Pellikoothuru and
Pellikoduku are the same rite performed twice, in two towns, on the same
Sunday. Then, on the evening of the 25th, at a ceremony whose name literally
means *to go out and receive*, they meet.

Any design that renders this as one vertical list has thrown away the only
structurally interesting thing about the event. Everything below follows from
refusing to do that.

A second fact, easy to miss: **the engagement already happened**, on 9 July.
The site therefore has a past as well as a future, and has to hold memory and
anticipation in the same frame without treating the past as dead weight.

---

## 2. Three directions, two killed

### A. The Gopuram — killed

The page as the tiers of a temple tower: each section a receding storey,
narrowing as you climb, the kalash at the summit.

**Why it dies.** A gopuram narrows *upward*; a web page moves *downward*. You
either invert the architecture, which is nonsense, or you scroll toward the
base, which reads as descending into a plinth. Worse, it is decoration wearing
structure's clothes: the tiers would not correspond to anything in the actual
event. It answers "what shall we make it look like" rather than "what is
true about these five days". A competent agent produces this in ten minutes,
and it would have looked fine, which is exactly the problem.

### B. The Mandala — killed as the primary structure, kept in one place

Everything radial. The five days as concentric rings, the two sides as opposing
arcs, the muhurtham at the centre. Genuine rotational symmetry, properly
generated.

**Why it dies.** Twelve ceremonies on a 390px screen, arranged radially, is
unusable. A guest at five in the morning looking for a function hall does not
want a diagram; they want a time, a town, and a phone number. Radial layouts
also collapse the sequence — and the sequence is the content. The idea was too
beautiful to be right.

**What survives.** Radial geometry is genuinely correct for *one* thing — a
countdown — and it is reserved for that, and used nowhere else.

### C. The Thread — built

The whole site hangs from a single cord that parts, runs as two, is knotted,
and travels on.

Before a Telugu wedding a protective thread — the **kankanam** — is tied on the
bride and on the groom **separately, in their own houses, on the same day**. It
is untied only after the wedding is over. Two threads, two houses, one knot.
That is not a metaphor anyone invented for this website; it is the literal
shape of the ritual, and it happens to be the literal shape of this schedule.

That is the test an ornament has to pass: *can it answer for why it is on the
page*. A river could not. A thread can.

---

## 3. The signature element

**One continuous cord running the entire length of the site.** All boldness is
spent here; everything else is kept deliberately quiet so that it lands.

It is not a decorative flourish laid over a timeline — it *is* the timeline. It
carries the navigation, the schedule, and the ornament in one object:

- It **begins as one** through the engagement, when both families were in one
  city.
- It **parts** into turmeric and kumkum for the two towns.
- It runs as **two parallel lanes** through 23 and 24 August, with mirrored
  ceremonies level with one another so the symmetry is visible, not merely
  stated.
- On the 25th, one lane goes **dashed** — the groom's party is driving, not
  celebrating, and a journey should not be dressed as a ceremony.
- At Edurukollu it is **knotted**: the strands cross, genuinely over and under,
  swing past each other and merge. It is the only place on the site where two
  lines touch.
- It **drifts** three hundred kilometres to Vinukonda for the reception.
- It ends in a **kalash**, the vessel set at the summit of a temple tower — the
  one place the thread stops rather than continues.

The shape is derived from the ceremony data at build time, not hard-coded.
Delete Edurukollu from the config and the knot moves to wherever the families
actually meet. That is what makes it a system rather than a drawing.

**A continuity test ships with the repo** (`tools/lines.cjs`), because a thread
with a gap in it is worse than no thread at all. It walks the rendered page and
fails if the cord is broken at any width. It caught four real breaks during the
build that were invisible to the eye.

---

## 4. Palette

Quarried from the wedding's own materials — stone and light, not gold and
velvet. Saturated colour is used as punctuation and never as wallpaper.

| Token | Hex | What it is | Where it is allowed |
|---|---|---|---|
| `--c-stone` | `#EDEFE9` | Limestone, faintly cool | The page itself |
| `--c-jasmine` | `#FBFBF7` | Raised surfaces, 1.12:1 on stone | Panels, deliberately barely-there |
| `--c-basalt` | `#171A17` | Dark granite, not black | Primary text — 15.15:1 |
| `--c-granite` | `#5A625C` | Weathered stone | Secondary text — 5.43:1 |
| `--c-turmeric` | `#C8891B` | Pasupu | **Fill only** — 2.57:1, never text |
| `--c-kumkum` | `#B22A22` | Kumkum | Vinukonda — 5.58:1 |
| `--c-tulsi` | `#2E6650` | Basil, mango leaf | The confluence, and every link — 5.79:1 |

Turmeric and kumkum are not decorative choices. *Pasupu-kumkuma* is a single
phrase in Telugu — the two substances are always given together, never apart.
Assigning one to each town, and letting them cross at the knot, means the
colour scheme is saying the same thing as the layout. The assignment is to the
**towns**, not to genders; Wanaparthy is turmeric because Wanaparthy comes
first in the alphabet, and that is the entire reason.

Turmeric fails AA for text at 2.57:1, so it is restricted to fills and strokes
and carries a text-safe sibling (`--c-turmeric-ink`, `#8A5B06`, 5.06:1) for
type. Every ratio in that table was measured, not estimated.

**Deliberately not used:** `#F4F1EA` cream with a `#D97757` terracotta accent.
That pairing is the current house style of AI-generated design and would read
instantly as a tell. The ground here is cooler and greener than cream; the
accents are a mustard-ochre and a blue-leaning red, not a soft orange.

---

## 5. Typography

Two families. Both variable, both self-hosted, both subset and instanced down
to what this site actually sets — **73KB for the pair**, down from 213KB before
subsetting.

**Display — Fraunces.** Axes kept: `opsz` 9–144 and `wght` 100–900. `SOFT` is
pinned to 0 for sharp, chiselled terminals — carved rather than soft — and
`WONK` to 1 for the characteristic alternate forms. Optical sizing is left on
`auto`, so the letterforms genuinely re-cut themselves as they scale: fine
hairlines and tight fitting at 124px, sturdier at 20px. That is the axis
earning its bytes rather than being kept for show.

**Text — Anek Latin.** Drawn by the Indian Type Foundry as the Latin companion
to a nine-script Indic superfamily, so its proportions were negotiated
*against* Telugu rather than imposed on it. That is a real reason to choose it
over a neutral grotesque, and it is not a font anyone reaches for by default.
Its width axis is genuinely lovely and was **cut anyway** — it cost 58KB, and
that is not a trade worth making for a guest on rural 4G.

Avoided on purpose: Playfair, Cormorant, Cinzel, Marcellus, anything script,
and Inter.

The scale is fluid and **generated from a formula**, interpolating linearly
between the 390px and 1440px viewports — `slope = (max − min) / 1050`. Twelve
steps, no eyeballed values. Tracking tightens as type grows and opens right out
for the small tracked labels.

---

## 6. Layout

**Mobile-first, and the desktop is a different composition rather than a wider
one.**

- **390px** — the thread runs down a 44px rail at the left edge; ceremonies sit
  to its right in a single column. A day with two parallel ceremonies stacks
  them, each with its own dot on its own lane.
- **≥992px** — the rail moves to a 148px gutter at the centre and the two towns
  take a column each. Mirrored ceremonies sit **level with one another**, which
  is the entire argument of the section made visible. The bride's column is
  set right-aligned and the groom's left-aligned, so both lean into the thread.
  Day markers sit *between* the two lanes, on the cord itself, because the date
  belongs to both towns equally.

Once the families join, shared ceremonies are centred on the single thread with
a page-coloured ground, so the cord passes behind each one rather than through
the middle of the type — ceremonies read as beads threaded onto it.

Everything resolves to a token. The spacing scale is built on a 4px base, and
`--pulli` (24px) is both the dot pitch of the kolam grid and the module the
layout is a multiple of, so ornament and layout share one rhythm instead of
merely coexisting. The radius scale is nearly flat — `0`, `2px`, `3px` — because
temple architecture is chamfered and tiered, not rounded; anything that wants
to look soft is drawn in SVG where the curve can mean something. There are
exactly two shadows on the site and both are almost invisible: elevation is
carried by value and hairline, not by blur.

---

## 7. Ornament

All hand-authored SVG, all generated from rules, no raster and no AI imagery.

**The kolam is real.** A kolam begins as a grid of dots chalked on the ground at
dawn; the line is walked around them in one unbroken stroke until every dot is
enclosed. In the interlaced kind — *sikku kolam* — the stroke behaves exactly
like a ball on a billiard table: it travels at 45°, reflects off the edges of
the grid, and returns to where it began. Some grids close in a single loop,
others need several, and **which is which is decided by arithmetic, not by the
person drawing**.

That is the whole algorithm in `src/lib/ornament/kolam.ts`. Change `cols` and
`rows` and you get a different, still-correct kolam. Where the trajectory
strikes an exact corner both coordinates reflect at once and the line doubles
back on itself; left alone that renders as a spike, so those points are
resolved into the small round turn a hand would actually draw there. The pulli
are drawn last, over the stroke, because they are the reason the figure exists.

The thread's geometry is likewise parametric — expressed in a normalised
100-unit viewBox so one definition serves the 44px phone rail and the 148px
desktop gutter, scaling uniformly rather than distorting. The over-and-under at
the knot is done with a casing stroke in the page's own colour, so the crossing
is genuinely woven rather than two lines that happen to overlap.

---

## 8. Motion

Choreographed, not decorated. **No animation library** — one
`IntersectionObserver`, mounted once, that marks elements as they arrive.
Everything else is declared in CSS. A wedding invitation opened on a mid-range
Android phone cannot afford thirty kilobytes of JavaScript to fade some text in.

Three rules:

1. **The thread draws itself.** It is a cord being laid down the page as you
   descend, so it grows from where it started. Shaped pieces are drawn
   stroke-first via `stroke-dashoffset`, with `pathLength` normalised to 1 so
   one rule serves every curve.
2. **Ceremonies arrive out of the thread**, moving away from it — the bride's
   side leftward, the groom's rightward, shared ones rising in place. They
   belong to the cord, so that is where they come from. Nothing on this site
   fades upward from twenty pixels below.
3. **Nothing costs more than it earns.** Every animated property is one the
   compositor handles alone: `transform`, `opacity`, `stroke-dashoffset`. No
   layout is triggered by any of it.

`prefers-reduced-motion` is a **designed variant, not a disabled one**: the page
renders complete and still, thread already drawn, every ceremony in place. It
is verified by the same continuity test as the animated version. And if
hydration never happens, a three-second failsafe in the document head reverts
to that same complete version, so nothing can ever be left invisible.

---

## 9. Honesty about what we do not know

Three ceremony meanings — Kotnam, Odugu, and the note on the engagement venue —
are **left as `null` in the config rather than invented**. They render as a
quiet, designed state ("The family is still writing this one") instead of
plausible-sounding fiction. A wedding invitation is not a place to guess at
what a ritual means.

The same applies to the muhurtham: the day is fixed, the hour is not, and the
site says so plainly rather than inventing a minute. `null` throughout this
codebase means "not decided yet" and is always a first-class, designed state —
never an empty cell, never the letters "TBD".

Road distances are shown only where they are actually known. Better a missing
number than a wrong one.
