import { FIELDS, STAGES, INTERESTS, AVATAR_CHOICES, AVATAR_COLORS, PEOPLE, EVENTS, SEED_POSTS, SEED_COMMENTS, SEED_GRAPH, FOLLOWS_BACK, POINT_RULES, LEVELS, REDEEM, PRACTITIONERS, POST_TYPES, LEVEL_PERKS, RULE_ICONS, PROMPTS } from './data.js';
import { avatar } from './avatar.js';
import { ICON } from './icons.js';

/* ------------------------------------------------------------------ state */
const KEY = 'jobbuddy-proto-v1';
const BADGE_ID = 'EB-07';
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
// Two avatar systems: real profile photo (app, online) and ASCII EventBuddy avatar (in-person device & wall).
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
const TAB_ICON = {
  home: '<svg viewBox="0 0 40 40"><path d="M20 3l4.9 10.6 11.6 1.3-8.6 7.9 2.4 11.4L20 28.4 9.7 34.2l2.4-11.4-8.6-7.9 11.6-1.3z" fill="var(--t-event)" stroke="var(--t-event)" stroke-width="3" stroke-linejoin="round"/></svg>',
  community: '<svg viewBox="0 0 40 40"><g fill="var(--t-comm)"><circle cx="20" cy="10" r="8.5"/><circle cx="20" cy="30" r="8.5"/><circle cx="10" cy="20" r="8.5"/><circle cx="30" cy="20" r="8.5"/></g><circle cx="20" cy="20" r="4" fill="#fff"/></svg>',
  messages: '<svg viewBox="0 0 40 40"><path d="M6 6h28a4 4 0 014 4v16a4 4 0 01-4 4H16l-8 6v-6H6a4 4 0 01-4-4V10a4 4 0 014-4z" fill="var(--t-msg)"/><g fill="#fff"><circle cx="13" cy="18" r="2.2"/><circle cx="20" cy="18" r="2.2"/><circle cx="27" cy="18" r="2.2"/></g></svg>',
  me: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="var(--t-acc)"/></svg>'
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
     <div class="photo-row"><span class="ph" style="width:64px;height:64px"><img src="people/me.jpg" alt=""></span><div><b>Profile photo</b><small>Shown in the app and at online events. Your EventBuddy avatar is chosen per in-person event.</small><button class="linkish" data-a="toast" data-x="Photo picker (mocked)">Change photo</button></div></div>
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
      <span class="lrow-meta"><span>${ICON.clock}${e.time.split(' ')[0]}</span><span>${e.mode === 'online' ? ICON.globe : ICON.pin}${esc(place)}</span>${e.mode === 'offline' && e.badges ? `<span class="badge-tag">${ICON.badge}EventBuddy</span>` : ''}</span>
      ${connLine(e)}
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
  const hint = { all: '', offline: `<p class="note">${ICON.badge} In-person events can lend you an EventBuddy device. You connect it to your account when you arrive.</p>`, online: `<p class="note">${ICON.globe} Online events run in the app. No EventBuddy needed — wave at people instead.</p>` }[mode];
  const past = EVENTS.filter((e) => reg(e.id)?.status === 'attended');
  return `<header class="top home-top">
      <div class="hi"><h1>Hi, ${p ? esc(p.short) : 'there'}</h1><p class="sub">${p ? `${esc(p.stage)} /<br>${esc(p.field)}` : 'Find career events and the people at them.'}</p></div>
      <span class="top-actions">${p ? `<button class="icon-btn dark" data-a="nav" data-x="events" aria-label="Search events">${ICON.search}</button>` : `<button class="btn small primary" data-a="login-demo">Log in</button>`}</span></header>
    <section class="pad">
      ${p ? `<div class="pills" style="gap:6px">${p.interests.map((t) => `<i class="tag">${esc(t)}</i>`).join('')}</div>` : ''}
      <div style="height:22px"></div>
      ${liveE ? `<button class="live-card flush" data-a="nav" data-x="${liveE.mode === 'online' ? 'room' : 'live'}/${liveE.id}"><span class="dot"></span><div><small>HAPPENING NOW</small><b>${esc(liveE.title)}</b></div>${ICON.chev}</button>` : ''}
      <button class="h2link" data-a="nav" data-x="me"><h2>Your events</h2>${ICON.chev}</button>
      ${mine.length ? mine.map(lumaRow).join('') : `<div class="empty">No upcoming events. Explore events below and RSVP to one.</div>`}
      <h2 class="explorer">Event Explorer</h2>
      <div class="seg3 mode-seg">${[['all', 'All'], ['offline', 'In person'], ['online', 'Online']].map(([k, l]) => `<button class="${mode === k ? 'on' : ''}" data-a="home-mode" data-x="${k}">${l}</button>`).join('')}</div>
      ${hint}
      ${groups}
      ${past.length ? `<h2>Recent views</h2>${past.map((e) => `<div class="card-white" style="display:flex;gap:14px;align-items:flex-start"><div style="width:74px;height:74px;flex:0 0 auto;border-radius:50%;overflow:hidden">${art(seedOf(e.circle), '', 'width:100%;height:100%')}</div><div style="flex:1"><h3 style="margin:0">${esc(e.title)}</h3><p class="muted small" style="margin:6px 0 10px">Attended ${e.date}. Revisit the shared stories and see who else showed up.</p><button class="btn small primary" data-a="nav" data-x="circle/${encodeURIComponent(e.circle)}">See more</button></div></div>`).join('')}` : ''}
      <div class="spacer"></div>
    </section>`;
};

