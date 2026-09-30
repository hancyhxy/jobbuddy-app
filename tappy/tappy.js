// JobBuddy EventBuddy — standalone simulated hardware app.
// Shares localStorage with the phone app (same origin), so two windows in one browser stay in sync.
// On a separate device it runs on its own; the operator menu (⋯) stands in for signals from the phone/staff.
import { PEOPLE, PROMPTS, AVATAR_CHOICES, AVATAR_COLORS } from '../js/data.js';
import { avatar } from '../js/avatar.js';

const KEY = 'jobbuddy-proto-v1';
const BADGE_ID = 'EB-07';
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
  if (sheet === 'nfc') inner = `<b>Touch EventBuddy devices with…</b><small>Simulates holding this EventBuddy against another attendee’s badge.</small>
    ${PARTNERS.map((id) => { const p = PEOPLE[id]; return `<button class="opt" data-a="tap" data-x="${id}">${avatar(p.avatar, p.color, 32)}<span>${p.name}${p.responds === 'later' ? '<i>will say “not now”</i>' : ''}</span></button>`; }).join('')}`;
  if (sheet === 'op') {
    const hasProfile = !!S.profile;
    inner = `<b>Operator</b><small>Stands in for the phone and staff while the devices aren’t linked.</small>
      <button class="opt" data-a="assign">1 · Staff assigns EventBuddy ${BADGE_ID}</button>
      <button class="opt" data-a="pair-req">2 · Phone sends pair request</button>
      <button class="opt" data-a="return">3 · Staff confirms return (wipe)</button>
      <button class="opt" data-a="reset">Reset EventBuddy</button>
      <button class="opt" data-a="to-script">▶ Presentation mode (scripted)</button>
      <small class="lbl">SHOWN ON BADGE</small>
      <div class="owners">${[hasProfile ? ['me', S.profile.name.split(' ')[0]] : null, ['demo', 'Xinyi (demo)'], ...['leo', 'marcus', 'sofia'].map((id) => [id, PEOPLE[id].short])].filter(Boolean)
        .map(([id, l]) => `<button class="pill ${(S.badge.owner || (hasProfile ? 'me' : 'demo')) === id ? 'on' : ''}" data-a="owner" data-x="${id}">${l}</button>`).join('')}</div>`;
  }
  return `<div class="scrim" data-a="close"></div><div class="sheet">${inner}</div>`;
}

const HINT = {
  off: 'Not assigned. Open ⋯ → Staff assigns badge.', unpaired: 'Waiting for the phone to pair.', pairing: 'Press ● if the code matches the phone.',
  idle: 'Tap the NFC strip to touch EventBuddy devices with someone.', request: '● to talk · ○ not now', waiting: 'Waiting for the other EventBuddy…',
  declined: 'No info was exchanged.', prompt: '● save to app · ○ skip', saved: 'Encounter synced to the app.', returned: 'Unpaired and wiped.'
};

function render() {
  if (mode === 'script') return renderScript();
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
  hw: (x) => (mode === 'script' ? scriptHW(x) : hw(x)),
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


/* ================================================================ PRESENTATION MODE
   A scripted walkthrough for two-phone demos without real networking.
   The presenter advances with Next (or the ● button / NFC strip where it makes sense). */

const MODE_KEY = 'tappy-mode'; const STEP_KEY = 'tappy-step'; const LOOK_KEY = 'tappy-look'; const NOTES_KEY = 'tappy-notes';
let mode = localStorage.getItem(MODE_KEY) || 'script';
let step = +(localStorage.getItem(STEP_KEY) || 0);
let notes = localStorage.getItem(NOTES_KEY) !== 'off';
let look = (() => { try { return { name: 'Xinyi', avatar: 'female_2_1', color: '#D7FF3A', tag: 'AI tools', ...JSON.parse(localStorage.getItem(LOOK_KEY)) }; } catch { return { name: 'Xinyi', avatar: 'female_2_1', color: '#D7FF3A', tag: 'AI tools' }; } })();
let flash = null; // temporary screen (e.g. "Maybe later")
const MARCUS = PEOPLE.marcus;
const TAGS = ['AI tools', 'UX', 'Portfolio', 'Interviews', 'Career change', 'Data viz'];

function qrSVG(seed) {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  let cells = '';
  for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) {
    const f = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17);
    let on;
    if (f) { const fx = x > 17 ? x - 18 : x, fy = y > 17 ? y - 18 : y; on = fx === 0 || fy === 0 || fx === 6 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5); }
    else if ((x === 7 || y === 7 || x === 17 || y === 17) && (x < 8 || x > 16) && (y < 8 || y > 16)) on = false;
    else { h = (h * 1103515245 + 12345) >>> 0; on = (h >> 16) & 1; }
    if (on) cells += `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`;
  }
  return `<svg viewBox="-2 -2 29 29" shape-rendering="crispEdges" class="t-qr"><rect x="-2" y="-2" width="29" height="29" fill="#fff"/><g fill="#000">${cells}</g></svg>`;
}

