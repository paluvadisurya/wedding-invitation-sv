/* ═══════════════════════════════════════════════════════════════════
   main.js — orchestration.
   Loads config.json (the single source of truth), renders every scene
   in the chosen language, and wires countdown, calendar, RSVP, wishes,
   sharing, music and all scroll choreography.
   ═══════════════════════════════════════════════════════════════════ */

import {
  reduced, motionState,
  initDust, initPetals, initPointerFX, initCursor, initMagnetic, initThread,
} from './fx.js';
import { googleCalUrl, downloadICS } from './calendar.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let C = null;                 // config
let lang = localStorage.getItem('ss-lang') === 'te' ? 'te' : 'en';
let petals = { shower() {}, burst() {}, spark() {} };
let calTarget = null;         // event awaiting calendar choice
let experienced = false;      // true once the loader has lifted

/* ── i18n helpers ───────────────────────────────────────────────── */
const t = (k) => (C.strings?.[lang]?.[k] ?? C.strings?.en?.[k] ?? k);
const L = (o) => (o ? (o[lang] || o.en || '') : '');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const tpl = (k, vars = {}) => t(k).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? '');

const locale = () => (lang === 'te' ? 'te-IN' : 'en-IN');
const tz = () => C.wedding?.timeZone || 'Asia/Kolkata';
const fmt = (d, opts) => new Intl.DateTimeFormat(locale(), { timeZone: tz(), ...opts }).format(d);
const fmtDay = (d) => fmt(d, { weekday: 'long', day: 'numeric', month: 'long' });
const fmtFull = (d) => fmt(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmtTime = (d) => fmt(d, { hour: 'numeric', minute: '2-digit' });

const coupleNames = () => `${L(C.couple.bride.name)} & ${L(C.couple.groom.name)}`;
const siteUrl = () => C.meta?.siteUrl || location.href.split('#')[0];

/* ═══════════════ boot ═══════════════ */
boot();

async function boot() {
  const t0 = performance.now();
  try {
    const res = await fetch('config.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    C = await res.json();
  } catch (err) {
    configError(err);
    return;
  }

  applyPalette();
  renderAll();
  wireStaticHandlers();
  startCountdown();

  if (!reduced) {
    initDust($('#fx-dust'));
    petals = initPetals($('#fx-petals'));
  }
  initPointerFX(petals);
  initCursor();
  initMagnetic();
  initThread();
  initParallax();
  initSectionTriggers();

  // let the kolam finish drawing before the curtain lifts
  const minShow = reduced ? 0 : 2050;
  const wait = Math.max(0, minShow - (performance.now() - t0));
  setTimeout(liftLoader, wait);
}

function liftLoader() {
  $('#loader').classList.add('done');
  document.body.classList.add('ready');
  experienced = true;
  initReveals();
  settleNames();
}

function configError(err) {
  const inner = $('.loader-inner');
  inner.innerHTML = `
    <p style="font-family:var(--font-display);font-size:1.4rem;color:var(--ivory)">Srivalli &amp; Surya</p>
    <p style="margin-top:14px;max-width:34em;color:var(--text-dim);font-size:.9rem;line-height:1.7">
      The invitation data (<code>config.json</code>) couldn't be loaded (${esc(err.message)}).<br/>
      If you opened <code>index.html</code> directly from disk, please serve the folder over HTTP —
      for example: <code>npx serve</code> — and reload.
    </p>`;
}

/* ═══════════════ palette & meta ═══════════════ */
function applyPalette() {
  const map = {
    gold: '--gold', goldBright: '--gold-bright', goldDeep: '--gold-deep',
    marigold: '--marigold', kumkum: '--kumkum', rose: '--rose', blush: '--blush',
    lavender: '--lavender', mint: '--mint', peach: '--peach', powder: '--powder',
    ivory: '--ivory', teal: '--teal',
  };
  for (const [k, cssVar] of Object.entries(map)) {
    const v = C.palette?.[k];
    if (v) document.documentElement.style.setProperty(cssVar, v);
  }
  if (C.meta?.themeColor) $('meta[name="theme-color"]')?.setAttribute('content', C.meta.themeColor);
}

/* ═══════════════ render everything (idempotent, re-run on language switch) ═══════════════ */
function renderAll() {
  document.documentElement.lang = lang;
  document.title = L(C.meta?.title) || document.title;
  $('meta[name="description"]')?.setAttribute('content', L(C.meta?.description));

  // static labels
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });

  // language pill
  $$('#lang-toggle [data-lang-opt]').forEach((el) => {
    el.classList.toggle('active', el.dataset.langOpt === lang);
  });
  $('#lang-toggle').setAttribute('aria-label', t('misc.langLabel'));

  renderHero();
  renderInvocation();
  renderStory();
  renderEvents();
  renderTravel();
  renderGallery();
  renderRsvp();
  renderWishes();
  renderFinale();
  renderCountdownMeta();

  if (experienced) {
    // language switch after load: content is rebuilt — show it instantly
    $$('[data-reveal]').forEach((el) => el.classList.add('in'));
    $$('.name-line').forEach((el) => el.classList.add('in'));
  } else {
    stageReveals();
  }
}

