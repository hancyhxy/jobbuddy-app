// JobBuddy Tappy — standalone simulated hardware app.
// Shares localStorage with the phone app (same origin), so two windows in one browser stay in sync.
// On a separate device it runs on its own; the operator menu (⋯) stands in for signals from the phone/staff.
import { PEOPLE, ICEBREAKERS, AVATAR_CHOICES, AVATAR_COLORS } from '../js/data.js';
import { avatar } from '../js/avatar.js';

const KEY = 'jobbuddy-proto-v1';
const BADGE_ID = 'TP-07';
const PAIR_CODE = '4812';
const EVENT_ID = 'build-night';
const DEMO_OWNER = { id: 'demo', name: 'Emma', short: 'Emma', line: 'Design · Beginner', avatar: 'female_2_1', color: '#D7FF3A' };
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
    const b = S.buddy || {}; // one Tappy profile reused for every event
    return { ...S.profile, short: S.profile.name.split(' ')[0], avatar: b.avatar || S.profile.avatar, color: b.color || S.profile.color, line: b.career ? `${b.career} · ${b.level}` : S.profile.field };
  }
  return DEMO_OWNER;
}

const icebreaker = (not) => { const l = ICEBREAKERS.filter((q) => q !== not); return l[Math.floor(Math.random() * l.length)]; };
const linkCode = (pid) => String(2700 + ([...pid].reduce((a, c) => a + c.charCodeAt(0), 0) * 37) % 300);
const lineOf = (p) => p.line || `${p.field} · ${p.headline?.split(' ')[0] || ''}`;

/* ------------------------------------------------------------ screens */
function screen() {
  const b = S.badge; const o = owner(); const p = b.partner && PEOPLE[b.partner];
  switch (b.screen) {
    case 'unpaired': return `<div class="bs qr-screen">${qrSVG(BADGE_ID)}<small>SCAN WITH JOBBUDDY · ${BADGE_ID}</small></div>`;
    case 'pairing': return `<div class="bs"><small>PAIR WITH</small><b>${esc(o.short)}?</b><div class="bcode">${PAIR_CODE}</div><small>Press = yes · Hold = no</small></div>`;
    case 'idle': return `<div class="bs idle"><div class="badge-av">${avatar(o.avatar, o.color, 104, frame)}</div><b>${esc(o.short)}</b><small>${esc(o.line)}</small><small class="dim">TAP TO MEET</small></div>`;
    case 'request': return `<div class="bs">${avatar(p.avatar, p.color, 64)}<small>MEET</small><b>${p.short}?</b><small>Press to meet · Hold to cancel</small></div>`;
    case 'waiting': return `<div class="bs">${avatar(p.avatar, p.color, 64)}<small>Waiting for</small><b>${p.short}…</b></div>`;
    case 'declined': return `<div class="bs"><b>Saved as pending</b><small>${p ? p.short + ' can tap back later.' : ''}<br>Nothing else was shared.</small></div>`;
    case 'prompt': return `<div class="bs prompt"><small>✓ LINKED · YOU &amp; ${p.short.toUpperCase()}</small><small class="dim">ICEBREAKER</small><p>${esc(b.prompt)}</p><small>● Saved to your event memories</small></div>`;
    case 'returned': return `<div class="bs off"><b>Thanks!</b><small>Data cleared.<br>Ready for next person.</small></div>`;
    default: return `<div class="bs off"><small>JobBuddy</small><b>${BADGE_ID}</b><small>Not assigned</small></div>`;
  }
}

