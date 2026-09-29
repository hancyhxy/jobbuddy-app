import { FIELDS, STAGES, INTERESTS, AVATAR_CHOICES, AVATAR_COLORS, PEOPLE, EVENTS, SEED_POSTS, PROMPTS } from './data.js';
import { avatar } from './avatar.js';
import { ICON } from './icons.js';

/* ------------------------------------------------------------------ state */
const KEY = 'jobbuddy-proto-v1';
const BADGE_ID = 'JB-07';
const PAIR_CODE = '4812';

const fresh = () => ({
  onboarded: false, profile: null, regs: {}, live: null,
  badge: { screen: 'off' }, encounters: [], following: [],
  posts: [], helped: [], stars: 3, feedback: {}
});

let S = load();
const ui = { q: '', filter: 'all', seg: 'foryou', meSeg: 'upcoming', liveTab: 'here', roomTab: 'people', sheet: null, ob: null, compose: null, frame: 0, waved: {} };

function load() {
  try { return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return fresh(); }
}
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
window.addEventListener('storage', (e) => { if (e.key === KEY) { S = load(); render(); } });

/* ------------------------------------------------------------------ theme */
const THEME_KEY = 'jobbuddy-theme';
const themePref = () => localStorage.getItem(THEME_KEY) || 'system';
const mq = matchMedia('(prefers-color-scheme: light)');
function applyTheme() {
  const t = themePref() === 'system' ? (mq.matches ? 'light' : 'dark') : themePref();
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
const me = () => S.profile && { ...S.profile, id: 'me', short: S.profile.name.split(' ')[0], headline: `${S.profile.field} · ${S.profile.stage}` };
const who = (id) => (id === 'me' ? me() : PEOPLE[id]);
const av = (p, size = 40, extra = '') => avatar(p.avatar, p.color, size, 0, extra);
const go = (path) => { location.hash = '#/' + path; };
const demo = (label, a, x = '') => `<button class="demo" data-a="${a}" data-x="${x}"><span>DEMO</span>${label}</button>`;
const allPosts = () => [...S.posts, ...SEED_POSTS];

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.innerHTML = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function statusLabel(e, r) {
  if (!r) return '';
  return {
    pending: 'Pending approval', declined: 'Not approved', going: e.mode === 'online' ? 'Registered' : 'Going',
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
      ${r ? `<i class="chip chip-${r.status}">${statusLabel(e, r)}</i>` : `<small>${e.cost} · ${e.going} going</small>`}
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
const MONTHS = { Sep: 'September', Oct: 'October' };
function dayParts(e) { const [d, n, m] = e.date.split(' '); return [`${n} ${MONTHS[m] || m}`, DAYS[d] || d]; }

function lumaRow(e) {
  const r = reg(e.id); const host = PEOPLE[e.host];
  const place = e.mode === 'online' ? 'Online' : e.venue.split(',')[0];
  return `<button class="lrow" data-a="nav" data-x="event/${e.id}">
    ${cover(e, 'th')}
    <span class="lrow-main">
      <span class="lrow-host">${av(host, 20)}<span>${esc(e.circle)}</span>${r ? `<i class="chip chip-${r.status}">${statusLabel(e, r)}</i>` : e.cost !== 'Free' ? `<i class="price">${e.cost}</i>` : ''}</span>
      <b>${esc(e.title)}</b>
      <span class="lrow-meta"><span>${ICON.clock}${e.time.split(' ')[0]}</span><span>${e.mode === 'online' ? ICON.globe : ICON.pin}${esc(place)}</span>${e.mode === 'offline' && e.badges ? `<span class="badge-tag">${ICON.badge}Tappy</span>` : ''}</span>
    </span></button>`;
}

V.home = () => {
  const p = me();
  const liveE = S.live && ev(S.live.eventId);
  const mine = EVENTS.filter((e) => ['pending', 'going', 'checkedin'].includes(reg(e.id)?.status));
  const mode = ui.homeMode || 'all';
  const list = EVENTS.filter((e) => mode === 'all' || e.mode === mode);
  let groups = ''; let last = '';
  list.forEach((e) => {
    const [day, wd] = dayParts(e);
    if (day !== last) { groups += `<h3 class="day">${day} <span>/ ${wd}</span></h3>`; last = day; }
    groups += lumaRow(e);
  });
  const hint = { all: '', offline: `<p class="note">${ICON.badge} In-person events can lend you a badge. You pair it with your account when you arrive.</p>`, online: `<p class="note">${ICON.globe} Online events run in the app. No Tappy needed — wave at people instead.</p>` }[mode];
  return `<header class="top home-top">
      <span class="brand">${p ? `<button class="plain" data-a="nav" data-x="me">${av(p, 36, 'round')}</button>` : `<span class="brand-dot">${ICON.badge}</span>`}<b>JobBuddy</b></span>
      <span class="top-actions"><button class="icon-btn theme-btn" data-a="theme-cycle" aria-label="Switch theme">${document.documentElement.dataset.theme === 'light' ? ICON.moon : ICON.sun}</button>
      ${p ? '' : `<button class="btn small" data-a="login-demo">Log in</button>`}</span></header>
    <section class="pad">
      ${liveE ? `<button class="live-card flush" data-a="nav" data-x="${liveE.mode === 'online' ? 'room' : 'live'}/${liveE.id}"><span class="dot"></span><div><small>HAPPENING NOW</small><b>${esc(liveE.title)}</b></div>${ICON.chev}</button>` : ''}
      <button class="h2link" data-a="nav" data-x="me"><h2>Your events</h2>${ICON.chev}</button>
      ${mine.length ? mine.map(lumaRow).join('') : `<div class="empty-your"><span>${ICON.ticket}</span><p>You have a clear schedule ahead. Explore events below and register for one.</p></div>`}
      <h2 class="picked">Picked for you</h2>
      <div class="seg3 mode-seg">${[['all', 'All'], ['offline', 'In person'], ['online', 'Online']].map(([k, l]) => `<button class="${mode === k ? 'on' : ''}" data-a="home-mode" data-x="${k}">${l}</button>`).join('')}</div>
      ${hint}
      ${groups}
      <div class="spacer"></div>
    </section>`;
};

function filteredEvents() {
  return EVENTS.filter((e) => (ui.filter === 'all' || (ui.filter === 'free' ? e.cost === 'Free' : e.mode === ui.filter)) && (!ui.q || (e.title + e.circle + e.tags.join(' ')).toLowerCase().includes(ui.q.toLowerCase())));
}

V.events = () => `
  <header class="top"><h1>Events</h1></header>
  <div class="search">${ICON.search}<input data-model="q" placeholder="Topics, circles, hosts" value="${esc(ui.q)}"></div>
  <div class="pills scroll">${[['all', 'All'], ['offline', 'In person'], ['online', 'Online'], ['free', 'Free']].map(([k, l]) => `<button class="pill ${ui.filter === k ? 'on' : ''}" data-a="filter" data-x="${k}">${l}</button>`).join('')}</div>
  <p class="note">${ICON.pin} Near Ultimo, Sydney · <u>change area</u></p>
  <div id="event-list">${eventListHTML()}</div><div class="spacer"></div>`;

const eventListHTML = () => filteredEvents().map(eventRow).join('') || '<p class="empty">No events match. Try another topic or switch format.</p>';

V.event = (id) => {
  const e = ev(id); if (!e) return V.notfound();
  const r = reg(id); const host = PEOPLE[e.host];
  const how = e.mode === 'offline'
    ? [['Check in', 'Show your pass at the desk'], ['Collect a Tappy', 'Optional loan device'], ['Pair it', 'Link the Tappy to your app'], ['Tap to talk', 'Both say yes, get a shared prompt'], ['Return it', 'Your encounters stay in the app']]
    : [['Join the lobby', 'Choose what others see'], ['Watch the stream', 'Camera & mic stay in Zoom'], ['Wave at people', 'Both say yes, get a shared prompt'], ['Save & follow', 'Only if you want to']];
  let cta;
  if (!r || r.status === 'cancelled') cta = `<button class="btn primary" data-a="nav" data-x="register/${id}">${e.approval ? 'Request to join' : 'Register'} · ${e.cost}</button>`;
  else if (r.status === 'attended') cta = `<button class="btn" data-a="nav" data-x="recap/${id}">See recap</button>`;
  else cta = `<button class="btn primary" data-a="nav" data-x="ticket/${id}">${r.status === 'pending' ? 'View request' : 'View pass'}</button>`;
  return `<header class="bar float"><button class="icon-btn" data-a="back">${ICON.back}</button><span></span><button class="icon-btn" data-a="toast" data-x="Link copied">${ICON.share}</button></header>
    <div class="hero" style="--c1:${e.cover[0]};--c2:${e.cover[1]}">${cover(e, 'art')}</div>
    <section class="pad">
      <p class="eyebrow">${esc(e.circle)}</p>
      <h1 class="title">${esc(e.title)}</h1>
      ${r ? `<i class="chip chip-${r.status}">${statusLabel(e, r)}</i>` : ''}
      <ul class="meta">
        <li>${ICON.cal}<span><b>${e.date}</b><small>${e.time}</small></span></li>
        <li>${e.mode === 'online' ? ICON.globe : ICON.pin}<span><b>${e.mode === 'online' ? 'Online' : e.venue}</b><small>${e.mode === 'online' ? e.platform + (e.recording ? ' · recording available' : '') : e.distance + ' away · step-free access'}</small></span></li>
        <li>${ICON.ticket}<span><b>${e.cost}</b><small>${e.going}/${e.capacity} spots · ${e.approval ? 'host approves each request' : 'instant confirmation'}</small></span></li>
      </ul>
      <button class="host" data-a="nav" data-x="person/${host.id}">${av(host, 40, 'round')}<span><small>Hosted by</small><b>${host.name}</b></span></button>
      <p>${esc(e.audience)}</p>
      <h3>Who’s going</h3>
      <div class="stack">${e.attendees.map((pid) => av(PEOPLE[pid], 36, 'round')).join('')}<small>${e.going} going · ${Math.round(e.going * 0.6)} visible</small></div>
      <h3>How it works</h3>
      <ol class="how">${how.map(([a, b]) => `<li><b>${a}</b><small>${b}</small></li>`).join('')}</ol>
      ${e.badges ? `<p class="note">${ICON.badge} Tappy is optional. No phone or rather not use one? You can still join everything.</p>` : ''}
      <h3>Agenda</h3>
      <ul class="agenda">${e.agenda.map(([t, a]) => `<li><time>${t}</time>${a}</li>`).join('')}</ul>
      <div class="spacer"></div>
    </section>
    <footer class="sticky">${cta}</footer>`;
};

V.auth = () => `<header class="bar"><button class="icon-btn" data-a="back">${ICON.close}</button><span></span><span></span></header>
  <section class="pad auth">
    <span class="brand-dot big">${ICON.badge}</span>
    <h2>Log in to register</h2>
    <p class="muted">Registering needs a JobBuddy account, so hosts know who’s coming and you keep the people you meet.</p>
    <input class="field" type="email" placeholder="Email" value="xinyi@student.uts.edu.au">
    <button class="btn primary" data-a="login-demo">Continue with email</button>
    <div class="or"><span>or</span></div>
    <button class="btn" data-a="login-demo">Continue with Apple</button>
    <button class="btn" data-a="login-demo">Continue with Google</button>
    <p class="muted center small">New here? <button class="linkish" data-a="signup">Create an account</button></p>
  </section>`;

const DEFAULT_PROFILE = { name: 'Xinyi Han', field: 'Design', stage: 'Studying', interests: ['AI tools', 'UX', 'Portfolio'], fact: 'Built a badge from scratch', avatar: 'female_2_1', color: '#D7FF3A', showStage: false };

function badgeLook(eventId) {
  const p = S.profile || DEFAULT_PROFILE;
  const b = (eventId && S.regs[eventId]?.badge) || S.lastBadge || {};
  return { avatar: b.avatar || p.avatar, color: b.color || p.color, tag: b.tag || p.interests[0] || p.field };
}

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
  const e = ev(id); if (!reg(id)) return V.event(id);
  if (!ui.regDraft || ui.regDraft.id !== id) ui.regDraft = { id, ...badgeLook(id) };
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.close}</button><b>Your Tappy</b><span></span></header>
    <section class="pad"><p class="muted">${esc(e.title)}</p>${badgePicker(ui.regDraft)}<div class="spacer"></div></section>
    <footer class="sticky"><button class="btn primary" data-a="badge-save" data-x="${id}">Save Tappy</button></footer>`;
};

V.register = (id) => {
  const e = ev(id);
  if (!S.onboarded) { if (S.afterOnboard !== 'register/' + id) { S.afterOnboard = 'register/' + id; save(); ui.ob = null; } return ui.authNew ? V.onboarding() : V.auth(); }
  ui.regDraft = ui.regDraft?.id === id ? ui.regDraft : { id, list: true, wall: true, ...badgeLook() };
  const d = ui.regDraft; const p = me();
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.close}</button><b>${e.approval ? 'Request to join' : 'Register'}</b><span></span></header>
    <section class="pad">
      <div class="next-card static">${cover(e, 'sm')}<div><b>${esc(e.title)}</b><small>${e.date} · ${e.time}</small></div></div>
      ${e.badges ? `<h3>Your Tappy for this event</h3>${badgePicker(d)}` : ''}
      <h3>${e.badges ? 'In the attendee list' : 'What attendees will see'}</h3>
      <div class="public-card">${av(e.badges ? { ...p, ...d } : p, 56)}<div><b>${esc(p.name)}</b><small>${p.field}${p.showStage ? ' · ' + p.stage : ''}</small><small class="tags">${p.interests.map((t) => '#' + t).join(' ')}</small></div></div>
      <label class="toggle"><input type="checkbox" data-a="reg-toggle" data-x="list" ${d.list ? 'checked' : ''}><span>Show me in the attendee list</span></label>
      ${e.mode === 'offline' ? `<label class="toggle"><input type="checkbox" data-a="reg-toggle" data-x="wall" ${d.wall ? 'checked' : ''}><span>Appear on the live participant wall after check-in</span></label>` : ''}
      <p class="note">${ICON.lock} Email, career stage and CV are never shown to attendees.</p>
      ${e.approval ? `<p class="note">${ICON.info} This host approves requests. You’ll get a notification either way, and the exact address unlocks once approved.</p>` : ''}
    </section>
    <footer class="sticky"><button class="btn primary" data-a="register" data-x="${id}">${e.approval ? 'Send request' : 'Confirm · ' + e.cost}</button></footer>`;
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
  if (r.status === 'pending') body = `<div class="state-box"><b>Waiting for ${PEOPLE[e.host].short} to approve</b><small>Most hosts reply within 2 days. We’ll notify you.</small></div>
      ${demo('Host approves request', 'approve', id)}${demo('Host declines request', 'decline', id)}`;
  else if (r.status === 'declined') body = `<div class="state-box warn"><b>This one’s full</b><small>The host couldn’t fit everyone. Similar events:</small></div>${EVENTS.filter((x) => x.id !== id && x.mode === e.mode).slice(0, 2).map(eventRow).join('')}`;
  else if (off) body = `<div class="pass">${fakeQR(id + S.profile.name)}<b>${esc(S.profile.name)}</b><small>Show this at the check-in desk</small></div>
      <div class="info-grid"><div>${ICON.pin}<b>${e.venue}</b><small>Get directions</small></div><div>${ICON.badge}<b>Tappy on loan</b><small>Collect → pair → return</small></div></div>
      ${e.badges ? `<button class="row badge-link" data-a="nav" data-x="badgeedit/${id}">${avatar(badgeLook(id).avatar, badgeLook(id).color, 44)}<span class="row-main"><b>Your Tappy look</b><small>#${esc(badgeLook(id).tag)} · only for this event</small></span><span class="small muted">Change</span></button>` : ''}
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
      ${['pending', 'going'].includes(r.status) ? `<button class="link" data-a="cancel" data-x="${id}">Cancel ${r.status === 'pending' ? 'request' : 'registration'}</button>` : ''}
    </section>
    ${cta ? `<footer class="sticky">${cta}</footer>` : ''}`;
};

/* ---------------------------------------------------- offline: check-in */
V.checkin = (id) => {
  const e = ev(id); const r = reg(id);
  if (!r) return V.event(id);
  const checked = r.status === 'checkedin';
  const hasBadge = S.live?.eventId === id && S.live.badgeId;
  return `<header class="bar"><button class="icon-btn" data-a="nav" data-x="ticket/${id}">${ICON.back}</button><b>Arrive</b><span></span></header>
    <section class="pad">
      <ol class="steps">
        <li class="${checked ? 'done' : 'now'}"><b>Check in at the desk</b>
          ${checked ? '<small>Checked in 17:42 ✓</small>' : `<small>Show your pass. Staff scan it — this confirms you actually came.</small><div class="pass mini">${fakeQR(id + S.profile.name)}</div>${demo('Staff scans your pass', 'checkin', id)}`}</li>
        <li class="${hasBadge ? 'done' : checked ? 'now' : ''}"><b>Collect a Tappy</b>
          ${hasBadge ? `<small>Tappy ${BADGE_ID} is yours for tonight ✓</small>` : checked ? `<small>Staff hand you a badge. Check the number on its back.</small>${demo('Staff hands you Tappy ' + BADGE_ID, 'give-badge', id)}<button class="link" data-a="no-badge" data-x="${id}">Continue without a Tappy</button>` : '<small>Optional loan device</small>'}</li>
        <li class="${hasBadge ? 'now' : ''}"><b>Pair it with your app</b><small>Takes 10 seconds</small></li>
      </ol>
    </section>
    ${hasBadge ? `<footer class="sticky"><button class="btn primary" data-a="nav" data-x="pair/${id}">Pair Tappy</button></footer>` : ''}`;
};

V.pair = (id) => {
  const L = S.live;
  if (!L || L.eventId !== id || !L.badgeId) return V.checkin(id);
  if (L.paired) return `<header class="bar"><span></span><b>Paired</b><span></span></header>
    <section class="pad center">
      <div class="big-check">${ICON.check}</div>
      <h2>Tappy ${BADGE_ID} is yours</h2>
      <p class="muted">Your Tappy now shows your avatar. Put your phone away — tap Tappys with someone when you both want to talk.</p>
      <div class="rules"><div><b>Tap</b><small>asks to talk</small></div><div><b>Both say yes</b><small>shared prompt appears</small></div><div><b>Save</b><small>keeps it in your app</small></div></div>
      <p class="note">${ICON.lock} Tapping never adds a friend or shares contact details.</p>
    </section>
    <footer class="sticky"><button class="btn primary" data-a="nav" data-x="live/${id}">Go to event</button></footer>`;
  if (L.pairing) return `<header class="bar"><button class="icon-btn" data-a="pair-cancel">${ICON.back}</button><b>Confirm on Tappy</b><span></span></header>
    <section class="pad center">
      <p class="muted">Does your Tappy show this code?</p>
      <div class="code">${PAIR_CODE.split('').map((d) => `<span>${d}</span>`).join('')}</div>
      <p>Press <i class="kdot"></i> on the Tappy to confirm.</p>
      <p class="note">${ICON.info} Code doesn’t match? You may have someone else’s Tappy — go back and check the number.</p>
      ${demo('Tappy on another device: confirmed', 'pair-confirm')}
    </section>`;
  return `<header class="bar"><button class="icon-btn" data-a="nav" data-x="checkin/${id}">${ICON.back}</button><b>Pair Tappy</b><span></span></header>
    <section class="pad">
      <h2>Scan the code on the back of your Tappy</h2>
      <button class="scan" data-a="scan">${ICON.qr}<span>Tap to scan</span></button>
      <p class="muted center">or type the Tappy number</p>
      <input class="field code-in" data-model="pairInput" placeholder="JB-00" value="${esc(ui.pairInput || '')}" maxlength="5">
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
  const tabs = [['here', 'Who’s here'], ['agenda', 'Agenda'], ['saved', `Saved · ${mine.length}`]];
  let body = '';
  if (ui.liveTab === 'here') body = `<p class="muted small">${here.length + 1} people chose to show on the wall. Spot their avatar on a badge.</p>
      <div class="wall">${(reg(id).wall ? [{ ...me(), ...badgeLook(id), headline: '#' + badgeLook(id).tag }, ...here] : here).map((p) => `<button class="wall-tile" data-a="sheet-person" data-x="${p.id}">${av(p, 64)}<b>${esc(p.short)}${p.id === 'me' ? ' (you)' : ''}</b><small>${esc(p.headline)}</small></button>`).join('')}</div>`;
  if (ui.liveTab === 'agenda') body = `<ul class="agenda">${e.agenda.map(([t, a], i) => `<li class="${i === 2 ? 'now' : ''}"><time>${t}</time>${a}${i === 2 ? ' <i class="chip">Now</i>' : ''}</li>`).join('')}</ul>`;
  if (ui.liveTab === 'saved') body = (mine.length ? mine.map(encounterRow).join('') : `<p class="empty">Nobody saved yet. When you and someone both say yes on your Tappys, you can save the moment here.</p>`)
    + (L.noBadge ? '' : here.filter((p) => !mine.some((x) => x.person === p.id)).slice(0, 2).map((p) => demo(`Tappy on another device saved ${p.short}`, 'demo-enc', p.id)).join(''));
  return `<header class="bar"><button class="icon-btn" data-a="nav" data-x="home">${ICON.back}</button><span class="live-pill"><span class="dot"></span>Live</span>
      ${L.noBadge ? '<span class="muted small">No Tappy</span>' : `<button class="badge-pill" data-a="badge-open">${ICON.badge}${BADGE_ID}</button>`}</header>
    <section class="pad">
      <h2 class="title sm">${esc(e.title)}</h2>
      ${L.noBadge ? `<p class="note">${ICON.info} No Tappy? Tap someone on the wall to send a hi request instead.</p>` : `<p class="note">${ICON.badge} Your Tappy does the work. Tap Tappys with someone when you both want to talk.</p>`}
      <div class="tabs">${tabs.map(([k, l]) => `<button class="${ui.liveTab === k ? 'on' : ''}" data-a="live-tab" data-x="${k}">${l}</button>`).join('')}</div>
      ${body}<div class="spacer"></div>
    </section>
    <footer class="sticky"><button class="btn" data-a="nav" data-x="leave/${id}">Leaving? ${L.noBadge ? 'Wrap up' : 'Return Tappy'}</button></footer>`;
};

function encounterRow(x) {
  const p = who(x.person); const f = S.following.includes(x.person);
  return `<div class="enc">${av(p, 44, 'round')}<div><b>${esc(p.name)}</b><small>${esc(x.prompt)}</small></div>
    <button class="btn small ${f ? '' : 'primary'}" data-a="follow" data-x="${p.id}">${f ? 'Following' : 'Follow'}</button></div>`;
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
        <li class="${returned ? 'done' : 'now'}"><b>Hand ${BADGE_ID} to the desk</b>${returned ? '<small>Returned 20:21 ✓</small>' : `<small>Staff confirm it’s back.</small>${demo('Staff confirms return', 'return-badge', id)}<button class="link" data-a="toast" data-x="We’ll remind you. Tappys can be dropped at any Harbour Commons desk.">Leaving in a hurry?</button>`}</li>
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
  const e = ev(id); const host = PEOPLE[e.host];
  if (!reg(id)) return V.event(id);
  const people = e.attendees.filter((p) => p !== e.host).map((p) => PEOPLE[p]);
  const mine = S.encounters.filter((x) => x.eventId === id);
  const tabs = [['people', `People · ${people.length}`], ['agenda', 'Agenda'], ['saved', `Saved · ${mine.length}`]];
  let body = '';
  if (ui.roomTab === 'people') body = people.map((p) => {
    const w = ui.waved[p.id]; const saved = mine.some((x) => x.person === p.id);
    return `<div class="enc">${av(p, 44, 'round')}<div><b>${esc(p.name)}</b><small>${esc(p.headline)}</small></div>
      ${saved ? '<span class="muted small">Saved ✓</span>' : `<button class="btn small ${w ? '' : 'primary'}" data-a="wave" data-x="${p.id}" ${w ? 'disabled' : ''}>${w ? 'Waved' : '👋 Wave'}</button>`}</div>`;
  }).join('') + `<p class="note">${ICON.lock} Waves are private. If they don’t wave back, nothing happens.</p>` + demo('David waves at you', 'incoming-wave', 'david');
  if (ui.roomTab === 'agenda') body = `<ul class="agenda">${e.agenda.map(([t, a], i) => `<li class="${i === 1 ? 'now' : ''}"><time>${t}</time>${a}</li>`).join('')}</ul>`;
  if (ui.roomTab === 'saved') body = mine.length ? mine.map(encounterRow).join('') : '<p class="empty">Wave at someone. If you both want to chat, you get a shared prompt and can save the encounter.</p>';
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
  const e = ev(id); const host = PEOPLE[e.host];
  if (!S.profile) return V.event(id);
  const mine = S.encounters.filter((x) => x.eventId === id);
  const nextUp = EVENTS.filter((x) => x.id !== id && !reg(x.id) && x.tags.some((t) => e.tags.includes(t) || S.profile.interests.includes(t)));
  const fb = S.feedback[id];
  return `<header class="bar float"><button class="icon-btn" data-a="nav" data-x="home">${ICON.back}</button><span></span><span></span></header>
    <div class="hero" style="--c1:${e.cover[0]};--c2:${e.cover[1]}">${cover(e, 'art')}</div>
    <section class="pad">
      <p class="eyebrow">You went · ${e.date}</p>
      <h1 class="title">${esc(e.title)}</h1>
      <div class="stats"><div><b>${mine.length}</b><small>people saved</small></div><div><b>${S.following.filter((p) => mine.some((x) => x.person === p)).length}</b><small>followed</small></div><div><b>${e.mode === 'online' ? '75' : '170'}</b><small>minutes</small></div></div>
      <h3>People you met</h3>
      ${mine.length ? mine.map(encounterRow).join('') + `<p class="note">${ICON.info} Following is one-way. They aren’t asked to follow back, and it doesn’t open direct messages.</p>` : '<p class="empty">You didn’t save anyone this time — that’s fine.</p>'}
      <div class="msg">${av(host, 36, 'round')}<div><small>Message from ${host.short} · host</small><p>Thanks for coming! Slides and the resource list are in the ${esc(e.circle)} circle. See you at the next one.</p></div></div>
      <div class="prompt-card" data-a="compose" data-x="${id}"><small>Share a takeaway</small><b>What’s one thing you’ll try this week?</b><span>Help someone who couldn’t make it · earn ★ when it helps</span></div>
      <h3>How was it?</h3>
      <div class="rate">${['😕', '😐', '🙂', '😄', '🤩'].map((m, i) => `<button class="${fb === i ? 'on' : ''}" data-a="rate" data-x="${id}|${i}">${m}</button>`).join('')}</div>
      ${nextUp.length ? `<h3>Keep going</h3><div class="shelf">${nextUp.map(eventCard).join('')}</div>` : ''}
      <div class="spacer"></div>
    </section>`;
};

/* ------------------------------------------------------------ community */
function postCard(p) {
  const a = p.anon ? { avatar: 'male_0_0', color: '#777777', name: 'Anonymous member' } : who(p.author); const helped = S.helped.includes(p.id); const own = p.author === 'me';
  return `<article class="post">
    <header>${av(a, 36, 'round')}<div><b>${esc(p.anon ? 'Anonymous member' : a.name)}</b><small>${esc(p.circle)} · ${p.ago}</small></div><i class="chip">${p.type}</i></header>
    <p>${esc(p.text)}</p>
    <footer><button class="help ${helped ? 'on' : ''}" data-a="helped" data-x="${p.id}" ${own ? 'disabled' : ''}>★ ${own ? 'Helpful' : helped ? 'You found this helpful' : 'This helped'} · ${p.stars + (helped ? 1 : 0)}</button><button class="plain muted small" data-a="toast" data-x="Replies are coming in the next build">Reply</button></footer>
  </article>`;
}

V.community = () => {
  const circles = [...new Set([...Object.keys(S.regs).map((id) => ev(id).circle), 'Harbour Builders', 'Switchers Circle'])];
  let list = allPosts();
  if (ui.seg === 'following') list = list.filter((p) => S.following.includes(p.author));
  return `<header class="top"><h1>Community</h1><button class="star-pill" data-a="nav" data-x="rewards">★ ${S.stars}</button></header>
    <div class="pills scroll">${[['foryou', 'For you'], ['circles', 'Circles'], ['following', 'Following']].map(([k, l]) => `<button class="pill ${ui.seg === k ? 'on' : ''}" data-a="seg" data-x="${k}">${l}</button>`).join('')}</div>
    ${ui.seg === 'circles' ? circles.map((c) => { const e = EVENTS.find((x) => x.circle === c); return `<button class="row" data-a="toast" data-x="Circle pages come next">${cover(e, 'sm')}<span class="row-main"><b>${c}</b><small>${e.going + 80} members · ${EVENTS.filter((x) => x.circle === c).length} upcoming</small></span></button>`; }).join('')
      : list.map(postCard).join('') || '<p class="empty">Follow people you meet at events to see their posts here.</p>'}
    <button class="fab" data-a="compose" data-x="">${ICON.plus}</button>
    <div class="spacer"></div>`;
};

V.compose = (eventId) => {
  const e = eventId && ev(eventId);
  if (!ui.compose || ui.compose.eventId !== eventId) ui.compose = { eventId, type: 'Takeaway', text: '', audience: 'circle' };
  const c = ui.compose;
  const qs = { Takeaway: 'What’s one thing you’ll try this week?', Resource: 'What link or tool would help others?', Question: 'What are you still unsure about?', 'Offer help': 'What could you help someone with?' };
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.close}</button><b>New post</b><button class="btn small primary" data-a="post">Post</button></header>
    <section class="pad">
      ${e ? `<div class="linked">${cover(e, 'sm')}<div><small>Linked to</small><b>${esc(e.title)}</b></div></div>` : ''}
      <div class="pills">${Object.keys(qs).map((t) => `<button class="pill ${c.type === t ? 'on' : ''}" data-a="compose-type" data-x="${t}">${t}</button>`).join('')}</div>
      <textarea class="field area" data-model="compose.text" placeholder="${qs[c.type]}">${esc(c.text)}</textarea>
      <h3>Who can see this</h3>
      <div class="seg3">${[['circle', e ? e.circle : 'My circles'], ['public', 'Everyone'], ['anon', 'Anonymous']].map(([k, l]) => `<button class="${c.audience === k ? 'on' : ''}" data-a="compose-aud" data-x="${k}">${l}</button>`).join('')}</div>
      <p class="note">${ICON.info} Stars come from people who found your post helpful — not from likes or post count.</p>
    </section>`;
};

V.rewards = () => `
  <header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>Your stars</b><span></span></header>
  <section class="pad">
    <div class="star-hero"><b>★ ${S.stars}</b><small>earned by helping people in your circles</small></div>
    <h3>How stars work</h3>
    <ol class="how"><li><b>Share or answer</b><small>takeaways, resources, offers of help</small></li><li><b>Someone marks it helpful</b><small>one star per person, per post</small></li><li><b>Unlock extras</b><small>core features are always free</small></li></ol>
    <h3>Use stars</h3>
    ${[['AI CV deep review', 'Line-by-line feedback for one role', 5], ['Priority mock interview', 'Get matched with a practitioner first', 8], ['Host a circle session', 'Run your own small event', 12]].map(([t, d, n]) => `<div class="enc"><span class="reward-ico">★</span><div><b>${t}</b><small>${d}</small></div><button class="btn small ${S.stars >= n ? 'primary' : ''}" data-a="toast" data-x="Concept only — redemption isn’t built in this prototype">${n} ★</button></div>`).join('')}
    <p class="note">${ICON.info} Everyone gets one free AI CV check each month, stars or not.</p>
  </section>`;

V.me = () => {
  const p = me();
  if (!p) return `<header class="top"><h1>Me</h1></header><section class="pad center"><p class="muted">Log in to register for events and keep the people you meet.</p><button class="btn primary" data-a="login-demo">Log in</button><button class="link" data-a="nav" data-x="onboarding">Create an account</button></section>`;
  const groups = { upcoming: ['going', 'checkedin'], pending: ['pending', 'declined'], past: ['attended'] };
  const list = EVENTS.filter((e) => groups[ui.meSeg].includes(reg(e.id)?.status));
  return `<header class="top"><h1>Me</h1><button class="icon-btn" data-a="edit-profile">${ICON.edit}</button></header>
    <section class="pad">
      <div class="me-hero">${av(p, 96)}<div><h2>${esc(p.name)}</h2><small>${p.field} · ${p.stage}${p.showStage ? '' : ' 🔒'}</small><small class="tags">${p.interests.map((t) => '#' + t).join(' ')}</small></div></div>
      <div class="stats"><button data-a="nav" data-x="people"><b>${S.encounters.length}</b><small>met</small></button><button data-a="nav" data-x="people"><b>${S.following.length}</b><small>following</small></button><button data-a="nav" data-x="rewards"><b>★ ${S.stars}</b><small>stars</small></button></div>
      <h3>My events</h3>
      <div class="pills">${[['upcoming', 'Upcoming'], ['pending', 'Requests'], ['past', 'Past']].map(([k, l]) => `<button class="pill ${ui.meSeg === k ? 'on' : ''}" data-a="me-seg" data-x="${k}">${l}</button>`).join('')}</div>
      ${list.map(eventRow).join('') || '<p class="empty">Nothing here yet.</p>'}
      <h3>Privacy</h3>
      <ul class="checklist"><li>Public: name, avatar, field, interests${p.fact ? ', fun fact' : ''}</li><li>Private: ${p.showStage ? 'email' : 'career stage, email'}</li></ul>
      <h3>Appearance</h3>
      <div class="seg3">${[['system', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<button class="${themePref() === k ? 'on' : ''}" data-a="theme" data-x="${k}">${l}</button>`).join('')}</div>
      <h3>Event Tappy</h3>
      <a class="row badge-link" href="./tappy/" target="_blank" rel="noopener">${ICON.badge}<span class="row-main"><b>Open the Tappy app</b><small>Install it on a second phone to act as the hardware</small></span>${ICON.chev}</a>
      <button class="link" data-a="logout">Log out</button>
      <button class="link danger" data-a="reset">Reset demo</button>
      <div class="spacer"></div>
    </section>`;
};

V.people = () => {
  const ids = [...new Set([...S.encounters.map((x) => x.person), ...S.following])];
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>People</b><span></span></header>
    <section class="pad">${ids.map((id) => { const x = S.encounters.find((y) => y.person === id); const p = PEOPLE[id]; const f = S.following.includes(id);
      return `<button class="enc" data-a="nav" data-x="person/${id}">${av(p, 44, 'round')}<div><b>${p.name}</b><small>${x ? 'Met at ' + ev(x.eventId).title : p.headline}</small></div><i class="chip">${f ? 'Following' : 'Met'}</i></button>`; }).join('') || '<p class="empty">People you save at events show up here.</p>'}</section>`;
};

V.person = (id) => {
  const p = PEOPLE[id]; const f = S.following.includes(id);
  const met = S.encounters.filter((x) => x.person === id);
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><span></span><span></span></header>
    <section class="pad">
      <div class="me-hero">${av(p, 96)}<div><h2>${p.name}</h2><small>${esc(p.headline)}</small><small class="tags">${p.interests.map((t) => '#' + t).join(' ')}</small></div></div>
      <button class="btn ${f ? '' : 'primary'}" data-a="follow" data-x="${id}">${f ? 'Following' : 'Follow'}</button>
      ${met.map((x) => `<div class="msg"><div><small>You met at ${esc(ev(x.eventId).title)}</small><p>${esc(x.prompt)}</p></div></div>`).join('')}
      <h3>Fun fact</h3><p>${esc(p.fact)}</p>
      <h3>Posts</h3>${SEED_POSTS.filter((x) => x.author === id).map(postCard).join('') || '<p class="empty">No posts yet.</p>'}
    </section>`;
};

V.notfound = () => `<section class="pad center"><p>Page not found.</p><button class="btn" data-a="nav" data-x="home">Home</button></section>`;

/* --------------------------------------------------------------- sheets */
function sheetHTML() {
  const s = ui.sheet; if (!s) return '';
  let inner = '';
  if (s.type === 'person') {
    const p = who(s.id); const noBadge = S.live?.noBadge;
    inner = `${av(p, 80)}<h2>${esc(p.name)}</h2><p class="muted">${esc(p.headline)}</p><p>“${esc(p.fact || '')}”</p>
      <div class="pills center">${p.interests.map((t) => `<i class="pill">${t}</i>`).join('')}</div>
      ${p.id === 'me' ? '<p class="note">This is how you appear on the wall.</p>' : noBadge ? `<button class="btn primary" data-a="hi-request" data-x="${p.id}">Send a hi request</button>` : `<p class="note">${ICON.badge} Look for this avatar on a Tappy and say hi. Tap Tappys if you both want a conversation prompt.</p>`}`;
  }
  if (s.type === 'match') {
    const p = PEOPLE[s.id];
    inner = `<div class="duo">${av(me(), 64)}${av(p, 64)}</div><small class="eyebrow">You both said yes · ${esc(s.tag)}</small><h2 class="prompt">${esc(s.prompt)}</h2>
      <button class="btn" data-a="toast" data-x="Opens a 5-minute video room (mocked)">Open 5-min chat room</button>
      <button class="btn primary" data-a="save-enc" data-x="${p.id}">Save encounter</button><button class="link" data-a="sheet-close">Skip</button>`;
  }
  if (s.type === 'incoming') {
    const p = PEOPLE[s.id];
    inner = `${av(p, 80)}<h2>${p.short} waved at you</h2><p class="muted">${esc(p.headline)}</p><p class="note">${ICON.lock} If you ignore it, ${p.short} won’t be told.</p>
      <button class="btn primary" data-a="accept-wave" data-x="${p.id}">Wave back</button><button class="link" data-a="sheet-close">Ignore quietly</button>`;
  }
  return `<div class="scrim" data-a="sheet-close"></div><div class="sheet"><i class="grab"></i>${inner}</div>`;
}

/* ================================================================ BADGE */
function badgeScreen() {
  const b = S.badge; const p = me();
  const partner = b.partner && PEOPLE[b.partner];
  switch (b.screen) {
    case 'off': return `<div class="bs off"><small>JobBuddy</small><b>${BADGE_ID}</b><small>Not assigned</small></div>`;
    case 'unpaired': return `<div class="bs"><small>BADGE</small><b class="huge">${BADGE_ID}</b><small>Open JobBuddy<br>to pair</small></div>`;
    case 'pairing': return `<div class="bs"><small>PAIR WITH</small><b>${esc(p.short)}?</b><div class="bcode">${PAIR_CODE}</div><small>● yes · ○ no</small></div>`;
    case 'idle': { const l = badgeLook(S.live?.eventId); return `<div class="bs idle"><div class="badge-av">${avatar(l.avatar, l.color, 118, ui.frame)}</div><b>${esc(p.short)}</b><small>#${esc(l.tag)}</small></div>`; }
    case 'request': return `<div class="bs">${avatar(partner.avatar, partner.color, 64)}<small>TALK WITH</small><b>${partner.short}?</b><small>● yes · ○ not now</small></div>`;
    case 'waiting': return `<div class="bs">${avatar(partner.avatar, partner.color, 64)}<small>Waiting for</small><b>${partner.short}…</b></div>`;
    case 'declined': return `<div class="bs"><b>Maybe later</b><small>Nothing was shared.</small></div>`;
    case 'prompt': return `<div class="bs prompt"><small>YOU + ${partner.short.toUpperCase()} · #${esc(b.tag)}</small><p>${esc(b.prompt)}</p><small>● save · ○ skip</small></div>`;
    case 'saved': return `<div class="bs"><b class="huge">✓</b><b>Saved</b><small>Find ${partner.short} in your app</small></div>`;
    case 'returned': return `<div class="bs off"><b>Thanks!</b><small>Data cleared.<br>Ready for next person.</small></div>`;
    default: return '';
  }
}

function badgePanel() {
  const L = S.live; const online = L && ev(L.eventId)?.mode === 'online';
  const hasBadge = L && L.badgeId;
  const e = L && ev(L.eventId);
  const nearby = e && e.attendees.map((id) => PEOPLE[id]);
  const idle = S.badge.screen === 'idle';
  const hint = {
    off: 'No Tappy assigned. Collect one at check-in.', unpaired: 'Assigned but not paired. Pair it from the phone.', pairing: 'Press ● to confirm the code matches the phone.',
    idle: 'Showing your public avatar. Tap Tappys with someone nearby.', request: 'The other Tappy asked to talk. Press ● if you want to.', waiting: 'Waiting for the other person to press ●.',
    declined: 'They chose “not now”. No info exchanged.', prompt: 'Shared prompt shown on both badges. ● saves the encounter to your app.', saved: 'Encounter synced to the app.', returned: 'Tappy unpaired and wiped.'
  }[S.badge.screen];
  return `<div class="bp-head"><b>Tappy</b><small>Simulated hardware · ESP32 + NFC + 240×240 screen · <a href="./tappy/" target="_blank" rel="noopener">open as separate app ↗</a></small><button class="icon-btn bp-close" data-a="badge-close">${ICON.close}</button></div>
    <div class="device ${hasBadge ? '' : 'dim'}">
      <div class="nfc">NFC</div>
      <div class="screen">${online ? '<div class="bs off"><small>Online events</small><b>No Tappy</b></div>' : badgeScreen()}</div>
      <div class="hw-btns"><button class="hw a" data-a="hw" data-x="A" aria-label="Yes button">●</button><button class="hw b" data-a="hw" data-x="B" aria-label="No button">○</button></div>
      <small class="dev-id">${BADGE_ID}</small>
    </div>
    <p class="bp-hint">${online ? 'Online events use waves in the app instead.' : hint}</p>
    ${idle && nearby ? `<div class="bp-demo"><small>DEMO · tap Tappys with someone nearby</small>${nearby.slice(0, 3).map((p) => `<button data-a="tap" data-x="${p.id}">${avatar(p.avatar, p.color, 28)}${p.short}${p.responds === 'later' ? ' <i>(will say not now)</i>' : ''}</button>`).join('')}</div>` : ''}`;
}

function setBadge(screen, extra = {}) { S.badge = { ...S.badge, ...extra, screen }; save(); render(); }
let badgeTimer;
function badgeLater(ms, fn) { clearTimeout(badgeTimer); badgeTimer = setTimeout(fn, ms); }

function hw(btn) {
  const b = S.badge; const L = S.live;
  if (b.screen === 'pairing') {
    if (btn === 'A') { L.paired = true; L.pairing = false; setBadge('idle'); toast('Tappy paired ✓'); }
    else { L.pairing = false; setBadge('unpaired'); }
  } else if (b.screen === 'request') {
    if (btn === 'A') {
      setBadge('waiting');
      const p = PEOPLE[b.partner];
      badgeLater(1400, () => {
        if (p.responds === 'later') { setBadge('declined'); badgeLater(2400, () => setBadge('idle', { partner: null })); }
        else { const pr = makePrompt(p); setBadge('prompt', { prompt: pr.text, tag: pr.tag }); }
      });
    } else setBadge('idle', { partner: null });
  } else if (b.screen === 'prompt') {
    if (btn === 'A') {
      addEncounter(b.partner, L.eventId, b.prompt, 'tappy');
      setBadge('saved'); toast(`Saved · ${PEOPLE[b.partner].short}`);
      badgeLater(2200, () => setBadge('idle', { partner: null }));
    } else setBadge('idle', { partner: null });
  } else if (b.screen === 'idle' && btn === 'A') toast('Badge: showing your avatar');
}

function addEncounter(person, eventId, prompt, via) {
  if (S.encounters.some((x) => x.person === person && x.eventId === eventId)) return;
  S.encounters.push({ id: 'x' + Date.now(), person, eventId, prompt, via, at: Date.now() });
  save();
}

/* ============================================================== ACTIONS */
const A = {
  nav: (x) => { ui.sheet = null; go(x); },
  back: () => history.length > 1 ? history.back() : go('home'),
  toast: (x) => toast(x),
  browse: () => { S.browsing = true; save(); go('home'); },
  'login-demo': () => { S.profile = { ...DEFAULT_PROFILE }; S.onboarded = true; const next = S.afterOnboard || 'home'; S.afterOnboard = null; save(); toast('Logged in as Xinyi'); go(next); render(); },
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
    S.onboarded = true; ui.ob = null; ui.authNew = false;
    const next = S.afterOnboard || 'home'; S.afterOnboard = null; save();
    toast(wasNew ? 'Account created' : 'Profile saved'); go(next);
    if (next.startsWith('register')) render();
  },
  'edit-profile': () => { ui.ob = null; go('onboarding'); },
  'reg-toggle': (x, el) => { ui.regDraft[x] = el.checked; },
  register: (id) => {
    const e = ev(id); const d = ui.regDraft || {};
    S.regs[id] = { status: e.approval ? 'pending' : 'going', list: d.list !== false, wall: d.wall !== false };
    if (e.badges) { S.regs[id].badge = { avatar: d.avatar, color: d.color, tag: d.tag }; S.lastBadge = S.regs[id].badge; }
    save(); toast(e.approval ? 'Request sent' : 'You’re in ✓');
    history.replaceState(null, '', '#/ticket/' + id); render();
  },
  approve: (id) => { S.regs[id].status = 'going'; save(); toast('🎉 Approved — address unlocked'); render(); },
  decline: (id) => { S.regs[id].status = 'declined'; save(); render(); },
  cancel: (id) => { if (confirm('Cancel? Your spot goes to the next person.')) { delete S.regs[id]; save(); toast('Cancelled'); go('event/' + id); } },
  checkin: (id) => { S.regs[id].status = 'checkedin'; S.live = { eventId: id }; save(); toast('Checked in ✓'); render(); },
  'give-badge': (id) => { S.live = { eventId: id, badgeId: BADGE_ID }; S.badge = { screen: 'unpaired' }; save(); render(); },
  'no-badge': (id) => { S.live = { eventId: id, noBadge: true }; save(); go('live/' + id); },
  scan: () => { ui.pairInput = BADGE_ID; ui.pairError = ''; render(); },
  'pair-start': () => {
    const v = (ui.pairInput || '').trim().toUpperCase();
    if (!v) { ui.pairError = 'Scan the code or type the Tappy number.'; render(); return; }
    if (v !== BADGE_ID) { ui.pairError = `${v} isn’t assigned to you. Check the number on the back, or ask staff.`; render(); return; }
    ui.pairError = ''; S.live.pairing = true; save(); setBadge('pairing');
  },
  theme: (x) => { localStorage.setItem(THEME_KEY, x); applyTheme(); render(); },
  'theme-cycle': () => { const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; localStorage.setItem(THEME_KEY, next); applyTheme(); render(); },
  'pair-confirm': () => { S.live.paired = true; S.live.pairing = false; setBadge('idle'); toast('Tappy paired ✓'); },
  'demo-enc': (x) => { const pr = makePrompt(PEOPLE[x]); addEncounter(x, S.live.eventId, pr.text, 'tappy'); toast(`Saved · ${PEOPLE[x].short}`); render(); },
  'pair-cancel': () => { S.live.pairing = false; setBadge('unpaired'); },
  'sheet-person': (x) => { ui.sheet = { type: 'person', id: x }; render(); },
  'sheet-close': () => { ui.sheet = null; render(); },
  'hi-request': (x) => {
    ui.sheet = null; toast(`Hi request sent to ${PEOPLE[x].short}`); render();
    setTimeout(() => { const pr = makePrompt(PEOPLE[x]); ui.sheet = { type: 'match', id: x, prompt: pr.text, tag: pr.tag }; render(); }, 1600);
  },
  tap: (x) => setBadge('request', { partner: x }),
  hw: (x) => hw(x),
  'badge-open': () => { document.body.classList.add('badge-open'); },
  'badge-close': () => { document.body.classList.remove('badge-open'); },
  'return-badge': (id) => {
    S.live.returned = true; setBadge('returned'); toast('Tappy returned ✓');
    badgeLater(2600, () => setBadge('off'));
  },
  finish: (id) => {
    S.regs[id].status = 'attended'; S.live = null; ui.waved = {}; save();
    document.body.classList.remove('badge-open');
    go('recap/' + id);
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
    const f = S.following.includes(x);
    S.following = f ? S.following.filter((p) => p !== x) : [...S.following, x];
    save(); toast(f ? 'Unfollowed' : `Following ${PEOPLE[x].short} · they won’t be asked to follow back`); render();
  },
  rate: (x) => { const [id, i] = x.split('|'); S.feedback[id] = +i; save(); toast('Thanks — sent to the host'); render(); },
  compose: (x) => { if (!S.onboarded) { go('onboarding'); return; } go('compose/' + x); },
  'compose-type': (x) => { ui.compose.type = x; render(); },
  'compose-aud': (x) => { ui.compose.audience = x; render(); },
  post: () => {
    const c = ui.compose; if (!c.text.trim()) { toast('Write something first'); return; }
    const e = c.eventId && ev(c.eventId);
    const post = { id: 'm' + Date.now(), author: 'me', anon: c.audience === 'anon', circle: e ? e.circle : 'Everyone', type: c.type, text: c.text.trim(), stars: 0, ago: 'now' };
    S.posts.unshift(post); ui.compose = null; save();
    ui.seg = 'foryou'; go('community'); toast('Posted');
    setTimeout(() => { const p = S.posts.find((y) => y.id === post.id); if (!p) return; p.stars++; S.stars++; save(); render(); toast('★ Marcus found your post helpful · +1 star'); }, 3500);
  },
  helped: (x) => { S.helped = S.helped.includes(x) ? S.helped.filter((p) => p !== x) : [...S.helped, x]; save(); render(); },
  reset: () => { if (confirm('Reset all demo data?')) { localStorage.removeItem(KEY); S = fresh(); Object.assign(ui, { sheet: null, ob: null, compose: null, waved: {}, pairInput: '' }); go('home'); render(); } }
};

/* =============================================================== RENDER */
const NO_NAV = ['welcome', 'onboarding', 'register', 'badgeedit', 'ticket', 'checkin', 'pair', 'live', 'leave', 'lobby', 'room', 'compose', 'rewards', 'people', 'person', 'event', 'recap'];
const TABS = [['home', 'Home', 'home'], ['events', 'Events', 'search'], ['community', 'Community', 'people'], ['me', 'Me', 'user']];

function route() {
  const [name = '', arg] = location.hash.replace(/^#\/?/, '').split('/');
  if (!name || name === 'welcome') return ['home'];
  return [V[name] ? name : 'notfound', arg];
}

function render() {
  const [name, arg] = route();
  const app = $('#app');
  const prev = app.dataset.view;
  app.innerHTML = V[name](arg) + sheetHTML();
  app.dataset.view = name + '/' + (arg || '');
  if (prev !== app.dataset.view) app.scrollTop = 0;
  const showNav = !NO_NAV.includes(name);
  $('#nav').hidden = !showNav;
  $('#nav').innerHTML = TABS.map(([k, l, i]) => `<button class="${name === k ? 'on' : ''}" data-a="nav" data-x="${k}">${ICON[i]}<span>${l}</span></button>`).join('');
  $('#badge').innerHTML = badgePanel();
  document.body.classList.toggle('has-badge', !!(S.live && S.live.badgeId));
}

function tickBadge() {
  ui.frame++;
  const el = document.querySelector('.badge-av');
  if (el && S.badge.screen === 'idle') { const l = badgeLook(S.live?.eventId); el.innerHTML = avatar(l.avatar, l.color, 118, ui.frame); }
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  const fn = A[el.dataset.a]; if (!fn) return;
  if (el.tagName !== 'INPUT') e.preventDefault();
  fn(el.dataset.x, el);
});
document.addEventListener('input', (e) => {
  const m = e.target.dataset.model; if (!m) return;
  const v = e.target.value;
  if (m === 'q') { ui.q = v; $('#event-list').innerHTML = eventListHTML(); return; }
  if (m === 'pairInput') { ui.pairInput = v; return; }
  const [obj, key] = m.split('.');
  ui[obj][key] = v;
  if (obj === 'ob') { const btn = $('[data-a="ob-next"]'); const o = ui.ob; if (btn && o.step === 0) btn.disabled = !(o.name.trim() && o.field && o.stage); }
});
window.addEventListener('hashchange', render);
setInterval(tickBadge, 650);
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});