function filteredEvents() {
  return EVENTS.filter((e) => (ui.filter === 'all' || (ui.filter === 'free' ? e.cost === 'Free' : e.mode === ui.filter)) && (!ui.q || (e.title + e.circle + e.tags.join(' ')).toLowerCase().includes(ui.q.toLowerCase())));
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
  const r = reg(id); const host = PEOPLE[e.host];
  const how = e.mode === 'offline'
    ? [['Check in', 'Show your pass at the desk'], ['Collect a EventBuddy', 'Optional loan device'], ['Pair it', 'Link the EventBuddy to your app'], ['Tap to talk', 'Both say yes, get a shared prompt'], ['Return it', 'Your encounters stay in the app']]
    : [['Join the lobby', 'Choose what others see'], ['Watch the stream', 'Camera & mic stay in Zoom'], ['Wave at people', 'Both say yes, get a shared prompt'], ['Save & follow', 'Only if you want to']];
  let cta;
  if (!r || r.status === 'cancelled') cta = `<button class="btn primary" data-a="nav" data-x="register/${id}">${e.approval ? 'Request to join' : 'RSVP'}${e.cost === 'Free' ? '' : ' · ' + e.cost}</button>`;
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
      <h3>About this event</h3>
      <p class="muted">${esc(e.audience)}</p>
      <div class="card-soft" style="margin-top:18px"><div style="display:flex;align-items:center"><div style="flex:1"><b>${e.going + (r ? 1 : 0)} / ${e.capacity}</b> <span class="muted small">spots filled</span></div>${e.badges ? '<i class="chip chip-going" style="margin:0">EventBuddy</i>' : ''}</div><div class="progress" style="margin-top:8px"><i style="width:${Math.min(100, ((e.going + (r ? 1 : 0)) / e.capacity) * 100)}%"></i></div></div>
      <h3>See who’s going</h3>
      ${connsGoing(e).length ? `<div class="conn-going">${faces(connsGoing(e), 36)}<div><b>${connsGoing(e).length} connection${connsGoing(e).length > 1 ? 's' : ''} going</b><small>${connsGoing(e).map((pid) => PEOPLE[pid].short).join(', ')}</small></div></div>` : ''}
      <div class="stack">${e.attendees.filter((pid) => !isConn(pid)).map((pid) => av(PEOPLE[pid], 32)).join('')}<small>${e.going} going · ${Math.round(e.going * 0.6)} visible</small></div>
      <h3>How it works</h3>
      <ol class="how">${how.map(([a, b]) => `<li><b>${a}</b><small>${b}</small></li>`).join('')}</ol>
      ${e.badges ? `<p class="note">${ICON.badge} EventBuddy is optional. Tap devices with another attendee to get a career question you can talk about together.</p>` : ''}
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
    <input class="field" type="email" placeholder="Email" value="emma@student.uts.edu.au">
    <button class="btn primary" data-a="login-demo">Continue with email</button>
    <div class="or"><span>or</span></div>
    <button class="btn" data-a="login-demo">Continue with Apple</button>
    <button class="btn" data-a="login-demo">Continue with Google</button>
    <p class="muted center small">New here? <button class="linkish" data-a="signup">Create an account</button></p>
  </section>`;

const DEFAULT_PROFILE = { name: 'Emma C.', field: 'Design', stage: 'Studying', interests: ['AI tools', 'UX', 'Portfolio'], fact: 'Built a badge from scratch', avatar: 'female_2_1', color: '#D7FF3A', showStage: false };

function badgeLook(eventId) {
  const p = S.profile || DEFAULT_PROFILE;
  const b = (eventId && S.regs[eventId]?.badge) || S.lastBadge || {};
  return { avatar: b.avatar || p.avatar, color: b.color || p.color, tag: b.tag || p.interests[0] || p.field };
}

function badgePicker(d) {
  const p = me();
  const tags = [...new Set([...p.interests, p.field])];
  return `<div class="badge-preview"><div class="mini-screen"><div class="bs idle">${avatar(d.avatar, d.color, 84)}<b>${esc(p.short)}</b><small>#${esc(d.tag)}</small></div></div>
      <small>Shown on your loan EventBuddy and the participant wall at this event only.</small></div>
    <h3>Pick an avatar</h3>
    <div class="avatar-grid">${AVATAR_CHOICES.map((k) => `<button class="${d.avatar === k ? 'on' : ''}" data-a="bd-pick" data-x="avatar|${k}">${avatar(k, d.color, 60)}</button>`).join('')}</div>
    <div class="swatches">${AVATAR_COLORS.map((c) => `<button class="${d.color === c ? 'on' : ''}" style="background:${c}" data-a="bd-pick" data-x="color|${c}" aria-label="colour ${c}"></button>`).join('')}</div>
    <h3>Tag on your EventBuddy</h3><p class="muted small">A conversation hook for this crowd.</p>
    <div class="pills" style="margin-top:10px">${tags.map((t) => `<button class="pill ${d.tag === t ? 'on' : ''}" data-a="bd-pick" data-x="tag|${t}">#${t}</button>`).join('')}</div>`;
}

V.badgeedit = (id) => {
  const e = ev(id); if (!reg(id)) return V.event(id);
  if (!ui.regDraft || ui.regDraft.id !== id) ui.regDraft = { id, ...badgeLook(id) };
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.close}</button><b>Your EventBuddy</b><span></span></header>
    <section class="pad"><p class="muted">${esc(e.title)}</p>${badgePicker(ui.regDraft)}<div class="spacer"></div></section>
    <footer class="sticky"><button class="btn primary" data-a="badge-save" data-x="${id}">Save EventBuddy</button></footer>`;
};