function sheetHTML() {
  if (!sheet) return '';
  let inner = '';
  if (sheet === 'nfc') inner = `<b>Touch Tappy devices with…</b><small>Simulates holding this Tappy against another attendee’s badge.</small>
    ${PARTNERS.map((id) => { const p = PEOPLE[id]; return `<button class="opt" data-a="tap" data-x="${id}">${avatar(p.avatar, p.color, 32)}<span>${p.name}${p.responds === 'later' ? '<i>won’t press yet → saved as pending</i>' : ''}</span></button>`; }).join('')}`;
  if (sheet === 'op') {
    const hasProfile = !!S.profile;
    inner = `<b>Operator</b><small>Stands in for the phone and staff while the devices aren’t linked.</small>
      <button class="opt" data-a="assign">1 · Staff assigns Tappy ${BADGE_ID}</button>
      <button class="opt" data-a="pair-req">2 · Phone sends pair request</button>
      <button class="opt" data-a="return">3 · Staff confirms return (wipe)</button>
      <button class="opt" data-a="reset">Reset Tappy</button>
      <button class="opt" data-a="to-script">▶ Presentation mode (scripted)</button>
      <small class="lbl">SHOWN ON BADGE</small>
      <div class="owners">${[hasProfile ? ['me', S.profile.name.split(' ')[0]] : null, ['demo', 'Emma (demo)'], ...['leo', 'marcus', 'sofia'].map((id) => [id, PEOPLE[id].short])].filter(Boolean)
        .map(([id, l]) => `<button class="pill ${(S.badge.owner || (hasProfile ? 'me' : 'demo')) === id ? 'on' : ''}" data-a="owner" data-x="${id}">${l}</button>`).join('')}</div>`;
  }
  return `<div class="scrim" data-a="close"></div><div class="sheet">${inner}</div>`;
}

const HINT = {
  off: 'Not assigned. Open ⋯ → Staff assigns Tappy.', unpaired: 'Scan this QR from the phone to pair.', pairing: 'Press Meet if the code matches the phone. Hold to cancel.',
  idle: 'Tap the NFC strip to hold devices together with someone.', request: 'Same code on both? Press to link · hold to cancel', waiting: 'Waiting for the other Tappy…',
  declined: 'They didn’t press yet. Saved as pending.', prompt: 'Take turns answering. Press for a new prompt · hold when done', returned: 'Unpaired and wiped.'
};
const MEET = `<div class="hw-row"><button class="hw a meet" data-meet aria-label="Meet: press = yes, hold = no">MEET</button></div><small class="meet-legend">PRESS = YES · HOLD = NO</small>`;

function render() {
  if (mode === 'script') return renderScript();
  const s = S.badge.screen || 'off';
  document.getElementById('root').innerHTML = `
    <header class="b-top"><span class="dev">${BADGE_ID}</span><span class="state ${S.live?.paired ? 'on' : ''}">${S.live?.paired ? '● paired' : S.live?.badgeId ? '○ not paired' : '○ idle'}</span><button class="op" data-a="op" aria-label="Operator menu">⋯</button></header>
    <button class="nfc-pad" data-a="nfc" ${s === 'idle' ? '' : 'disabled'}><span>NFC</span></button>
    <div class="screen-wrap"><div class="screen">${screen()}</div></div>
    ${MEET}
    <p class="b-hint">${HINT[s] || ''}</p>
    ${sheetHTML()}`;
  fit();
}

function fit() {
  const k = Math.min(window.innerWidth * 0.86, window.innerHeight * 0.48, 480) / 228;
  document.documentElement.style.setProperty('--k', k.toFixed(3));
}