const PROMPT_TEXT = () => (MARCUS.interests.includes(look.tag) ? `You both picked “${look.tag}”. What got you into it?` : 'One of you is further along. What do you wish you knew a year ago?');

const STEPS = [
  { title: 'Ready at the desk', screen: () => `<div class="bs off"><small>JobBuddy</small><b>${BADGE_ID}</b><small>Ready for the next attendee</small></div>`,
    note: 'On the phone: open the event → “I’m here — check in” → DEMO Staff scans your pass → DEMO Staff hands you EventBuddy EB-07.' },
  { title: 'Scan to pair', screen: () => `<div class="bs qr-screen">${qrSVG(BADGE_ID)}<small>SCAN WITH JOBBUDDY · ${BADGE_ID}</small></div>`,
    note: 'On the phone: “Pair EventBuddy” → “Tap to scan”, then point the camera at this QR.' },
  { title: 'Confirm the code', a: 'next', screen: () => `<div class="bs"><small>PAIR WITH</small><b>${esc(look.name)}?</b><div class="bcode">${PAIR_CODE}</div><small>● yes · ○ no</small></div>`,
    note: 'Phone shows 4812 too. Press ● here, then tap “EventBuddy shows ✓ — continue” on the phone.' },
  { title: 'Paired', screen: () => `<div class="bs"><b class="huge">✓</b><b>Hi ${esc(look.name)}</b><small>EventBuddy is yours tonight</small></div>`,
    note: 'On the phone: “Back to event”. Put the phone away — EventBuddy does the rest.' },
  { title: 'Your avatar', nfc: true, screen: () => `<div class="bs idle"><div class="badge-av">${avatar(look.avatar, look.color, 118, frame)}</div><b>${esc(look.name)}</b><small>#${esc(look.tag)}</small></div>`,
    note: 'Walk up to someone. Hold two EventBuddy devices together: tap the NFC strip (or Next).' },
  { title: 'Tap: talk?', a: 'next', b: 'decline', screen: () => `<div class="bs">${avatar(MARCUS.avatar, MARCUS.color, 64)}<small>TALK WITH</small><b>${MARCUS.short}?</b><small>● yes · ○ not now</small></div>`,
    note: 'A tap only asks. Press ● for yes (○ shows the quiet “not now” path).' },
  { title: 'Waiting', auto: 1600, screen: () => `<div class="bs">${avatar(MARCUS.avatar, MARCUS.color, 64)}<small>Waiting for</small><b>${MARCUS.short}…</b></div>`,
    note: 'Both people have to say yes. Nothing is shared until then.' },
  { title: 'Shared prompt', a: 'next', b: 'skip', screen: () => `<div class="bs prompt"><small>YOU + ${MARCUS.short.toUpperCase()}</small><p>${esc(PROMPT_TEXT())}</p><small>● save · ○ skip</small></div>`,
    note: 'Both EventBuddy devices show the same prompt. Talk! Press ● to save the encounter.' },
  { title: 'Saved', screen: () => `<div class="bs"><b class="huge">✓</b><b>Saved</b><small>Find ${MARCUS.short} in your app</small></div>`,
    note: 'On the phone: Live → Saved → DEMO “EventBuddy on another device saved Marcus”. Then Follow him after the event.' },
  { title: 'Return', screen: () => `<div class="bs"><small>LEAVING?</small><b>Return me<br>at the desk</b><small>Your encounters are<br>already in the app</small></div>`,
    note: 'On the phone: “Leaving? Return EventBuddy” → DEMO Staff confirms return.' },
  { title: 'Wiped', screen: () => `<div class="bs off"><b>Thanks!</b><small>Data cleared.<br>Ready for the next person.</small></div>`,
    note: 'EventBuddy is unpaired and wiped. The phone shows the recap. Next restarts the demo.' }
];

function setStep(i) {
  step = (i + STEPS.length) % STEPS.length; flash = null;
  localStorage.setItem(STEP_KEY, step); clearTimeout(timer);
  navigator.vibrate?.(12);
  const s = STEPS[step];
  if (s.auto) timer = setTimeout(() => setStep(step + 1), s.auto);
  render();
}

function scriptHW(btn) {
  const s = STEPS[step];
  if (btn === 'A' && s.a === 'next') return setStep(step + 1);
  if (btn === 'B' && s.b === 'decline') { flash = `<div class="bs"><b>Maybe later</b><small>Nothing was shared.</small></div>`; render(); clearTimeout(timer); timer = setTimeout(() => setStep(4), 2200); return; }
  if (btn === 'B' && s.b === 'skip') return setStep(4);
  navigator.vibrate?.(8);
}