V.register = (id) => {
  const e = ev(id);
  if (!S.onboarded) { if (S.afterOnboard !== 'register/' + id) { S.afterOnboard = 'register/' + id; save(); ui.ob = null; } return ui.authNew ? V.onboarding() : V.auth(); }
  ui.regDraft = ui.regDraft?.id === id ? ui.regDraft : { id, list: true, wall: true, ...badgeLook() };
  const d = ui.regDraft; const p = me();
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.close}</button><b>${e.approval ? 'Request to join' : 'Register'}</b><span></span></header>
    <section class="pad">
      <div class="next-card static">${cover(e, 'sm')}<div><b>${esc(e.title)}</b><small>${e.date} · ${e.time}</small></div></div>
      ${e.badges ? `<h3>Your EventBuddy for this event</h3>${badgePicker(d)}` : ''}
      <h3>${e.badges ? 'In the attendee list' : 'What attendees will see'}</h3>
      <div class="public-card">${e.badges ? asc({ ...p, ...d }, 56) : av(p, 56)}<div><b>${esc(p.name)}</b><small>${p.field}${p.showStage ? ' · ' + p.stage : ''}</small><small class="tags">${p.interests.map((t) => '#' + t).join(' ')}</small></div></div>
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
      <div class="info-grid"><div>${ICON.pin}<b>${e.venue}</b><small>Get directions</small></div><div>${ICON.badge}<b>EventBuddy on loan</b><small>Collect → pair → return</small></div></div>
      ${e.badges ? `<button class="row badge-link" data-a="nav" data-x="badgeedit/${id}">${avatar(badgeLook(id).avatar, badgeLook(id).color, 44)}<span class="row-main"><b>Your EventBuddy look</b><small>#${esc(badgeLook(id).tag)} · only for this event</small></span><span class="small muted">Change</span></button>` : ''}
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
  const e = ev(id); const r = reg(id);
  if (!r) return V.event(id);
  const checked = r.status === 'checkedin';
  const hasBadge = S.live?.eventId === id && S.live.badgeId;
  return `<header class="bar"><button class="icon-btn" data-a="nav" data-x="ticket/${id}">${ICON.back}</button><b>Arrive</b><span></span></header>
    <section class="pad">
      <ol class="steps">
        <li class="${checked ? 'done' : 'now'}"><b>Check in at the desk</b>
          ${checked ? '<small>Checked in 17:42 ✓</small>' : `<small>Show your pass. Staff scan it — this confirms you actually came.</small><div class="pass mini">${fakeQR(id + S.profile.name)}</div>${demo('Staff scans your pass', 'checkin', id)}`}</li>
        <li class="${hasBadge ? 'done' : checked ? 'now' : ''}"><b>Collect a EventBuddy</b>
          ${hasBadge ? `<small>EventBuddy ${BADGE_ID} is yours for tonight ✓</small>` : checked ? `<small>Staff hand you an EventBuddy wearable. Check the number on its back.</small>${demo('Staff hands you EventBuddy ' + BADGE_ID, 'give-badge', id)}<button class="link" data-a="no-badge" data-x="${id}">Continue without an EventBuddy</button>` : '<small>Optional loan device</small>'}</li>
        <li class="${hasBadge ? 'now' : ''}"><b>Pair it with your app</b><small>Takes 10 seconds</small></li>
      </ol>
    </section>
    ${hasBadge ? `<footer class="sticky"><button class="btn primary" data-a="nav" data-x="pair/${id}">Pair EventBuddy</button></footer>` : ''}`;
};