/* ------------------------------------------------------------- actions */
// btn: 'A' = press (yes), 'B' = hold (no)
function hw(btn) {
  navigator.vibrate?.(btn === 'B' ? 40 : 15);
  const b = S.badge; const eventId = S.live?.eventId || EVENT_ID;
  const save1 = (person, prompt, waiting) => { if (!S.encounters.some((x) => x.person === person && x.eventId === eventId)) S.encounters.push({ id: 'x' + Date.now(), person, eventId, prompt, via: 'tappy', at: Date.now(), ...(waiting ? { waiting: true } : {}) }); };
  if (b.screen === 'pairing') {
    if (btn === 'A') { S.live = { ...(S.live || { eventId: EVENT_ID, badgeId: BADGE_ID }), paired: true, pairing: false }; set('idle'); }
    else { if (S.live) S.live.pairing = false; set('unpaired'); }
  } else if (b.screen === 'request') {
    if (btn === 'B') return set('idle', { partner: null });
    set('waiting');
    const p = PEOPLE[b.partner];
    later(1400, () => {
      if (p.responds === 'later') { save1(p.id, '', true); set('declined'); later(2400, () => set('idle', { partner: null })); }
      else { const q = icebreaker(); save1(p.id, q); set('prompt', { prompt: q }); }
    });
  } else if (b.screen === 'prompt') {
    if (btn === 'A') set('prompt', { prompt: icebreaker(b.prompt) }); else set('idle', { partner: null });
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
let look = (() => { try { return { name: 'Emma', avatar: 'female_2_1', color: '#D7FF3A', tag: 'Design · Beginner', ...JSON.parse(localStorage.getItem(LOOK_KEY)) }; } catch { return { name: 'Emma', avatar: 'female_2_1', color: '#D7FF3A', tag: 'Design · Beginner' }; } })();
if (!look.tag.includes('·')) look.tag = 'Design · Beginner';
let flash = null; // temporary screen (e.g. "Maybe later")
const MARCUS = PEOPLE.marcus;
const TAGS = ['Design · Beginner', 'Design · Intermediate', 'Engineering · Beginner', 'Product · Intermediate', 'Student · Beginner'];

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

let promptIdx = 0;
const PROMPT_TEXT = () => ICEBREAKERS[promptIdx % ICEBREAKERS.length];

const STEPS = [
  { title: 'Ready at the desk', screen: () => `<div class="bs off"><small>JobBuddy</small><b>${BADGE_ID}</b><small>Ready for the next attendee</small></div>`,
    note: 'On the phone: Your events → Portfolio Crit Circle → “Check in at the event” → DEMO Staff scans pass · hands you Tappy. It is already linked: no scan, no code.' },
  { title: 'Paired', screen: () => `<div class="bs"><b class="huge">✓</b><b>Hi ${esc(look.name)}</b><small>Tappy is yours tonight</small></div>`,
    note: 'Tappy is linked the moment staff hand it over. The phone goes in the pocket — the device does the work.' },
  { title: 'Idle · tap to meet', nfc: true, screen: () => `<div class="bs idle"><div class="badge-av">${avatar(look.avatar, look.color, 104, frame)}</div><b>${esc(look.name)}</b><small>${esc(look.tag)}</small><small class="dim">TAP TO MEET</small></div>`,
    note: 'Walk up to someone. Hold two Tappy devices together: tap the NFC strip (or Next).' },
  { title: 'Meet Marcus?', a: 'next', b: 'decline', screen: () => `<div class="bs">${avatar(MARCUS.avatar, MARCUS.color, 64)}<small>MEET</small><b>${MARCUS.short}?</b><small>Press to meet · Hold to cancel</small></div>`,
    note: 'Tappy shows who you just tapped. Press Meet to say yes (hold = cancel, nothing is shared).' },
  { title: 'Waiting', auto: 1600, screen: () => `<div class="bs">${avatar(MARCUS.avatar, MARCUS.color, 64)}<small>Waiting for</small><b>${MARCUS.short}…</b></div>`,
    note: 'Both people have to press. If they don’t, the tap is saved as pending on the phone.' },
  { title: 'Linked · icebreaker', a: 'prompt', b: 'skip', screen: () => `<div class="bs prompt"><small>✓ LINKED · YOU &amp; ${MARCUS.short.toUpperCase()}</small><small class="dim">ICEBREAKER</small><p>${esc(PROMPT_TEXT())}</p><small>● Saved to your event memories</small></div>`,
    note: 'Take turns answering out loud. Press Meet for a new prompt, hold when done. No “accept” here — that happens later at home.' },
  { title: 'Return', screen: () => `<div class="bs"><small>LEAVING?</small><b>Tap me on<br>the exit box</b><small>Your taps sync<br>to the app</small></div>`,
    note: 'Leaving: tap Tappy on the return box at the exit. On the phone: “Leaving? Tap Tappy at the exit” → Taps synced. No staff step.' },
  { title: 'Wiped', screen: () => `<div class="bs off"><b>Thanks!</b><small>Data cleared.<br>Ready for the next person.</small></div>`,
    note: 'Tappy is unpaired and wiped. On the phone, accept or decline Marcus in Network → Requests. Next restarts the demo.' }
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
  if (btn === 'A' && s.a === 'prompt') { promptIdx++; navigator.vibrate?.(12); return render(); }
  if (btn === 'B' && s.b === 'decline') { flash = `<div class="bs"><b>Cancelled</b><small>Nothing was shared.</small></div>`; render(); clearTimeout(timer); timer = setTimeout(() => setStep(2), 2200); return; }
  if (btn === 'B' && s.b === 'skip') return setStep(2);
  navigator.vibrate?.(8);
}

function scriptSheet() {
  return `<b>Presentation mode</b><small>Scripted Tappy for two-phone demos. No connection to the other phone is needed.</small>
    <button class="opt" data-a="s-restart">↺ Restart from step 1</button>
    <button class="opt" data-a="s-notes">${notes ? 'Hide' : 'Show'} presenter notes</button>
    <small class="lbl">NAME ON TAPPY</small>
    <input class="field" data-look="name" value="${esc(look.name)}" maxlength="14">
    <small class="lbl">AVATAR (match your Tappy profile)</small>
    <div class="look-grid">${AVATAR_CHOICES.map((k) => `<button class="${look.avatar === k ? 'on' : ''}" data-a="s-look" data-x="avatar|${k}">${avatar(k, look.color, 44)}</button>`).join('')}</div>
    <div class="owners">${AVATAR_COLORS.map((c) => `<button class="sw ${look.color === c ? 'on' : ''}" style="background:${c}" data-a="s-look" data-x="color|${c}"></button>`).join('')}</div>
    <small class="lbl">CAREER LINE</small>
    <div class="owners">${TAGS.map((t) => `<button class="pill ${look.tag === t ? 'on' : ''}" data-a="s-look" data-x="tag|${t}">${t}</button>`).join('')}</div>
    <button class="opt" data-a="s-mode">Switch to free play (manual operator)</button>`;
}

function renderScript() {
  const s = STEPS[step];
  document.getElementById('root').innerHTML = `
    <header class="b-top"><span class="dev">${BADGE_ID}</span><span class="state on">${step + 1}/${STEPS.length} · ${s.title}</span><button class="op" data-a="op" aria-label="Menu">⋯</button></header>
    <button class="nfc-pad" data-a="s-nfc" ${s.nfc ? '' : 'disabled'}><span>NFC</span></button>
    <div class="screen-wrap"><div class="screen">${flash || s.screen()}</div></div>
    ${MEET}
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
document.addEventListener('input', (e) => { if (e.target.dataset.look) { look[e.target.dataset.look] = e.target.value || 'Emma'; localStorage.setItem(LOOK_KEY, JSON.stringify(look)); } });
document.addEventListener('click', () => { if (!window.__wake && navigator.wakeLock) { window.__wake = true; navigator.wakeLock.request('screen').catch(() => { window.__wake = false; }); } }, { capture: true });

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  A[el.dataset.a]?.(el.dataset.x);
});
// Meet button: short press = yes, hold ~0.6 s = no.
let meetT = null; let held = false;
document.addEventListener('pointerdown', (e) => { const m = e.target.closest('[data-meet]'); if (!m) return; held = false; m.classList.add('down'); meetT = setTimeout(() => { held = true; m.classList.add('held'); A.hw('B'); }, 600); });
document.addEventListener('pointerup', (e) => { if (meetT === null) return; clearTimeout(meetT); meetT = null; document.querySelector('[data-meet]')?.classList.remove('down', 'held'); if (!held && e.target.closest('[data-meet]')) A.hw('A'); });
document.addEventListener('pointercancel', () => { clearTimeout(meetT); meetT = null; });
window.addEventListener('resize', fit);
setInterval(() => {
  frame++;
  const el = document.querySelector('.badge-av');
  if (el && mode === 'script') { el.innerHTML = avatar(look.avatar, look.color, 104, frame); return; }
  if (el && S.badge.screen === 'idle') { const o = owner(); el.innerHTML = avatar(o.avatar, o.color, 104, frame); }
}, 650);
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('../sw.js').catch(() => {});