function scriptSheet() {
  return `<b>Presentation mode</b><small>Scripted EventBuddy for two-phone demos. No connection to the other phone is needed.</small>
    <button class="opt" data-a="s-restart">↺ Restart from step 1</button>
    <button class="opt" data-a="s-notes">${notes ? 'Hide' : 'Show'} presenter notes</button>
    <small class="lbl">NAME ON TAPPY</small>
    <input class="field" data-look="name" value="${esc(look.name)}" maxlength="14">
    <small class="lbl">AVATAR (match what you picked when registering)</small>
    <div class="look-grid">${AVATAR_CHOICES.map((k) => `<button class="${look.avatar === k ? 'on' : ''}" data-a="s-look" data-x="avatar|${k}">${avatar(k, look.color, 44)}</button>`).join('')}</div>
    <div class="owners">${AVATAR_COLORS.map((c) => `<button class="sw ${look.color === c ? 'on' : ''}" style="background:${c}" data-a="s-look" data-x="color|${c}"></button>`).join('')}</div>
    <small class="lbl">TAG</small>
    <div class="owners">${TAGS.map((t) => `<button class="pill ${look.tag === t ? 'on' : ''}" data-a="s-look" data-x="tag|${t}">#${t}</button>`).join('')}</div>
    <button class="opt" data-a="s-mode">Switch to free play (manual operator)</button>`;
}

function renderScript() {
  const s = STEPS[step];
  document.getElementById('root').innerHTML = `
    <header class="b-top"><span class="dev">${BADGE_ID}</span><span class="state on">${step + 1}/${STEPS.length} · ${s.title}</span><button class="op" data-a="op" aria-label="Menu">⋯</button></header>
    <button class="nfc-pad" data-a="s-nfc" ${s.nfc ? '' : 'disabled'}><span>NFC</span></button>
    <div class="screen-wrap"><div class="screen">${flash || s.screen()}</div></div>
    <div class="hw-row"><button class="hw a" data-a="hw" data-x="A" aria-label="Yes">●</button><button class="hw b" data-a="hw" data-x="B" aria-label="No">○</button></div>
    ${notes ? `<p class="presenter"><b>PRESENTER</b>${s.note}</p>` : '<p class="presenter"></p>'}
    <div class="player"><button data-a="s-prev" aria-label="Previous">◀</button><div class="dots">${STEPS.map((_, i) => `<i class="${i === step ? 'on' : i < step ? 'done' : ''}"></i>`).join('')}</div><button class="next" data-a="s-next">Next ▶</button></div>
    ${sheet ? `<div class="scrim" data-a="close"></div><div class="sheet">${sheet === 'op' ? scriptSheet() : ''}</div>` : ''}`;
  fit();
}

Object.assign(A, {
  's-next': () => setStep(step + 1),
  's-prev': () => setStep(step - 1),
  's-nfc': () => { navigator.vibrate?.([20, 40, 20]); setStep(step + 1); },
  's-restart': () => { sheet = null; setStep(0); },
  's-notes': () => { notes = !notes; localStorage.setItem(NOTES_KEY, notes ? 'on' : 'off'); sheet = null; render(); },
  's-look': (x) => { const [k, v] = x.split('|'); look[k] = v; localStorage.setItem(LOOK_KEY, JSON.stringify(look)); render(); },
  's-mode': () => { mode = 'free'; localStorage.setItem(MODE_KEY, mode); sheet = null; render(); },
  'to-script': () => { mode = 'script'; localStorage.setItem(MODE_KEY, mode); sheet = null; render(); }
});
document.addEventListener('input', (e) => { if (e.target.dataset.look) { look[e.target.dataset.look] = e.target.value || 'Xinyi'; localStorage.setItem(LOOK_KEY, JSON.stringify(look)); } });
document.addEventListener('click', () => { if (!window.__wake && navigator.wakeLock) { window.__wake = true; navigator.wakeLock.request('screen').catch(() => { window.__wake = false; }); } }, { capture: true });

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  A[el.dataset.a]?.(el.dataset.x);
});
window.addEventListener('resize', fit);
setInterval(() => {
  frame++;
  const el = document.querySelector('.badge-av');
  if (el && mode === 'script') { el.innerHTML = avatar(look.avatar, look.color, 118, frame); return; }
  if (el && S.badge.screen === 'idle') { const o = owner(); el.innerHTML = avatar(o.avatar, o.color, 118, frame); }
}, 650);
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('../sw.js').catch(() => {});