/* ── hero ───────────────────────────────────────────────────────── */
function renderHero() {
  $('#invocation-line').textContent = C.invocation?.script || '';

  const bride = L(C.couple.bride.name);
  const groom = L(C.couple.groom.name);
  const h1 = $('.hero-names');
  h1.setAttribute('aria-label', `${bride} & ${groom}`);
  splitName($('#name-bride'), bride);
  splitName($('#name-groom'), groom);

  // the "other" script as a shimmer line beneath the names
  const alt = lang === 'te'
    ? `${C.couple.bride.name.en} & ${C.couple.groom.name.en}`
    : `${C.couple.bride.name.te || ''} & ${C.couple.groom.name.te || ''}`;
  $('#hero-names-te').textContent = alt;

  const m = new Date(C.wedding.muhurthamISO);
  $('#hero-date').textContent = `${fmtFull(m)} · ${fmtTime(m)}`;
  $('#hero-hashtag').textContent = C.couple.hashtag || '';
  $('#hero-hashtag').hidden = !C.couple.hashtag;

  mountPhoto($('[data-photo="hero"]'), C.photos?.hero, { scrim: false });
  buildToranam();
}

function splitName(el, name) {
  el.setAttribute('aria-hidden', 'true');
  if (reduced || experienced) { el.textContent = name; return; }
  el.innerHTML = '';
  let parts;
  try {
    parts = [...new Intl.Segmenter(locale(), { granularity: 'grapheme' }).segment(name)].map((s) => s.segment);
  } catch { parts = [name]; }
  parts.forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.style.setProperty('--i', i);
    s.textContent = ch;
    el.appendChild(s);
  });
}

/* once the letter entrance has played, flatten the spans so the
   parent's gradient sheen (background-clip: text) renders the names */
function settleNames() {
  $$('.name-line').forEach((el) => {
    const chars = $$('.ch', el).length;
    setTimeout(() => { el.textContent = el.textContent; }, chars * 55 + 1250);
  });
}

function buildToranam() {
  const host = $('#toranam');
  const w = Math.max(window.innerWidth, 360);
  const n = Math.ceil(w / 30);
  const yAt = (x) => {
    const tt = x / w;
    return (1 - tt) * (1 - tt) * 8 + 2 * (1 - tt) * tt * 30 + tt * tt * 8;
  };
  let leaves = '';
  for (let i = 0; i <= n; i++) {
    const x = (w / n) * i;
    const y = yAt(x);
    const len = i % 2 ? 30 : 24;
    leaves += `
      <g class="leaf" style="--i:${i % 7}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
        <path d="M0,0 C6,${len * 0.25} 6.5,${len * 0.68} 1.5,${len} C-4.5,${len * 0.68} -5,${len * 0.25} 0,0 Z"
              fill="#274d3c" stroke="#3f7a58" stroke-width=".7"/>
        <path d="M0,2 C1,${len * 0.4} 1,${len * 0.6} 1,${len - 3}" stroke="#d9b25f" stroke-width=".55" fill="none" opacity=".55"/>
      </g>
      ${i % 4 === 2 ? `<circle cx="${x.toFixed(1)}" cy="${(y + 2).toFixed(1)}" r="2.6" fill="#f0a835" stroke="#b06a1d" stroke-width=".6"/>` : ''}`;
  }
  host.innerHTML = `
    <svg viewBox="0 0 ${w} 74" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,8 Q ${w / 2},34 ${w},8" fill="none" stroke="#8a6a2f" stroke-width="1.6"/>
      ${leaves}
    </svg>`;
}

