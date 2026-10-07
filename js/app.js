import { FIELDS, STAGES, INTERESTS, AVATAR_CHOICES, AVATAR_COLORS, PEOPLE, EVENTS, SEED_POSTS, SEED_COMMENTS, SEED_GRAPH, FOLLOWS_BACK, POINT_RULES, LEVELS, REDEEM, PRACTITIONERS, POST_TYPES, LEVEL_PERKS, RULE_ICONS, PROMPTS, BUDDY, EVENT_Q, ICEBREAKERS, AUTO_REPLY, DEFAULT_AUTO_REPLY, MEMORY_SEED, EVENT_CHAT_SEED } from './data.js';
import { avatar } from './avatar.js';
import { ICON } from './icons.js';

/* ------------------------------------------------------------------ state */
const KEY = 'jobbuddy-proto-v1';
const BADGE_ID = 'TP-07';
const PAIR_CODE = '4812';

const fresh = () => ({
  onboarded: false, profile: null, regs: {}, live: null,
  badge: { screen: 'off' }, encounters: [], following: [], followers: [], circles: [],
  posts: [], helped: [], myComments: {}, points: 0, ledger: [], credits: {}, cvFree: 3, mockFree: 1, bookings: [], feedback: {}
});

let S = load();
const ui = { q: '', filter: 'all', seg: 'foryou', meSeg: 'upcoming', liveTab: 'here', roomTab: 'people', sheet: null, ob: null, compose: null, frame: 0, waved: {} };

function load() {
  let st; try { st = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY)) }; } catch { st = fresh(); }
  if (st.profile?.name === 'Xinyi Han') st.profile.name = 'Emma C.';
  return st;
}
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
window.addEventListener('storage', (e) => { if (e.key === KEY) { S = load(); render(); } });

/* ------------------------------------------------------------------ theme */
const THEME_KEY = 'jobbuddy-theme';
const themePref = () => localStorage.getItem(THEME_KEY) || 'system';
const mq = matchMedia('(prefers-color-scheme: light)');
function applyTheme() {
  const t = 'light'; // JoBuddy visual language is light-only
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]').content = t === 'light' ? '#ffffff' : '#121212';
}
mq.addEventListener('change', applyTheme);
applyTheme();

/* ---------------------------------------------------------------- helpers */
const $ = (s) => document.querySelector(s);
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ev = (id) => EVENTS.find((e) => e.id === id);
const reg = (id) => S.regs[id];
const ME_FACE = { emoji: '👩🏻', tint: '#8e9bd6' }; // Emma's avatar from the teammate prototype
const me = () => S.profile && { photo: 'people/me.jpg', ...S.profile, id: 'me', short: S.profile.name.split(' ')[0], headline: `${S.profile.field} · ${S.profile.stage}` };
const who = (id) => (id === 'me' ? me() : PEOPLE[id]);
// Two avatar systems: real profile photo (app, online) and ASCII Tappy avatar (in-person device & wall).
const av = (p, size = 40) => (p.emoji && !p.photo ? `<span class="ph emo" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.56)}px;background:${p.tint}33;box-shadow:inset 0 0 0 1.5px ${p.tint}66">${p.emoji}</span>` : p.photo ? `<span class="ph" style="width:${size}px;height:${size}px"><img src="${p.photo}" alt="" loading="lazy"></span>` : avatar(p.avatar, p.color, size, 0, 'round'));
const asc = (p, size = 40, extra = '') => avatar(p.avatar, p.color, size, 0, extra);
const go = (path) => { location.hash = '#/' + path; };
const demo = (label, a, x = '') => `<button class="demo" data-a="${a}" data-x="${x}"><span>DEMO</span>${label}</button>`;
const allPosts = () => [...S.posts, ...SEED_POSTS];

/* Grainy gradient art (teammate visual language) */
const PALETTES = [
  ['#f6e36b', '#f25c7a', '#5b7bf0', '#fbe8f0'], ['#6fbf5a', '#e8f2c8', '#3f8a3b', '#f7f3a1'],
  ['#7fb6f2', '#c8e6ff', '#3a6fb8', '#ffffff'], ['#b58be0', '#f2b0c9', '#6b8af0', '#f8e0a8'],
  ['#e58a5b', '#f7d3a8', '#b34a3a', '#ffe9d2'], ['#9fd6c0', '#f4f1c9', '#5aa38a', '#dff0ff'],
  ['#2b2b2b', '#6b6b6b', '#d6f36b', '#111111'], ['#f2c14e', '#f78154', '#4d9078', '#b4436c']
];
function art(seed, cls = '', st = '') {
  const p = PALETTES[seed % PALETTES.length];
  const bg = `radial-gradient(circle at ${20 + seed * 13 % 60}% ${25 + seed * 7 % 50}%, ${p[0]} 0 18%, transparent 42%),radial-gradient(circle at ${70 - seed * 11 % 40}% ${70 - seed * 5 % 30}%, ${p[1]} 0 22%, transparent 50%),radial-gradient(ellipse at 50% 110%, ${p[2]} 0 30%, transparent 65%),linear-gradient(${seed * 40}deg, ${p[3]}, ${p[1]})`;
  return `<div class="art ${cls}" style="background:${bg};${st}"></div>`;
}
const seedOf = (s) => [...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0);
// Monochrome line icons (filled when active) to match the app's modern UI — replaces the coloured blob icons.
const TAB_ICON = {
  home: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  community: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.8" cy="9.3" r="2.6"/><path d="M15.6 14.6c2.5-.3 4.4 1.3 4.9 4.4"/></svg>',
  messages: '<svg viewBox="0 0 24 24"><path d="M5.5 4.5h13a2.5 2.5 0 012.5 2.5v8a2.5 2.5 0 01-2.5 2.5H11l-4.5 3.5v-3.5h-1A2.5 2.5 0 013 15V7a2.5 2.5 0 012.5-2.5z"/></svg>',
  me: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c.9-4 3.8-6 7.5-6s6.6 2 7.5 6"/></svg>'
};

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.innerHTML = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function statusLabel(e, r) {
  if (!r) return '';
  return {
    pending: 'Pending approval', declined: 'Not approved', going: e.mode === 'online' ? 'Registered' : r.confirmed ? 'Confirmed' : 'Going',
    waitlist: `Waitlist · #${r.pos || 3}`, offered: 'Spot offered',
    checkedin: 'Checked in', attended: 'You went'
  }[r.status] || '';
}

function makePrompt(p) {
  const mine = S.profile?.interests || [];
  const tag = p.interests.find((t) => mine.includes(t));
  const list = tag ? PROMPTS.shared(tag) : PROMPTS.offer;
  return { tag: tag || (p.field === S.profile?.field ? S.profile.field : 'Career stories'), text: list[Math.floor(Math.random() * list.length)] };
}

/* ------------------------------------------------------------------ cover */
function cover(e, size = 'lg') {
  const [c1, c2] = e.cover;
  if (e.img) return `<div class="cover cover-${size} has-img" style="--c1:${c1};--c2:${c2}"><img src="${e.img}" alt="" loading="lazy">
    <span class="cover-mode">${e.mode === 'online' ? ICON.globe : ICON.pin}${e.mode === 'online' ? 'Online' : 'In person'}</span></div>`;
  return `<div class="cover cover-${size}" style="--c1:${c1};--c2:${c2}">
    <span class="cover-mode">${e.mode === 'online' ? ICON.globe : ICON.pin}${e.mode === 'online' ? 'Online' : 'In person'}</span>
    <span class="cover-title">${esc(e.title)}</span></div>`;
}

function eventRow(e) {
  const r = reg(e.id);
  return `<button class="row" data-a="nav" data-x="event/${e.id}">
    ${cover(e, 'sm')}
    <span class="row-main"><b>${esc(e.title)}</b>
      <small>${e.date} · ${e.mode === 'online' ? 'Online' : e.venue.split(',')[1]?.trim() || e.venue}</small>
      ${r ? `<i class="chip ${stCls(e, r)}">${statusLabel(e, r)}</i>` : `<small>${e.cost} · ${e.going} going</small>`}
      ${connLine(e, 18)}
    </span></button>`;
}

function eventCard(e) {
  return `<button class="card" data-a="nav" data-x="event/${e.id}">${cover(e, 'md')}<b>${esc(e.title)}</b><small>${e.when} · ${e.cost}</small></button>`;
}

/* ================================================================== VIEWS */
const V = {};

V.welcome = () => `
  <section class="welcome">
    <div class="welcome-art">${['female_1_0', 'male_2_1', 'female_3_2', 'male_1_0', 'female_2_1', 'male_4_1'].map((k, i) => avatar(k, AVATAR_COLORS[i], 64)).join('')}</div>
    <h1 class="wordmark">JobBuddy</h1>
    <p class="lead">Meet people at career events.<br>Keep them after.</p>
    <button class="btn primary" data-a="nav" data-x="onboarding">Get started</button>
    <button class="btn ghost" data-a="browse">Browse events first</button>
  </section>`;

V.onboarding = () => {
  if (!ui.ob) {
    const p = S.profile || {};
    ui.ob = { step: 0, name: p.name || '', field: p.field || '', stage: p.stage || '', interests: [...(p.interests || [])], fact: p.fact || '', avatar: p.avatar || AVATAR_CHOICES[0], color: p.color || AVATAR_COLORS[0], showStage: p.showStage || false };
  }
  const o = ui.ob;
  const chips = (list, key, multi) => list.map((v) => {
    const on = multi ? o[key].includes(v) : o[key] === v;
    return `<button class="pill ${on ? 'on' : ''}" data-a="ob-pick" data-x="${key}|${v}">${v}</button>`;
  }).join('');
  const steps = [
    `${S.onboarded ? '' : '<p class="eyebrow">New account · 2 quick steps</p>'}<h2>Hi. What should people call you?</h2>
     <div class="photo-row"><span class="ph" style="width:64px;height:64px"><img src="people/me.jpg" alt=""></span><div><b>Profile photo</b><small>Shown in the app and at online events. Your Tappy avatar is chosen per in-person event.</small><button class="linkish" data-a="toast" data-x="Photo picker (mocked)">Change photo</button></div></div>
     <input class="field" data-model="ob.name" placeholder="Display name" value="${esc(o.name)}" maxlength="24">
     <h3>Your field</h3><div class="pills">${chips(FIELDS, 'field')}</div>
     <h3>Where you are right now</h3><div class="pills">${chips(STAGES, 'stage')}</div>
     <p class="note">${ICON.lock} Your career stage is private unless you choose to show it.</p>`,
    `<h2>What do you like talking about?</h2><p class="muted">Pick up to 3. We use these to suggest conversation starters.</p>
     <div class="pills">${chips(INTERESTS, 'interests', true)}</div>
     <h3>A fun fact (optional)</h3>
     <input class="field" data-model="ob.fact" placeholder="Something people can ask you about" value="${esc(o.fact)}" maxlength="60">
     <label class="toggle"><input type="checkbox" data-a="ob-toggle" ${o.showStage ? 'checked' : ''}><span>Show my career stage publicly</span></label>`
  ];
  const valid = [o.name.trim() && o.field && o.stage, o.interests.length > 0][o.step];
  return `<header class="bar"><button class="icon-btn" data-a="${o.step ? 'ob-back' : 'back'}">${ICON.back}</button><div class="progress"><i style="width:${((o.step + 1) / 2) * 100}%"></i></div><span></span></header>
    <section class="pad ob">${steps[o.step]}</section>
    <footer class="sticky"><button class="btn primary" data-a="ob-next" ${valid ? '' : 'disabled'}>${o.step === 1 ? (S.onboarded ? 'Save' : 'Create account') : 'Continue'}</button></footer>`;
};

const DAYS = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
const MONTHS = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
function dayParts(e) { const [d, n, m] = e.date.split(' '); return [`${n} ${MONTHS[m] || m}`, DAYS[d] || d]; }

// One colour per status so they are easy to tell apart.
function stCls(e, r) {
  if (r.status === 'going') return e.mode === 'online' ? 'st-registered' : r.confirmed ? 'st-confirmed' : 'st-confirm';
  return { checkedin: 'chip-live', pending: 'st-pending', waitlist: 'st-waitlist', offered: 'st-offered', declined: 'st-declined', attended: 'st-past' }[r.status] || 'st-past';
}
function rowChip(e, r) {
  if (r.status === 'checkedin') return '<i class="chip chip-live"><span class="dot"></span>Live now</i>';
  if (r.status === 'attended') { const n = S.encounters.filter((x) => x.eventId === e.id && !x.waiting).length; return `<i class="chip st-past">${n ? `${n} connection${n === 1 ? '' : 's'}` : 'You went'}</i>`; }
  if (r.status === 'going' && e.mode === 'offline' && !r.confirmed) return '<i class="chip st-confirm">Confirm attendance</i>';
  return `<i class="chip ${stCls(e, r)}">${statusLabel(e, r)}</i>`;
}
function lumaRow(e) {
  const r = reg(e.id); const host = hostOf(e);
  const place = e.mode === 'online' ? 'Online' : e.venue.split(',')[0];
  return `<button class="lrow" data-a="nav" data-x="event/${e.id}">
    ${cover(e, 'th')}
    <span class="lrow-main">
      <span class="lrow-host">${av(host, 20)}<span>${esc(e.circle)}</span>${isHost(e) ? '<i class="chip st-hosting">Hosting</i>' : r ? rowChip(e, r) : e.cost !== 'Free' ? `<i class="price">${e.cost}</i>` : ''}</span>
      <b>${esc(e.title)}</b>
      <span class="lrow-meta"><span>${ICON.clock}${e.time.split(' ')[0]}</span><span>${e.mode === 'online' ? ICON.globe : ICON.pin}${esc(place)}</span></span>
      ${connLine(e)}
    </span></button>`;
}

function yeCard(e) {
  const r = reg(e.id);
  const chip = isHost(e) ? '<i class="chip st-hosting">Hosting</i>' : r ? rowChip(e, r) : '';
  return `<button class="ye-card" data-a="nav" data-x="event/${e.id}">${cover(e, 'th')}<span class="ye-main">${chip}<b>${esc(e.title)}</b><small>${e.date} · ${e.mode === 'online' ? 'Online' : 'Offline'}</small></span></button>`;
}
function pickCard(e) {
  const r = reg(e.id);
  return `<button class="ye-card pick" data-a="nav" data-x="event/${e.id}">${cover(e, 'th')}<span class="ye-main">${r ? rowChip(e, r) : ''}<b>${esc(e.title)}</b><small>${e.date} · ${e.mode === 'online' ? 'Online' : 'Offline'}</small></span></button>`;
}

V.home = () => {
  const p = me();
  const liveE = S.live && ev(S.live.eventId);
  const mine = EVENTS.filter((e) => !e.past && (isHost(e) || ['pending', 'going', 'checkedin', 'waitlist', 'offered'].includes(reg(e.id)?.status)));
  // Live event first, then confirmed in-person events, then the rest.
  const rank = (e) => { const r = reg(e.id); return r?.status === 'checkedin' ? 0 : e.mode === 'offline' && r?.confirmed ? 1 : 2; };
  mine.sort((a, b) => rank(a) - rank(b));
  const pastMine = EVENTS.filter((e) => reg(e.id)?.status === 'attended');
  const yseg = ui.yseg === 'past' ? 'past' : 'upcoming';
  const mode = ui.homeMode || 'all';
  const list = EVENTS.filter((e) => !e.past && (mode === 'all' || e.mode === mode));
  let groups = ''; let last = '';
  list.forEach((e) => {
    const [day, wd] = dayParts(e);
    if (day !== last) { groups += `<h3 class="day">${day} <span>/ ${wd}</span></h3>`; last = day; }
    groups += lumaRow(e);
  });
  const hint = { all: '', offline: `<p class="note">${ICON.badge} In-person events can lend you a Tappy device. You connect it to your account when you arrive.</p>`, online: `<p class="note">${ICON.globe} Online events run in the app. No Tappy needed — wave at people instead.</p>` }[mode];
  const past = [];
  return `<header class="top home-top">
      <div class="hi"><h1>Hi, ${p ? esc(p.short) : 'there'}</h1><p class="sub">${p ? `${esc(p.stage)} /<br>${esc(p.field)}` : 'Find career events and the people at them.'}</p></div>
      <span class="top-actions">${p ? `<button class="icon-btn dark" data-a="ce-new" aria-label="Create event">${ICON.plus}</button>` : `<button class="btn small primary" data-a="login-demo">Log in</button>`}</span></header>
    <section class="pad">
      ${p ? `<div class="pills" style="gap:6px">${p.interests.map((t) => `<i class="tag">${esc(t)}</i>`).join('')}</div>` : ''}
      <div style="height:22px"></div>
      <button class="h2link" data-a="nav" data-x="me"><h2>Your events</h2>${ICON.chev}</button>
      ${p ? `<div class="seg3" style="margin-bottom:12px">${[['upcoming', `Upcoming · ${mine.length}`], ['past', `Past · ${pastMine.length}`]].map(([k, l]) => `<button class="${yseg === k ? 'on' : ''}" data-a="yseg" data-x="${k}">${l}</button>`).join('')}</div>` : ''}
      ${yseg === 'past' && p ? (pastMine.length ? `<div class="hscroll">${pastMine.map(yeCard).join('')}</div>` : '<div class="empty">Events you attend show up here with the people you met.</div>')
        : mine.length ? `<div class="hscroll">${mine.map(yeCard).join('')}</div>` : `<div class="empty">No upcoming events. Explore events below and RSVP to one.</div>`}
      <div class="explorer-row"><h2 class="explorer">Event Explorer</h2><button class="icon-btn" data-a="nav" data-x="events" aria-label="Search events">${ICON.search}</button></div>
      <div class="seg3 mode-seg">${[['all', 'All'], ['offline', 'In person'], ['online', 'Online']].map(([k, l]) => `<button class="${mode === k ? 'on' : ''}" data-a="home-mode" data-x="${k}">${l}</button>`).join('')}</div>
      ${hint}
      <div class="explorer-row"><h2 style="margin:0">Picks for you</h2><button class="linkish small" data-a="nav" data-x="events">See all</button></div>
      <div class="hscroll picks">${list.filter((e) => !reg(e.id) && !isHost(e)).map(pickCard).join('')}</div>
      <h2>By date</h2>
      ${groups}
      ${past.length ? `<h2>Recent views</h2>${past.map((e) => `<div class="card-white" style="display:flex;gap:14px;align-items:flex-start"><div style="width:74px;height:74px;flex:0 0 auto;border-radius:50%;overflow:hidden">${art(seedOf(e.circle), '', 'width:100%;height:100%')}</div><div style="flex:1"><h3 style="margin:0">${esc(e.title)}</h3><p class="muted small" style="margin:6px 0 10px">Attended ${e.date}. Revisit the shared stories and see who else showed up.</p><button class="btn small primary" data-a="nav" data-x="circle/${encodeURIComponent(e.circle)}">See more</button></div></div>`).join('')}` : ''}
      <div class="spacer"></div>
    </section>`;
};

function filteredEvents() {
  return EVENTS.filter((e) => !e.past && (ui.filter === 'all' || (ui.filter === 'free' ? e.cost === 'Free' : e.mode === ui.filter)) && (!ui.q || (e.title + e.circle + e.tags.join(' ')).toLowerCase().includes(ui.q.toLowerCase())));
}

V.events = () => `
  <header class="top"><h1>Search events</h1></header>
  <div class="search">${ICON.search}<input data-model="q" placeholder="Topics, circles, hosts" value="${esc(ui.q)}"></div>
  <div class="pills scroll">${[['all', 'All'], ['offline', 'In person'], ['online', 'Online'], ['free', 'Free']].map(([k, l]) => `<button class="pill ${ui.filter === k ? 'on' : ''}" data-a="filter" data-x="${k}">${l}</button>`).join('')}</div>
  <p class="note">${ICON.pin} Near Ultimo, Sydney · <u>change area</u></p>
  <div id="event-list">${eventListHTML()}</div><div class="spacer"></div>`;

const eventListHTML = () => filteredEvents().map(eventRow).join('') || '<p class="empty">No events match. Try another topic or switch format.</p>';

V.event = (id) => {
  const e = ev(id); if (!e) return V.notfound();
  const r = reg(id); const host = hostOf(e);
  if (e.mode === 'offline' && !isHost(e) && ['going', 'checkedin', 'attended'].includes(r?.status)) return eventPhase(e, r);
  const full = e.going >= e.capacity; const left = e.capacity - e.going;
  const how = e.mode === 'offline'
    ? [['Check in', 'Show your pass at the desk'], ['Collect a Tappy', 'Optional loan device'], ['Pair it', 'Link the Tappy to your app'], ['Tap to talk', 'Both say yes, get a shared prompt'], ['Return it', 'Your encounters stay in the app']]
    : [['Join the lobby', 'Choose what others see'], ['Watch the stream', 'Camera & mic stay in Zoom'], ['Wave at people', 'Both say yes, get a shared prompt'], ['Connect', 'Accept or not now — your call']];
  let cta;
  if (isHost(e)) cta = `<button class="btn primary" data-a="toast" data-x="Invite link copied">${ICON.share}Share invite link</button><p class="muted small center">You’re hosting · ${e.going} going so far</p>`;
  else if (!r || r.status === 'cancelled') cta = `<button class="btn primary" data-a="nav" data-x="register/${id}">${full && e.waitlist ? 'Join the waitlist' : e.approval ? 'Request to join' : 'RSVP'}${e.cost === 'Free' ? '' : ' · ' + e.cost}</button>`;
  else if (r.status === 'waitlist') cta = `<p class="muted small center">You’re #${r.pos} on the waitlist. Spots free up when people don’t confirm 24h before.</p>${demo('Someone releases their spot', 'wait-offer', id)}<button class="link danger" data-a="cancel" data-x="${id}">Leave the waitlist</button>`;
  else if (r.status === 'offered') cta = `<p class="muted small center">A spot freed up for you. Claim it within 24 hours or it goes to the next person.</p><button class="btn primary" data-a="wait-claim" data-x="${id}">Claim my spot</button>`;
  else if (r.status === 'attended') cta = `<button class="btn" data-a="nav" data-x="recap/${id}">See recap</button>`;
  else cta = `<button class="btn primary" data-a="nav" data-x="ticket/${id}">${r.status === 'pending' ? 'View request' : 'View pass'}</button>`;
  return `<header class="bar float"><button class="icon-btn" data-a="back">${ICON.back}</button><span></span><button class="icon-btn" data-a="toast" data-x="Link copied">${ICON.share}</button></header>
    <div class="hero" style="--c1:${e.cover[0]};--c2:${e.cover[1]}">${cover(e, 'art')}</div>
    <section class="pad">
      <p class="eyebrow">${esc(e.circle)}</p>
      <h1 class="title">${esc(e.title)}</h1>
      ${r ? `<i class="chip ${stCls(e, r)}">${statusLabel(e, r)}</i>` : ''}
      <ul class="meta">
        <li>${ICON.cal}<span><b>${e.date}</b><small>${e.time}</small></span></li>
        <li>${e.mode === 'online' ? ICON.globe : ICON.pin}<span><b>${e.mode === 'online' ? 'Online' : e.venue}</b><small>${e.mode === 'online' ? e.platform + (e.recording ? ' · recording available' : '') : e.distance + ' away · step-free access'}</small></span></li>
        <li>${ICON.ticket}<span><b>${e.cost}</b><small>${e.going}/${e.capacity} spots · ${e.approval ? 'host approves each request' : 'instant confirmation'}</small></span></li>
      </ul>
      <button class="host" data-a="nav" data-x="${isHost(e) ? 'me' : 'person/' + host.id}">${av(host, 40, 'round')}<span><small>Hosted by</small><b>${isHost(e) ? 'You' : host.name}</b></span></button>
      <h3>About this event</h3>
      <p class="muted">${esc(e.audience)}</p>
      <div class="card-soft" style="margin-top:18px"><div style="display:flex;align-items:center"><div style="flex:1"><b>${Math.min(e.capacity, e.going + (r && !['waitlist'].includes(r.status) ? 1 : 0))} / ${e.capacity}</b> <span class="muted small">spots filled${full ? ` · waitlist open` : left <= 3 ? ` · only ${left} left — grab it before it’s gone` : ''}</span></div>${e.badges ? '<i class="chip chip-going" style="margin:0">Tappy</i>' : ''}</div><div class="progress" style="margin-top:8px"><i style="width:${Math.min(100, ((e.going + (r ? 1 : 0)) / e.capacity) * 100)}%"></i></div></div>
      <h3>See who’s going</h3>
      ${connsGoing(e).length ? `<div class="conn-going">${faces(connsGoing(e), 36)}<div><b>${connsGoing(e).length} connection${connsGoing(e).length > 1 ? 's' : ''} going</b><small>${connsGoing(e).map((pid) => PEOPLE[pid].short).join(', ')}</small></div></div>` : ''}
      <div class="stack">${e.attendees.filter((pid) => !isConn(pid)).map((pid) => av(PEOPLE[pid], 32)).join('')}<small>${e.going} going · ${Math.round(e.going * 0.6)} visible</small></div>
      <h3>How it works</h3>
      <ol class="how">${how.map(([a, b]) => `<li><b>${a}</b><small>${b}</small></li>`).join('')}</ol>
      ${e.badges ? `<p class="note">${ICON.badge} Tappy is optional. Tap devices with another attendee to get a career question you can talk about together.</p>` : ''}
      <h3>Agenda</h3>
      <ul class="agenda">${e.agenda.map(([t, a]) => `<li><time>${t}</time>${a}</li>`).join('')}</ul>
      <div class="spacer"></div>
    </section>
    <footer class="sticky">${cta}</footer>`;
};

