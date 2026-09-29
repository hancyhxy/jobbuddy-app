// JobBuddy Tappy — standalone simulated hardware app.
// Shares localStorage with the phone app (same origin), so two windows in one browser stay in sync.
// On a separate device it runs on its own; the operator menu (⋯) stands in for signals from the phone/staff.
import { PEOPLE, PROMPTS } from '../js/data.js';
import { avatar } from '../js/avatar.js';

const KEY = 'jobbuddy-proto-v1';
const BADGE_ID = 'JB-07';
const PAIR_CODE = '4812';
const EVENT_ID = 'build-night';
const DEMO_OWNER = { id: 'demo', name: 'Xinyi', short: 'Xinyi', field: 'Design', interests: ['AI tools', 'UX'], avatar: 'female_2_1', color: '#D7FF3A' };
const PARTNERS = ['marcus', 'david', 'priya', 'sofia', 'ahmed'];

let S = load();
let sheet = null; let frame = 0; let timer;

function load() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { /* empty */ }
  return { regs: {}, encounters: [], badge: { screen: 'off' }, live: null, ...s };
}
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
function set(screen, extra = {}) { S.badge = { ...S.badge, ...extra, screen }; save(); render(); }
function later(ms, fn) { clearTimeout(timer); timer = setTimeout(fn, ms); }
window.addEventListener('storage', (e) => { if (e.key === KEY) { S = load(); render(); } });

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function owner() {
  const o = S.badge.owner;
  if (o && PEOPLE[o]) return PEOPLE[o];
  if (o !== 'demo' && S.profile) {
    const b = S.regs?.[S.live?.eventId]?.badge || S.lastBadge || {};
    return { ...S.profile, short: S.profile.name.split(' ')[0], avatar: b.avatar || S.profile.avatar, color: b.color || S.profile.color, interests: [b.tag || S.profile.interests[0], ...S.profile.interests] };
  }
  return DEMO_OWNER;
}

function prompt(p) {
  const mine = owner().interests || [];
  const tag = p.interests.find((t) => mine.includes(t));
  const list = tag ? PROMPTS.shared(tag) : PROMPTS.offer;
  return { tag: tag || 'Career stories', text: list[Math.floor(Math.random() * list.length)] };
}

/* ------------------------------------------------------------ screens */
function screen() {
  const b = S.badge; const o = owner(); const p = b.partner && PEOPLE[b.partner];
  switch (b.screen) {
    case 'unpaired': return `<div class="bs"><small>BADGE</small><b class="huge">${BADGE_ID}</b><small>Open JobBuddy<br>to pair</small></div>`;
    case 'pairing': return `<div class="bs"><small>PAIR WITH</small><b>${esc(o.short)}?</b><div class="bcode">${PAIR_CODE}</div><small>● yes · ○ no</small></div>`;
    case 'idle': return `<div class="bs idle"><div class="badge-av">${avatar(o.avatar, o.color, 118, frame)}</div><b>${esc(o.short)}</b><small>#${esc(o.interests?.[0] || o.field)}</small></div>`;
    case 'request': return `<div class="bs">${avatar(p.avatar, p.color, 64)}<small>TALK WITH</small><b>${p.short}?</b><small>● yes · ○ not now</small></div>`;
    case 'waiting': return `<div class="bs">${avatar(p.avatar, p.color, 64)}<small>Waiting for</small><b>${p.short}…</b></div>`;
    case 'declined': return `<div class="bs"><b>Maybe later</b><small>Nothing was shared.</small></div>`;
    case 'prompt': return `<div class="bs prompt"><small>YOU + ${p.short.toUpperCase()} · #${esc(b.tag)}</small><p>${esc(b.prompt)}</p><small>● save · ○ skip</small></div>`;
    case 'saved': return `<div class="bs"><b class="huge">✓</b><b>Saved</b><small>Find ${p.short} in your app</small></div>`;
    case 'returned': return `<div class="bs off"><b>Thanks!</b><small>Data cleared.<br>Ready for next person.</small></div>`;
    default: return `<div class="bs off"><small>JobBuddy</small><b>${BADGE_ID}</b><small>Not assigned</small></div>`;
  }
}

function sheetHTML() {
  if (!sheet) return '';
  let inner = '';
  if (sheet === 'nfc') inner = `<b>Touch Tappys with…</b><small>Simulates holding this Tappy against another attendee’s badge.</small>
    ${PARTNERS.map((id) => { const p = PEOPLE[id]; return `<button class="opt" data-a="tap" data-x="${id}">${avatar(p.avatar, p.color, 32)}<span>${p.name}${p.responds === 'later' ? '<i>will say “not now”</i>' : ''}</span></button>`; }).join('')}`;
  if (sheet === 'op') {
    const hasProfile = !!S.profile;
    inner = `<b>Operator</b><small>Stands in for the phone and staff while the devices aren’t linked.</small>
      <button class="opt" data-a="assign">1 · Staff assigns Tappy ${BADGE_ID}</button>
      <button class="opt" data-a="pair-req">2 · Phone sends pair request</button>
      <button class="opt" data-a="return">3 · Staff confirms return (wipe)</button>
      <button class="opt" data-a="reset">Reset Tappy</button>
      <small class="lbl">SHOWN ON BADGE</small>
      <div class="owners">${[hasProfile ? ['me', S.profile.name.split(' ')[0]] : null, ['demo', 'Xinyi (demo)'], ...['leo', 'marcus', 'sofia'].map((id) => [id, PEOPLE[id].short])].filter(Boolean)
        .map(([id, l]) => `<button class="pill ${(S.badge.owner || (hasProfile ? 'me' : 'demo')) === id ? 'on' : ''}" data-a="owner" data-x="${id}">${l}</button>`).join('')}</div>`;
  }
  return `<div class="scrim" data-a="close"></div><div class="sheet">${inner}</div>`;
}