V.pair = (id) => {
  const L = S.live;
  if (!L || L.eventId !== id || !L.badgeId) return V.checkin(id);
  if (L.paired) return `<header class="bar"><span></span><b>Paired</b><span></span></header>
    <section class="pad center">
      <div class="big-check">${ICON.check}</div>
      <h2>You’re connected!</h2>
      <p class="muted">Your EventBuddy wearable (${BADGE_ID}) is paired and live for ${esc(ev(id).title)}.</p>
      <div class="card-soft" style="text-align:left;margin-top:16px"><h3 style="margin:0 0 8px">How it works</h3><p class="muted small" style="font-size:14px">Tap your device with another attendee’s to see a career question you can talk about together. Save the moment if you both want to — you decide later whether to follow.</p></div>
      <div class="rules"><div><b>Tap</b><small>asks to talk</small></div><div><b>Both say yes</b><small>shared prompt appears</small></div><div><b>Save</b><small>keeps it in your app</small></div></div>
      <p class="note">${ICON.lock} Tapping never adds a friend or shares contact details.</p>
    </section>
    <footer class="sticky"><button class="btn primary" data-a="nav" data-x="live/${id}">Back to event</button></footer>`;
  if (L.pairing) return `<header class="bar"><button class="icon-btn" data-a="pair-cancel">${ICON.back}</button><b>Confirm on EventBuddy</b><span></span></header>
    <section class="pad center">
      <p class="muted">Does your EventBuddy show this code?</p>
      <div class="code">${PAIR_CODE.split('').map((d) => `<span>${d}</span>`).join('')}</div>
      <p>Press <i class="kdot"></i> on the EventBuddy to confirm.</p>
      <p class="note">${ICON.info} Code doesn’t match? You may have someone else’s EventBuddy — go back and check the number.</p>
      ${demo('EventBuddy shows ✓ — continue', 'pair-confirm')}
    </section>`;
  return `<header class="bar"><button class="icon-btn" data-a="nav" data-x="checkin/${id}">${ICON.back}</button><b>Pair EventBuddy</b><span></span></header>
    <section class="pad">
      <h2>Scan your EventBuddy</h2><p class="muted">Point your camera at the QR code on the device</p>
      <button class="scan" data-a="scan">${ICON.qr}<span>Tap to scan</span></button>
      <p class="muted center">Can’t scan? Enter code manually</p>
      <input class="field code-in" data-model="pairInput" placeholder="EB-00" value="${esc(ui.pairInput || '')}" maxlength="5">
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
  if (ui.liveTab === 'here') body = `<p class="muted small">${here.length + 1} people chose to show on the wall. Spot their avatar on a EventBuddy.</p>
      <div class="wall">${(reg(id).wall ? [{ ...me(), ...badgeLook(id), headline: '#' + badgeLook(id).tag }, ...here] : here).map((p) => `<button class="wall-tile" data-a="sheet-person" data-x="${p.id}">${asc(p, 64)}<b>${esc(p.short)}${p.id === 'me' ? ' (you)' : ''}</b><small>${esc(p.headline)}</small></button>`).join('')}</div>`;
  if (ui.liveTab === 'agenda') body = `<ul class="agenda">${e.agenda.map(([t, a], i) => `<li class="${i === 2 ? 'now' : ''}"><time>${t}</time>${a}${i === 2 ? ' <i class="chip">Now</i>' : ''}</li>`).join('')}</ul>`;
  if (ui.liveTab === 'saved') body = (mine.length ? mine.map(encounterRow).join('') : `<p class="empty">Nobody saved yet. When you and someone both say yes on your devices, you can save the moment here.</p>`)
    + (L.noBadge ? '' : here.filter((p) => !mine.some((x) => x.person === p.id)).slice(0, 2).map((p) => demo(`EventBuddy on another device saved ${p.short}`, 'demo-enc', p.id)).join(''));
  return `<header class="bar"><button class="icon-btn" data-a="nav" data-x="home">${ICON.back}</button><span class="live-pill"><span class="dot"></span>Live</span>
      ${L.noBadge ? '<span class="muted small">No EventBuddy</span>' : `<button class="badge-pill" data-a="badge-open">${ICON.badge}${BADGE_ID}</button>`}</header>
    <section class="pad">
      <h2 class="title sm">${esc(e.title)}</h2>
      ${L.noBadge ? `<p class="note">${ICON.info} No EventBuddy? Tap someone on the wall to send a hi request instead.</p>` : `<p class="note">${ICON.badge} Your EventBuddy does the work. Tap devices with someone when you both want to talk.</p>`}
      <div class="tabs">${tabs.map(([k, l]) => `<button class="${ui.liveTab === k ? 'on' : ''}" data-a="live-tab" data-x="${k}">${l}</button>`).join('')}</div>
      ${body}<div class="spacer"></div>
    </section>
    <footer class="sticky"><button class="btn" data-a="nav" data-x="leave/${id}">Leaving? ${L.noBadge ? 'Wrap up' : 'Return EventBuddy'}</button></footer>`;
};

function encounterRow(x) {
  const p = who(x.person); const f = S.following.includes(x.person);
  return `<div class="enc">${av(p, 44, 'round')}<div><b>${esc(p.name)}</b><small>${esc(x.prompt)}</small></div>
    ${followBtn(p.id)}</div>`;
}

V.leave = (id) => {
  const L = S.live || {}; const mine = S.encounters.filter((x) => x.eventId === id);
  if (L.noBadge) return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>Leaving</b><span></span></header>
    <section class="pad"><ol class="steps"><li class="done"><b>${mine.length} encounter${mine.length === 1 ? '' : 's'} saved</b><small>Stored in your app</small></li></ol></section>
    <footer class="sticky"><button class="btn primary" data-a="finish" data-x="${id}">Finish & see recap</button></footer>`;
  const returned = L.returned;
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>Return your EventBuddy</b><span></span></header>
    <section class="pad">
      <ol class="steps">
        <li class="done"><b>${mine.length} encounter${mine.length === 1 ? '' : 's'} synced to your app</b><small>Safe to hand the EventBuddy back ✓</small></li>
        <li class="${returned ? 'done' : 'now'}"><b>Hand ${BADGE_ID} to the desk</b>${returned ? '<small>Returned 20:21 ✓</small>' : `<small>Staff confirm it’s back.</small>${demo('Staff confirms return', 'return-badge', id)}<button class="link" data-a="toast" data-x="We’ll remind you. EventBuddy devices can be dropped at any Harbour Commons desk.">Leaving in a hurry?</button>`}</li>
        <li class="${returned ? 'done' : ''}"><b>EventBuddy wiped</b><small>${returned ? 'Your name and avatar are erased from the device ✓' : 'Your data is erased before the next person uses it'}</small></li>
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
function relLabel(id) {
  if (isConn(id)) return 'Connected';
  if (S.following.includes(id)) return 'Following';
  if (S.followers.includes(id)) return 'Follow back';
  return 'Follow';
}
function followBtn(id, small = true) {
  const l = relLabel(id); const cta = l === 'Follow' || l === 'Follow back';
  return `<button class="btn ${small ? 'small' : ''} ${cta ? 'primary' : ''}" data-a="follow" data-x="${id}">${l === 'Connected' ? '✓ Connected' : l}</button>`;
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
  S.points = points; S.lifetime = points; S.ledger = points ? [{ n: 15, why: 'Shared an event takeaway', at: Date.now() - 864e5 }, { n: 20, why: 'Checked in at an event', at: Date.now() - 9e7 }, { n: 5, why: 'New connection · Leo', at: Date.now() - 2e8 }] : [];
}
const wallet = () => S.points || 0;            // spendable: goes down when you redeem
const earned = () => S.lifetime ?? S.points ?? 0; // lifetime: only goes up, sets your level
const lvChip = () => { const l = level(); return `<button class="lv-chip" data-a="nav" data-x="rewards">Lv ${l.n} · ${l.name}<span>${wallet()} pts to spend</span></button>`; };
const ptsPair = () => `<div class="pts-pair"><div><b>${wallet()}</b><small>pts to spend</small><i>Redeeming uses these</i></div><div><b>${earned()}</b><small>earned in total</small><i>Sets your level · never goes down</i></div></div>`;

/* ------------------------------------------------------------ community */
const comments = (id) => [...(SEED_COMMENTS[id] || []), ...((S.myComments || {})[id] || []).map((t) => ['me', t])];
function postCard(p) {
  const a = p.anon ? { name: 'Anonymous member' } : who(p.author);
  const helped = S.helped.includes(p.id); const own = p.author === 'me';
  const conn = !own && !p.anon && isConn(p.author);
  return `<article class="post">
    <header>${p.anon ? '<span class="ph anon" style="width:36px;height:36px">?</span>' : `<button class="plain" data-a="nav" data-x="${own ? 'me' : 'person/' + p.author}">${av(a, 36)}</button>`}
      <div><b>${esc(a.name)}${conn ? ' <i class="conn-tag">Connection</i>' : ''}</b><small>${p.aud === 'circle' ? ICON.lock : ''}${esc(p.circle)} · ${p.ago}</small></div><i class="chip">${p.type}</i></header>
    <p>${esc(p.text)}</p>
    <footer><button class="help ${helped ? 'on' : ''}" data-a="helped" data-x="${p.id}" ${own ? 'disabled' : ''}>${ICON.spark}Helpful · ${p.helpful + (helped ? 1 : 0)}</button><button class="help" data-a="comments" data-x="${p.id}">${ICON.chat}${p.comments + ((S.myComments || {})[p.id] || []).length}</button></footer>
  </article>`;
}

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
  if (sub === 'Connections') body = conns.map((id) => `<button class="list-item" data-a="nav" data-x="person/${id}">${av(PEOPLE[id], 48)}<div class="grow"><h3>${PEOPLE[id].name}</h3><small>${esc(PEOPLE[id].headline)}</small></div>${ICON.chev}</button>`).join('')
    || '<div class="empty">No connections yet — tap devices at your next event, then follow each other.</div>';
  else body = (reqs.map((id) => `<div class="card-soft"><div style="display:flex;gap:14px;align-items:center">${av(PEOPLE[id], 48)}<div class="grow" style="flex:1"><h3 style="margin:0">${PEOPLE[id].name}</h3><small>${esc(PEOPLE[id].headline)}</small>${metAt(id) ? `<small>Met at ${esc(metAt(id))}</small>` : ''}</div></div>
      <p class="muted" style="margin:12px 0;font-size:14px">${PEOPLE[id].short} follows you. Follow back to connect.</p>
      <div style="display:flex;gap:10px"><button class="btn" style="height:42px" data-a="dismiss" data-x="${id}">Not now</button><button class="btn primary" style="height:42px" data-a="follow" data-x="${id}">Follow back</button></div></div>`).join('')
    || '<div class="empty">You’re all caught up. New follows from events will show up here.</div>')
    + (seen.length ? `<h3>Explore who else was there</h3>${seen.map((id) => person(id, followBtn(id))).join('')}` : '');
  const circles = circlesJoined();
  return `<div class="search">${ICON.search}<input data-model="nq" placeholder="Search connections" aria-label="Search connections" value="${esc(ui.nq || '')}"></div>
    <div class="seg2"><button class="${sub === 'Connections' ? 'on' : ''}" data-a="nsub" data-x="Connections">Connections</button><button class="${sub === 'Requests' ? 'on' : ''}" data-a="nsub" data-x="Requests">Requests${reqs.length ? `<i class="cnt">${reqs.length}</i>` : ''}</button></div>
    ${body}
    <h2 style="margin:28px 0 6px">Event Circles</h2>
    <p class="muted small" style="margin-bottom:14px">Members only — you join a circle by attending its events.</p>
    ${circles.map((c) => { const posts = allPosts().filter((p) => p.aud === 'circle' && p.circle === c).length; const evs = EVENTS.filter((e) => e.circle === c);
      const went = evs.some((e) => reg(e.id)?.status === 'attended');
      return `<button class="list-item" data-a="nav" data-x="circle/${encodeURIComponent(c)}"><div style="width:68px;height:68px;border-radius:12px;overflow:hidden;flex:0 0 auto">${art(seedOf(c), '', 'width:100%;height:100%')}</div><div class="grow"><h3>${esc(c)}</h3><small style="margin:4px 0">${evs.map((e) => e.date).join(' · ') || 'Circle'}</small><small style="color:var(--ac-tx);margin-bottom:6px">${posts} stories shared</small><i class="chip ${went ? 'chip-attended' : 'chip-going'}" style="margin:0">${went ? 'Past' : 'Member'}</i></div>${ICON.chev}</button>`; }).join('') || '<div class="empty">Attend an event to join your first circle.</div>'}`;
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

/* ------------------------------------------------------------ messages */
const CHAT_SEED = {
  priya: [['priya', 'The agent-eval checklist is pinned in the circle btw!'], ['me', 'Amazing, thank you 🙏']],
  sofia: [['sofia', 'Are you coming to the crit circle on Thursday?'], ['me', 'Yes! Wouldn’t miss it (:'], ['sofia', 'Awesome, bring one case study']],
  leo: [['leo', 'Thanks for the Figma tips yesterday!']]
};
const chats = () => { if (!S.chats) { S.chats = JSON.parse(JSON.stringify(CHAT_SEED)); S.unread = { leo: 1, sofia: 1 }; save(); } return S.chats; };
const unreadTotal = () => (S.profile ? Object.values(chats() && S.unread || {}).reduce((a, b) => a + b, 0) : 0);

V.messages = () => {
  if (!S.profile) return `<header class="top"><h1>Messages</h1></header><section class="pad"><div class="empty">Log in to message your connections.</div><div style="height:12px"></div><button class="btn primary" data-a="login-demo">Log in</button></section>`;
  const c = chats(); const ids = Object.keys(c).filter((id) => PEOPLE[id]);
  return `<header class="top"><div><h1>Messages</h1><p class="muted" style="margin-top:4px">Your chatbox</p></div></header>
    <section class="pad">
      ${ids.map((id) => { const m = c[id][c[id].length - 1]; return `<button class="list-item" data-a="nav" data-x="chat/${id}">${av(PEOPLE[id], 48)}<div class="grow"><h3>${PEOPLE[id].name}</h3><small style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m ? (m[0] === 'me' ? 'You: ' : '') + esc(m[1]) : 'Say hi 👋'}</small></div>${S.unread?.[id] ? `<i class="unread">${S.unread[id]}</i>` : ''}</button>`; }).join('') || '<div class="empty">No messages yet. Connect with someone to start chatting.</div>'}
      <p class="note">${ICON.lock} You can message people once you’re connected (you follow each other).</p>
      <div class="spacer"></div>
    </section>`;
};