/* ------------------------------------------------ event flow: Before / During / After (Week 9 revision)
   The event page is organised around the event itself. The wearable leads in person; the app supports before and after. */
const PHASES = ['Before', 'During', 'After'];
const phaseOf = (r) => ({ going: 0, checkedin: 1, attended: 2 }[r.status] ?? 0);
const confirmedCount = (e, r) => Math.round(e.going * 0.8) + (r?.confirmed ? 1 : 0);
const memories = (id) => [...((S.memories || {})[id] || []), ...(MEMORY_SEED[id] || [])];
const metHere = (id) => S.encounters.filter((x) => x.eventId === id);
function metStatus(pid) {
  if (isConn(pid)) return '<i class="chip chip-going" style="margin:0">Connected</i>';
  if (S.following.includes(pid)) return '<i class="chip chip-pending" style="margin:0">Request pending</i>';
  if (S.followers.includes(pid)) return `<button class="btn small primary" data-a="follow" data-x="${pid}">Accept</button>`;
  return '<i class="chip" style="margin:0">Waiting</i>';
}

function eventPhase(e, r) {
  const id = e.id; const now = phaseOf(r);
  const ph = now;
  // No stage switcher: the page simply shows whatever state the event is in right now.
  const steps = '<div style="height:12px"></div>';
  const head = `<header class="bar float"><button class="icon-btn" data-a="nav" data-x="home">${ICON.back}</button><span></span><button class="icon-btn" data-a="toast" data-x="Link copied">${ICON.share}</button></header>
    <div class="hero" style="--c1:${e.cover[0]};--c2:${e.cover[1]}">${cover(e, 'art')}</div>
    <section class="pad">
      <button class="host" data-a="nav" data-x="person/${hostOf(e).id}">${av(hostOf(e), 32)}<span><small>Hosted by</small><b>${esc(hostOf(e).name)}</b></span>${e.badges ? `<i class="chip chip-going" style="margin:0 0 0 auto">${ICON.badge}Tappy</i>` : ''}</button>
      <h1 class="title sm">${esc(e.title)}</h1>
      <p class="muted small">${e.date} · ${e.time}${now === 1 ? ' · <b style="color:var(--green2)">Live now</b>' : ''}<br>${esc(e.venue)}</p>
      ${steps}`;
  let body = ''; let foot = '';
  if (ph === 0) {
    const card = r.confirmed
      ? `<div class="phase-card"><small class="ok">✓ YOU’RE GOING</small><b>Check in when you arrive</b><p>We’ll remind you the day before.</p></div>`
      : `<div class="phase-card warn"><small>CONFIRM ATTENDANCE · 24H BEFORE</small><b>Still coming on ${e.date}?</b><p>Unconfirmed spots go to the waitlist, so the people who match are the people who show up.</p>
          <div class="row2"><button class="btn small" data-a="cancel" data-x="${id}">Can’t make it</button><button class="btn small primary" data-a="confirm-att" data-x="${id}">I’m coming</button></div></div>`;
    const bud = !buddyReady()
      ? `<button class="buddy-cta" data-a="buddy-start" data-x="${id}"><span><b>Set up your Tappy profile</b><i class="chip" style="margin:0 0 0 6px">Recommended</i><small>Optional. Fill it in once, reuse it for every event and edit anytime.</small></span>${ICON.chev}</button>`
      : !r.q ? `<button class="buddy-cta" data-a="nav" data-x="buddyq/${id}"><span><b>Answer ${esc(hostOf(e).short)}’s questions for this event</b><small>3 quick questions · your core profile is already saved</small></span>${ICON.chev}</button>`
      : `<button class="buddy-cta done" data-a="nav" data-x="buddyreview/${id}"><span><b>Tappy ready</b><small>Review what strangers will see today</small></span>${ICON.chev}</button>`;
    body = `${card}
      <button class="linkrow" data-a="who-sheet" data-x="${id}|going">${confirmedCount(e, r)} confirmed · See who’s going ›</button>
      ${e.badges ? bud : ''}
      <p class="note">${ICON.badge} The Tappy is handed out at check-in. Nothing to carry until the day.</p>
      <h3>About this event</h3><p class="muted">${esc(e.audience)}</p>`;
    foot = `<p class="muted small center">Check-in opens when you arrive at the venue.</p><button class="btn primary" data-a="nav" data-x="checkin/${id}">Check in at the event</button><button class="link danger" style="margin:4px auto 0" data-a="cancel" data-x="${id}">Can’t make it? Cancel RSVP</button>`;
  } else if (ph === 1) {
    if (now < 1) body = `<div class="phase-card"><small>NOT CHECKED IN YET</small><b>This opens when you arrive</b><p>Tap your card at the door or show your pass. Then your Tappy does the work and your phone stays in your pocket.</p></div>`;
    else {
      const L = S.live?.eventId === id ? S.live : {};
      const mine = metHere(id); const met = mine.filter((x) => !x.waiting).length; const pend = mine.filter((x) => x.waiting).length;
      const room = Math.round(e.going * 0.35) + 1;
      const dev = L.paired ? `<div class="eb-card"><span class="ok">${ICON.check}</span><div><b>Tappy</b><small>Connected · checked in 17:42</small></div><p>Tap devices to meet someone.</p></div>`
        : L.badgeId ? `<button class="eb-card" data-a="nav" data-x="${buddyReady() && r.q ? 'pair' : 'buddyreview'}/${id}"><span>${ICON.badge}</span><div><b>Pair your Tappy</b><small>${BADGE_ID} · scan the QR on its screen</small></div>${ICON.chev}</button>`
        : L.noBadge ? `<div class="eb-card"><span>${ICON.info}</span><div><b>No Tappy</b><small>Send hi requests from Who’s here</small></div></div>`
        : `<button class="eb-card" data-a="nav" data-x="checkin/${id}"><span>${ICON.badge}</span><div><b>Collect your Tappy</b><small>Optional · at the desk</small></div>${ICON.chev}</button>`;
      body = `<div class="phase-card"><div style="display:flex"><small style="flex:1">EVENT PROGRESS</small><small class="ok">1h 12m left</small></div><div class="ev-prog"><i style="width:58%"></i><b style="left:58%"></b></div><div class="ev-times"><small>${e.time.split(' ')[0]}</small><small><b>Now</b></small><small>${e.time.split(' ').pop()}</small></div></div>
        <button class="linkrow" data-a="live-go" data-x="${id}|here">${room} here now · See who’s here ›</button>
        ${dev}
        <div class="stats">${[['saved', met, 'met so far'], ['pending', pend, 'pending'], ['here', room, 'in the room']].map(([k, n, l]) => `<button data-a="${k === 'pending' ? 'nav' : 'live-go'}" data-x="${k === 'pending' ? 'pending/' + id : id + '|' + k}"><b>${n}</b><small>${l}</small></button>`).join('')}</div>
        <p class="muted small">Synced 2 min ago</p>`;
      foot = `<button class="btn primary" data-a="live-go" data-x="${id}|saved">See who I’ve met</button><button class="link" style="margin:4px auto 0" data-a="exit-tap" data-x="${id}">Leaving? ${L.noBadge ? 'Wrap up' : 'Tap Tappy at the exit'}</button>`;
    }
  } else {
    if (now < 2) body = `<div class="phase-card"><small>AFTER THE EVENT</small><b>Connections first, memories second</b><p>After you leave, the people you tapped show up here and in Network → Requests. Memories stay open for 7 days.</p></div>`;
    else {
      const sub = ui.asub === 'Conversation' ? 'Conversation' : 'Stories';
      const mine = metHere(id).filter((x) => !x.waiting);
      const mem = memories(id);
      body = `<div class="seg2" style="margin:4px 0 14px">${['Stories', 'Conversation'].map((x) => `<button class="${sub === x ? 'on' : ''}" data-a="asub" data-x="${x}">${x === 'Conversation' ? 'Follow-up' : x}</button>`).join('')}</div>
        ${sub === 'Stories' ? `<div class="phase-card"><small class="ok">✓ YOU ATTENDED</small><p style="margin-top:6px">${esc(e.audience)}</p></div>
          <button class="linkrow" data-a="who-sheet" data-x="${id}|there">${e.going} attended · See who was there ›</button>
          <h3>People you met · ${mine.length}</h3>
          ${mine.map((x) => { const p = PEOPLE[x.person]; return `<div class="enc"><button class="plain" data-a="nav" data-x="person/${p.id}">${av(p, 40)}</button><div><b>${esc(p.name)}</b><small>${esc(p.headline)}</small></div>${metStatus(p.id)}</div>`; }).join('') || '<p class="empty">You didn’t link with anyone this time — that’s fine.</p>'}
          <div class="enc">${av(hostOf(e), 40)}<div><b>${esc(hostOf(e).name)}</b><small>Event host</small></div><i class="chip" style="margin:0">Host</i></div>
          <h3>Shared stories</h3>
          <p class="muted small" style="margin:-4px 0 10px">Shared after the event · open for 7 days, then archived</p>
          <button class="btn primary" data-a="memory-open" data-x="${id}">+ Add a memory</button>
          <div class="mem-grid">${mem.map((m) => { const p = who(m.by); return `<figure class="mem">${m.photo !== false ? art(m.seed ?? 2, 'mem-art') : ''}<figcaption><span>${av(p, 20)}<b>${m.by === 'me' ? 'You' : esc(p.short)}</b><small>Day ${m.day || 1}</small></span>“${esc(m.text)}”</figcaption></figure>`; }).join('')}</div>
          <button class="link" data-a="nav" data-x="recap/${id}">See your recap</button>`
        : `<p class="note">${ICON.info} Follow-up is optional. Everyone here attended — share slides, links or a thank-you.</p>${chatThread('ev:' + id, 'Reply to the group...')}`}`;
    }
  }
  return `${head}${body}<div class="spacer"></div></section>${foot ? `<footer class="sticky">${foot}</footer>` : ''}`;
}

V.pending = (id) => {
  const e = ev(id); const list = metHere(id).filter((x) => x.waiting);
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>Pending · ${list.length}</b><span></span></header>
    <section class="pad">
      <p class="muted">People you’ve tapped who haven’t tapped back yet.</p>
      <button class="linkrow" data-a="toast" data-x="Synced just now">Synced 2 min ago · Sync now ›</button>
      ${list.map((x) => { const p = PEOPLE[x.person]; return `<div class="list-item">${av(p, 44)}<div class="grow"><h3>${esc(p.name)}</h3><small>${esc(p.headline)}</small><small>Tapped at ${new Date(x.at).toTimeString().slice(0, 5)}</small></div><i class="chip chip-pending" style="margin:0">Waiting</i></div>`; }).join('') || '<div class="empty">No one is pending.</div>'}
      <p class="note">${ICON.info} Once they tap back, they move to your Connections. Taps can take a few minutes to show up.</p>
      ${list.map((x) => demo(`${PEOPLE[x.person].short} taps back`, 'tap-back', x.id)).join('')}
    </section>`;
};

// Shown after the Tappy is returned: taps synced, decisions happen later at home.
V.synced = (id) => {
  const e = ev(id); const list = metHere(id).filter((x) => !x.waiting && !isConn(x.person));
  return `<header class="bar"><span></span><b>Taps synced</b><span></span></header>
    <section class="pad center">
      <div class="big-check">↻</div>
      <h2>${list.length} new connection${list.length === 1 ? '' : 's'} from today</h2>
      <p class="muted">Tappy picked up these taps at ${esc(e.title)}</p>
      <div style="text-align:left;margin-top:14px">${list.map((x) => { const p = PEOPLE[x.person]; return `<div class="enc">${av(p, 44)}<div><b>${esc(p.name)}</b><small>${esc(p.headline)}</small></div><i class="chip chip-pending" style="margin:0">Pending</i></div>`; }).join('')}</div>
      <p class="note">${ICON.lock} They’ll appear in Network → Requests. Accept or decline anytime — nobody is told if you decline.</p>
    </section>
    <footer class="sticky"><button class="btn primary" data-a="review-requests">Review in Network</button><button class="link" style="margin:4px auto 0" data-a="nav" data-x="event/${id}">Remind me later</button></footer>`;
};

/* ------------------------------------------------ Tappy profile: core (once) + this event (host questions) + review */
const chipRow = (list, val, key, multi) => `<div class="pills">${list.map((v) => { const on = multi ? (val || []).includes(v) : val === v; return `<button class="pill ${on ? 'on' : ''}" data-a="bq-pick" data-x="${key}|${v}|${multi ? 1 : 0}">${v}</button>`; }).join('')}</div>`;

V.buddy = () => {
  if (!S.profile) return V.me();
  const p = me(); const b = ui.bd || (ui.bd = { avatar: p.avatar, color: p.color, career: 'Design', level: 'Beginner', looking: 'Mentor', vibe: BUDDY.vibe[0], mbti: '', showMbti: false, hobbies: [], ...(S.buddy || {}) });
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>Tappy Profile</b><span></span></header>
    <section class="pad">
      <p class="muted center small" style="margin-top:-6px">Reused for every event — edit anytime</p>
      <div class="badge-preview"><div class="mini-screen"><div class="bs idle">${avatar(b.avatar, b.color, 84)}<b>${esc(p.short)}</b><small>${esc(b.career)} · ${esc(b.level)}</small></div></div><small>This is all your device shows. Everything else stays in the app.</small></div>
      <div class="avatar-grid">${AVATAR_CHOICES.map((k) => `<button class="${b.avatar === k ? 'on' : ''}" data-a="bq-pick" data-x="avatar|${k}|0">${avatar(k, b.color, 60)}</button>`).join('')}</div>
      <div class="swatches">${AVATAR_COLORS.map((c) => `<button class="${b.color === c ? 'on' : ''}" style="background:${c}" data-a="bq-pick" data-x="color|${c}|0" aria-label="colour ${c}"></button>`).join('')}</div>
      <h3>Career background</h3>${chipRow(BUDDY.career, b.career, 'career')}
      <h3>Experience level</h3>${chipRow(BUDDY.level, b.level, 'level')}
      <h3>What are you hoping to find?</h3>${chipRow(BUDDY.looking, b.looking, 'looking')}
      <h3>Your vibe at events</h3>${chipRow(BUDDY.vibe, b.vibe, 'vibe')}
      <h3>Your personality <small class="muted">(optional)</small></h3>
      <p class="muted small" style="margin-bottom:10px">Shown on your profile only if you choose. Your Tappy asks career questions, not these.</p>
      <select class="field" data-model="bd.mbti"><option value="">MBTI type (optional)</option>${BUDDY.mbti.map((m) => `<option ${b.mbti === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
      <label class="toggle"><input type="checkbox" data-a="bd-toggle" ${b.showMbti ? 'checked' : ''}><span>Show on profile</span></label>
      <h3>Interests &amp; hobbies <small class="muted">(optional)</small></h3>${chipRow(BUDDY.hobbies, b.hobbies, 'hobbies', true)}
      <div class="spacer"></div>
    </section>
    <footer class="sticky"><button class="btn primary" data-a="buddy-save">Save profile</button><p class="muted small center">Saved to your account — you won’t need to redo this for future events</p></footer>`;
};

V.buddyq = (id) => {
  const e = ev(id); const r = reg(id); if (!r) return V.event(id);
  if (!buddyReady()) { ui.bdNext = 'buddyq/' + id; return V.buddy(); }
  const last = Object.values(S.regs).find((x) => x.q)?.q || {};
  const q = ui.bq?.id === id ? ui.bq : (ui.bq = { id, hoping: [], open: '', skill: last.skill || '', opener: '', reply: S.buddy.reply || DEFAULT_AUTO_REPLY, ...(r.q || {}) });
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>For this event</b><span></span></header>
    <section class="pad">
      <p class="eyebrow">${esc(e.title)}</p><p class="muted small">Set by the host — changes per event</p>
      <h3>What are you hoping to get from today?</h3>${chipRow(EVENT_Q.hoping, q.hoping, 'hoping', true)}
      <h3>Comfortable talking to strangers about your career today?</h3>${chipRow(EVENT_Q.open, q.open, 'open')}
      <h3>Skill level for this session</h3>${last.skill ? '<p class="muted small" style="margin:-4px 0 8px">Prefilled from your last event — feel free to change it</p>' : ''}${chipRow(EVENT_Q.skill, q.skill, 'skill')}
      <h3>Your opening message <small class="muted">(optional)</small></h3>
      <input class="field" data-model="bq.opener" placeholder="Say hi and share what brings you here today..." value="${esc(q.opener)}" maxlength="80">
      <h3>Auto-reply message</h3><p class="muted small" style="margin-bottom:8px">Sent automatically when someone accepts your connection</p>
      <input class="field" data-model="bq.reply" value="${esc(q.reply)}" maxlength="80">
      <div class="spacer"></div>
    </section>
    <footer class="sticky"><button class="btn primary" data-a="bq-save" data-x="${id}">Save &amp; continue</button><p class="muted small center">Only your answers for this event — the rest stays saved to your account</p></footer>`;
};

V.buddyreview = (id) => {
  const e = ev(id); const r = reg(id); if (!r) return V.event(id);
  if (!buddyReady() || !r.q) return V.buddyq(id);
  const b = S.buddy; const q = r.q; const L = S.live?.eventId === id ? S.live : {};
  const row = (k, v, to) => `<button class="rev-row" data-a="nav" data-x="${to}"><span><small>${k}</small><b>${esc(v || '—')}</b></span><u>Edit</u></button>`;
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>You’re all set</b><span></span></header>
    <section class="pad">
      <p class="muted">Here’s what strangers will see today</p>
      ${row('CORE PROFILE · Career background', `${b.career} · ${b.level}`, 'buddy')}
      ${row('CORE PROFILE · Looking for', b.looking, 'buddy')}
      ${row('CORE PROFILE · Vibe', b.vibe, 'buddy')}
      ${row('THIS EVENT · Hoping to get', q.hoping.join(', '), 'buddyq/' + id)}
      ${row('THIS EVENT · Openness + skill level', [q.open, q.skill].filter(Boolean).join(' · '), 'buddyq/' + id)}
      <p class="note">${ICON.lock} Only visible to people you link with via Tappy. MBTI and hobbies never appear on the device.</p>
      <div class="phase-card"><small>SAMPLE PROMPT YOU MIGHT GET</small><b>“${ICEBREAKERS[1]}”</b><p>Career-focused, picked fresh each event — not based on your personality answers.</p></div>
      <div class="spacer"></div>
    </section>
    <footer class="sticky">${L.badgeId && !L.paired ? `<button class="btn primary" data-a="nav" data-x="pair/${id}">Scan device</button><p class="muted small center">You’ll scan the QR code on your Tappy wearable next</p>` : `<button class="btn primary" data-a="nav" data-x="event/${id}">Back to event</button>`}</footer>`;
};

/* ------------------------------------------------------------ create event (teammate flow + our event model) */
const COVER_PAIRS = [['#D7FF3A', '#1E3A2F'], ['#E7A6FF', '#2A1838'], ['#FF9E7A', '#3A1E14'], ['#8FB8FF', '#14223A'], ['#FFD166', '#3A2E10'], ['#7CE0C3', '#123A30']];
const hostOf = (e) => (e.host === 'me' ? me() || { name: 'You', short: 'You', id: 'me' } : PEOPLE[e.host]);
const isHost = (e) => e.host === 'me';
// Created events live in S.myEvents and join the shared EVENTS list at start-up.
function loadMyEvents() { (S.myEvents || []).forEach((e) => { if (!ev(e.id)) EVENTS.push(e); }); }
const fmtDate = (d) => d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '');

V.createEvent = () => {
  if (!S.profile) return V.me();
  const mine = circlesJoined();
  const d = ui.ce || (ui.ce = { cover: 0, name: '', date: '', time: '18:00', online: false, place: '', cap: '20', wait: true, approval: false, badges: true, desc: '', circle: mine[0] || '' });
  const pair = COVER_PAIRS[d.cover % COVER_PAIRS.length];
  const tg = (k, label, sub) => `<label class="toggle"><span>${label}${sub ? `<small>${sub}</small>` : ''}</span><input type="checkbox" data-a="ce-toggle" data-x="${k}" ${d[k] ? 'checked' : ''}></label>`;
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.close}</button><b>Create event</b><span></span></header>
    <section class="pad">
      <button class="ce-cover" data-a="ce-cover" style="--c1:${pair[0]};--c2:${pair[1]}"><span class="cover cover-art" style="--c1:${pair[0]};--c2:${pair[1]}"><span class="cover-title">${esc(d.name || 'Your event')}</span></span><small>${ICON.image} Tap to change cover</small></button>
      <h3>Event name</h3><input class="field" data-model="ce.name" placeholder="e.g. Ikebana + Career exchange" value="${esc(d.name)}" maxlength="48">
      <h3>Date &amp; time</h3><div style="display:flex;gap:8px"><input class="field" type="date" data-model="ce.date" value="${esc(d.date)}"><input class="field" style="width:130px" type="time" data-model="ce.time" value="${esc(d.time)}"></div>
      ${tg('online', 'Online event')}
      ${d.online ? '' : `<h3>Location</h3><input class="field" data-model="ce.place" placeholder="Venue name & address" value="${esc(d.place)}">`}
      <h3>Capacity</h3><input class="field" type="number" min="2" data-model="ce.cap" value="${esc(d.cap)}">
      ${tg('wait', 'Allow waitlist')}
      ${tg('approval', 'Approve each request', 'Otherwise people are confirmed instantly')}
      ${d.online ? '' : tg('badges', 'Lend Tappy devices', 'Attendees can tap devices to start conversations')}
      <h3>Circle</h3><p class="muted small" style="margin-bottom:10px">Attendees join this circle and can see its members-only stories.</p>
      <div class="pills">${mine.map((c) => `<button class="pill ${d.circle === c ? 'on' : ''}" data-a="ce-circle" data-x="${esc(c)}">${esc(c)}</button>`).join('')}<button class="pill ${d.circle === '' ? 'on' : ''}" data-a="ce-circle" data-x="">New circle</button></div>
      <h3>Description</h3><textarea class="field area" style="min-height:120px" data-model="ce.desc" placeholder="What’s this event about? What should people expect?">${esc(d.desc)}</textarea>
      <p class="note">${ICON.info} Attendees can choose to appear on this event’s discovery list at RSVP.</p>
      <div class="spacer"></div>
    </section>
    <footer class="sticky"><button class="btn primary" data-a="ce-publish">Publish event</button></footer>`;
};

V.auth = () => `<header class="bar"><button class="icon-btn" data-a="back">${ICON.close}</button><span></span><span></span></header>
  <section class="pad auth">
    <span class="brand-dot big">${ICON.badge}</span>
    <h2>Log in to register</h2>
    <p class="muted">Registering needs a JobBuddy account, so hosts know who’s coming and you keep the people you meet.</p>
    <input class="field" type="email" placeholder="Email" value="emma@student.uts.edu.au">
    <button class="btn primary" data-a="login-demo">Continue with email</button>
    <div class="or"><span>or</span></div>
    <button class="btn" data-a="login-demo">Continue with Apple</button>
    <button class="btn" data-a="login-demo">Continue with Google</button>
    <p class="muted center small">New here? <button class="linkish" data-a="signup">Create an account</button></p>
  </section>`;

const DEFAULT_PROFILE = { name: 'Emma C.', field: 'Design', stage: 'Studying', interests: ['AI tools', 'UX', 'Portfolio'], fact: 'Built a badge from scratch', avatar: 'female_2_1', color: '#D7FF3A', showStage: false };

// One Tappy profile reused for every event (Week 9 revision). The device shows avatar, name and career line only.
function badgeLook() {
  const p = S.profile || DEFAULT_PROFILE; const b = S.buddy || {};
  return { avatar: b.avatar || p.avatar, color: b.color || p.color, tag: b.career ? `${b.career} · ${b.level}` : p.field };
}
const buddyReady = () => !!S.buddy?.saved;

function badgePicker(d) {
  const p = me();
  const tags = [...new Set([...p.interests, p.field])];
  return `<div class="badge-preview"><div class="mini-screen"><div class="bs idle">${avatar(d.avatar, d.color, 84)}<b>${esc(p.short)}</b><small>#${esc(d.tag)}</small></div></div>
      <small>Shown on your loan Tappy and the participant wall at this event only.</small></div>
    <h3>Pick an avatar</h3>
    <div class="avatar-grid">${AVATAR_CHOICES.map((k) => `<button class="${d.avatar === k ? 'on' : ''}" data-a="bd-pick" data-x="avatar|${k}">${avatar(k, d.color, 60)}</button>`).join('')}</div>
    <div class="swatches">${AVATAR_COLORS.map((c) => `<button class="${d.color === c ? 'on' : ''}" style="background:${c}" data-a="bd-pick" data-x="color|${c}" aria-label="colour ${c}"></button>`).join('')}</div>
    <h3>Tag on your Tappy</h3><p class="muted small">A conversation hook for this crowd.</p>
    <div class="pills" style="margin-top:10px">${tags.map((t) => `<button class="pill ${d.tag === t ? 'on' : ''}" data-a="bd-pick" data-x="tag|${t}">#${t}</button>`).join('')}</div>`;
}

V.badgeedit = (id) => {
  return V.buddy();
  const e = ev(id); if (!reg(id)) return V.event(id);
  if (!ui.regDraft || ui.regDraft.id !== id) ui.regDraft = { id, ...badgeLook(id) };
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.close}</button><b>Your Tappy</b><span></span></header>
    <section class="pad"><p class="muted">${esc(e.title)}</p>${badgePicker(ui.regDraft)}<div class="spacer"></div></section>
    <footer class="sticky"><button class="btn primary" data-a="badge-save" data-x="${id}">Save Tappy</button></footer>`;
};

V.register = (id) => {
  const e = ev(id);
  if (!S.onboarded) { if (S.afterOnboard !== 'register/' + id) { S.afterOnboard = 'register/' + id; save(); ui.ob = null; } return ui.authNew ? V.onboarding() : V.auth(); }
  ui.regDraft = ui.regDraft?.id === id ? ui.regDraft : { id, list: true, wall: true };
  const d = ui.regDraft; const p = me();
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.close}</button><b>${e.approval ? 'Request to join' : 'Register'}</b><span></span></header>
    <section class="pad">
      <div class="next-card static">${cover(e, 'sm')}<div><b>${esc(e.title)}</b><small>${e.date} · ${e.time}</small></div></div>
      <h3>What attendees will see</h3>
      <div class="public-card">${av(p, 56)}<div><b>${esc(p.name)}</b><small>${p.field}${p.showStage ? ' · ' + p.stage : ''}</small><small class="tags">${p.interests.map((t) => '#' + t).join(' ')}</small></div></div>
      <label class="toggle"><input type="checkbox" data-a="reg-toggle" data-x="list" ${d.list ? 'checked' : ''}><span>Let people see I’m going<small>Shown on this event’s list so others can connect with you</small></span></label>
      ${e.mode === 'offline' ? `<label class="toggle"><input type="checkbox" data-a="reg-toggle" data-x="wall" ${d.wall ? 'checked' : ''}><span>Appear on the live participant wall after check-in</span></label>` : ''}
      <p class="note">${ICON.lock} Email, career stage and CV are never shown to attendees.</p>
      ${e.badges ? `<p class="note">${ICON.badge} ${buddyReady() ? 'Your Tappy profile is saved and will be reused here.' : 'After you RSVP you can set up your Tappy profile once and reuse it for every event. Optional.'}</p>` : ''}
      ${e.going >= e.capacity && e.waitlist ? `<p class="note">${ICON.info} This event is full. You’ll join the waitlist and get a spot if someone doesn’t confirm 24h before.</p>` : ''}
      ${e.approval ? `<p class="note">${ICON.info} This host approves requests. You’ll get a notification either way, and the exact address unlocks once approved.</p>` : ''}
    </section>
    <footer class="sticky"><button class="btn primary" data-a="register" data-x="${id}">${e.going >= e.capacity && e.waitlist ? 'Join waitlist' : e.approval ? 'Send request' : 'Confirm · ' + e.cost}</button></footer>`;
};