/* ── invocation ─────────────────────────────────────────────────── */
function renderInvocation() {
  $('#shloka').textContent = C.invocation?.shloka || '';
  $('#shloka-meaning').textContent = L(C.invocation?.translation);
}

/* ── story ──────────────────────────────────────────────────────── */
function renderStory() {
  $('#story-intro').textContent = L(C.story?.intro);
  const ol = $('#story-timeline');
  ol.innerHTML = (C.story?.timeline || []).map((step, i) => `
    <li data-reveal style="--d:${i * 0.12}s">
      <span class="story-step-label">${esc(L(step.label))}</span>
      <p>${esc(L(step.text))}</p>
    </li>`).join('');
  mountPhoto($('[data-photo="story"]'), C.photos?.story);
}

/* ── events ─────────────────────────────────────────────────────── */
function sideLabel(side) {
  return side === 'bride' ? t('events.brideSide') : side === 'groom' ? t('events.groomSide') : t('events.bothSides');
}
function townOf(ev) { return C.towns?.[ev.town] || null; }
function townLine(ev) {
  const tn = townOf(ev);
  return tn ? `${L(tn.name)}, ${L(tn.state)}` : '';
}
function eventMapsUrl(ev) { return ev.mapsUrl || townOf(ev)?.mapsUrl || ''; }