V.chat = (id) => {
  const p = PEOPLE[id]; if (!p || !S.profile) return V.messages();
  const c = chats(); c[id] = c[id] || [];
  if (S.unread?.[id]) { S.unread[id] = 0; save(); }
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><button class="plain" data-a="nav" data-x="person/${id}" style="display:flex;gap:10px;align-items:center;justify-self:center">${av(p, 32)}<span style="text-align:left"><b>${p.name}</b><small style="color:var(--ac-tx)">${isConn(id) ? 'Connected' : 'Not connected'}</small></span></button><span></span></header>
    <section class="pad"><div class="bubbles">${c[id].map(([by, t]) => `<div class="bub ${by === 'me' ? 'me' : ''}">${esc(t)}</div>`).join('')}${ui.typing === id ? '<div class="bub small">typing…</div>' : ''}</div></section>
    ${isConn(id) ? `<div class="composer"><input data-model="msgText" id="msgIn" placeholder="Type a message..." aria-label="Message" value="${esc(ui.msgText || '')}"><button data-a="send-msg" data-x="${id}" aria-label="Send">${ICON.share}</button></div>`
    : `<div class="composer"><p class="muted small" style="flex:1">Follow each other to message ${p.short}.</p></div>`}`;
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
      <div class="namecard"><small>Your name card · No. 0001</small><b>${esc(p.name)}</b><small style="color:#bbb">${p.field} · Sydney, AU</small><small style="color:#bbb;margin-top:4px">${p.interests.map((t) => '#' + t).join(' ')}</small></div>
      <div class="lv-card" data-a="nav" data-x="rewards" role="button"><div><small>LEVEL ${l.n}</small><b>${l.name}</b></div><span>${wallet()} pts<small style="display:inline;margin-left:4px;color:#bbb;letter-spacing:0">to spend</small><button class="icon-btn help-btn sm" data-a="growth-help" aria-label="How growth works">${ICON.help}</button></span><div class="lvbar"><i style="width:${l.pct}%"></i></div><small>${earned()} earned in total · ${l.next ? `${l.next - earned()} to ${l.nextName}` : 'Top level'} · Redeeming never lowers your level</small></div>
      <div class="stats four">${[['connections', connections().length, 'connections'], ['followers', S.followers.length, 'followers'], ['following', S.following.length, 'following'], ['met', metIds.length, 'met']].map(([t, n, lbl]) => `<button data-a="people-tab" data-x="${t}"><b>${n}</b><small>${lbl}</small></button>`).join('')}</div>
      <button class="list-item" data-a="nav" data-x="messages"><span class="lead-ico">${ICON.chat}</span><div class="grow"><b>Messages</b><small>View your chatbox</small></div>${ICON.chev}</button>
      <h3>Career tools</h3>
      <button class="tool" data-a="nav" data-x="cv"><span class="tool-ico">${ICON.file}</span><span class="row-main"><b>AI CV review</b><small>${S.cvFree ?? 3} free this month${(S.credits || {}).cv ? ` · +${S.credits.cv} extra` : ''}</small></span>${ICON.chev}</button>
      <button class="tool" data-a="nav" data-x="mock"><span class="tool-ico">${ICON.people}</span><span class="row-main"><b>Mock interview with a person</b><small>${S.mockFree ?? 1} free session this month</small></span>${ICON.chev}</button>
      <h3>Your events</h3>
      <div class="pills">${[['upcoming', 'Upcoming'], ['pending', 'Requests'], ['past', 'Previous']].map(([k, lb]) => `<button class="pill ${ui.meSeg === k ? 'on' : ''}" data-a="me-seg" data-x="${k}">${lb}</button>`).join('')}</div>
      ${list.map(eventRow).join('') || '<p class="empty">Nothing here yet.</p>'}
      <h3>Two avatars</h3>
      <div class="two-av"><div>${av(p, 56)}<small>Profile photo<br>app & online events</small></div><div>${avatar(look.avatar, look.color, 56)}<small>EventBuddy avatar<br>chosen per in-person event</small></div></div>
      <h3>Privacy</h3>
      <ul class="checklist"><li>Public: name, photo, field, interests${p.fact ? ', fun fact' : ''}</li><li>Private: ${p.showStage ? 'email, CV' : 'career stage, email, CV'}</li></ul>
      <h3>EventBuddy</h3>
      <a class="row badge-link" href="./tappy/" target="_blank" rel="noopener">${ICON.badge}<span class="row-main"><b>Open the EventBuddy app</b><small>Install it on a second phone to act as the hardware</small></span>${ICON.chev}</a>
      <button class="link" data-a="logout">Log out</button>
      <button class="btn" style="margin-top:24px" data-a="reset">Reset demo data</button><p class="muted small center" style="margin-top:10px">Prototype for IDS · data stays in this browser only</p>
      <div class="spacer"></div>
    </section>`;
};