function fakeQR(seed) {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  let cells = '';
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
    const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    let on;
    if (finder) { const fx = x > 13 ? x - 14 : x, fy = y > 13 ? y - 14 : y; on = fx === 0 || fy === 0 || fx === 6 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5); }
    else { h = (h * 1103515245 + 12345) >>> 0; on = (h >> 16) & 1; }
    if (on) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  return `<svg class="qr" viewBox="-2 -2 25 25" shape-rendering="crispEdges"><rect x="-2" y="-2" width="25" height="25" fill="#fff"/>${cells}</svg>`;
}

V.ticket = (id) => {
  const e = ev(id); const r = reg(id);
  if (!r) return V.event(id);
  const off = e.mode === 'offline';
  const steps = off ? [['Requested', e.approval], ['Approved', true], ['Checked in', true], ['Attended', true]].filter((s) => s[1]).map((s) => s[0]) : ['Registered', 'Joined'];
  const idx = off ? { pending: 0, declined: 0, going: e.approval ? 1 : 0, checkedin: e.approval ? 2 : 1, attended: 9 }[r.status] : { going: 0, attended: 9 }[r.status];
  let body = '';
  if (r.status === 'pending') body = `<div class="state-box"><b>Waiting for ${hostOf(e).short} to approve</b><small>Most hosts reply within 2 days. We’ll notify you.</small></div>
      ${demo('Host approves request', 'approve', id)}${demo('Host declines request', 'decline', id)}`;
  else if (r.status === 'declined') body = `<div class="state-box warn"><b>This one’s full</b><small>The host couldn’t fit everyone. Similar events:</small></div>${EVENTS.filter((x) => x.id !== id && x.mode === e.mode).slice(0, 2).map(eventRow).join('')}`;
  else if (off) body = `<div class="pass">${fakeQR(id + S.profile.name)}<b>${esc(S.profile.name)}</b><small>Show this at the check-in desk</small></div>
      <div class="info-grid"><div>${ICON.pin}<b>${e.venue}</b><small>Get directions</small></div><div>${ICON.badge}<b>Tappy on loan</b><small>Collect → pair → return</small></div></div>
      ${e.badges ? `<button class="row badge-link" data-a="nav" data-x="buddy">${avatar(badgeLook().avatar, badgeLook().color, 44)}<span class="row-main"><b>Your Tappy profile</b><small>${esc(badgeLook().tag)} · reused for every event</small></span><span class="small muted">Edit</span></button>` : ''}
      <h3>Before you go</h3><ul class="checklist"><li>Arrive by 17:45 — first 30 get a drink token</li><li>Bring your phone charged (or pair with staff help)</li><li>Nothing to prepare. Just come curious.</li></ul>`;
  else body = `<div class="pass online"><div>${ICON.globe}</div><b>${e.date} · ${e.time}</b><small>Lobby opens 10 min before</small></div>
      <h3>Before you join</h3><ul class="checklist"><li>Stream runs in Zoom. Camera optional.</li><li>Waves and chats happen here in JobBuddy</li><li>${e.recording ? 'Recording shared afterwards' : 'Not recorded'}</li></ul>`;
  let cta = '';
  if (r.status === 'going' && off) cta = `<button class="btn primary" data-a="nav" data-x="checkin/${id}">I’m here — check in</button>`;
  if (r.status === 'checkedin') cta = `<button class="btn primary" data-a="nav" data-x="${S.live?.eventId === id ? (S.live.paired || S.live.noBadge ? 'live' : S.live.badgeId ? 'pair' : 'checkin') : 'checkin'}/${id}">Continue at event</button>`;
  if (r.status === 'going' && !off) cta = `<button class="btn primary" data-a="nav" data-x="lobby/${id}">Join lobby</button>`;
  if (r.status === 'attended') cta = `<button class="btn primary" data-a="nav" data-x="recap/${id}">See recap</button>`;
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>${off ? 'Your pass' : 'Your registration'}</b><button class="icon-btn" data-a="toast" data-x="Added to calendar">${ICON.cal}</button></header>
    <section class="pad">
      <h2 class="title sm">${esc(e.title)}</h2><p class="muted">${e.date} · ${e.time}</p>
      <ol class="timeline">${steps.map((s, i) => `<li class="${i < idx ? 'done' : i === idx ? 'now' : ''}">${s}</li>`).join('')}</ol>
      ${body}
      ${['pending', 'going'].includes(r.status) ? `<button class="link danger" data-a="cancel" data-x="${id}">Cancel ${r.status === 'pending' ? 'request' : 'RSVP'}</button>` : ''}
    </section>
    ${cta ? `<footer class="sticky">${cta}</footer>` : ''}`;
};

/* ---------------------------------------------------- offline: check-in */
V.checkin = (id) => {
  // Simplified arrival: staff scan your pass and hand you a Tappy that is already linked to you. No self-pairing, no code.
  const e = ev(id); const r = reg(id);
  if (!r) return V.event(id);
  return `<header class="bar"><button class="icon-btn" data-a="nav" data-x="event/${id}">${ICON.back}</button><b>Arrive</b><span></span></header>
    <section class="pad center">
      <h2>Show this at the door</h2>
      <p class="muted">Staff scan it and hand you a Tappy. It’s already linked to you — just clip it on.</p>
      <div class="pass">${fakeQR(id + S.profile.name)}<b>${esc(S.profile.name)}</b><small>${esc(e.title)}</small></div>
      ${demo('Staff scans pass · hands you Tappy ' + BADGE_ID, 'arrive', id)}
      <button class="link" data-a="no-badge" data-x="${id}">Continue without a Tappy</button>
    </section>`;
};

V.pair = (id) => {
  const L = S.live;
  if (!L || L.eventId !== id || !L.badgeId) return V.checkin(id);
  if (L.paired) return `<header class="bar"><span></span><b>Paired</b><span></span></header>
    <section class="pad center">
      <div class="big-check">${ICON.check}</div>
      <h2>You’re connected!</h2>
      <p class="muted">Your Tappy wearable (${BADGE_ID}) is paired and live for ${esc(ev(id).title)}.</p>
      <div class="card-soft" style="text-align:left;margin-top:16px"><h3 style="margin:0 0 8px">How it works</h3><p class="muted small" style="font-size:14px">Tap your device with another attendee’s and both press Meet. You get a career question to talk about, and the tap is saved quietly. You decide later, at home, whether to connect.</p></div>
      <div class="rules"><div><b>Tap</b><small>hold devices together</small></div><div><b>Press = yes</b><small>hold = no</small></div><div><b>Linked</b><small>icebreaker + saved quietly</small></div></div>
      <p class="note">${ICON.lock} Linking never adds a connection. You accept or decline later, at home.</p>
    </section>
    <footer class="sticky"><button class="btn primary" data-a="phase-go" data-x="${id}|1">Back to event</button></footer>`;
  if (L.pairing) return `<header class="bar"><span></span><b>Link your Tappy</b><span></span></header>
    <section class="pad center">
      <div class="big-check" style="background:var(--s1);color:var(--tx)">${ICON.badge}</div>
      <h2>Is ${BADGE_ID} showing your name?</h2>
      <p class="muted">Staff linked this Tappy to your pass. Press <b>Meet</b> on the Tappy to confirm it’s yours. Hold it if it shows someone else.</p>
      <p class="note">${ICON.lock} Only you can confirm. Until you do, the Tappy shows nothing about you to others.</p>
      ${demo('Pressed Meet on the Tappy', 'pair-confirm')}
    </section>`;
  return `<header class="bar"><button class="icon-btn" data-a="nav" data-x="checkin/${id}">${ICON.back}</button><b>Pair Tappy</b><span></span></header>
    <section class="pad">
      <h2>Scan your Tappy</h2><p class="muted">Point your camera at the QR code on the device</p>
      <button class="scan" data-a="scan">${ICON.qr}<span>Tap to scan</span></button>
      <p class="muted center">Can’t scan? Enter code manually</p>
      <input class="field code-in" data-model="pairInput" placeholder="TP-00" value="${esc(ui.pairInput || '')}" maxlength="5">
      ${ui.pairError ? `<p class="error">${ui.pairError}</p>` : ''}
    </section>
    <footer class="sticky"><button class="btn primary" data-a="pair-start">Pair</button><button class="link" data-a="toast" data-x="Staff can pair it for you at the desk">No phone signal? Ask staff</button></footer>`;
};

/* ------------------------------------------------------- offline: live */
V.live = (id) => {
  const e = ev(id); const L = S.live || {};
  if (!reg(id)) return V.event(id);
  const here = e.attendees.map((p) => PEOPLE[p]);
  const mine = S.encounters.filter((x) => x.eventId === id);
  const tabs = [['here', 'Who’s here'], ['agenda', 'Agenda'], ['saved', `Met · ${mine.filter((x) => !x.waiting).length}`]];
  let body = '';
  if (ui.liveTab === 'here') body = `<p class="muted small">${here.length + 1} people chose to show on the wall. Spot their avatar on a Tappy.</p>
      <div class="wall">${(reg(id).wall ? [{ ...me(), ...badgeLook(), headline: badgeLook().tag }, ...here] : here).map((p) => `<button class="wall-tile" data-a="sheet-person" data-x="${p.id}">${asc(p, 64)}<b>${esc(p.short)}${p.id === 'me' ? ' (you)' : ''}</b><small>${esc(p.headline)}</small></button>`).join('')}</div>`;
  if (ui.liveTab === 'agenda') body = `<ul class="agenda">${e.agenda.map(([t, a], i) => `<li class="${i === 2 ? 'now' : ''}"><time>${t}</time>${a}${i === 2 ? ' <i class="chip">Now</i>' : ''}</li>`).join('')}</ul>`;
  if (ui.liveTab === 'saved') body = (mine.length ? mine.map(encounterRow).join('') : `<p class="empty">No one yet. Hold devices together with someone and both press Meet — they show up here, and you decide whether to connect after the event.</p>`)
    + (L.noBadge ? '' : here.filter((p) => !mine.some((x) => x.person === p.id)).slice(0, 2).map((p) => demo(`Linked with ${p.short} on the other device`, 'demo-enc', p.id)).join(''));
  return `<header class="bar"><button class="icon-btn" data-a="phase-go" data-x="${id}|1">${ICON.back}</button><span class="live-pill"><span class="dot"></span>Live</span>
      ${L.noBadge ? '<span class="muted small">No Tappy</span>' : `<button class="badge-pill" data-a="badge-open">${ICON.badge}${BADGE_ID}</button>`}</header>
    <section class="pad">
      <h2 class="title sm">${esc(e.title)}</h2>
      ${L.noBadge ? `<p class="note">${ICON.info} No Tappy? Tap someone on the wall to send a hi request instead.</p>` : `<p class="note">${ICON.badge} Your Tappy does the work. Tap devices with someone when you both want to talk.</p>`}
      <div class="tabs">${tabs.map(([k, l]) => `<button class="${ui.liveTab === k ? 'on' : ''}" data-a="live-tab" data-x="${k}">${l}</button>`).join('')}</div>
      ${body}<div class="spacer"></div>
    </section>
    <footer class="sticky"><button class="btn" data-a="exit-tap" data-x="${id}">Leaving? ${L.noBadge ? 'Wrap up' : 'Tap Tappy at the exit'}</button></footer>`;
};

function encounterRow(x) {
  const p = who(x.person);
  return `<div class="enc">${av(p, 44, 'round')}<div><b>${esc(p.name)}</b><small>${x.waiting ? 'Tapped · hasn’t tapped back yet' : esc(x.prompt)}</small></div>
    ${x.waiting ? '<i class="chip chip-pending" style="margin:0">Waiting</i>' : S.live?.eventId === x.eventId && !S.live?.online ? '<i class="chip" style="margin:0">Saved</i>' : followBtn(p.id)}</div>`;
}

V.leave = (id) => {
  const L = S.live || {}; const mine = S.encounters.filter((x) => x.eventId === id);
  if (L.noBadge) return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>Leaving</b><span></span></header>
    <section class="pad"><ol class="steps"><li class="done"><b>${mine.length} encounter${mine.length === 1 ? '' : 's'} saved</b><small>Stored in your app</small></li></ol></section>
    <footer class="sticky"><button class="btn primary" data-a="finish" data-x="${id}">Finish & see recap</button></footer>`;
  const returned = L.returned;
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>Return your Tappy</b><span></span></header>
    <section class="pad">
      <ol class="steps">
        <li class="done"><b>${mine.length} encounter${mine.length === 1 ? '' : 's'} synced to your app</b><small>Safe to hand the Tappy back ✓</small></li>
        <li class="${returned ? 'done' : 'now'}"><b>Hand ${BADGE_ID} to the desk</b>${returned ? '<small>Returned 20:21 ✓</small>' : `<small>Staff confirm it’s back.</small>${demo('Staff confirms return', 'return-badge', id)}<button class="link" data-a="toast" data-x="We’ll remind you. Tappy devices can be dropped at any Harbour Commons desk.">Leaving in a hurry?</button>`}</li>
        <li class="${returned ? 'done' : ''}"><b>Tappy wiped</b><small>${returned ? 'Your name and avatar are erased from the device ✓' : 'Your data is erased before the next person uses it'}</small></li>
      </ol>
    </section>
    ${returned ? `<footer class="sticky"><button class="btn primary" data-a="finish" data-x="${id}">See your recap</button></footer>` : ''}`;
};

/* --------------------------------------------------------------- online */
V.lobby = (id) => {
  const e = ev(id); const p = me(); const r = reg(id);
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>Lobby</b><span></span></header>
    <section class="pad">
      <h2 class="title sm">${esc(e.title)}</h2><p class="muted">Starts in 4 min · ${e.going} registered</p>
      <h3>How you’ll appear here</h3>
      <div class="public-card">${av(p, 56)}<div><b>${esc(p.name)}</b><small>${p.field}</small><small class="tags">${p.interests.map((t) => '#' + t).join(' ')}</small></div></div>
      <label class="toggle"><input type="checkbox" data-a="lobby-toggle" data-x="${id}" ${r.list ? 'checked' : ''}><span>Show me in People so others can wave</span></label>
      <ul class="checklist"><li>Video, camera and mic are controlled in Zoom</li><li>Waves only connect when both people say yes</li><li>You can leave any time</li></ul>
    </section>
    <footer class="sticky"><button class="btn primary" data-a="join-online" data-x="${id}">Enter event</button></footer>`;
};

