import SPRITES from './sprites.js';

// Colour helper adapted from Hello, Stranger (MIT, The Pudding, 2022).
export function darken(hex, factor = 0.3) {
  const n = hex.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(n.substr(i, 2), 16));
  const max = Math.max(...c);
  return '#' + c.map((v) => Math.min(255, Math.round(v * (factor + (v === max ? 0.2 : 0)))).toString(16).padStart(2, '0')).join('');
}

export function frames(key) {
  return SPRITES[key] || SPRITES.female_1_0;
}

const cache = new Map();

const escXml = (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] || c);

/** Render one 18×18 ASCII sprite frame as SVG text on a fixed character grid. */
function svg(key, color, frame) {
  const id = `${key}|${color}|${frame}`;
  if (cache.has(id)) return cache.get(id);
  const f = frames(key);
  const rows = f[frame % f.length].split('\n');
  let body = '';
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== ' ') body += `<text x="${x + 0.5}" y="${y + 0.85}">${escXml(ch)}</text>`;
    });
  });
  const out = `<svg viewBox="-0.5 -0.5 19 19" aria-hidden="true"><g fill="${color}" font-family="ui-monospace,Menlo,monospace" font-size="1.1" font-weight="700" text-anchor="middle">${body}</g></svg>`;
  cache.set(id, out);
  return out;
}

export function avatar(key, color = '#D7FF3A', size = 48, frame = 0, extra = '') {
  return `<span class="av ${extra}" style="width:${size}px;height:${size}px;background:${darken(color, 0.16)}">${svg(key, color, frame)}</span>`;
}