function renderEvents() {
  $('#legend-bride').textContent = `${t('events.brideSide')} · ${L(C.towns?.[C.couple.bride.town]?.name)}`;
  $('#legend-groom').textContent = `${t('events.groomSide')} · ${L(C.towns?.[C.couple.groom.town]?.name)}`;

  const list = [...(C.events || [])].sort((a, b) => new Date(a.startISO) - new Date(b.startISO));
  const host = $('#events-list');
  host.innerHTML = '';

  let lastDay = '';
  let flip = false;
  let idx = 0;

  for (const ev of list) {
    const start = new Date(ev.startISO);
    const dayKey = start.toLocaleDateString('en-CA', { timeZone: tz() });
    if (dayKey !== lastDay) {
      lastDay = dayKey;
      host.insertAdjacentHTML('beforeend',
        `<h3 class="day-head" data-reveal><span>${esc(fmtDay(start))}</span></h3>`);
    }

    const tn = townOf(ev);
    const venue = L(ev.venueName);
    const maps = eventMapsUrl(ev);
    const dress = L(ev.dressCode);
    const altName = lang === 'te' ? (ev.name.en || '') : (ev.name.te || '');
    const pos = ev.highlight ? '' : (flip = !flip, flip ? 'pos-l' : 'pos-r');

    const chips = [
      tn
        ? `<span class="chip"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-map"/></svg>${esc(L(tn.name))} · ${esc(sideLabel(ev.side))}</span>`
        : `<span class="chip chip-muted">${esc(t('events.townTBA'))}</span>`,
      dress ? `<span class="chip">${esc(t('events.dressCode'))}: ${esc(dress)}</span>` : '',
    ].join('');

    const venueHtml = tn
      ? (venue
        ? `<p class="event-venue"><svg width="13" height="13" viewBox="0 0 48 48" aria-hidden="true" style="color:var(--accent);flex:none;align-self:center"><use href="#i-map"/></svg> ${esc(venue)}, ${esc(townLine(ev))}</p>`
        : `<p class="event-venue"><span class="tba">${esc(t('events.venueTBA'))}</span></p>`)
      : '';

    const live = ev.highlight && C.livestream?.url
      ? `<a class="mini-btn" href="${esc(C.livestream.url)}" target="_blank" rel="noopener"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-video"/></svg>${esc(t('events.watchLive'))}</a>`
      : '';

    host.insertAdjacentHTML('beforeend', `
      <article class="event-card side-${esc(ev.side)} ${ev.highlight ? 'highlight' : ''} ${pos}" data-reveal style="--d:${(idx % 3) * 0.1}s">
        ${ev.highlight ? `<p class="badge-main"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-sparkle"/></svg><span>${esc(t('events.mainEvent'))}</span></p>` : ''}
        <div class="event-top">
          <div class="event-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-${esc(ev.icon || 'diya-sm')}"/></svg></div>
          <div>
            <h4 class="event-name">${esc(L(ev.name))}</h4>
            ${altName ? `<p class="event-name-alt">${esc(altName)}</p>` : ''}
            <p class="event-when">${esc(fmtTime(start))}</p>
          </div>
        </div>
        <p class="event-tagline">${esc(L(ev.tagline))}</p>
        <div class="event-chips">${chips}</div>
        ${venueHtml}
        <div class="event-actions">
          ${maps ? `<a class="mini-btn" href="${esc(maps)}" target="_blank" rel="noopener"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-map"/></svg>${esc(t('events.directions'))}</a>` : ''}
          <button class="mini-btn" type="button" data-cal-event="${esc(ev.id)}"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-calendar"/></svg>${esc(t('events.addCal'))}</button>
          ${live}
        </div>
      </article>`);
    idx++;
  }
}

/* ── travel ─────────────────────────────────────────────────────── */
function renderTravel() {
  const host = $('#travel-grid');
  host.innerHTML = (C.travel || []).map((block, bi) => {
    const tn = C.towns?.[block.town];
    if (!tn) return '';
    const side = block.town === C.couple.bride.town ? 'bride' : 'groom';
    const routes = (block.routes || []).map((r) => `
      <li>
        <span class="route-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-${esc(r.icon)}"/></svg></span>
        <div>
          <p class="route-title">${esc(L(r.title))}</p>
          <p class="route-text">${esc(L(r.text))}</p>
        </div>
      </li>`).join('');
    const options = (block.stay?.options || []).map((o) => `
      <li><b>${esc(L(o.name) || o.name || '')}</b>${o.note ? ` — ${esc(L(o.note))}` : ''}${o.phone ? ` · <a href="tel:${esc(o.phone)}" style="color:var(--gold-bright)">${esc(o.phone)}</a>` : ''}</li>`).join('');
    return `
      <div class="travel-card side-${side}" data-reveal style="--d:${bi * 0.12}s">
        <h3 class="travel-town">${esc(L(tn.name))}
          <span class="travel-state">${esc(L(tn.state))}</span>
          <span class="travel-side-tag">${esc(sideLabel(side))}</span>
        </h3>
        <ul class="travel-routes">${routes}</ul>
        <div class="travel-stay">
          <p class="stay-title">${esc(t('travel.stay'))}</p>
          ${options ? `<ul class="stay-options">${options}</ul>` : `<p class="stay-note">${esc(L(block.stay?.note))}</p>`}
        </div>
        ${tn.mapsUrl ? `<div class="travel-map-link"><a class="mini-btn" href="${esc(tn.mapsUrl)}" target="_blank" rel="noopener"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-map"/></svg>${esc(t('travel.openMap'))}</a></div>` : ''}
      </div>`;
  }).join('');
}

/* ── gallery ────────────────────────────────────────────────────── */
function renderGallery() {
  const host = $('#gallery-grid');
  host.innerHTML = '';
  const items = [C.photos?.hero, C.photos?.story, C.photos?.finale, ...(C.photos?.galleryExtra || [])]
    .filter(Boolean);
  items.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('data-reveal', '');
    item.style.setProperty('--d', `${(i % 3) * 0.12}s`);
    const slot = document.createElement('div');
    slot.className = 'photo-slot';
    item.appendChild(slot);
    host.appendChild(item);
    mountPhoto(slot, p);
  });
}

/* ── photo slots with graceful placeholders ─────────────────────── */
function mountPhoto(slot, cfg, opts = {}) {
  if (!slot) return;
  slot.innerHTML = `
    <div class="ph">
      <svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-lotus"/></svg>
      <span>${esc(t('gallery.photoSoon'))}</span>
    </div>`;
  if (!cfg?.src) return;
  const img = new Image();
  img.loading = 'lazy';
  img.decoding = 'async';
  img.alt = L(cfg.alt) || '';
  img.addEventListener('load', () => {
    slot.querySelector('.ph')?.remove();
    slot.appendChild(img);
    if (opts.scrim) slot.insertAdjacentHTML('beforeend', '<div class="scrim"></div>');
  });
  // on error: placeholder simply stays — a missing photo never breaks the page
  img.src = cfg.src;
}

/* ── rsvp ───────────────────────────────────────────────────────── */
function rsvpChannel() {
  if (C.rsvp?.whatsappNumber) return 'whatsapp';
  if (C.rsvp?.email) return 'email';
  return 'copy';
}

function renderRsvp() {
  const ch = rsvpChannel();
  $('#rsvp-send-label').textContent = ch === 'whatsapp' ? t('rsvp.send') : ch === 'email' ? t('rsvp.sendEmail') : t('rsvp.sendCopy');
  $('#rsvp-privacy').textContent = L(C.rsvp?.privacy);
  const dl = $('#rsvp-deadline');
  if (C.rsvp?.deadlineISO) {
    dl.hidden = false;
    dl.textContent = tpl('rsvp.deadline', {
      date: fmt(new Date(`${C.rsvp.deadlineISO}T12:00:00+05:30`), { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  } else { dl.hidden = true; }
}

function rsvpMessage() {
  const name = $('#rsvp-name').value.trim();
  const attending = $('input[name="attending"]:checked').value === 'yes';
  const guests = $('#rsvp-guests').value;
  const note = $('#rsvp-message').value.trim();
  const lines = [
    `🌸 ${tpl('share.rsvpTitle', { names: coupleNames() })}`,
    `${t('rsvp.name')}: ${name}`,
    `${t('rsvp.attending')}: ${attending ? t('rsvp.yes') : t('rsvp.no')}`,
  ];
  if (attending) lines.push(`${t('rsvp.guests')}: ${guests}`);
  if (note) lines.push(`${t('rsvp.message')}: ${note}`);
  return lines.join('\n');
}

/* ── wishes ─────────────────────────────────────────────────────── */
function renderWishes() {
  $('#blessing-script').textContent = C.blessing?.script || '';
  $('#blessing-meaning').textContent = L(C.blessing?.translation);
  $('#wish-text').placeholder = t('wishes.placeholder');
  $('#wish-send-label').textContent = t('wishes.send');
}

/* ── finale ─────────────────────────────────────────────────────── */
function renderFinale() {
  $('#finale-bride').textContent = L(C.couple.bride.name);
  $('#finale-groom').textContent = L(C.couple.groom.name);
  $('#finale-hashtag').textContent = C.couple.hashtag || '';
  $('#finale-hashtag').hidden = !C.couple.hashtag;

  const liveBtn = $('#footer-livestream');
  if (C.livestream?.url) { liveBtn.hidden = false; liveBtn.href = C.livestream.url; }
  else liveBtn.hidden = true;

  const grid = $('#contacts-grid');
  const cards = (C.contacts || []).filter((c) => L(c.name) || c.phone).map((c) => {
    const inner = `
      <svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-phone"/></svg>
      <span><span class="contact-name">${esc(L(c.name))}</span>
      <span class="contact-side">${esc(sideLabel(c.side))}</span>
      ${c.phone ? `<span class="contact-phone">${esc(c.phone)}</span>` : ''}</span>`;
    return c.phone
      ? `<a class="contact-card" href="tel:${esc(c.phone)}">${inner}</a>`
      : `<div class="contact-card">${inner}</div>`;
  }).join('');
  grid.innerHTML = cards;
  $('#contacts').hidden = !cards;
}

/* ── countdown ──────────────────────────────────────────────────── */
function renderCountdownMeta() {
  const m = new Date(C.wedding.muhurthamISO);
  $('#count-date').textContent = `${fmtFull(m)} · ${fmtTime(m)} IST`;
}

function startCountdown() {
  const target = new Date(C.wedding.muhurthamISO).getTime();
  const cells = { d: $('#cd-days'), h: $('#cd-hours'), m: $('#cd-mins'), s: $('#cd-secs') };
  let done = false;

  function setCell(el, val) {
    const str = String(val);
    if (el.textContent === str) return;
    el.textContent = str;
    if (!reduced && experienced) {
      el.classList.remove('tick');
      void el.offsetWidth;
      el.classList.add('tick');
    }
  }

  function update() {
    let diff = target - Date.now();
    if (diff <= 0) {
      diff = 0;
      if (!done) { done = true; $('#count-date').textContent = t('countdown.begun'); }
    }
    const sec = Math.floor(diff / 1000);
    setCell(cells.d, Math.floor(sec / 86400));
    setCell(cells.h, Math.floor((sec % 86400) / 3600));
    setCell(cells.m, Math.floor((sec % 3600) / 60));
    setCell(cells.s, sec % 60);
  }
  update();
  setInterval(update, 1000);
}

/* ═══════════════ interaction wiring (static elements only) ═══════════════ */
function wireStaticHandlers() {
  // language
  $('#lang-toggle').addEventListener('click', () => {
    lang = lang === 'en' ? 'te' : 'en';
    localStorage.setItem('ss-lang', lang);
    renderAll();
  });

  // music (only if configured)
  const audio = $('#bg-music');
  const musicBtn = $('#music-toggle');
  if (C.music?.src) {
    audio.src = C.music.src;
    musicBtn.hidden = false;
    musicBtn.setAttribute('aria-label', t('misc.musicOn'));
    musicBtn.addEventListener('click', async () => {
      try {
        if (audio.paused) { audio.volume = 0.55; await audio.play(); musicBtn.setAttribute('aria-pressed', 'true'); }
        else { audio.pause(); musicBtn.setAttribute('aria-pressed', 'false'); }
      } catch { /* playback blocked — stay muted */ }
    });
  }

  // topbar veil
  window.addEventListener('scroll', () => {
    $('#topbar').classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // calendar popover (delegated — event cards re-render on language switch)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-cal-event]');
    const pop = $('#cal-pop');
    if (trigger) {
      calTarget = C.events.find((ev) => ev.id === trigger.dataset.calEvent) || null;
      if (!calTarget) return;
      const r = trigger.getBoundingClientRect();
      pop.hidden = false;
      const pw = pop.offsetWidth, ph = pop.offsetHeight;
      let x = Math.min(Math.max(10, r.left), window.innerWidth - pw - 10);
      let y = r.bottom + 8;
      if (y + ph > window.innerHeight - 10) y = r.top - ph - 8;
      pop.style.left = `${x}px`;
      pop.style.top = `${y}px`;
      return;
    }
    if (!e.target.closest('#cal-pop')) pop.hidden = true;
  });
  // dismiss the popover only after a real scroll, not a sub-pixel nudge
  let popScrollAnchor = 0;
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cal-event]') || e.target.closest('#save-the-date')) popScrollAnchor = window.scrollY;
  }, true);
  window.addEventListener('scroll', () => {
    if (Math.abs(window.scrollY - popScrollAnchor) > 48) $('#cal-pop').hidden = true;
  }, { passive: true });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('#cal-pop').hidden = true; });

  $$('.cal-opt').forEach((btn) => btn.addEventListener('click', () => {
    if (!calTarget) return;
    const ev = calTarget;
    const tn = townOf(ev);
    const venue = L(ev.venueName);
    const location = tn
      ? (venue ? `${venue}, ${townLine(ev)}` : townLine(ev))
      : t('events.townTBA');
    const payload = {
      title: `${L(ev.name)} — ${coupleNames()}`,
      details: [L(ev.tagline), eventMapsUrl(ev), C.couple.hashtag, siteUrl()].filter(Boolean).join('\n'),
      location, ev, timeZone: tz(),
    };
    if (btn.dataset.cal === 'google') window.open(googleCalUrl(payload), '_blank', 'noopener');
    else downloadICS(payload);
    $('#cal-pop').hidden = true;
    toast(t('misc.calOpened'));
  }));

  // save-the-date = add the muhurtham to the guest's calendar
  $('#save-the-date').addEventListener('click', (e) => {
    const main = C.events.find((ev) => ev.highlight) || C.events.find((ev) => ev.id === 'muhurtham');
    if (!main) return;
    e.stopPropagation();
    calTarget = main;
    const pop = $('#cal-pop');
    const r = e.currentTarget.getBoundingClientRect();
    pop.hidden = false;
    let x = Math.min(Math.max(10, r.left), window.innerWidth - pop.offsetWidth - 10);
    let y = r.bottom + 8;
    if (y + pop.offsetHeight > window.innerHeight - 10) y = r.top - pop.offsetHeight - 8;
    pop.style.left = `${x}px`;
    pop.style.top = `${y}px`;
  });

  // share
  const share = async () => {
    const m = new Date(C.wedding.muhurthamISO);
    const text = tpl('share.inviteMsg', {
      names: coupleNames(),
      date: `${fmtFull(m)}, ${fmtTime(m)}`,
      url: siteUrl(),
      hashtag: C.couple.hashtag || '',
    }).trim();
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch { /* cancelled */ }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    }
  };
  $('#share-invite').addEventListener('click', share);
  $('#footer-share').addEventListener('click', share);

  // rsvp
  $('#rsvp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!$('#rsvp-name').value.trim()) { toast(t('rsvp.nameMissing')); $('#rsvp-name').focus(); return; }
    sendToFamily(rsvpMessage(), tpl('share.rsvpTitle', { names: coupleNames() }));
    petals.burst(window.innerWidth / 2, window.innerHeight * 0.4, 22);
  });
  $('#rsvp-form').addEventListener('change', (e) => {
    if (e.target.name === 'attending') {
      $('#rsvp-guests-field').classList.toggle('hidden-soft', e.target.value === 'no' && e.target.checked);
    }
  });
  $$('.step-btn').forEach((b) => b.addEventListener('click', () => {
    const input = $('#rsvp-guests');
    input.value = Math.min(20, Math.max(1, (parseInt(input.value, 10) || 1) + Number(b.dataset.step)));
  }));

  // wishes
  $('#wish-send').addEventListener('click', () => {
    const wish = $('#wish-text').value.trim();
    if (!wish) { toast(t('wishes.empty')); $('#wish-text').focus(); return; }
    sendToFamily(`💛 ${tpl('share.wishTitle', { names: coupleNames() })}\n“${wish}”`, tpl('share.wishTitle', { names: coupleNames() }));
    petals.burst(window.innerWidth / 2, window.innerHeight * 0.45, 22);
  });
}

function sendToFamily(message, subject) {
  const ch = rsvpChannel();
  if (ch === 'whatsapp') {
    window.open(`https://wa.me/${C.rsvp.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  } else if (ch === 'email') {
    location.href = `mailto:${C.rsvp.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  } else {
    (navigator.clipboard?.writeText(message) || Promise.reject())
      .then(() => toast(t('rsvp.copied')))
      .catch(() => toast(t('rsvp.copied')));
  }
}

/* ═══════════════ scroll choreography ═══════════════ */
function stageReveals() {
  // stagger children scene by scene
  $$('.scene').forEach((scene) => {
    $$('[data-reveal]', scene).forEach((el, i) => {
      if (!el.style.getPropertyValue('--d')) {
        el.style.setProperty('--d', `${Math.min(i * 0.09, 0.55)}s`);
      }
    });
  });
}

function initReveals() {
  if (reduced) {
    $$('[data-reveal]').forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  // re-observe anything created later (language switches re-render nodes)
  new MutationObserver((muts) => {
    for (const m of muts) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches?.('[data-reveal]') && !node.classList.contains('in')) io.observe(node);
        node.querySelectorAll?.('[data-reveal]:not(.in)').forEach((el) => io.observe(el));
      }
    }
  }).observe($('#main'), { childList: true, subtree: true });
}

function initSectionTriggers() {
  if (reduced) { $('#finale')?.classList.add('lit'); return; }
  const burstIO = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) {
        petals.shower(26);
        burstIO.unobserve(en.target);
      }
    }
  }, { threshold: 0.35 });
  $$('[data-petal-burst]').forEach((el) => burstIO.observe(el));

  const finaleIO = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) {
        en.target.classList.add('lit');
        petals.shower(34);
        finaleIO.unobserve(en.target);
      }
    }
  }, { threshold: 0.3 });
  finaleIO.observe($('#finale'));
}

/* parallax — depth on scroll + device tilt */
function initParallax() {
  if (reduced) return;
  const els = $$('[data-parallax]');
  if (!els.length) return;
  let ticking = false;
  function apply() {
    ticking = false;
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) continue;
      const f = parseFloat(el.dataset.parallax) || 0.3;
      const centered = r.top + r.height / 2 - vh / 2;
      const y = -centered * f * 0.14 + motionState.tiltY * 8 * f;
      const x = motionState.tiltX * 12 * f;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('deviceorientation', req, { passive: true });
  window.addEventListener('resize', () => { req(); buildToranam(); }, { passive: true });
  apply();
}

/* ── toast ──────────────────────────────────────────────────────── */
let toastTimer = 0;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}