V.room = (id) => {
  const e = ev(id); const host = hostOf(e);
  if (!reg(id)) return V.event(id);
  const people = e.attendees.filter((p) => p !== e.host).map((p) => PEOPLE[p]);
  const mine = S.encounters.filter((x) => x.eventId === id);
  const tabs = [['people', `People · ${people.length}`], ['agenda', 'Agenda'], ['saved', `Met · ${mine.length}`]];
  let body = '';
  if (ui.roomTab === 'people') body = people.map((p) => {
    const w = ui.waved[p.id]; const saved = mine.some((x) => x.person === p.id);
    return `<div class="enc">${av(p, 44, 'round')}<div><b>${esc(p.name)}</b><small>${esc(p.headline)}</small></div>
      ${saved ? '<span class="muted small">Saved ✓</span>' : `<button class="btn small ${w ? '' : 'primary'}" data-a="wave" data-x="${p.id}" ${w ? 'disabled' : ''}>${w ? 'Waved' : '👋 Wave'}</button>`}</div>`;
  }).join('') + `<p class="note">${ICON.lock} Waves are private. If they don’t wave back, nothing happens.</p>` + demo('David waves at you', 'incoming-wave', 'david');
  if (ui.roomTab === 'agenda') body = `<ul class="agenda">${e.agenda.map(([t, a], i) => `<li class="${i === 1 ? 'now' : ''}"><time>${t}</time>${a}</li>`).join('')}</ul>`;
  if (ui.roomTab === 'saved') body = mine.length ? mine.map(encounterRow).join('') : '<p class="empty">Wave at someone. If you both want to chat, you get a shared prompt and can accept to connect.</p>';
  return `<header class="bar"><button class="icon-btn" data-a="nav" data-x="home">${ICON.back}</button><span class="live-pill"><span class="dot"></span>Live online</span><span></span></header>
    <section class="pad">
      <div class="stage" style="--c1:${e.cover[0]};--c2:${e.cover[1]}">${av(host, 72)}<div><small>ON STAGE</small><b>${host.name}</b><span>“How I switched careers into UX”</span></div>
        <button class="btn small" data-a="toast" data-x="Opens the Zoom stream (mocked)">Open stream ↗</button></div>
      <div class="tabs">${tabs.map(([k, l]) => `<button class="${ui.roomTab === k ? 'on' : ''}" data-a="room-tab" data-x="${k}">${l}</button>`).join('')}</div>
      ${body}<div class="spacer"></div>
    </section>
    <footer class="sticky"><button class="btn" data-a="finish" data-x="${id}">Leave event</button></footer>`;
};

/* ---------------------------------------------------------------- recap */
V.recap = (id) => {
  const e = ev(id); const host = hostOf(e);
  if (!S.profile) return V.event(id);
  const mine = S.encounters.filter((x) => x.eventId === id);
  const nextUp = EVENTS.filter((x) => x.id !== id && !x.past && !reg(x.id) && x.tags.some((t) => e.tags.includes(t) || S.profile.interests.includes(t)));
  const fb = S.feedback[id];
  return `<header class="bar float"><button class="icon-btn" data-a="nav" data-x="home">${ICON.back}</button><span></span><span></span></header>
    <div class="hero" style="--c1:${e.cover[0]};--c2:${e.cover[1]}">${cover(e, 'art')}</div>
    <section class="pad">
      <p class="eyebrow">You went · ${e.date}</p>
      <h1 class="title">${esc(e.title)}</h1>
      <div class="stats"><div><b>${mine.length}</b><small>people saved</small></div><div><b>${S.following.filter((p) => mine.some((x) => x.person === p)).length}</b><small>following</small></div><div><b>${e.mode === 'online' ? '75' : '170'}</b><small>minutes</small></div></div>
      <h3>People you met</h3>
      ${mine.length ? mine.map(encounterRow).join('') + `<p class="note">${ICON.info} Follow anyone you met. If they follow you back, you’re connected — connections see each other at future events.</p>` : '<p class="empty">You didn’t save anyone this time — that’s fine.</p>'}
      <div class="msg">${av(host, 36, 'round')}<div><small>Message from ${host.short} · host</small><p>Thanks for coming! Slides and the resource list are in the ${esc(e.circle)} circle. See you at the next one.</p></div></div>
      <div class="prompt-card" data-a="compose" data-x="${id}"><small>Share a takeaway</small><b>What’s one thing you’ll try this week?</b><span>Help someone who couldn’t make it · +15 pts</span></div>
      <h3>How was it?</h3>
      <div class="rate">${['😕', '😐', '🙂', '😄', '🤩'].map((m, i) => `<button class="${fb === i ? 'on' : ''}" data-a="rate" data-x="${id}|${i}">${m}</button>`).join('')}</div>
      ${nextUp.length ? `<h3>Keep going</h3><div class="shelf">${nextUp.map(eventCard).join('')}</div>` : ''}
      <div class="spacer"></div>
    </section>`;
};

/* ------------------------------------------------------------ social graph */
const isConn = (id) => S.following.includes(id) && S.followers.includes(id);
const connections = () => S.following.filter((id) => S.followers.includes(id));
const connsGoing = (e) => (S.profile ? e.attendees.filter(isConn) : []);
const faces = (ids, size = 22) => `<span class="faces">${ids.slice(0, 4).map((id) => av(PEOPLE[id], size)).join('')}</span>`;
function connLine(e, size = 20) {
  const c = connsGoing(e); if (!c.length) return '';
  const names = c.slice(0, 2).map((id) => PEOPLE[id].short).join(', ');
  return `<span class="conn-line">${faces(c, size)}<span>${names}${c.length > 2 ? ` +${c.length - 2}` : ''} going</span></span>`;
}
// Nobody can contact someone directly: Connect sends a request (optional note); a mutual yes = connected.
function relLabel(id) {
  if (isConn(id)) return 'Connected';
  if (S.following.includes(id)) return 'Requested';
  if (S.followers.includes(id)) return 'Accept';
  return 'Connect';
}
function followBtn(id, small = true) {
  const l = relLabel(id); const cta = l === 'Connect' || l === 'Accept';
  return `<button class="btn ${small ? 'small' : ''} ${cta ? 'primary' : ''}" data-a="${l === 'Connect' ? 'connect-open' : 'follow'}" data-x="${id}">${l === 'Connected' ? '✓ Connected' : l}</button>`;
}
const circlesJoined = () => [...new Set([...(S.circles || []), ...Object.keys(S.regs).map((id) => ev(id).circle)])];

/* ------------------------------------------------------------ growth points */
function level(pts = S.lifetime ?? S.points ?? 0) {
  let i = 0; LEVELS.forEach(([min], k) => { if (pts >= min) i = k; });
  const [min, name] = LEVELS[i]; const nx = LEVELS[i + 1];
  return { n: i + 1, name, min, next: nx && nx[0], nextName: nx && nx[1], pct: nx ? Math.round(((pts - min) / (nx[0] - min)) * 100) : 100 };
}
function earn(n, why, quiet) {
  const before = level().n;
  S.points = (S.points || 0) + n;
  if (n > 0) S.lifetime = (S.lifetime ?? S.points - n) + n;
  S.ledger = [{ n, why, at: Date.now() }, ...(S.ledger || [])].slice(0, 30);
  save();
  const after = level();
  if (after.n > before) setTimeout(() => toast(`🎉 Level up — you’re now a ${after.name}`), quiet ? 0 : 2700);
  if (!quiet) toast(`+${n} pts · ${why}`);
}
function seedAccount(points) {
  S.following = [...SEED_GRAPH.following]; S.followers = [...SEED_GRAPH.followers];
  S.circles = ['Harbour Builders', 'UTS Design Crowd'];
  S.regs['portfolio-night'] = { status: 'attended', list: true, confirmed: true };
  // Mock one offline event per time state so Before / During / After can be shown without walking the flow.
  S.regs['crit-circle'] = { status: 'going', list: true, wall: true, confirmed: true };
  S.regs['switch-ux'] = { status: 'going', list: true };
  S.regs['data-ama'] = { status: 'going', list: true };
  S.regs['mixer'] = { status: 'going', list: true, wall: true, confirmed: true };
  ['ux-breakfast', 'ai-tools-jam', 'grad-panel'].forEach((id) => { S.regs[id] = { status: 'attended', list: true, confirmed: true }; });
  S.regs['coffee-meetup'] = { status: 'checkedin', list: true, wall: true, confirmed: true };
  S.live = { eventId: 'coffee-meetup', badgeId: BADGE_ID, paired: true }; S.badge = { screen: 'idle' };
  S.encounters = [['leo', 'What’s one skill you’re trying to build this year?'], ['sofia', 'What’s the best piece of feedback you’ve ever had on your work?'], ['marcus', 'What did you almost do instead of this career?']]
    .map(([person, prompt], i) => ({ id: 'seed' + i, person, eventId: 'portfolio-night', prompt, via: 'tappy', at: Date.now() - 6e8 }));
  S.encounters.push({ id: 'seed-live0', person: 'hannah', eventId: 'coffee-meetup', prompt: 'What would you tell yourself on day one of your first job?', via: 'tappy', at: Date.now() - 9e5 },
    { id: 'seed-live1', person: 'priya', eventId: 'coffee-meetup', prompt: 'Which project are you proudest of, and why?', via: 'tappy', at: Date.now() - 3e5, waiting: true });
  S.points = points; S.lifetime = points; S.ledger = points ? [{ n: 15, why: 'Shared an event takeaway', at: Date.now() - 864e5 }, { n: 20, why: 'Checked in at an event', at: Date.now() - 9e7 }, { n: 5, why: 'New connection · Leo', at: Date.now() - 2e8 }] : [];
}
const wallet = () => S.points || 0;            // spendable: goes down when you redeem
const earned = () => S.lifetime ?? S.points ?? 0; // lifetime: only goes up, sets your level
const lvChip = () => { const l = level(); return `<button class="lv-chip" data-a="nav" data-x="rewards">Lv ${l.n} · ${l.name}<span>${wallet()} pts to spend</span></button>`; };
const ptsPair = () => `<div class="pts-pair"><div><b>${wallet()}</b><small>pts to spend</small><i>Redeeming uses these</i></div><div><b>${earned()}</b><small>earned in total</small><i>Sets your level · never goes down</i></div></div>`;

/* ------------------------------------------------------------ community */
const msgReq = (id) => (S.msgReqs || {})[id];
const canChat = (id) => isConn(id) || msgReq(id)?.state === 'accepted';
const comments = (id) => [...(SEED_COMMENTS[id] || []), ...((S.myComments || {})[id] || []).map((t) => ['me', t])];
function postCard(p) {
  const a = p.anon ? { name: 'Anonymous member' } : who(p.author);
  const helped = S.helped.includes(p.id); const own = p.author === 'me';
  const conn = !own && !p.anon && isConn(p.author);
  return `<article class="post tappable" data-a="nav" data-x="post/${p.id}">
    <header>${p.anon ? '<span class="ph anon" style="width:36px;height:36px">?</span>' : `<button class="plain" data-a="nav" data-x="${own ? 'me' : 'person/' + p.author}">${av(a, 36)}</button>`}
      <div><b>${esc(a.name)}${conn ? ' <i class="conn-tag">Connection</i>' : ''}</b><small>${p.aud === 'circle' ? ICON.lock : ''}${esc(p.circle)} · ${p.ago}</small></div><i class="chip">${p.type}</i></header>
    <p>${esc(p.text)}</p>
    <footer><button class="help ${helped ? 'on' : ''}" data-a="helped" data-x="${p.id}" ${own ? 'disabled' : ''}>${ICON.spark}Helpful · ${p.helpful + (helped ? 1 : 0)}</button><button class="help" data-a="nav" data-x="post/${p.id}">${ICON.chat}${p.comments + ((S.myComments || {})[p.id] || []).length}</button><span style="flex:1"></span><span class="read-more">Read more ›</span></footer>
  </article>`;
}

/* Post detail (teammate flow): author + Connect, full post, comments inline, reply box. */
const POST_EXTRA = {
  p1: { title: 'Free PM mock interviews this week', more: ['Each slot is 20 minutes: 10 on a product case, 10 on feedback. I’ll focus on how you structure your answer, not whether it’s “right”.', 'Priority for people who came to the last build night, but reply anyway if you’re switching into product.'], tags: ['Interviews', 'Product', 'Mentoring'] },
  p2: { title: 'My teaching portfolio was a data portfolio', more: ['I spent months thinking I had nothing to show. Then I realised every lesson plan had a question, data, and a decision — exactly what a dashboard is.', 'I rebuilt three of them in Looker Studio and wrote a one-paragraph story for each. Two recruiters asked about them in the first call.', 'If you’re switching careers: look at what you already made before you start a “portfolio project”.'], tags: ['Career change', 'Data viz', 'Portfolio'] },
  p3: { title: 'Agent-eval checklist (for first-timers)', more: ['It covers scoping the task, picking 10 real test cases, and what to log so you can debug later.', 'It’s pinned in the circle. Comments welcome — I’ll update it after the next build night.'], tags: ['AI tools', 'Resources'] },
  p4: { title: 'How do we make crits less scary?', more: ['I’m redesigning Thursday’s format. Ideas so far: share the three questions in advance, keep groups to four, and end with one thing that works.', 'What would make you actually bring a piece you’re stuck on?'], tags: ['Portfolio', 'UX', 'Junior'] },
  p5: { title: 'Anyone walking into the mixer together?', more: ['First time at Sydney Tech and I don’t know anyone. I’ll be at the main door at 6pm — look for the green tote bag.'], tags: ['Networking', 'Going together'] },
  p6: { title: 'Hiring 2 grad engineers (Feb start)', more: ['We’re a small platform team. I’ll refer people I’ve actually talked to, so come say hi at the mixer or reply here with what you’ve built.'], tags: ['Referral', 'Graduate', 'Engineering'] },
  p7: { title: 'I got my first design internship!', more: ['The interviewer asked about exactly the case study the crit circle tore apart two weeks ago. I had answers because you all asked first.', 'Thank you — I’ll be at the next crit to pay it forward.'], tags: ['Win', 'Internship', 'UX'] },
  p8: { title: 'Vote: next build night theme', more: ['(a) voice agents, (b) agents for spreadsheets, (c) evals deep-dive. Reply with a letter — closes Friday.'], tags: ['AI tools', 'Community'] }
};