V.people = () => {
  const tab = ui.pplTab || 'connections';
  const metIds = [...new Set(S.encounters.map((x) => x.person))];
  const ids = { connections: connections(), followers: S.followers, following: S.following, met: metIds }[tab];
  const empty = { connections: 'When you and someone follow each other, you’re connected.', followers: 'No followers yet.', following: 'You’re not following anyone yet.', met: 'People you save at events show up here.' }[tab];
  return `<header class="bar"><button class="icon-btn" data-a="back">${ICON.back}</button><b>People</b><span></span></header>
    <section class="pad">
      <div class="tabs">${[['connections', 'Connections'], ['followers', 'Followers'], ['following', 'Following'], ['met', 'Met']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-a="people-tab" data-x="${k}">${l}</button>`).join('')}</div>
      ${tab === 'connections' ? `<p class="note">${ICON.info} A connection is a mutual follow.</p>` : ''}
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
      ${S.profile ? `<div style="display:grid;gap:8px">${followBtn(id, false)}${isConn(id) ? `<button class="btn primary" data-a="nav" data-x="chat/${id}">${ICON.chat}Message</button>` : ''}</div>` : ''}
      ${S.followers.includes(id) && !S.following.includes(id) ? `<p class="note">${ICON.info} ${p.short} follows you. Follow back to connect.</p>` : ''}
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
      ${p.id === 'me' ? '<p class="note">This is how you appear on the wall.</p>' : noBadge ? `<button class="btn primary" data-a="hi-request" data-x="${p.id}">Send a hi request</button>` : `<p class="note">${ICON.badge} Look for this avatar on a EventBuddy and say hi. Tap devices if you both want a conversation prompt.</p>`}`;
  }
  if (s.type === 'match') {
    const p = PEOPLE[s.id];
    const online = S.live?.online;
    inner = `<div class="duo">${online ? av(me(), 64) + av(p, 64) : asc({ ...me(), ...badgeLook(S.live?.eventId) }, 64) + asc(p, 64)}</div><small class="eyebrow">You both said yes · ${esc(s.tag)}</small><h2 class="prompt">${esc(s.prompt)}</h2>
      <button class="btn" data-a="toast" data-x="Opens a 5-minute video room (mocked)">Open 5-min chat room</button>
      <button class="btn primary" data-a="save-enc" data-x="${p.id}">Save encounter</button><button class="link" data-a="sheet-close">Skip</button>`;
  }
  if (s.type === 'incoming') {
    const p = PEOPLE[s.id];
    inner = `${av(p, 80)}<h2>${p.short} waved at you</h2><p class="muted">${esc(p.headline)}</p><p class="note">${ICON.lock} If you ignore it, ${p.short} won’t be told.</p>
      <button class="btn primary" data-a="accept-wave" data-x="${p.id}">Wave back</button><button class="link" data-a="sheet-close">Ignore quietly</button>`;
  }
  if (s.type === 'comments') {
    const p = allPosts().find((x) => x.id === s.id); const cs = comments(s.id);
    inner = `<h2 class="sheet-title">Comments · ${p.comments + ((S.myComments || {})[s.id] || []).length}</h2>
      <div class="clist">${cs.map(([a, t]) => { const u = who(a); return `<div class="cmt">${av(u, 30)}<div><b>${esc(u.name)}</b><p>${esc(t)}</p></div></div>`; }).join('') || '<p class="muted small">Be the first to reply.</p>'}${p.comments > cs.length ? `<p class="muted small">+ ${p.comments - cs.length} earlier comments</p>` : ''}</div>
      <div class="cinput"><input class="field" data-model="commentText" placeholder="Add a helpful reply… (+3 pts)" value="${esc(ui.commentText || '')}"><button class="btn small primary" data-a="send-comment" data-x="${s.id}">Send</button></div>`;
  }
  return `<div class="scrim" data-a="sheet-close"></div><div class="sheet ${s.type === 'comments' ? 'left' : ''}"><i class="grab"></i>${inner}</div>`;
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
    off: 'No EventBuddy assigned. Collect one at check-in.', unpaired: 'Assigned but not paired. Pair it from the phone.', pairing: 'Press ● to confirm the code matches the phone.',
    idle: 'Showing your public avatar. Tap devices with someone nearby.', request: 'The other EventBuddy asked to talk. Press ● if you want to.', waiting: 'Waiting for the other person to press ●.',
    declined: 'They chose “not now”. No info exchanged.', prompt: 'Shared prompt shown on both devices. ● saves the encounter to your app.', saved: 'Encounter synced to the app.', returned: 'EventBuddy unpaired and wiped.'
  }[S.badge.screen];
  return `<div class="bp-head"><b>EventBuddy</b><small>Simulated hardware · ESP32 + NFC + 240×240 screen · <a href="./tappy/" target="_blank" rel="noopener">open as separate app ↗</a></small><button class="icon-btn bp-close" data-a="badge-close">${ICON.close}</button></div>
    <div class="device ${hasBadge ? '' : 'dim'}">
      <div class="nfc">NFC</div>
      <div class="screen">${online ? '<div class="bs off"><small>Online events</small><b>No EventBuddy</b></div>' : badgeScreen()}</div>
      <div class="hw-btns"><button class="hw a" data-a="hw" data-x="A" aria-label="Yes button">●</button><button class="hw b" data-a="hw" data-x="B" aria-label="No button">○</button></div>
      <small class="dev-id">${BADGE_ID}</small>
    </div>
    <p class="bp-hint">${online ? 'Online events use waves in the app instead.' : hint}</p>
    ${idle && nearby ? `<div class="bp-demo"><small>DEMO · tap devices with someone nearby</small>${nearby.slice(0, 3).map((p) => `<button data-a="tap" data-x="${p.id}">${avatar(p.avatar, p.color, 28)}${p.short}${p.responds === 'later' ? ' <i>(will say not now)</i>' : ''}</button>`).join('')}</div>` : ''}`;
}

function setBadge(screen, extra = {}) { S.badge = { ...S.badge, ...extra, screen }; save(); render(); }
let badgeTimer;
function badgeLater(ms, fn) { clearTimeout(badgeTimer); badgeTimer = setTimeout(fn, ms); }

function hw(btn) {
  const b = S.badge; const L = S.live;
  if (b.screen === 'pairing') {
    if (btn === 'A') { L.paired = true; L.pairing = false; setBadge('idle'); toast('EventBuddy paired ✓'); }
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

/* ------------------------------------------------ camera scan (demo)
   Opens the real rear camera as a viewfinder; “detects” the EventBuddy after ~2 s.
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
  'badge-save': (id) => { const d = ui.regDraft; S.regs[id].badge = { avatar: d.avatar, color: d.color, tag: d.tag }; S.lastBadge = S.regs[id].badge; save(); toast('EventBuddy updated'); history.back(); },
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
    S.regs[id] = { status: e.approval ? 'pending' : 'going', list: d.list !== false, wall: d.wall !== false };
    if (e.badges) { S.regs[id].badge = { avatar: d.avatar, color: d.color, tag: d.tag }; S.lastBadge = S.regs[id].badge; }
    save(); toast(e.approval ? 'Request sent' : 'You’re in ✓');
    history.replaceState(null, '', '#/ticket/' + id); render();
  },
  approve: (id) => { S.regs[id].status = 'going'; save(); toast('🎉 Approved — address unlocked'); render(); },
  decline: (id) => { S.regs[id].status = 'declined'; save(); render(); },
  cancel: (id) => { if (confirm('Cancel? Your spot goes to the next person.')) { delete S.regs[id]; save(); toast('Cancelled'); go('event/' + id); } },
  checkin: (id) => { S.regs[id].status = 'checkedin'; S.live = { eventId: id }; save(); earn(20, 'Checked in at an event'); render(); },
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
  'pair-confirm': () => { S.live.paired = true; S.live.pairing = false; setBadge('idle'); toast('EventBuddy paired ✓'); },
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
    S.live.returned = true; setBadge('returned'); toast('EventBuddy returned ✓');
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
    if (!S.profile) { go('onboarding'); return; }
    const p = PEOPLE[x]; const was = S.following.includes(x);
    if (was) { if (isConn(x) && !confirm(`Remove ${p.short} as a connection? You’ll stop following them.`)) return; S.following = S.following.filter((y) => y !== x); save(); toast(`Unfollowed ${p.short}`); render(); return; }
    S.following = [...S.following, x]; save();
    if (isConn(x)) { earn(5, `New connection · ${p.short}`, true); toast(`🤝 You and ${p.short} are now connected · +5 pts`); }
    else {
      toast(`Following ${p.short}. You’ll connect if they follow back.`);
      if (FOLLOWS_BACK.includes(x)) setTimeout(() => { if (!S.following.includes(x) || S.followers.includes(x)) return; S.followers = [...S.followers, x]; earn(5, `New connection · ${p.short}`, true); render(); toast(`🤝 ${p.short} followed you back — you’re connected · +5 pts`); }, 3000);
    }
    render();
  },
  'people-tab': (x) => { ui.pplTab = x; if (!location.hash.startsWith('#/people')) go('people'); else render(); },
  'growth-help': () => { ui.growthHelp = true; render(); },
  'growth-help-close': () => { ui.growthHelp = false; render(); },
  circle: (x) => { ui.circle = x || null; render(); },
  cmode: (x) => { ui.cmode = x; render(); },
  nsub: (x) => { ui.nsub = x; render(); },
  ctab: (x) => { ui.ctab = x; render(); },
  dismiss: (x) => { S.dismissed = [...(S.dismissed || []), x]; save(); toast('Request removed'); render(); },
  'send-msg': (x) => {
    const t = (ui.msgText || '').trim(); if (!t) return;
    chats()[x].push(['me', t]); ui.msgText = ''; ui.typing = x; save(); render(); scrollEnd();
    setTimeout(() => { const r = ['Haha yes!', 'Sounds good (:', 'Totally agree', 'Let me check and get back to you', 'See you there!']; chats()[x].push([x, r[Math.floor(Math.random() * r.length)]]); ui.typing = null; save(); if (location.hash === '#/chat/' + x) { render(); scrollEnd(); } }, 1400);
  },
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
  reset: () => { if (confirm('Reset all demo data?')) { localStorage.removeItem(KEY); S = fresh(); Object.assign(ui, { sheet: null, ob: null, compose: null, waved: {}, pairInput: '' }); go('home'); render(); } }
};

/* =============================================================== RENDER */
const NO_NAV = ['welcome', 'onboarding', 'register', 'badgeedit', 'ticket', 'checkin', 'pair', 'live', 'leave', 'lobby', 'room', 'compose', 'rewards', 'people', 'person', 'cv', 'mock', 'event', 'recap', 'circle', 'chat'];
const TABS = [['home', 'Event', 'var(--t-event)'], ['community', 'Community', 'var(--t-comm)'], ['messages', 'Messages', 'var(--t-msg)'], ['me', 'Account', 'var(--t-acc)']];
const scrollEnd = () => { const a = $('#app'); a.scrollTop = a.scrollHeight; };

function route() {
  const [name = '', arg] = location.hash.replace(/^#\/?/, '').split('/');
  if (!name || name === 'welcome') return ['home'];
  return [V[name] ? name : 'notfound', arg];
}

function render() {
  const [name, arg] = route();
  const app = $('#app');
  const prev = app.dataset.view;
  app.innerHTML = V[name](arg) + sheetHTML() + (ui.growthHelp ? growthHelp() : '') + scannerHTML();
  attachScan();
  app.dataset.view = name + '/' + (arg || '');
  if (prev !== app.dataset.view) app.scrollTop = 0;
  const showNav = !NO_NAV.includes(name);
  $('#nav').hidden = !showNav;
  const un = unreadTotal();
  $('#nav').innerHTML = TABS.map(([k, l, c]) => `<button class="${name === k || (k === 'home' && name === 'events') ? 'on' : ''}" data-a="nav" data-x="${k}" style="color:${c}" aria-label="${l}">${TAB_ICON[k]}<span>${l}</span>${k === 'messages' && un ? `<i class="cnt">${un}</i>` : ''}</button>`).join('');
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
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'msgIn') { e.preventDefault(); $('[data-a="send-msg"]')?.click(); } });
document.addEventListener('input', (e) => {
  const m = e.target.dataset.model; if (!m) return;
  const v = e.target.value;
  if (m === 'q') { ui.q = v; $('#event-list').innerHTML = eventListHTML(); return; }
  if (m === 'pairInput') { ui.pairInput = v; return; }
  if (m === 'commentText') { ui.commentText = v; return; }
  if (m === 'msgText') { ui.msgText = v; return; }
  if (m === 'cq' || m === 'nq') { ui[m] = v; const pos = e.target.selectionStart; const top = $('#app').scrollTop; render(); $('#app').scrollTop = top; const n = document.querySelector(`[data-model="${m}"]`); n.focus(); n.setSelectionRange(pos, pos); return; }
  const [obj, key] = m.split('.');
  ui[obj][key] = v;
  if (obj === 'ob') { const btn = $('[data-a="ob-next"]'); const o = ui.ob; if (btn && o.step === 0) btn.disabled = !(o.name.trim() && o.field && o.stage); }
});
window.addEventListener('hashchange', render);
setInterval(tickBadge, 650);

// Deep-link helpers for design capture: ?demo=1 logs in the demo account, ?theme=light|dark forces a theme.
{
  const q = new URLSearchParams(location.search);
  if (q.get('theme')) { localStorage.setItem(THEME_KEY, q.get('theme')); applyTheme(); }
  if (q.get('demo') && !S.onboarded) { S.profile = { ...DEFAULT_PROFILE }; S.onboarded = true; seedAccount(140); save(); }
}
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});