const HINT = {
  off: 'Not assigned. Open ⋯ → Staff assigns badge.', unpaired: 'Waiting for the phone to pair.', pairing: 'Press ● if the code matches the phone.',
  idle: 'Tap the NFC strip to touch Tappys with someone.', request: '● to talk · ○ not now', waiting: 'Waiting for the other Tappy…',
  declined: 'No info was exchanged.', prompt: '● save to app · ○ skip', saved: 'Encounter synced to the app.', returned: 'Unpaired and wiped.'
};

function render() {
  const s = S.badge.screen || 'off';
  document.getElementById('root').innerHTML = `
    <header class="b-top"><span class="dev">${BADGE_ID}</span><span class="state ${S.live?.paired ? 'on' : ''}">${S.live?.paired ? '● paired' : S.live?.badgeId ? '○ not paired' : '○ idle'}</span><button class="op" data-a="op" aria-label="Operator menu">⋯</button></header>
    <button class="nfc-pad" data-a="nfc" ${s === 'idle' ? '' : 'disabled'}><span>NFC</span></button>
    <div class="screen-wrap"><div class="screen">${screen()}</div></div>
    <div class="hw-row"><button class="hw a" data-a="hw" data-x="A" aria-label="Yes">●</button><button class="hw b" data-a="hw" data-x="B" aria-label="No">○</button></div>
    <p class="b-hint">${HINT[s] || ''}</p>
    ${sheetHTML()}`;
  fit();
}

function fit() {
  const k = Math.min(window.innerWidth * 0.86, window.innerHeight * 0.48, 480) / 228;
  document.documentElement.style.setProperty('--k', k.toFixed(3));
}

/* ------------------------------------------------------------- actions */
function hw(btn) {
  navigator.vibrate?.(15);
  const b = S.badge;
  if (b.screen === 'pairing') {
    if (btn === 'A') { S.live = { ...(S.live || { eventId: EVENT_ID, badgeId: BADGE_ID }), paired: true, pairing: false }; set('idle'); }
    else { if (S.live) S.live.pairing = false; set('unpaired'); }
  } else if (b.screen === 'request') {
    if (btn === 'B') return set('idle', { partner: null });
    set('waiting');
    const p = PEOPLE[b.partner];
    later(1400, () => {
      if (p.responds === 'later') { set('declined'); later(2400, () => set('idle', { partner: null })); }
      else { const pr = prompt(p); set('prompt', { prompt: pr.text, tag: pr.tag }); }
    });
  } else if (b.screen === 'prompt') {
    if (btn === 'B') return set('idle', { partner: null });
    const eventId = S.live?.eventId || EVENT_ID;
    if (!S.encounters.some((x) => x.person === b.partner && x.eventId === eventId)) S.encounters.push({ id: 'x' + Date.now(), person: b.partner, eventId, prompt: b.prompt, via: 'tappy', at: Date.now() });
    set('saved');
    later(2200, () => set('idle', { partner: null }));
  }
}

const A = {
  hw,
  nfc: () => { sheet = 'nfc'; render(); },
  tap: (x) => { sheet = null; navigator.vibrate?.([20, 40, 20]); set('request', { partner: x }); },
  op: () => { sheet = 'op'; render(); },
  close: () => { sheet = null; render(); },
  assign: () => { sheet = null; S.live = { eventId: EVENT_ID, badgeId: BADGE_ID }; set('unpaired'); },
  'pair-req': () => { sheet = null; S.live = { ...(S.live || { eventId: EVENT_ID, badgeId: BADGE_ID }), pairing: true }; set('pairing'); },
  return: () => { sheet = null; if (S.live) S.live.returned = true; set('returned'); later(2600, () => set('off')); },
  reset: () => { sheet = null; if (S.live?.badgeId) S.live = null; set('off', { partner: null }); },
  owner: (x) => { S.badge.owner = x === 'me' ? null : x; save(); render(); }
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  A[el.dataset.a]?.(el.dataset.x);
});
window.addEventListener('resize', fit);
setInterval(() => {
  frame++;
  const el = document.querySelector('.badge-av');
  if (el && S.badge.screen === 'idle') { const o = owner(); el.innerHTML = avatar(o.avatar, o.color, 118, frame); }
}, 650);
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('../sw.js').catch(() => {});