V.post = (id) => {
  const p = allPosts().find((x) => x.id === id); if (!p) return V.notfound();
  const a = p.anon ? { name: 'Anonymous member' } : who(p.author); const own = p.author === 'me';
  const helped = S.helped.includes(p.id); const cs = comments(id); const total = p.comments + ((S.myComments || {})[id] || []).length;
  let rel = '';
  if (!own && !p.anon && S.profile) {
    rel = isConn(p.author) ? `<button class="btn small" data-a="nav" data-x="chat/${p.author}">Message</button>`
      : S.following.includes(p.author) ? '<button class="btn small" disabled>Requested</button>'
      : `<button class="btn small primary" data-a="connect-open" data-x="${p.author}">${ICON.plus}Connect</button>`;
  }
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>Post</b><button class="icon-btn" data-a="toast" data-x="Link copied">${ICON.share}</button></header>
    <section class="pad post-detail">
      <div class="pd-author">${p.anon ? '<span class="ph anon" style="width:44px;height:44px">?</span>' : `<button class="plain" data-a="nav" data-x="${own ? 'me' : 'person/' + p.author}">${av(a, 44)}</button>`}
        <div><b>${esc(a.name)}</b><small>${p.anon ? '' : esc(a.headline || '') + ' · '}${p.ago}</small></div>${rel}</div>
      <div class="pd-tags"><i class="chip">${p.type}</i><i class="chip">${p.aud === 'circle' ? ICON.lock : ''}${esc(p.circle)}</i></div>
      ${POST_EXTRA[id]?.title ? `<h1 class="pd-title">${esc(POST_EXTRA[id].title)}</h1>` : ''}
      ${POST_EXTRA[id] ? `<img class="pd-img" src="posts/${id}.jpg" alt="">` : ''}
      <p class="pd-text">${esc(p.text)}</p>
      ${(POST_EXTRA[id]?.more || []).map((t) => `<p class="pd-text more">${esc(t)}</p>`).join('')}
      ${POST_EXTRA[id]?.tags ? `<div class="pd-tags">${POST_EXTRA[id].tags.map((t) => `<i class="tag-out">#${esc(t)}</i>`).join('')}</div>` : ''}
      <div class="pd-actions"><button class="help ${helped ? 'on' : ''}" data-a="helped" data-x="${p.id}" ${own ? 'disabled' : ''}>${ICON.spark}Helpful · ${p.helpful + (helped ? 1 : 0)}</button><span class="muted small">${ICON.chat} ${total} comments</span></div>
      <div class="pd-chead"><h3>Comments · ${total}</h3><div class="seg-mini">${['Top', 'Newest'].map((k) => `<button class="${(ui.csort || 'Top') === k ? 'on' : ''}" data-a="csort" data-x="${k}">${k}</button>`).join('')}</div></div>
      <div class="clist">${(ui.csort === 'Newest' ? [...cs].reverse() : cs).map(([au, t], i) => { const u = who(au); return `<div class="cmt">${av(u, 30)}<div><b>${esc(u.name)}${au === p.author ? ' <i class="chip" style="margin:0 0 0 4px">Author</i>' : ''} <small class="muted" style="font-weight:400;margin-left:4px">${['1h', '45m', '30m', '12m', '5m'][i % 5]}</small></b><p>${esc(t)}</p><small class="muted cmt-act">♡ ${[12, 7, 3, 2, 1][i % 5]} · Reply</small></div></div>`; }).join('') || '<p class="muted small">Be the first to reply.</p>'}${p.comments > cs.length ? `<p class="muted small">+ ${p.comments - cs.length} earlier comments</p>` : ''}</div>
      <div class="spacer"></div>
    </section>
    <footer class="sticky"><div class="cinput"><input class="field" data-model="commentText" placeholder="Add a comment… (+3 pts)" value="${esc(ui.commentText || '')}"><button class="btn small primary" data-a="send-comment" data-x="${id}">Send</button></div></footer>`;
};

V.community = () => {
  const mode = ui.cmode === 'Networks' ? 'Networks' : 'Community';
  return `<header class="top"><h1 style="font-size:${mode === 'Community' ? 26 : 28}px">${mode === 'Community' ? 'Community Explorer' : 'Network'}</h1>${S.profile ? lvChip() : ''}</header>
    <section class="pad">
      <div class="seg ${mode === 'Networks' ? 'net' : ''}">${['Community', 'Networks'].map((m) => `<button class="${mode === m ? 'on' : ''}" data-a="cmode" data-x="${m}">${m}</button>`).join('')}</div>
      ${mode === 'Community' ? communityView() : networkView()}
    </section>
    <div class="spacer"></div>`;
};

function communityView() {
  const q = (ui.cq || '').toLowerCase();
  const list = allPosts().filter((p) => p.aud === 'public' && (!q || (p.text + p.circle + p.type + (who(p.author)?.name || '')).toLowerCase().includes(q)));
  return `<div class="search">${ICON.search}<input data-model="cq" placeholder="Search" aria-label="Search posts" value="${esc(ui.cq || '')}"></div>
    <button class="btn primary" style="margin-bottom:18px" data-a="compose" data-x="">+ Create post</button>
    <p class="note">${ICON.globe} Open to everyone on JobBuddy: questions, takeaways, referrals, and people looking for someone to go with.</p>
    ${list.map(postCard).join('') || '<div class="empty">No posts match that search</div>'}`;
}

const requests = () => S.followers.filter((id) => !S.following.includes(id) && !(S.dismissed || []).includes(id));
function metAt(id) { const x = S.encounters.find((y) => y.person === id); return x ? ev(x.eventId).title : ''; }

function networkView() {
  if (!S.profile) return `<div class="empty">Log in to see your connections and event circles.</div><div style="height:12px"></div><button class="btn primary" data-a="login-demo">Log in</button>`;
  const sub = ui.nsub === 'Requests' ? 'Requests' : 'Connections';
  const q = (ui.nq || '').toLowerCase();
  const conns = connections().filter((id) => !q || PEOPLE[id].name.toLowerCase().includes(q));
  const reqs = requests();
  const seen = [...new Set([...S.encounters.map((x) => x.person), ...EVENTS.filter((e) => reg(e.id)).flatMap((e) => e.attendees)])]
    .filter((id) => !S.following.includes(id) && !reqs.includes(id)).slice(0, 4);
  const person = (id, right) => `<div class="list-item"><button class="plain" data-a="nav" data-x="person/${id}">${av(PEOPLE[id], 48)}</button><div class="grow"><h3>${PEOPLE[id].name}</h3><small>${esc(PEOPLE[id].headline)}</small></div>${right}</div>`;
  let body;
  const connRow = (id) => `<button class="list-item" data-a="nav" data-x="person/${id}">${av(PEOPLE[id], 48)}<div class="grow"><h3>${PEOPLE[id].name}</h3><small>${esc(PEOPLE[id].headline)}</small></div>${ICON.chev}</button>`;
  if (sub === 'Connections' && conns.length > 3) body = conns.slice(0, 3).map(connRow).join('') + `<button class="see-all" data-a="conn-sheet">See all ${conns.length} ›</button>`;
  else if (sub === 'Connections') body = conns.map((id) => `<button class="list-item" data-a="nav" data-x="person/${id}">${av(PEOPLE[id], 48)}<div class="grow"><h3>${PEOPLE[id].name}</h3><small>${esc(PEOPLE[id].headline)}</small></div>${ICON.chev}</button>`).join('')
    || '<div class="empty">No connections yet — tap devices at your next event, then follow each other.</div>';
  else body = (reqs.map((id) => `<div class="card-soft"><div style="display:flex;gap:14px;align-items:center">${av(PEOPLE[id], 48)}<div class="grow" style="flex:1"><h3 style="margin:0">${PEOPLE[id].name}</h3><small>${esc(PEOPLE[id].headline)}</small><small style="color:var(--green2)">${metAt(id) ? `Met at ${esc(metAt(id))}` : 'Sent you a connect request'}</small></div></div>
      <p class="muted" style="margin:12px 0;font-size:14px">“${esc(AUTO_REPLY[id] || DEFAULT_AUTO_REPLY)}”</p>
      <div style="display:flex;gap:10px"><button class="btn" style="height:42px" data-a="dismiss" data-x="${id}">Decline</button><button class="btn primary" style="height:42px" data-a="follow" data-x="${id}">Accept</button></div></div>`).join('')
    || '<div class="empty">You’re all caught up. People you tap at events show up here after they sync.</div>')
    + (seen.length ? `<h3>Explore who else was there</h3>${seen.map((id) => person(id, followBtn(id))).join('')}` : '');
  const circles = circlesJoined();
  return `<div class="search">${ICON.search}<input data-model="nq" placeholder="Search connections" aria-label="Search connections" value="${esc(ui.nq || '')}"></div>
    <div class="seg2"><button class="${sub === 'Connections' ? 'on' : ''}" data-a="nsub" data-x="Connections">Connections</button><button class="${sub === 'Requests' ? 'on' : ''}" data-a="nsub" data-x="Requests">Requests${reqs.length ? `<i class="cnt">${reqs.length}</i>` : ''}</button></div>
    ${body}
    <h2 style="margin:28px 0 6px">Event Circles</h2>
    <p class="muted small" style="margin-bottom:14px">Members only — you join a circle by attending its events.</p>
    ${circles.map((c) => { const posts = allPosts().filter((p) => p.aud === 'circle' && p.circle === c).length; const evs = EVENTS.filter((e) => e.circle === c);
      const went = evs.some((e) => reg(e.id)?.status === 'attended');
      return `<button class="list-item" data-a="nav" data-x="circle/${encodeURIComponent(c)}"><div style="width:68px;height:68px;border-radius:12px;overflow:hidden;flex:0 0 auto">${art(seedOf(c), '', 'width:100%;height:100%')}</div><div class="grow"><h3>${esc(c)}</h3><small style="margin:4px 0">${evs.map((e) => e.date).join(' · ') || 'Circle'}</small><small style="color:var(--ac-tx);margin-bottom:6px">${posts} stories shared</small><i class="chip ${went ? 'chip-attended' : 'chip-going'}" style="margin:0">${went ? 'Past' : 'Member'}</i></div>${ICON.chev}</button>`; }).join('') || '<div class="empty">Attend an event to join your first circle.</div>'}
    ${podsSection()}`;
}

V.circle = (arg) => {
  const c = decodeURIComponent(arg || ''); const mine = circlesJoined().includes(c);
  const evs = EVENTS.filter((e) => e.circle === c); const t = ui.ctab === 'Attendees' ? 'Attendees' : 'Stories';
  const posts = allPosts().filter((p) => p.aud === 'circle' && p.circle === c);
  const people = [...new Set(evs.flatMap((e) => e.attendees))];
  const e0 = evs[0];
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><span></span><i class="chip ${mine ? 'chip-going' : ''}" style="margin:0;justify-self:end">${mine ? 'Member' : 'Members only'}</i></header>
    <section class="pad">
      ${art(seedOf(c), 'heroart')}
      <h1 style="margin-top:14px">${esc(c)}</h1><p class="muted">${evs.map((e) => e.date).join(' · ')} · ${people.length + (mine ? 1 : 0)} members</p>
      ${mine ? `<div class="seg2">${['Stories', 'Attendees'].map((x) => `<button class="${t === x ? 'on' : ''}" data-a="ctab" data-x="${x}">${x}</button>`).join('')}</div>
        ${t === 'Stories' ? `${posts.map(postCard).join('') || '<div class="empty">No stories yet — share the first one.</div>'}
          <p class="note">${ICON.lock} Only circle members can see these posts.</p>
          <button class="btn primary" data-a="${e0 ? 'compose' : 'nav'}" data-x="${e0 ? e0.id : 'compose/'}">+ Add memory</button>`
        : people.map((id) => `<div class="list-item"><button class="plain" data-a="nav" data-x="person/${id}">${av(PEOPLE[id], 48)}</button><div class="grow"><h3>${PEOPLE[id].name}</h3><small>${esc(PEOPLE[id].headline)}</small></div>${followBtn(id)}</div>`).join('')}`
      : `<div class="empty">${ICON.lock}<br>Attend one of this circle’s events to join and see its stories.</div>${evs.map(lumaRow).join('')}`}
      <div class="spacer"></div>
    </section>`;
};

/* ------------------------------------------------------------ pods
   Small invite-only groups (teammate design). Logic: you can only invite connections (mutual follows). */
const POD_SEED = [{
  id: 'pod-portfolio', name: 'Portfolio Buddies', desc: 'Keeping each other on track with case studies before grad applications',
  members: ['sofia', 'leo', 'priya'], status: 'In progress',
  todos: [{ t: 'Post one case study draft each', who: 'Everyone', done: false }, { t: 'Book a crit slot for Thursday', who: 'Leo', done: true }, { t: 'Share interview question bank', who: 'Sofia', done: false }],
  events: ['crit-circle'],
  chat: [['sofia', 'Crit circle is on Thursday — who’s bringing a case study?'], ['leo', 'Me! Still fixing the intro though 😅'], ['priya', 'Happy to review it tonight if you send it over'], ['sofia', { ev: 'crit-circle' }]]
}];
const pods = () => { if (!S.pods) { S.pods = JSON.parse(JSON.stringify(POD_SEED)); S.podUnread = { 'pod-portfolio': 2 }; save(); } return S.pods; };
const pod = (id) => pods().find((p) => p.id === id);
const podFaces = (p, size = 32) => `<span class="pod-faces" style="width:${size + 22}px;height:${size + 14}px">${p.members.slice(0, 2).map((m, i) => `<span style="top:${i ? 14 : 0}px;left:${i ? 22 : 0}px">${av(PEOPLE[m], size)}</span>`).join('')}</span>`;
const podLast = (p) => { const m = p.chat[p.chat.length - 1]; if (!m) return 'Say hi to the pod 👋'; const n = m[0] === 'me' ? 'You' : PEOPLE[m[0]].short; return `${n}: ${typeof m[1] === 'string' ? m[1] : 'shared an event'}`; };

function podsSection() {
  return `<div style="display:flex;align-items:center;margin-top:28px"><div style="flex:1"><h2 style="margin:0">Pods</h2><p class="muted small" style="margin-top:4px">Your people, your project — invite-only (:</p></div><button class="icon-btn dark" data-a="nav" data-x="podnew" aria-label="Create pod">${ICON.plus}</button></div>
    <div style="height:14px"></div>
    ${pods().map((p) => `<button class="list-item" data-a="nav" data-x="pod/${p.id}" style="flex-wrap:wrap">${podFaces(p)}<div class="grow"><h3>${esc(p.name)}</h3><small style="margin:3px 0 6px">${p.members.length + 1} members · ${p.todos.filter((t) => !t.done).length} to-dos open</small><i class="chip chip-pending" style="margin:0">${p.status}</i></div>${S.podUnread?.[p.id] ? `<i class="unread">${S.podUnread[p.id]}</i>` : ICON.chev}<p class="muted small" style="width:100%;margin-top:8px">${esc(p.desc)}</p></button>`).join('') || '<div class="empty">No pods yet. Start one with people you’ve met.</div>'}`;
}

/* ------------------------------------------------------------ shared chat thread
   One component for Pod group chats and direct chats. key = 'pod:<id>' | 'dm:<personId>'.
   Messages: [by, text] or [by, { ev: eventId }]. */
const thread = (key) => {
  const [kind, id] = key.split(':');
  if (kind === 'ev') { const e = ev(id); S.evChats = S.evChats || {}; S.evChats[id] = S.evChats[id] || JSON.parse(JSON.stringify(EVENT_CHAT_SEED[id] || [])); return e && { kind, id, msgs: S.evChats[id], group: true, repliers: e.attendees, title: e.title, onShare: () => {} }; }
  if (kind === 'pod') { const p = pod(id); return p && { kind, id, msgs: p.chat, group: true, repliers: p.members, title: p.name, onShare: (eid) => { if (!p.events.includes(eid)) p.events.push(eid); } }; }
  const c = chats(); c[id] = c[id] || [];
  return PEOPLE[id] && { kind, id, msgs: c[id], group: false, repliers: [id], title: PEOPLE[id].short, onShare: () => {} };
};
const threadHash = (key) => { const [k, id] = key.split(':'); return '#/' + ({ pod: 'pod/', ev: 'event/' }[k] || 'chat/') + id; };

function msgBubble(m, group) {
  const mine = m[0] === 'me'; const who_ = mine ? 'You' : PEOPLE[m[0]]?.short || '';
  const name = group && !mine ? `<b>${who_}</b><br>` : '';
  if (typeof m[1] === 'string') return `<div class="bub ${mine ? 'me' : ''}">${name}${esc(m[1])}</div>`;
  if (!m[1].ev) return ''; // legacy to-do cards now live in the To-do tab
  const e = ev(m[1].ev);
  return `<div class="bub card-bub ${mine ? 'me' : ''}"><small>${mine ? 'You' : '<b>' + who_ + '</b>'} shared an event</small><button class="ev-share" data-a="nav" data-x="event/${e.id}">${cover(e, 'sm')}<span><b>${esc(e.title)}</b><small>${e.date} · ${e.mode === 'online' ? 'Online' : e.venue.split(',')[0]}</small></span></button></div>`;
}

// Bubbles + WeChat-style composer (Enter sends; ⊕ opens Event / Album / Camera).
function chatThread(key, placeholder, locked) {
  const t = thread(key); const open = ui.chatPlus === key;
  const tiles = [['event', ICON.cal, 'Event'], ['album', ICON.image, 'Album'], ['camera', ICON.camera, 'Camera']];
  return `<div class="bubbles ${open ? 'with-panel' : ''}">${t.msgs.map((m) => msgBubble(m, t.group)).join('') || '<p class="muted small center">Say hi 👋</p>'}${ui.typing === key ? '<div class="bub small">typing…</div>' : ''}</div>
    <div class="composer-wrap">
      ${locked ? `<div class="composer"><p class="muted small" style="flex:1">${locked}</p></div>`
      : `<div class="composer"><input data-model="msgText" id="msgIn" data-key="${key}" enterkeyhint="send" placeholder="${placeholder}" aria-label="Message" value="${esc(ui.msgText || '')}"><button class="plain plus-btn ${open ? 'on' : ''}" data-a="chat-plus" data-x="${key}" aria-label="More">${ICON.plus}</button></div>
        ${open ? `<div class="plus-panel">${tiles.map(([k, ic, l]) => `<button data-a="chat-plus-pick" data-x="${key}|${k}"><span>${ic}</span><small>${l}</small></button>`).join('')}</div>` : ''}`}
    </div>`;
}
function chatReply(key) {
  const t = thread(key); const who_ = t.repliers[Math.floor(Math.random() * t.repliers.length)]; if (!who_) return;
  ui.typing = key; render(); scrollEnd();
  setTimeout(() => {
    const r = ['Love this!', 'Count me in 🙌', 'Nice, adding it to my calendar', 'Sounds good (:', 'Let’s do it!'];
    thread(key).msgs.push([who_, r[Math.floor(Math.random() * r.length)]]); ui.typing = null; save();
    if (location.hash === threadHash(key)) { render(); scrollEnd(); }
  }, 1500);
}

V.pod = (id) => {
  const p = pod(id); if (!p || !S.profile) return V.community();
  if (S.podUnread?.[id]) { S.podUnread[id] = 0; save(); }
  const tab = ui.podTab === 'To-do' ? 'To-do' : 'Chat';
  const open = p.todos.filter((x) => !x.done).length;
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>${esc(p.name)} (${p.members.length + 1})</b><button class="btn small" data-a="pod-invite" data-x="${id}">+ Invite</button></header>
    <section class="pad">
      <div class="pod-members">${p.members.map((m) => `<button class="plain" data-a="nav" data-x="person/${m}">${av(PEOPLE[m], 36)}<small>${PEOPLE[m].short}</small></button>`).join('')}<span>${av(me(), 36)}<small>You</small></span></div>
      <div class="seg2" style="margin:0 0 16px">${['Chat', 'To-do'].map((x) => `<button class="${tab === x ? 'on' : ''}" data-a="pod-tab" data-x="${x}">${x}${x === 'To-do' && open ? ` · ${open}` : ''}</button>`).join('')}</div>
      ${tab === 'Chat' ? chatThread('pod:' + id, 'Message the pod...')
      : `${p.todos.map((x, i) => `<button class="todo ${x.done ? 'on' : ''}" data-a="pod-todo" data-x="${id}|${i}" aria-pressed="${x.done}"><span class="box">${x.done ? ICON.check : ''}</span><span class="t">${esc(x.t)}</span><small>${esc(x.who)}</small></button>`).join('') || '<div class="empty">No to-dos yet.</div>'}
        <div style="display:flex;gap:8px;margin-top:14px"><input class="field" data-model="todoText" id="todoIn" enterkeyhint="done" placeholder="Add a to-do" value="${esc(ui.todoText || '')}"><button class="btn small primary" style="height:50px" data-a="pod-add-todo" data-x="${id}">Add</button></div>
        <div class="spacer"></div>`}
    </section>`;
};

V.podnew = () => {
  if (!S.profile) return V.community();
  const d = ui.newPod || (ui.newPod = { name: '', desc: '', members: [] });
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>Create pod</b><span></span></header>
    <section class="pad">
      <p class="muted">Pods are small, invite-only groups for people you’ve met — to keep a project or conversation going.</p>
      <h3>Pod name</h3><input class="field" data-model="newPod.name" placeholder="e.g. Portfolio Buddies" value="${esc(d.name)}" maxlength="32">
      <h3>What are you working on?</h3><input class="field" data-model="newPod.desc" placeholder="Describe the goal in a sentence" value="${esc(d.desc)}" maxlength="90">
      <h3>Invite connections</h3>
      <div class="pills">${connections().map((id) => `<button class="pill ${d.members.includes(id) ? 'on' : ''}" data-a="podnew-member" data-x="${id}">${PEOPLE[id].name}</button>`).join('') || '<p class="muted small">Connect with people first — you can only invite connections.</p>'}</div>
      <p class="note">${ICON.lock} Only people you’re connected with (you follow each other) can be invited.</p>
    </section>
    <footer class="sticky"><button class="btn primary" data-a="podnew-create">Create pod</button></footer>`;
};

function podSheet() {
  const s = ui.sheet; const p = s.type === 'pod-invite' && pod(s.id);
  if (s.type === 'chat-share') {
    const t = thread(s.id);
    return `<h2 class="sheet-title">Share an event with ${esc(t.title)}</h2><div class="clist">${EVENTS.map((e) => `<button class="ev-share" data-a="chat-share-pick" data-x="${s.id}|${e.id}">${cover(e, 'sm')}<span><b>${esc(e.title)}</b><small>${e.date} · ${e.mode === 'online' ? 'Online' : e.venue.split(',')[0]}</small></span></button>`).join('')}</div>`;
  }
  const list = connections().filter((id) => !p.members.includes(id));
  return `<h2 class="sheet-title">Invite to ${esc(p.name)}</h2><div class="clist">${list.map((id) => `<div class="enc">${av(PEOPLE[id], 44)}<div><b>${PEOPLE[id].name}</b><small>${esc(PEOPLE[id].headline)}</small></div><button class="btn small primary" data-a="pod-invite-pick" data-x="${p.id}|${id}">Invite</button></div>`).join('') || '<p class="muted small">All your connections are already here. Follow people you meet at events to invite more.</p>'}</div>`;
}
/* ------------------------------------------------------------ messages */
const CHAT_SEED = {
  priya: [['priya', 'The agent-eval checklist is pinned in the circle btw!'], ['me', 'Amazing, thank you 🙏']],
  sofia: [['sofia', 'Are you coming to the crit circle on Thursday?'], ['me', 'Yes! Wouldn’t miss it (:'], ['sofia', 'Awesome, bring one case study']],
  leo: [['leo', 'Thanks for the Figma tips yesterday!']]
};
const chats = () => { if (!S.chats) { S.chats = JSON.parse(JSON.stringify(CHAT_SEED)); S.unread = { leo: 1, sofia: 1 }; save(); } return S.chats; };
const unreadTotal = () => (S.profile ? [...Object.values(chats() && S.unread || {}), ...Object.values(pods() && S.podUnread || {})].reduce((a, b) => a + b, 0) : 0);

V.messages = () => {
  if (!S.profile) return `<header class="top"><h1>Messages</h1></header><section class="pad"><div class="empty">Log in to message your connections.</div><div style="height:12px"></div><button class="btn primary" data-a="login-demo">Log in</button></section>`;
  const c = chats(); const ids = Object.keys(c).filter((id) => PEOPLE[id]);
  return `<header class="top"><div><h1>Messages</h1><p class="muted" style="margin-top:4px">Your chatbox</p></div></header>
    <section class="pad">
      <h3 style="margin-top:6px">Pods</h3>
      ${pods().map((p) => `<button class="list-item" data-a="pod-open" data-x="${p.id}">${podFaces(p)}<div class="grow"><h3>${esc(p.name)}</h3><small style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(podLast(p))}</small></div>${S.podUnread?.[p.id] ? `<i class="unread">${S.podUnread[p.id]}</i>` : ''}</button>`).join('') || '<div class="empty">No pods yet. Create one from Community → Networks.</div>'}
      <h3>Direct</h3>
      ${ids.map((id) => { const m = c[id][c[id].length - 1]; return `<button class="list-item" data-a="nav" data-x="chat/${id}">${av(PEOPLE[id], 48)}<div class="grow"><h3>${PEOPLE[id].name}</h3><small style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m ? (m[0] === 'me' ? 'You: ' : '') + (typeof m[1] === 'string' ? esc(m[1]) : 'Shared an event') : 'Say hi 👋'}</small></div>${S.unread?.[id] ? `<i class="unread">${S.unread[id]}</i>` : ''}</button>`; }).join('') || '<div class="empty">No messages yet. Connect with someone to start chatting.</div>'}
      <p class="note">${ICON.lock} You can message connections. Anyone else needs a message request they accept first.</p>
      <div class="spacer"></div>
    </section>`;
};

V.chat = (id) => {
  const p = PEOPLE[id]; if (!p || !S.profile) return V.messages();
  chats(); if (S.unread?.[id]) { S.unread[id] = 0; save(); }
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><button class="plain" data-a="nav" data-x="person/${id}" style="display:flex;gap:10px;align-items:center;justify-self:center">${av(p, 32)}<span style="text-align:left"><b>${p.name}</b><small style="color:var(--ac-tx)">${isConn(id) ? 'Connected' : msgReq(id)?.state === 'accepted' ? 'Request accepted' : msgReq(id) ? 'Request pending' : 'Not connected'}</small></span></button><span></span></header>
    <section class="pad">${!isConn(id) && msgReq(id)?.state === 'pending' ? `<p class="note">${ICON.lock} Message request sent. Waiting for ${p.short} to accept — chat unlocks then. Expires in 7 days.</p>${demo(`${p.short} accepts your message request`, 'msg-accept', id)}` : msgReq(id)?.state === 'accepted' && !isConn(id) ? `<p class="note">${ICON.check} ${p.short} accepted your message request. You can both talk now.</p>` : ''}
      ${chatThread('dm:' + id, 'Type a message...', canChat(id) ? '' : msgReq(id) ? 'Waiting for them to accept…' : `Send ${p.short} a message request first.`)}</section>`;
};

const PLACEHOLDER = { Question: 'What are you stuck on?', Takeaway: 'What’s one thing you’ll try this week?', Resource: 'Share a link, template or tool…', 'Offer help': 'What could you help someone with?', Referral: 'Which role, and who should reach out?', 'Going together': 'Which event? Where should people meet you?', Win: 'What happened? Who helped?' };
V.compose = (eventId) => {
  const e = eventId && ev(eventId);
  const mine = circlesJoined();
  if (!ui.compose || ui.compose.eventId !== eventId) ui.compose = { eventId, type: e ? 'Takeaway' : 'Question', text: '', audience: e || mine.length ? 'circle' : 'public', circle: e ? e.circle : mine[0] };
  const c = ui.compose;
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.close}</button><b>Create post</b><button class="btn small primary" data-a="post">Post</button></header>
    <section class="pad">
      ${e ? `<div class="linked">${cover(e, 'sm')}<div><small>Linked to</small><b>${esc(e.title)}</b></div></div>` : ''}
      <div class="pills">${POST_TYPES.map((t) => `<button class="pill ${c.type === t ? 'on' : ''}" data-a="compose-type" data-x="${t}">${t}</button>`).join('')}</div>
      <textarea class="field area" data-model="compose.text" placeholder="${PLACEHOLDER[c.type]}">${esc(c.text)}</textarea>
      <h3>Who can see this</h3>
      <div class="seg3">${[['circle', 'Circle'], ['public', 'Public'], ['anon', 'Anonymous']].map(([k, l]) => `<button class="${c.audience === k ? 'on' : ''}" data-a="compose-aud" data-x="${k}">${l}</button>`).join('')}</div>
      ${c.audience === 'circle' ? `<div class="pills" style="margin-top:12px">${(e ? [e.circle] : mine).map((x) => `<button class="pill ${c.circle === x ? 'on' : ''}" data-a="compose-circle" data-x="${x}">${ICON.lock}${x}</button>`).join('')}</div>` : ''}
      <p class="note">${ICON.spark} +${e ? 15 : 10} pts for posting. More when people mark it helpful or reply.</p>
    </section>`;
};

/* ------------------------------------------------------------ growth */
V.rewards = () => {
  const l = level();
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>Growth & points</b><button class="icon-btn help-btn" data-a="growth-help" aria-label="How growth works">${ICON.help}</button></header>
  <section class="pad">
    <div class="lv-hero"><small>LEVEL ${l.n}</small><b>${l.name}</b><div class="lvbar"><i style="width:${l.pct}%"></i></div>
      <span>${l.next ? `${l.next - earned()} more earned pts to ${l.nextName}` : 'Top level'}</span></div>
    ${ptsPair()}
    <h3>Levels</h3>
    <ol class="levels">${LEVELS.map(([min, name], i) => `<li class="${i + 1 === l.n ? 'now' : i + 1 < l.n ? 'done' : ''}"><span>${i + 1}</span><b>${name}</b><small>${min} pts</small></li>`).join('')}</ol>
    <h3>How you earn</h3>
    <ul class="rules-list">${POINT_RULES.map(([t, n]) => `<li><span>${t}</span><b>+${n}</b></li>`).join('')}</ul>
    <p class="note">${ICON.info} Fair play: up to 60 pts a day from posts and comments; each person’s “helpful” counts once; self-votes and vote swaps don’t count.</p>
    <h3>Redeem</h3>
    ${REDEEM.map((r) => `<div class="enc"><span class="reward-ico">${ICON.spark}</span><div><b>${r.title}</b><small>${r.desc}${(S.credits || {})[r.id] ? ` · you have ${S.credits[r.id]}` : ''}</small></div><button class="btn small ${(S.points || 0) >= r.cost ? 'primary' : ''}" data-a="redeem" data-x="${r.id}" ${(S.points || 0) >= r.cost ? '' : 'disabled'}>${r.cost} pts</button></div>`).join('')}
    <h3>Recent</h3>
    ${(S.ledger || []).slice(0, 6).map((x) => `<div class="ledger"><span>${esc(x.why)}${x.n < 0 ? '<small>Spent · level unchanged</small>' : ''}</span><b class="${x.n < 0 ? 'neg' : ''}">${x.n > 0 ? '+' : ''}${x.n}</b></div>`).join('') || '<p class="empty">No points yet.</p>'}
    <div class="spacer"></div>
  </section>`;
};

function growthHelp() {
  const l = level(); const life = S.lifetime ?? S.points ?? 0;
  const max = LEVELS[LEVELS.length - 1][0];
  const pos = (v) => Math.min(100, (Math.sqrt(v) / Math.sqrt(max)) * 100);
  const week = [['📍', 'Check in at Build Night', 20], ['📝', 'Share a takeaway', 15], ['✨', '4 people mark it helpful', 20], ['💬', 'Reply to 3 questions', 9], ['🤝', 'Connect with someone you met', 5]];
  const total = week.reduce((a, x) => a + x[2], 0);
  const after = life + total; const next = LEVELS.find(([m]) => m > life) || LEVELS[LEVELS.length - 1];
  return `<div class="help-overlay" role="dialog" aria-label="How growth works">
    <header class="bar"><span></span><b>How growth works</b><button class="icon-btn" data-a="growth-help-close" aria-label="Close">${ICON.close}</button></header>
    <section class="pad">
      <p class="lead-sm">JobBuddy rewards people who make the community better: showing up, sharing what you learned and helping others.</p>

      <div class="flow3"><div><span>✍️</span><b>Take part</b><small>attend, post, reply, help</small></div><i>→</i><div><span>✦</span><b>Earn points</b><small>every action has a value</small></div><i>→</i><div><span>⬆</span><b>Level up & redeem</b><small>unlock perks and extras</small></div></div>

      <h3>The level track</h3>
      <div class="track">
        <div class="track-bar"><i style="width:${pos(life)}%"></i></div>
        ${LEVELS.map(([m, name], i) => `<div class="track-node ${i + 1 <= l.n ? 'on' : ''}" style="left:${pos(m)}%"><span>${i + 1}</span></div>`).join('')}
        <div class="track-you" style="left:${pos(life)}%"><b>You</b><small>${life}</small></div>
      </div>
      <ol class="level-cards">${LEVELS.map(([m, name], i) => `<li class="${i + 1 === l.n ? 'now' : i + 1 < l.n ? 'done' : ''}"><div><span>${i + 1}</span><b>${name}</b><small>${m}+ pts</small></div><p>${LEVEL_PERKS[i]}</p></li>`).join('')}</ol>

      <h3>How you earn</h3>
      <table class="pts-table"><thead><tr><th>Action</th><th>Points</th></tr></thead><tbody>
        ${POINT_RULES.map(([t, n], i) => `<tr><td><span>${RULE_ICONS[i]}</span>${t}</td><td><b>+${n}</b><i class="mini-bar" style="width:${n * 3}px"></i></td></tr>`).join('')}
      </tbody></table>

      <h3>Example: one good week</h3>
      <div class="week">${week.map(([ic, t, n]) => `<div class="week-row"><span>${ic}</span><small>${t}</small><b>+${n}</b></div>`).join('')}
        <div class="stacked">${week.map(([, , n], i) => `<i style="flex:${n}" class="c${i}"></i>`).join('')}</div>
        <p class="week-sum"><b>+${total} pts</b> in a week → ${life} → ${after}${after >= next[0] && next[0] > life ? ` · reaches <b>${next[1]}</b> 🎉` : ` · ${Math.max(0, next[0] - after)} to ${next[1]}`}</p>
      </div>

      <h3>Spend vs. level</h3>
      <div class="two-bars">
        <div><small>Points to spend</small><div class="hbar"><i style="width:${Math.min(100, ((S.points || 0) / Math.max(life, 1)) * 100)}%"></i></div><b>${S.points || 0}</b></div>
        <div><small>Earned in total (sets your level)</small><div class="hbar"><i class="full" style="width:100%"></i></div><b>${life}</b></div>
      </div>
      <p class="note">${ICON.info} Redeeming points (for extra AI CV reviews or mock interviews) never lowers your level.</p>

      <h3>What you can redeem</h3>
      ${REDEEM.map((r) => `<div class="enc"><span class="reward-ico">${ICON.spark}</span><div><b>${r.title}</b><small>${r.desc}</small></div><b>${r.cost} pts</b></div>`).join('')}
      <p class="note">${ICON.spark} You have ${wallet()} pts to spend. Redeeming only uses these — your ${earned()} earned pts and your level stay the same.</p>
      <button class="btn primary" data-a="nav" data-x="rewards">Go to redeem</button>

      <h3>Fair play</h3>
      <ul class="checklist"><li>Up to 60 pts a day from posts and comments</li><li>Each person’s “helpful” counts once per post</li><li>Self-votes and vote swapping don’t count</li><li>Points are never shown as a ranking or leaderboard</li></ul>
      <div class="spacer"></div>
    </section>
  </div>`;
}

/* ------------------------------------------------------------ tools */
const CV_TIPS = [
  ['Lead with outcomes', 'Turn “Designed onboarding screens” into “Redesigned onboarding, cutting drop-off from 38% to 21%”.'],
  ['Match the role’s words', 'The UX designer ads you saved mention “usability testing” 6×; your CV mentions it once.'],
  ['Cut the skills cloud', 'Replace the 18-item tool list with 3 projects that show those tools in use.']
];
V.cv = () => {
  if (!S.profile) return V.me();
  const free = S.cvFree ?? 3; const extra = (S.credits || {}).cv || 0; const r = ui.cvResult;
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>AI CV review</b><span></span></header>
  <section class="pad">
    <div class="usage"><div><b>${free}</b><small>free left this month</small></div><div><b>${extra}</b><small>extra (redeemed)</small></div></div>
    ${r ? `<div class="cv-score"><b>72</b><small>/100 for ${esc(ui.cvRole || 'UX designer')}</small></div>
      <h3>Top fixes</h3><ol class="how">${CV_TIPS.map(([a, b]) => `<li><b>${a}</b><small>${b}</small></li>`).join('')}</ol>
      <h3>Strengths</h3><ul class="checklist"><li>Clear project structure</li><li>Real research methods, named</li></ul>
      <p class="note">${ICON.info} AI suggestions are a starting point. Ask someone in your circle to sanity-check.</p>
      <button class="btn" data-a="cv-again">Review another version</button>`
    : `<div class="upload">${ICON.file}<b>Emma_C_CV.pdf</b><small>Uploaded · 2 pages</small></div>
      <h3>Target role</h3><div class="pills">${['UX designer', 'Product designer', 'Design intern'].map((t) => `<button class="pill ${(ui.cvRole || 'UX designer') === t ? 'on' : ''}" data-a="cv-role" data-x="${t}">${t}</button>`).join('')}</div>
      <p class="note">${ICON.lock} Your CV is private and never shown in the community.</p>`}
    <div class="spacer"></div>
  </section>
  ${r ? '' : `<footer class="sticky">${free || extra ? `<button class="btn primary" data-a="cv-run">Review my CV${free ? '' : ' · uses 1 extra'}</button>` : `<button class="btn primary" data-a="redeem" data-x="cv">Out of free reviews · redeem 30 pts</button>`}</footer>`}`;
};

V.mock = () => {
  if (!S.profile) return V.me();
  const free = S.mockFree ?? 1; const extra = (S.credits || {}).mock || 0;
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>Mock interview</b><span></span></header>
  <section class="pad">
    <p class="muted">Practise with a real person from the community — 30 minutes, video, honest feedback.</p>
    <div class="usage"><div><b>${free}</b><small>free session this month</small></div><div><b>${extra}</b><small>extra (redeemed)</small></div></div>
    ${(S.bookings || []).length ? `<h3>Booked</h3>${S.bookings.map((b) => `<div class="enc">${av(PEOPLE[b.who], 44)}<div><b>${PEOPLE[b.who].name}</b><small>${b.slot} · ${esc(b.role)}</small></div><i class="chip chip-going">Booked</i></div>`).join('')}` : ''}
    <h3>Practitioners</h3>
    ${PRACTITIONERS.map((x) => { const p = PEOPLE[x.id]; return `<div class="prac"><div class="enc">${av(p, 44)}<div><b>${p.name}${isConn(x.id) ? ' <i class="conn-tag">Connection</i>' : ''}</b><small>${x.role}</small></div></div>
      <div class="pills">${x.slots.map((s) => `<button class="pill" data-a="book" data-x="${x.id}|${s}">${s}</button>`).join('')}</div></div>`; }).join('')}
    <p class="note">${ICON.spark} Practitioners earn points for every session they give.</p>
    <div class="spacer"></div>
  </section>`;
};

/* ------------------------------------------------------------ me & people */
V.me = () => {
  const p = me();
  if (!p) return `<header class="top"><h1>Account</h1></header><section class="pad center"><p class="muted">Log in to register for events and keep the people you meet.</p><button class="btn primary" data-a="login-demo">Log in</button><button class="link" data-a="nav" data-x="onboarding">Create an account</button></section>`;
  const groups = { upcoming: ['going', 'checkedin'], pending: ['pending', 'declined'], past: ['attended'] };
  const list = EVENTS.filter((e) => groups[ui.meSeg].includes(reg(e.id)?.status));
  const l = level(); const look = badgeLook();
  const metIds = [...new Set(S.encounters.map((x) => x.person))];
  return `<header class="top"><div style="display:flex;gap:14px;align-items:center">${av(p, 64)}<div><h1>${esc(p.name)}</h1><p class="muted" style="margin-top:4px">${p.stage}${p.showStage ? '' : ' 🔒'} / ${p.field}</p></div></div><button class="icon-btn" data-a="edit-profile" aria-label="Edit profile">${ICON.edit}</button></header>
    <section class="pad">
      <p class="muted">Hi, I’m ${esc(p.short)} — ${p.stage.toLowerCase()} in ${p.field.toLowerCase()}. ${p.fact ? esc(p.fact) + '.' : ''}</p>
      <button class="eb-entry" data-a="nav" data-x="buddy"><span>${ICON.badge}</span><div><b>Tappy</b><small>${buddyReady() ? `${esc(badgeLook().tag)} · device & profile settings` : 'Set up once, reused for every event'}</small></div>${ICON.chev}</button>
      <div class="lv-card" data-a="nav" data-x="rewards" role="button"><div><small>LEVEL ${l.n}</small><b>${l.name}</b></div><span>${wallet()} pts<small style="display:inline;margin-left:4px;color:#bbb;letter-spacing:0">to spend</small><button class="icon-btn help-btn sm" data-a="growth-help" aria-label="How growth works">${ICON.help}</button></span><div class="lvbar"><i style="width:${l.pct}%"></i></div><small>${earned()} earned in total · ${l.next ? `${l.next - earned()} to ${l.nextName}` : 'Top level'} · Redeeming never lowers your level</small></div>
      <div class="nc-head"><h3>Your name card</h3><button class="linkish small" data-a="edit-profile">Edit</button></div>
      <div class="namecard"><small>Your name card · No. 0001</small><b>${esc(p.name)}</b><small style="color:#bbb">${p.field} · Sydney, AU</small><small style="color:#bbb;margin-top:4px">${p.interests.map((t) => '#' + t).join(' ')}</small><button class="nc-conn" data-a="people-tab" data-x="connections">${connections().length} connections</button></div>
      <button class="list-item" data-a="nav" data-x="messages"><span class="lead-ico">${ICON.chat}</span><div class="grow"><b>Messages</b><small>View your chatbox</small></div>${ICON.chev}</button>
      <h3>Career tools</h3>
      <button class="tool" data-a="nav" data-x="cv"><span class="tool-ico">${ICON.file}</span><span class="row-main"><b>AI CV review</b><small>${S.cvFree ?? 3} free this month${(S.credits || {}).cv ? ` · +${S.credits.cv} extra` : ''}</small></span>${ICON.chev}</button>
      <button class="tool" data-a="nav" data-x="mock"><span class="tool-ico">${ICON.people}</span><span class="row-main"><b>Mock interview with a person</b><small>${S.mockFree ?? 1} free session this month</small></span>${ICON.chev}</button>
      <h3>Your events</h3>
      <div class="pills">${[['upcoming', 'Upcoming'], ['pending', 'Requests'], ['past', 'Previous']].map(([k, lb]) => `<button class="pill ${ui.meSeg === k ? 'on' : ''}" data-a="me-seg" data-x="${k}">${lb}</button>`).join('')}</div>
      ${list.map(eventRow).join('') || '<p class="empty">Nothing here yet.</p>'}
      <h3>Two avatars</h3>
      <div class="two-av"><div>${av(p, 56)}<small>Profile photo<br>app & online events</small></div><div>${avatar(look.avatar, look.color, 56)}<small>Tappy avatar<br>same for every event</small></div></div>
      <h3>Privacy</h3>
      <ul class="checklist"><li>Public: name, photo, field, interests${p.fact ? ', fun fact' : ''}</li><li>Private: ${p.showStage ? 'email, CV' : 'career stage, email, CV'}</li></ul>
      <h3>Tappy</h3>
      <a class="row badge-link" href="./tappy/" target="_blank" rel="noopener">${ICON.badge}<span class="row-main"><b>Open the Tappy app</b><small>Install it on a second phone to act as the hardware</small></span>${ICON.chev}</a>
      <button class="link" data-a="logout">Log out</button>
      <button class="btn" style="margin-top:24px" data-a="reset">Reset demo data</button><p class="muted small center" style="margin-top:10px">Prototype for IDS · data stays in this browser only</p>
      <div class="spacer"></div>
    </section>`;
};

V.people = () => {
  const tab = 'connections';
  const metIds = [...new Set(S.encounters.map((x) => x.person))];
  const ids = { connections: connections(), followers: S.followers, following: S.following, met: metIds }[tab];
  const empty = { connections: 'When you and someone follow each other, you’re connected.', followers: 'No followers yet.', following: 'You’re not following anyone yet.', met: 'People you save at events show up here.' }[tab];
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>${ids.length} connections</b><span></span></header>
    <section class="pad">
      <p class="note">${ICON.info} A connection is a mutual follow.</p>
      ${ids.map((id) => { const p = PEOPLE[id]; const x = S.encounters.find((y) => y.person === id);
        return `<div class="enc"><button class="plain" data-a="nav" data-x="person/${id}">${av(p, 44)}</button><div><b>${p.name}</b><small>${x ? 'Met at ' + ev(x.eventId).title : p.headline}</small></div>${followBtn(id)}</div>`; }).join('') || `<p class="empty">${empty}</p>`}
    </section>`;
};

V.person = (id) => {
  const p = PEOPLE[id]; if (!p) return V.notfound();
  const met = S.encounters.filter((x) => x.person === id);
  const both = EVENTS.filter((e) => e.attendees.includes(id) && reg(e.id));
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><span></span><span></span></header>
    <section class="pad">
      <div class="me-hero">${av(p, 88)}<div><h2>${p.name}</h2><small>${esc(p.headline)}</small><small class="tags">${p.interests.map((t) => '#' + t).join(' ')}</small></div></div>
      ${S.profile ? `<div style="display:grid;gap:8px">${followBtn(id, false)}<button class="btn ${canChat(id) ? 'primary' : ''}" data-a="${canChat(id) || msgReq(id) ? 'nav' : 'msg-open'}" data-x="${canChat(id) || msgReq(id) ? 'chat/' + id : id}">${ICON.chat}${canChat(id) ? 'Message' : msgReq(id) ? 'Message request sent' : 'Send a message request'}</button></div>` : ''}
      ${S.followers.includes(id) && !S.following.includes(id) ? `<p class="note">${ICON.info} ${p.short} sent you a connect request. Accept to connect.</p>` : ''}
      ${met.map((x) => `<div class="msg"><div><small>You met at ${esc(ev(x.eventId).title)}</small><p>${esc(x.prompt)}</p></div></div>`).join('')}
      ${both.length ? `<h3>Also going</h3>${both.map(lumaRow).join('')}` : ''}
      <h3>Fun fact</h3><p>${esc(p.fact)}</p>
      <h3>Posts</h3>${allPosts().filter((x) => x.author === id && (x.aud === 'public' || circlesJoined().includes(x.circle))).map(postCard).join('') || '<p class="empty">No posts yet.</p>'}
      <div class="spacer"></div>
    </section>`;
};

V.notfound = () => `<section class="pad center"><p>Page not found.</p><button class="btn" data-a="nav" data-x="home">Home</button></section>`;

/* --------------------------------------------------------------- sheets */
function sheetHTML() {
  const s = ui.sheet; if (!s) return '';
  let inner = '';
  if (s.type === 'person') {
    const p = s.id === 'me' ? { ...me(), ...badgeLook(S.live?.eventId) } : who(s.id); const noBadge = S.live?.noBadge;
    inner = `${asc(p, 80)}<h2>${esc(p.name)}</h2><p class="muted">${esc(p.headline)}</p><p>“${esc(p.fact || '')}”</p>
      <div class="pills center">${p.interests.map((t) => `<i class="pill">${t}</i>`).join('')}</div>
      ${p.id === 'me' ? '<p class="note">This is how you appear on the wall.</p>' : noBadge ? `<button class="btn primary" data-a="hi-request" data-x="${p.id}">Send a hi request</button>` : `<p class="note">${ICON.badge} Look for this avatar on a Tappy and say hi. Tap devices if you both want a conversation prompt.</p>`}`;
  }
  if (s.type === 'match') {
    const p = PEOPLE[s.id];
    const online = S.live?.online;
    inner = `<div class="duo">${online ? av(me(), 64) + av(p, 64) : asc({ ...me(), ...badgeLook(S.live?.eventId) }, 64) + asc(p, 64)}</div><small class="eyebrow">You both said yes · ${esc(s.tag)}</small><h2 class="prompt">${esc(s.prompt)}</h2>
      <button class="btn" data-a="toast" data-x="Opens a 5-minute video room (mocked)">Open 5-min chat room</button>
      <h3 style="margin:6px 0 0">Connect with ${p.short}?</h3><div style="display:flex;gap:10px;width:100%"><button class="btn" data-a="sheet-close">Not now</button><button class="btn primary" data-a="save-enc" data-x="${p.id}">Accept</button></div>`;
  }
  if (s.type === 'incoming') {
    const p = PEOPLE[s.id];
    inner = `${av(p, 80)}<h2>${p.short} waved at you</h2><p class="muted">${esc(p.headline)}</p><p class="note">${ICON.lock} If you ignore it, ${p.short} won’t be told.</p>
      <button class="btn primary" data-a="accept-wave" data-x="${p.id}">Wave back</button><button class="link" data-a="sheet-close">Ignore quietly</button>`;
  }
  if (s.type === 'conns') {
    const ids = connections();
    inner = `<div class="sheet-head"><h2 class="sheet-title">Connections (${ids.length})</h2><button class="icon-btn" data-a="sheet-close">${ICON.close}</button></div><p class="muted small">Tap someone to view their profile</p>
      <div class="clist">${ids.map((id) => `<button class="list-item" data-a="nav" data-x="person/${id}">${av(PEOPLE[id], 44)}<div class="grow"><h3>${PEOPLE[id].name}</h3><small>${esc(PEOPLE[id].headline)}</small></div></button>`).join('')}</div>`;
  }
  if (s.type === 'comments') {
    const p = allPosts().find((x) => x.id === s.id); const cs = comments(s.id);
    inner = `<h2 class="sheet-title">Comments · ${p.comments + ((S.myComments || {})[s.id] || []).length}</h2>
      <div class="clist">${cs.map(([a, t]) => { const u = who(a); return `<div class="cmt">${av(u, 30)}<div><b>${esc(u.name)}</b><p>${esc(t)}</p></div></div>`; }).join('') || '<p class="muted small">Be the first to reply.</p>'}${p.comments > cs.length ? `<p class="muted small">+ ${p.comments - cs.length} earlier comments</p>` : ''}</div>
      <div class="cinput"><input class="field" data-model="commentText" placeholder="Add a helpful reply… (+3 pts)" value="${esc(ui.commentText || '')}"><button class="btn small primary" data-a="send-comment" data-x="${s.id}">Send</button></div>`;
  }
  if (['chat-share', 'pod-invite'].includes(s.type)) inner = podSheet();
  if (s.type === 'who') {
    const e = ev(s.id); const ids = e.attendees; const extra = Math.max(0, (s.mode === 'there' ? e.going : confirmedCount(e, reg(e.id))) - ids.length - 1);
    inner = `<h2 class="sheet-title">${s.mode === 'there' ? `Who was there (${e.going})` : `Who’s going · ${confirmedCount(e, reg(e.id))} confirmed`}</h2>
      <p class="muted small">${s.mode === 'there' ? 'Tap someone to see their profile. Connecting is always a request.' : 'Only people who chose “Let people see I’m going”.'}</p>
      <div class="clist">${ids.map((id) => `<div class="enc"><button class="plain" data-a="nav" data-x="person/${id}">${av(PEOPLE[id], 40)}</button><div><b>${PEOPLE[id].name}</b><small>${esc(PEOPLE[id].headline)}</small></div>${followBtn(id)}</div>`).join('')}
      ${extra ? `<p class="muted small">+ ${extra} more ${s.mode === 'there' ? 'attendees' : 'people'}</p>` : ''}</div>`;
  }
  if (s.type === 'memory') {
    const d = ui.mem || (ui.mem = { photo: false, text: '' });
    inner = `<h2 class="sheet-title">Add a memory</h2><p class="muted small">Shared after the event · visible for 7 days</p>
      <button class="mem-pick ${d.photo ? 'on' : ''}" data-a="memory-photo">${d.photo ? art(7, 'mem-art') : `${ICON.plus}<small>Tap to add a photo</small>`}</button>
      <textarea class="field area" style="min-height:90px;margin-top:4px" data-model="mem.text" maxlength="200" placeholder="What stuck with you?">${esc(d.text)}</textarea>
      <button class="btn primary" data-a="memory-share" data-x="${s.id}">Share memory</button><button class="link" style="margin:2px auto 0" data-a="sheet-close">Cancel</button>`;
  }
  if (s.type === 'connect' || s.type === 'msgreq') {
    const p = PEOPLE[s.id]; const isMsg = s.type === 'msgreq'; const max = isMsg ? 200 : 150;
    inner = `<div style="display:flex;gap:12px;align-items:center">${av(p, 48)}<div><b>${isMsg ? 'Message' : 'Connect with'} ${esc(p.name)}</b><small class="muted">${esc(p.headline)}</small></div></div>
      <p class="muted small">${isMsg ? `Your first message is sent as a request. ${p.short} has to accept before you can chat. It expires in 7 days.` : `${p.short} has to accept before you’re connected. A short note helps.`}</p>
      <textarea class="field area" style="min-height:90px;margin-top:0" data-model="reqText" maxlength="${max}" placeholder="${isMsg ? 'Hi! I saw your post about…' : 'Add a note (optional)'}">${esc(ui.reqText || '')}</textarea>
      <small class="muted">Up to ${max} characters</small>
      <button class="btn primary" data-a="${isMsg ? 'msg-send' : 'connect-send'}" data-x="${s.id}">${isMsg ? 'Send message request' : 'Send request'}</button>`;
  }
  return `<div class="scrim" data-a="sheet-close"></div><div class="sheet ${['conns', 'comments', 'chat-share', 'pod-invite', 'who', 'memory', 'connect', 'msgreq'].includes(s.type) ? 'left' : ''}"><i class="grab"></i>${inner}</div>`;
}

/* ================================================================ BADGE */
// Tappy: one physical Meet button. Press = yes, hold = no. NFC to tap, small screen.
const linkCode = (pid) => String(2700 + (seedOf(pid) * 37) % 300);
const PRESS = 'Press = yes · Hold = no';
function badgeScreen() {
  const b = S.badge; const p = me();
  const partner = b.partner && PEOPLE[b.partner];
  switch (b.screen) {
    case 'off': return `<div class="bs off"><small>JobBuddy</small><b>${BADGE_ID}</b><small>Not assigned</small></div>`;
    case 'unpaired': return `<div class="bs"><small>EVENTBUDDY</small><b class="huge">${BADGE_ID}</b><small>Scan this device<br>with JobBuddy to pair</small></div>`;
    case 'pairing': { const l = badgeLook(); return `<div class="bs"><small>LINK TO</small><div class="badge-av">${avatar(l.avatar, l.color, 72, ui.frame)}</div><b>${esc(p.short)}?</b><small>Press = it’s me · Hold = not me</small></div>`; }
    case 'idle': { const l = badgeLook(); return `<div class="bs idle"><div class="badge-av">${avatar(l.avatar, l.color, 104, ui.frame)}</div><b>${esc(p.short)}</b><small>${esc(l.tag)}</small><small class="dim">TAP TO MEET · hold devices together</small></div>`; }
    case 'request': return `<div class="bs">${avatar(partner.avatar, partner.color, 64)}<small>MEET</small><b>${partner.short}?</b><small>Press to meet · Hold to cancel</small></div>`;
    case 'waiting': return `<div class="bs">${avatar(partner.avatar, partner.color, 64)}<small>Waiting for</small><b>${partner.short}…</b></div>`;
    case 'declined': return `<div class="bs"><b>Saved as pending</b><small>${partner ? partner.short + ' can tap back later.' : ''}<br>Nothing else was shared.</small></div>`;
    case 'prompt': return `<div class="bs prompt"><small>✓ LINKED · YOU &amp; ${partner.short.toUpperCase()}</small><small class="dim">ICEBREAKER</small><p>${esc(b.prompt)}</p><small>● Saved to your event memories</small><small class="dim">Press for a new prompt · Hold when done</small></div>`;
    case 'returned': return `<div class="bs off"><b>Thanks!</b><small>Data cleared.<br>Ready for next person.</small></div>`;
    default: return '';
  }
}

function badgePanel() {
  const L = S.live; const online = L && ev(L.eventId)?.mode === 'online';
  const hasBadge = L && L.badgeId;
  const e = L && ev(L.eventId);
  const nearby = e && e.attendees.map((id) => PEOPLE[id]).filter((p) => !S.encounters.some((x) => x.person === p.id && x.eventId === e.id));
  const idle = S.badge.screen === 'idle';
  const hint = {
    off: 'No Tappy assigned. Collect one at check-in.', unpaired: 'Assigned but not paired. Scan its QR from the phone.', pairing: 'Staff assigned it to your pass. Press Meet to confirm it’s you; hold if it isn’t.',
    idle: 'Showing your avatar and career line. Hold devices together with someone nearby.', request: 'Shows who you just tapped. Press Meet to say yes, hold to cancel.', waiting: 'Waiting for the other person to press Meet.',
    declined: 'They didn’t press yet. The tap is saved as pending.', prompt: 'Linked. Take turns answering out loud. Press for a new prompt, hold when done.', returned: 'Tappy unpaired and wiped.'
  }[S.badge.screen];
  return `<div class="bp-head"><b>Tappy</b><small>Simulated hardware · NFC + small screen + one Meet button · <a href="./tappy/" target="_blank" rel="noopener">open as separate app ↗</a></small><button class="icon-btn bp-close" data-a="badge-close">${ICON.close}</button></div>
    <div class="device ${hasBadge ? '' : 'dim'}">
      <div class="nfc">NFC</div>
      <div class="screen">${online ? '<div class="bs off"><small>Online events</small><b>No Tappy</b></div>' : badgeScreen()}</div>
      <div class="hw-btns"><button class="hw a meet" data-meet aria-label="Meet button: press for yes, hold for no">MEET</button></div>
      <small class="dev-id">${BADGE_ID} · press = yes · hold = no</small>
    </div>
    <p class="bp-hint">${online ? 'Online events use waves in the app instead.' : hint}</p>
    ${idle && nearby?.length ? `<div class="bp-demo"><small>DEMO · tap devices with someone nearby</small>${nearby.slice(0, 3).map((p) => `<button data-a="tap" data-x="${p.id}">${avatar(p.avatar, p.color, 28)}${p.short}${p.responds === 'later' ? ' <i>(won’t press yet)</i>' : ''}</button>`).join('')}</div>` : ''}`;
}

function setBadge(screen, extra = {}) { S.badge = { ...S.badge, ...extra, screen }; save(); render(); }
let badgeTimer;
function badgeLater(ms, fn) { clearTimeout(badgeTimer); badgeTimer = setTimeout(fn, ms); }
const icebreaker = (not) => { const l = ICEBREAKERS.filter((q) => q !== not); return l[Math.floor(Math.random() * l.length)]; };

// btn: 'A' = press (yes), 'B' = hold (no)
function hw(btn) {
  const b = S.badge; const L = S.live;
  navigator.vibrate?.(btn === 'B' ? 40 : 15);
  if (b.screen === 'pairing') {
    if (btn === 'A') { L.paired = true; L.pairing = false; setBadge('idle'); toast('Tappy linked to you ✓'); }
    else { L.pairing = false; setBadge('unpaired'); toast('Not yours? Swap it at the desk'); }
  } else if (b.screen === 'request') {
    if (btn === 'B') return setBadge('idle', { partner: null });
    setBadge('waiting');
    const p = PEOPLE[b.partner];
    badgeLater(1400, () => {
      if (p.responds === 'later') { addEncounter(p.id, L.eventId, '', 'tappy', true); setBadge('declined'); badgeLater(2400, () => setBadge('idle', { partner: null })); }
      else { const q = icebreaker(); addEncounter(p.id, L.eventId, q, 'tappy'); setBadge('prompt', { prompt: q }); toast(`Linked with ${p.short} · saved quietly`); }
    });
  } else if (b.screen === 'prompt') {
    if (btn === 'A') setBadge('prompt', { prompt: icebreaker(b.prompt) });
    else setBadge('idle', { partner: null });
  } else if (b.screen === 'idle') toast(btn === 'A' ? 'Hold devices together with someone to meet' : 'Nothing to cancel');
}

function addEncounter(person, eventId, prompt, via, waiting = false) {
  if (S.encounters.some((x) => x.person === person && x.eventId === eventId)) return;
  S.encounters.push({ id: 'x' + Date.now(), person, eventId, prompt, via, at: Date.now(), ...(waiting ? { waiting: true } : {}) });
  save();
}

/* ------------------------------------------------ camera scan (demo)
   Opens the real rear camera as a viewfinder; “detects” the Tappy after ~2 s.
   No QR decoding and no network — it just makes the two-phone demo feel real. */
let scanStream = null; let scanTimer = null;
async function startScan() {
  ui.scanning = true; ui.pairError = ''; render();
  try { scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }); attachScan(); } catch { scanStream = null; }
  clearTimeout(scanTimer);
  scanTimer = setTimeout(() => {
    if (!ui.scanning) return;
    ui.scanFound = true; render(); navigator.vibrate?.(30);
    setTimeout(() => { stopScan(true); ui.pairInput = BADGE_ID; A['pair-start'](); }, 700);
  }, 2200);
}
function attachScan() { const v = document.querySelector('.scanner video'); if (v && scanStream && v.srcObject !== scanStream) { v.srcObject = scanStream; v.play?.().catch(() => {}); } }
function stopScan(silent) {
  clearTimeout(scanTimer); scanStream?.getTracks().forEach((t) => t.stop()); scanStream = null;
  ui.scanning = false; ui.scanFound = false; if (!silent) render();
}
function scannerHTML() {
  if (!ui.scanning) return '';
  return `<div class="scanner"><video playsinline muted autoplay></video>
    <div class="reticle ${ui.scanFound ? 'found' : ''}"><i></i><i></i><i></i><i></i>${ui.scanFound ? `<b>${BADGE_ID}</b>` : '<span class="scanline"></span>'}</div>
    <p>${ui.scanFound ? `Device ${BADGE_ID} found — pairing…` : 'Looking for device signal…'}</p>
    <button class="btn small" data-a="scan-cancel">Cancel</button></div>`;
}

/* ============================================================== ACTIONS */
const A = {
  nav: (x) => { ui.sheet = null; ui.growthHelp = false; go(x); },
  back: () => history.length > 1 ? history.back() : go('home'),
  toast: (x) => toast(x),
  browse: () => { S.browsing = true; save(); go('home'); },
  'login-demo': () => { S.profile = { ...DEFAULT_PROFILE }; S.onboarded = true; if (!S.following.length) seedAccount(140); const next = S.afterOnboard || 'home'; S.afterOnboard = null; save(); toast('Logged in as Emma'); go(next); render(); },
  signup: () => { ui.authNew = true; ui.ob = null; render(); },
  'bd-pick': (x) => { const [k, v] = x.split('|'); ui.regDraft[k] = v; render(); },
  'badge-save': (id) => { const d = ui.regDraft; S.regs[id].badge = { avatar: d.avatar, color: d.color, tag: d.tag }; S.lastBadge = S.regs[id].badge; save(); toast('Tappy updated'); history.back(); },
  logout: () => { S.onboarded = false; S.profile = null; save(); toast('Logged out'); go('home'); },
  'home-mode': (x) => { ui.homeMode = x; render(); },
  'filter-go': (x) => { ui.filter = x; go('events'); },
  filter: (x) => { ui.filter = x; render(); },
  seg: (x) => { ui.seg = x; render(); },
  'me-seg': (x) => { ui.meSeg = x; render(); },
  'live-tab': (x) => { ui.liveTab = x; render(); },
  'room-tab': (x) => { ui.roomTab = x; render(); },
  'ob-pick': (x) => {
    const [k, v] = x.split('|'); const o = ui.ob;
    if (k === 'interests') o.interests = o.interests.includes(v) ? o.interests.filter((t) => t !== v) : o.interests.length < 3 ? [...o.interests, v] : o.interests;
    else o[k] = v;
    render();
  },
  'ob-toggle': (x, el) => { ui.ob.showStage = el.checked; render(); },
  'ob-back': () => { ui.ob.step--; render(); },
  'ob-next': () => {
    const o = ui.ob;
    if (o.step < 1) { o.step++; render(); return; }
    const wasNew = !S.onboarded;
    S.profile = { name: o.name.trim(), field: o.field, stage: o.stage, interests: o.interests, fact: o.fact.trim(), avatar: S.profile?.avatar || o.avatar, color: S.profile?.color || o.color, showStage: o.showStage };
    if (wasNew) seedAccount(0);
    S.onboarded = true; ui.ob = null; ui.authNew = false;
    const next = S.afterOnboard || 'home'; S.afterOnboard = null; save();
    toast(wasNew ? 'Account created' : 'Profile saved'); go(next);
    if (next.startsWith('register')) render();
  },
  'edit-profile': () => { ui.ob = null; go('onboarding'); },
  'reg-toggle': (x, el) => { ui.regDraft[x] = el.checked; },
  register: (id) => {
    const e = ev(id); const d = ui.regDraft || {};
    const full = e.going >= e.capacity && e.waitlist;
    S.regs[id] = { status: full ? 'waitlist' : e.approval ? 'pending' : 'going', pos: full ? e.waitPos || 3 : undefined, list: d.list !== false, wall: d.wall !== false };
    save(); toast(full ? `You’re #${e.waitPos || 3} on the waitlist` : e.approval ? 'Request sent' : 'You’re in ✓');
    history.replaceState(null, '', '#/' + (e.approval && !full ? 'ticket/' : 'event/') + id); render();
  },
  approve: (id) => { S.regs[id].status = 'going'; save(); toast('🎉 Approved — address unlocked'); render(); },
  decline: (id) => { S.regs[id].status = 'declined'; save(); render(); },
  cancel: (id) => { if (confirm('Can’t make it? Your spot goes straight to the next person on the waitlist.')) { delete S.regs[id]; save(); toast('RSVP cancelled · spot released'); go('event/' + id); render(); } },
  'confirm-att': (id) => { S.regs[id].confirmed = true; save(); toast('Attendance confirmed ✓'); render(); },
  'wait-offer': (id) => { S.regs[id].status = 'offered'; save(); toast('A spot freed up for you'); render(); },
  'wait-claim': (id) => { S.regs[id] = { ...S.regs[id], status: 'going', confirmed: true, pos: undefined }; save(); toast('Spot claimed ✓'); render(); },
  yseg: (x) => { ui.yseg = x; render(); },
  phase: (x) => { const [id, i] = x.split('|'); ui.phase = { ...(ui.phase || {}), [id]: +i }; render(); },
  'phase-go': (x) => { const [id, i] = x.split('|'); ui.phase = { ...(ui.phase || {}), [id]: +i }; go('event/' + id); },
  asub: (x) => { ui.asub = x; render(); },
  'live-go': (x) => { const [id, t] = x.split('|'); ui.liveTab = t; go('live/' + id); },
  'who-sheet': (x) => { const [id, mode] = x.split('|'); ui.sheet = { type: 'who', id, mode }; render(); },
  'buddy-start': (id) => { ui.bd = null; ui.bdNext = 'buddyq/' + id; go('buddy'); },
  'bq-pick': (x) => {
    const [k, v, multi] = x.split('|'); const o = ['avatar', 'color', 'career', 'level', 'looking', 'vibe', 'hobbies'].includes(k) ? ui.bd : ui.bq;
    if (multi === '1') o[k] = (o[k] || []).includes(v) ? o[k].filter((t) => t !== v) : [...(o[k] || []), v]; else o[k] = v;
    const top = $('#app').scrollTop; render(); $('#app').scrollTop = top;
  },
  'bd-toggle': (x, el) => { ui.bd.showMbti = el.checked; },
  'buddy-save': () => { S.buddy = { ...ui.bd, saved: true }; ui.bd = null; save(); toast('Tappy profile saved'); const n = ui.bdNext; ui.bdNext = null; if (n) { history.replaceState(null, '', '#/' + n); render(); } else if (/^#\/buddy(q|review)/.test(location.hash)) render(); else history.back(); },
  'bq-save': (id) => { const q = ui.bq; if (!q.hoping.length || !q.open || !q.skill) { toast('Answer the three questions first'); return; } const { id: _, ...ans } = q; S.regs[id].q = ans; ui.bq = null; save(); history.replaceState(null, '', '#/buddyreview/' + id); render(); },
  'memory-open': (id) => { ui.mem = { photo: false, text: '' }; ui.sheet = { type: 'memory', id }; render(); },
  'memory-photo': () => { ui.mem.photo = !ui.mem.photo; render(); },
  'memory-share': (id) => {
    const d = ui.mem; if (!d.text.trim() && !d.photo) { toast('Add a photo or a line first'); return; }
    S.memories = S.memories || {}; S.memories[id] = [{ by: 'me', text: d.text.trim() || 'A moment from the night', day: 1, seed: 7, photo: d.photo }, ...(S.memories[id] || [])];
    ui.sheet = null; ui.mem = null; save(); earn(15, 'Shared an event memory');
    render();
  },
  'tap-back': (xid) => { const x = S.encounters.find((y) => y.id === xid); if (x) { x.waiting = false; x.prompt = icebreaker(); save(); toast(`${PEOPLE[x.person].short} tapped back · moved to met`); render(); } },
  'review-requests': () => { ui.cmode = 'Networks'; ui.nsub = 'Requests'; go('community'); },
  'connect-open': (x) => { if (!S.profile) { go('onboarding'); return; } ui.reqText = ''; ui.sheet = { type: 'connect', id: x }; render(); },
  'connect-send': (x) => { ui.sheet = null; ui.reqText = ''; A.follow(x); },
  'msg-open': (x) => { if (!S.profile) { go('onboarding'); return; } ui.reqText = ''; ui.sheet = { type: 'msgreq', id: x }; render(); },
  'msg-send': (x) => {
    const t = (ui.reqText || '').trim(); if (!t) { toast('Write a first message'); return; }
    S.msgReqs = { ...(S.msgReqs || {}), [x]: { state: 'pending', at: Date.now() } }; const c = chats(); c[x] = [...(c[x] || []), ['me', t]];
    ui.sheet = null; ui.reqText = ''; save(); toast(`Message request sent to ${PEOPLE[x].short}`); go('chat/' + x);
  },
  'msg-accept': (x) => { S.msgReqs[x].state = 'accepted'; chats()[x].push([x, 'Hey! Happy to chat 🙂']); save(); toast(`${PEOPLE[x].short} accepted · chat unlocked`); render(); },
  checkin: (id) => { S.regs[id].status = 'checkedin'; S.regs[id].confirmed = true; S.live = { eventId: id }; ui.phase = { ...(ui.phase || {}), [id]: 1 }; save(); earn(20, 'Checked in at an event'); render(); },
  arrive: (id) => {
    S.regs[id].status = 'checkedin'; S.regs[id].confirmed = true;
    // Staff scan the pass, which assigns this Tappy to you. You still confirm on the device (press Meet) to bind it.
    S.live = { eventId: id, badgeId: BADGE_ID, pairing: true }; S.badge = { screen: 'pairing' }; save();
    earn(20, 'Checked in at an event', true); go('pair/' + id);
  },
  // Leaving = tap the Tappy on the return box at the exit. It unpairs, wipes and syncs in one go; no staff step.
  'exit-tap': (id) => {
    if (!S.live || S.live.noBadge) return A.finish(id);
    clearTimeout(badgeTimer); S.live.returned = true; setBadge('returned'); toast('Tappy returned · taps synced ✓');
    setTimeout(() => A.finish(id), 900);
  },
  'give-badge': (id) => { S.live = { eventId: id, badgeId: BADGE_ID }; S.badge = { screen: 'unpaired' }; save(); render(); },
  'no-badge': (id) => { S.live = { eventId: id, noBadge: true }; save(); go('live/' + id); },
  scan: () => startScan(),
  'scan-cancel': () => stopScan(),
  'pair-start': () => {
    const v = (ui.pairInput || '').trim().toUpperCase();
    if (!v) { ui.pairError = 'Scan the code Can’t scan? Enter code manually.'; render(); return; }
    if (v !== BADGE_ID) { ui.pairError = `${v} isn’t assigned to you. Check the number on the back, or ask staff.`; render(); return; }
    ui.pairError = ''; S.live.pairing = true; save(); setBadge('pairing');
  },
  theme: (x) => { localStorage.setItem(THEME_KEY, x); applyTheme(); render(); },
  'theme-cycle': () => { const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; localStorage.setItem(THEME_KEY, next); applyTheme(); render(); },
  'pair-confirm': () => { S.live.paired = true; S.live.pairing = false; setBadge('idle'); toast('Tappy linked to you ✓'); },
  'demo-enc': (x) => { addEncounter(x, S.live.eventId, icebreaker(), 'tappy'); toast(`Linked with ${PEOPLE[x].short} · saved quietly`); render(); },
  'pair-cancel': () => { S.live.pairing = false; setBadge('unpaired'); },
  'sheet-person': (x) => { ui.sheet = { type: 'person', id: x }; render(); },
  'sheet-close': () => { ui.sheet = null; render(); },
  'hi-request': (x) => {
    ui.sheet = null; toast(`Hi request sent to ${PEOPLE[x].short}`); render();
    setTimeout(() => { const pr = makePrompt(PEOPLE[x]); ui.sheet = { type: 'match', id: x, prompt: pr.text, tag: pr.tag }; render(); }, 1600);
  },
  scene: (x) => scene(+x),
  'dir-toggle': () => toggleDirector(),
  'tappy-dev': (x) => tappyDev(x),
  'dir-reset': () => { if (confirm('Reset all demo data?')) { localStorage.removeItem(KEY); S = fresh(); ui.scene = undefined; S.profile = { ...DEFAULT_PROFILE }; S.onboarded = true; seedAccount(140); save(); go('home'); render(); } },
  tap: (x) => setBadge('request', { partner: x }),
  hw: (x) => hw(x),
  'badge-open': () => { document.body.classList.add('badge-open'); },
  'badge-close': () => { document.body.classList.remove('badge-open'); },
  'return-badge': (id) => {
    S.live.returned = true; setBadge('returned'); toast('Tappy returned ✓');
    badgeLater(2600, () => setBadge('off'));
  },
  finish: (id) => {
    const online = S.live?.online;
    S.regs[id].status = 'attended'; S.live = null; ui.waved = {};
    // Taps sync after the event: people you linked with send you a request to accept or decline at home.
    S.encounters.filter((x) => x.eventId === id && !x.waiting && !S.followers.includes(x.person)).forEach((x) => { S.followers = [...S.followers, x.person]; });
    S.dismissed = (S.dismissed || []).filter((p) => !S.encounters.some((x) => x.eventId === id && x.person === p));
    ui.phase = { ...(ui.phase || {}), [id]: 2 }; save();
    document.body.classList.remove('badge-open');
    go((online ? 'recap/' : 'synced/') + id);
  },
  'lobby-toggle': (id, el) => { S.regs[id].list = el.checked; save(); },
  'join-online': (id) => { S.regs[id].status = 'going'; S.live = { eventId: id, online: true }; save(); toast('Attendance confirmed ✓'); go('room/' + id); },
  wave: (x) => {
    ui.waved[x] = true; render();
    const p = PEOPLE[x];
    if (p.responds === 'later') return;
    setTimeout(() => { const pr = makePrompt(p); ui.sheet = { type: 'match', id: x, prompt: pr.text, tag: pr.tag }; render(); }, 1500);
  },
  'incoming-wave': (x) => { ui.sheet = { type: 'incoming', id: x }; render(); },
  'accept-wave': (x) => { const pr = makePrompt(PEOPLE[x]); ui.sheet = { type: 'match', id: x, prompt: pr.text, tag: pr.tag }; render(); },
  'save-enc': (x) => { addEncounter(x, S.live.eventId, ui.sheet.prompt, S.live.online ? 'wave' : 'hi'); ui.sheet = null; toast(`Saved · ${PEOPLE[x].short}`); render(); },
  follow: (x) => {
    if (!S.profile) { go('onboarding'); return; }
    const p = PEOPLE[x]; const was = S.following.includes(x);
    if (was) { const wasConn = isConn(x); if (!confirm(wasConn ? `Remove ${p.short} as a connection?` : `Cancel your request to ${p.short}?`)) return; S.following = S.following.filter((y) => y !== x); save(); toast(wasConn ? `Removed ${p.short}` : 'Request cancelled'); render(); return; }
    S.following = [...S.following, x]; save();
    if (isConn(x)) { earn(5, `New connection · ${p.short}`, true); toast(`🤝 You and ${p.short} are now connected · +5 pts`); }
    else {
      toast(`Request sent to ${p.short}. You’ll connect when they accept.`);
      if (FOLLOWS_BACK.includes(x)) setTimeout(() => { if (!S.following.includes(x) || S.followers.includes(x)) return; S.followers = [...S.followers, x]; earn(5, `New connection · ${p.short}`, true); render(); toast(`🤝 ${p.short} accepted — you’re connected · +5 pts`); }, 3000);
    }
    render();
  },
  'people-tab': (x) => { ui.pplTab = x; if (!location.hash.startsWith('#/people')) go('people'); else render(); },
  'growth-help': () => { ui.growthHelp = true; render(); },
  'growth-help-close': () => { ui.growthHelp = false; render(); },
  circle: (x) => { ui.circle = x || null; render(); },
  cmode: (x) => { ui.cmode = x; render(); },
  'ce-new': () => { if (!S.profile) { go('onboarding'); return; } ui.ce = null; go('createEvent'); },
  'ce-cover': () => { ui.ce.cover++; render(); },
  'ce-toggle': (k, el) => { ui.ce[k] = el.checked; render(); },
  'ce-circle': (x) => { ui.ce.circle = x; render(); },
  'ce-publish': () => {
    const d = ui.ce;
    if (!d.name.trim() || !d.date) { toast('Add an event name and date'); return; }
    if (!d.online && !d.place.trim()) { toast('Add a location'); return; }
    const start = new Date(d.date + 'T' + (d.time || '18:00')); const end = new Date(start.getTime() + 2 * 36e5);
    const hm = (t) => t.toTimeString().slice(0, 5);
    const days = Math.round((start - new Date()) / 864e5);
    const e = {
      id: 'my-' + Date.now(), mode: d.online ? 'online' : 'offline', title: d.name.trim(), circle: d.circle || `${me().short}’s circle`,
      date: fmtDate(start), time: `${hm(start)} – ${hm(end)}`, when: days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`,
      ...(d.online ? { platform: 'Zoom (link in app)' } : { venue: d.place.trim(), distance: 'Near you' }),
      cost: 'Free', capacity: Math.max(2, +d.cap || 20), going: 0, approval: d.approval, waitlist: d.wait, badges: !d.online && d.badges, host: 'me',
      cover: COVER_PAIRS[d.cover % COVER_PAIRS.length], audience: d.desc.trim() || 'No description yet.',
      agenda: [[hm(start), 'Doors & intros'], [hm(end), 'Wrap up']], attendees: [], tags: [...(me().interests || []).slice(0, 2)]
    };
    S.myEvents = [...(S.myEvents || []), e]; if (!(S.circles || []).includes(e.circle)) S.circles = [...(S.circles || []), e.circle];
    EVENTS.push(e); ui.ce = null; save(); toast('Event published 🎉');
    history.replaceState(null, '', '#/event/' + e.id); render();
  },
  'pod-open': (x) => { ui.chatPlus = null; ui.podTab = 'Chat'; go('pod/' + x); setTimeout(scrollEnd, 50); },
  'pod-tab': (x) => { ui.podTab = x; ui.chatPlus = null; render(); if (x === 'Chat') scrollEnd(); },
  'pod-todo': (x) => { const [id, i] = x.split('|'); const t = pod(id).todos[+i]; t.done = !t.done; save(); render(); },
  'pod-add-todo': (x) => { const t = (ui.todoText || '').trim(); if (!t) return; pod(x).todos.push({ t, who: 'You', done: false }); ui.todoText = ''; save(); render(); $('#todoIn')?.focus(); },
  'chat-send': (key) => { const t = (ui.msgText || '').trim(); if (!t) return; thread(key).msgs.push(['me', t]); ui.msgText = ''; save(); render(); scrollEnd(); $('#msgIn')?.focus(); chatReply(key); },
  'chat-plus': (key) => { ui.chatPlus = ui.chatPlus === key ? null : key; render(); scrollEnd(); },
  'chat-plus-pick': (x) => { const [key, k] = x.split('|'); ui.chatPlus = null; if (k === 'event') ui.sheet = { type: 'chat-share', id: key }; else toast(k === 'album' ? 'Opens your photo album (mocked)' : 'Opens the camera (mocked)'); render(); },
  'chat-share-pick': (x) => { const [key, eid] = x.split('|'); const t = thread(key); t.onShare(eid); t.msgs.push(['me', { ev: eid }]); ui.sheet = null; save(); toast('Shared with ' + t.title); render(); scrollEnd(); chatReply(key); },
  'pod-invite': (x) => { ui.sheet = { type: 'pod-invite', id: x }; render(); },
  'pod-invite-pick': (x) => { const [id, pid] = x.split('|'); const p = pod(id); p.members.push(pid); p.chat.push([pid, 'Hi all, thanks for the invite 👋']); ui.sheet = null; save(); toast(`${PEOPLE[pid].short} joined ${p.name}`); render(); },
  'podnew-member': (x) => { const m = ui.newPod.members; ui.newPod.members = m.includes(x) ? m.filter((y) => y !== x) : [...m, x]; render(); },
  'podnew-create': () => {
    const d = ui.newPod; if (!d.name.trim()) { toast('Give your pod a name'); return; }
    const id = 'pod' + Date.now();
    pods().unshift({ id, name: d.name.trim(), desc: d.desc.trim() || 'Just getting started', members: d.members, status: 'In progress', todos: [], events: [], chat: d.members.length ? [[d.members[0], 'Excited for this! 🙌']] : [] });
    ui.newPod = null; ui.podTab = 'Chat'; save(); toast('Pod created'); history.replaceState(null, '', '#/pod/' + id); render();
  },
  nsub: (x) => { ui.nsub = x; render(); },
  ctab: (x) => { ui.ctab = x; render(); },
  dismiss: (x) => { S.dismissed = [...(S.dismissed || []), x]; save(); toast('Declined quietly — they won’t be told'); render(); },
  csort: (x) => { ui.csort = x; render(); },
  'conn-sheet': () => { ui.sheet = { type: 'conns' }; render(); },
  comments: (x) => { ui.sheet = { type: 'comments', id: x }; render(); },
  'send-comment': (x) => {
    if (!S.profile) { ui.sheet = null; go('onboarding'); return; }
    const t = (ui.commentText || '').trim(); if (!t) return;
    S.myComments = S.myComments || {}; S.myComments[x] = [...(S.myComments[x] || []), t]; ui.commentText = '';
    earn(3, 'Commented on a post'); render();
  },
  'compose-circle': (x) => { ui.compose.circle = x; render(); },
  redeem: (x) => {
    const r = REDEEM.find((y) => y.id === x); if ((S.points || 0) < r.cost) { toast('Not enough points yet'); return; }
    if (!confirm(`Redeem ${r.cost} pts for “${r.title}”?\n\nPoints to spend: ${wallet()} → ${wallet() - r.cost}\nYour level stays ${level().name} (${earned()} earned in total).`)) return;
    S.credits = S.credits || {}; S.credits[x] = (S.credits[x] || 0) + 1; earn(-r.cost, `Redeemed · ${r.title}`, true); toast(`Redeemed · ${wallet()} pts left · level unchanged`); render();
  },
  'cv-role': (x) => { ui.cvRole = x; render(); },
  'cv-run': () => {
    if ((S.cvFree ?? 3) > 0) S.cvFree = (S.cvFree ?? 3) - 1; else if ((S.credits || {}).cv) S.credits.cv--; else return;
    save(); ui.cvResult = true; toast('Reviewing…'); render();
  },
  'cv-again': () => { ui.cvResult = false; render(); },
  book: (x) => {
    const [who_, slot] = x.split('|'); const pr = PRACTITIONERS.find((y) => y.id === who_);
    if ((S.mockFree ?? 1) > 0) S.mockFree = (S.mockFree ?? 1) - 1;
    else if ((S.credits || {}).mock) S.credits.mock--;
    else { if (confirm('Your free session is used. Redeem 80 pts for another?')) { A.redeem('mock'); if ((S.credits || {}).mock) { S.credits.mock--; } else return; } else return; }
    S.bookings = [...(S.bookings || []), { who: who_, slot, role: pr.role }]; save(); toast(`Booked with ${PEOPLE[who_].short} · ${slot}`); render();
  },
  rate: (x) => { const [id, i] = x.split('|'); S.feedback[id] = +i; save(); toast('Thanks — sent to the host'); render(); },
  compose: (x) => { if (!S.onboarded) { go('onboarding'); return; } go('compose/' + x); },
  'compose-type': (x) => { ui.compose.type = x; render(); },
  'compose-aud': (x) => { ui.compose.audience = x; render(); },
  post: () => {
    const c = ui.compose; if (!c.text.trim()) { toast('Write something first'); return; }
    const e = c.eventId && ev(c.eventId);
    const aud = c.audience === 'circle' ? 'circle' : 'public';
    const post = { id: 'm' + Date.now(), author: 'me', anon: c.audience === 'anon', aud, circle: aud === 'circle' ? c.circle || (e && e.circle) : 'Public', type: c.type, text: c.text.trim(), helpful: 0, comments: 0, ago: 'now' };
    S.posts.unshift(post); ui.compose = null; save();
    if (aud === 'circle') { ui.ctab = 'Stories'; history.replaceState(null, '', '#/circle/' + encodeURIComponent(post.circle)); render(); } else { ui.cmode = 'Community'; history.replaceState(null, '', '#/community'); render(); }
    e ? earn(15, 'Shared an event takeaway') : earn(10, 'Published a post');
    setTimeout(() => { const p = S.posts.find((y) => y.id === post.id); if (!p) return; p.helpful++; earn(5, 'Marcus marked your post helpful'); render(); }, 3500);
    setTimeout(() => { const p = S.posts.find((y) => y.id === post.id); if (!p) return; p.comments++; earn(2, 'Sofia commented on your post'); render(); }, 7000);
  },
  helped: (x) => { S.helped = S.helped.includes(x) ? S.helped.filter((p) => p !== x) : [...S.helped, x]; save(); render(); },
  reset: () => { if (confirm('Reset all demo data?')) { localStorage.removeItem(KEY); S = { ...fresh(), seedV: '2026-10-07' }; Object.assign(ui, { sheet: null, ob: null, compose: null, waved: {}, pairInput: '', phase: {}, bd: null, bq: null, mem: null }); go('home'); render(); } }
};

/* =============================================================== RENDER */
const NO_NAV = ['post', 'buddy', 'buddyq', 'buddyreview', 'pending', 'synced', 'createEvent', 'pod', 'podnew', 'welcome', 'onboarding', 'register', 'badgeedit', 'ticket', 'checkin', 'pair', 'live', 'leave', 'lobby', 'room', 'compose', 'rewards', 'people', 'person', 'cv', 'mock', 'event', 'recap', 'circle', 'chat'];
const TABS = [['home', 'Event', 'var(--t-event)'], ['community', 'Community', 'var(--t-comm)'], ['messages', 'Messages', 'var(--t-msg)'], ['me', 'Account', 'var(--t-acc)']];
const scrollEnd = () => { const a = $('#app'); a.scrollTop = a.scrollHeight; };

function route() {
  const [name = '', arg] = location.hash.replace(/^#\/?/, '').split('/');
  if (!name || name === 'welcome') return ['home'];
  return [V[name] ? name : 'notfound', arg];
}

// Status bar colour follows the page: event/recap heroes tint it to the top of their gradient.
const mixWhite = (hex, k) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k + 255 * (1 - k)).toString(16).padStart(2, '0')).join('');
function statusBar(name, arg) {
  const e = ['event', 'recap'].includes(name) && ev(arg);
  const c = e ? mixWhite(e.cover[0], 0.5) : '#ffffff';
  const m = document.querySelector('meta[name="theme-color"]'); if (m && m.content !== c) m.content = c;
  document.body.style.background = e ? c : '';
}
/* ---------------------------------------------------------------- demo director (desktop only)
   One click puts BOTH the phone and the simulated Tappy into a scene, so teammates can record the in-person flow
   without walking every step. Uses Portfolio Crit Circle (an upcoming, confirmed in-person event) and Marcus. */
const DIR_EV = 'crit-circle'; const DIR_PEER = 'marcus';
const DIR_PEER2 = 'david';
const SCENES = [
  ['Before', 'Event page before the event'],
  ['Arrive', 'Show pass at the door'],
  ['Link Tappy', 'Tappy: Emma? press Meet to bind'],
  ['Linked', 'Bound to you · avatar on'],
  ['Tap Marcus', 'Tappy: Meet Marcus?'],
  ['Linked Marcus', 'Icebreaker · saved'],
  ['Tap David', 'Tappy: Meet David?'],
  ['Linked David', 'Icebreaker · saved'],
  ['Exit tap', 'Tappy returned · taps synced'],
  ['After', 'Event page after the event']
];
function scene(n) {
  if (!S.profile) { S.profile = { ...DEFAULT_PROFILE }; S.onboarded = true; if (!S.following.length) seedAccount(140); }
  clearTimeout(badgeTimer); stopScan?.(true);
  const id = DIR_EV;
  S.regs[id] = { status: 'going', list: true, wall: true, confirmed: true };
  S.encounters = S.encounters.filter((x) => x.eventId !== id);
  S.followers = S.followers.filter((p) => ![DIR_PEER, DIR_PEER2].includes(p) || SEED_GRAPH.followers.includes(p));
  S.live = null; S.badge = { screen: 'off' }; ui.sheet = null; ui.liveTab = 'here';
  const meet = (p, q) => addEncounter(p, id, q, 'tappy');
  let to = 'event/' + id;
  if (n === 1) to = 'checkin/' + id;
  if (n === 2) { S.regs[id].status = 'checkedin'; S.live = { eventId: id, badgeId: BADGE_ID, pairing: true }; S.badge = { screen: 'pairing' }; to = 'pair/' + id; ui.scene = n; save(); return location.hash === '#/' + to ? render() : go(to); }
  n -= 1;   // remaining scenes keep their old numbering below
  if (n >= 2) { S.regs[id].status = 'checkedin'; S.live = { eventId: id, badgeId: BADGE_ID, paired: true }; }
  if (n === 2) { S.badge = { screen: 'idle' }; to = 'pair/' + id; }
  if (n === 3) S.badge = { screen: 'request', partner: DIR_PEER };
  if (n >= 4) meet(DIR_PEER, ICEBREAKERS[0]);
  if (n === 4) S.badge = { screen: 'prompt', partner: DIR_PEER, prompt: ICEBREAKERS[0] };
  if (n === 5) S.badge = { screen: 'request', partner: DIR_PEER2 };
  if (n >= 6) meet(DIR_PEER2, ICEBREAKERS[3]);
  if (n === 6) S.badge = { screen: 'prompt', partner: DIR_PEER2, prompt: ICEBREAKERS[3] };
  if (n >= 7) {
    S.regs[id].status = 'attended'; S.live = null;
    [DIR_PEER, DIR_PEER2].forEach((p) => { if (!S.followers.includes(p)) S.followers = [...S.followers, p]; });
    S.badge = { screen: 'returned' };
    to = (n === 7 ? 'synced/' : 'event/') + id;
  }
  ui.scene = n + 1; save();
  if (location.hash === '#/' + to) render(); else go(to);
}
const TAPPY_DEV = [['off', 'Off'], ['pairing', 'Link (Emma?)'], ['idle', 'Avatar'], ['request:marcus', 'Tap Marcus'], ['request:david', 'Tap David'], ['request:priya', 'Tap Priya (no reply)'], ['prompt', 'Icebreaker'], ['returned', 'Wiped']];
function tappyDev(x) {
  const [screen, who] = x.split(':');
  clearTimeout(badgeTimer);
  const id = S.live?.eventId || DIR_EV;
  if (screen !== 'off' && !S.live?.badgeId) { if (!S.profile) { S.profile = { ...DEFAULT_PROFILE }; S.onboarded = true; seedAccount(140); } S.regs[id] = { ...(S.regs[id] || {}), status: 'checkedin', confirmed: true }; S.live = { eventId: id, badgeId: BADGE_ID }; }
  if (S.live && ['idle', 'request', 'prompt'].includes(screen)) S.live.paired = true;
  const extra = screen === 'request' ? { partner: who } : screen === 'prompt' ? { partner: S.badge.partner || DIR_PEER, prompt: icebreaker() } : { partner: null };
  setBadge(screen, extra);
}
const DIR_KEY = 'jobbuddy-director-open';
function toggleDirector(open = !document.body.classList.contains('dir-open')) {
  document.body.classList.toggle('dir-open', open); localStorage.setItem(DIR_KEY, open ? '1' : '0');
}
toggleDirector(localStorage.getItem(DIR_KEY) !== '0');
function directorPanel() {
  const cur = ui.scene ?? -1;
  return `<div class="dir-head"><b>Demo director</b><small>One click sets the phone and Tappy together.<br>← / → scenes · Space = MEET · H = hold · D = hide</small></div>
    <ol class="dir-list">${SCENES.map(([t, d], i) => `<li><button class="${i === cur ? 'on' : ''}" data-a="scene" data-x="${i}"><i>${i + 1}</i><span><b>${t}</b><small>${d}</small></span></button></li>`).join('')}</ol>
    <div class="dir-foot"><button data-a="scene" data-x="${Math.max(0, cur - 1)}">◀ Prev</button><button class="pri" data-a="scene" data-x="${Math.min(SCENES.length - 1, cur + 1)}">Next ▶</button></div>
    <div class="dir-sec"><b>Tappy only</b><small>Changes the device screen, the phone stays where it is.</small></div>
    <div class="dir-grid">${TAPPY_DEV.map(([k, l]) => `<button class="${(([sc, w]) => S.badge.screen === sc && (!w || S.badge.partner === w))(k.split(':')) ? 'on' : ''}" data-a="tappy-dev" data-x="${k}">${l}</button>`).join('')}</div>
    <div class="dir-foot"><button data-a="hw" data-x="A">● Press MEET</button><button data-a="hw" data-x="B">Hold MEET</button></div>
    <button class="dir-reset" data-a="dir-reset">Reset demo data</button>
    <p class="dir-note">Event: Portfolio Crit Circle · people met: Marcus, David. You can still click inside the phone and press MEET normally.</p>`;
}

function render() {
  const [name, arg] = route();
  statusBar(name, arg);
  const app = $('#app');
  const prev = app.dataset.view;
  app.innerHTML = V[name](arg) + sheetHTML() + (ui.growthHelp ? growthHelp() : '') + scannerHTML();
  attachScan();
  app.dataset.view = name + '/' + (arg || '');
  if (prev !== app.dataset.view) app.scrollTop = 0;
  const showNav = !NO_NAV.includes(name);
  $('#nav').hidden = !showNav;
  const un = unreadTotal();
  $('#nav').innerHTML = TABS.map(([k, l]) => `<button class="${name === k || (k === 'home' && name === 'events') ? 'on' : ''}" data-a="nav" data-x="${k}" aria-label="${l}">${TAB_ICON[k]}<span>${l}</span>${k === 'messages' && un ? `<i class="cnt">${un}</i>` : ''}</button>`).join('');
  $('#badge').innerHTML = badgePanel();
  const dir = $('#director'); if (dir) dir.innerHTML = directorPanel();
  document.body.classList.toggle('has-badge', !!(S.live && S.live.badgeId));
}

function tickBadge() {
  ui.frame++;
  const el = document.querySelector('.badge-av');
  if (el && S.badge.screen === 'idle') { const l = badgeLook(); el.innerHTML = avatar(l.avatar, l.color, 104, ui.frame); }
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  const fn = A[el.dataset.a]; if (!fn) return;
  if (el.tagName !== 'INPUT') e.preventDefault();
  fn(el.dataset.x, el);
});
document.addEventListener('keydown', (e) => {
  if (!e.target.closest?.('input, textarea') && matchMedia('(min-width: 861px)').matches && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    const cur = ui.scene ?? -1; scene(Math.max(0, Math.min(SCENES.length - 1, cur + (e.key === 'ArrowRight' ? 1 : -1)))); return;
  }
  if (!e.target.closest?.('input, textarea') && matchMedia('(min-width: 861px)').matches && (e.key === 'd' || e.key === 'D')) { toggleDirector(); return; }
  // Keyboard MEET for the simulated Tappy: Space = press (yes), H = hold (no).
  if (!e.target.closest?.('input, textarea') && matchMedia('(min-width: 861px)').matches && S.live?.badgeId && (e.key === ' ' || e.key === 'h' || e.key === 'H')) {
    e.preventDefault(); const btn = document.querySelector('[data-meet]'); btn?.classList.add('pressed'); setTimeout(() => btn?.classList.remove('pressed'), 180);
    hw(e.key === ' ' ? 'A' : 'B'); return;
  }
  if (e.key !== 'Enter' || e.isComposing) return;
  if (e.target.id === 'msgIn') { e.preventDefault(); A['chat-send'](e.target.dataset.key); }
  if (e.target.id === 'todoIn') { e.preventDefault(); $('[data-a="pod-add-todo"]')?.click(); }
});
document.addEventListener('input', (e) => {
  const m = e.target.dataset.model; if (!m) return;
  const v = e.target.value;
  if (m === 'q') { ui.q = v; $('#event-list').innerHTML = eventListHTML(); return; }
  if (m === 'pairInput') { ui.pairInput = v; return; }
  if (m === 'commentText') { ui.commentText = v; return; }
  if (m === 'reqText') { ui.reqText = v; return; }
  if (m === 'msgText') { ui.msgText = v; return; }
  if (m === 'todoText') { ui.todoText = v; return; }
  if (m === 'cq' || m === 'nq') { ui[m] = v; const pos = e.target.selectionStart; const top = $('#app').scrollTop; render(); $('#app').scrollTop = top; const n = document.querySelector(`[data-model="${m}"]`); n.focus(); n.setSelectionRange(pos, pos); return; }
  const [obj, key] = m.split('.');
  ui[obj][key] = v;
  if (obj === 'ob') { const btn = $('[data-a="ob-next"]'); const o = ui.ob; if (btn && o.step === 0) btn.disabled = !(o.name.trim() && o.field && o.stage); }
});
// Meet button: a short press = yes, holding ~0.6 s = no.
let meetTimer = null; let meetHeld = false;
document.addEventListener('pointerdown', (e) => { if (!e.target.closest('[data-meet]')) return; meetHeld = false; e.target.closest('[data-meet]').classList.add('down'); meetTimer = setTimeout(() => { meetHeld = true; document.querySelector('[data-meet]')?.classList.add('held'); hw('B'); }, 600); });
document.addEventListener('pointerup', (e) => { if (meetTimer === null) return; clearTimeout(meetTimer); meetTimer = null; document.querySelector('[data-meet]')?.classList.remove('down', 'held'); if (!meetHeld && e.target.closest('[data-meet]')) hw('A'); });
document.addEventListener('pointercancel', () => { clearTimeout(meetTimer); meetTimer = null; });
window.addEventListener('hashchange', render);
setInterval(tickBadge, 650);

// Deep-link helpers for design capture: ?demo=1 logs in the demo account, ?theme=light|dark forces a theme.
{
  const q = new URLSearchParams(location.search);
  if (q.get('theme')) { localStorage.setItem(THEME_KEY, q.get('theme')); applyTheme(); }
  if (q.get('demo') && !S.onboarded) { S.profile = { ...DEFAULT_PROFILE }; S.onboarded = true; seedAccount(140); save(); }
}
// Demo data version: when the seeded demo changes, every browser (phone or laptop) re-seeds once on open,
// so all devices show the same Home. Bump SEED_V whenever seedAccount() or the demo events change.
{
  const SEED_V = '2026-10-07';
  if (S.seedV !== SEED_V) {
    const wasIn = S.onboarded; S = fresh();
    if (wasIn) { S.profile = { ...DEFAULT_PROFILE }; S.onboarded = true; seedAccount(140); }
    S.seedV = SEED_V; save();
  }
}
loadMyEvents();
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});
