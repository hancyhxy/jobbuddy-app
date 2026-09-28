const s = (d, fill = false) => `<svg viewBox="0 0 24 24" class="ic" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'} aria-hidden="true">${d}</svg>`;

export const ICON = {
  home: s('<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/>'),
  search: s('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  people: s('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17.5 14.5c2 .4 3.4 2 4 4.5"/>'),
  user: s('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4-7 8-7s7 2.5 8 7"/>'),
  back: s('<path d="M15 5l-7 7 7 7"/>'),
  close: s('<path d="M6 6l12 12M18 6 6 18"/>'),
  chev: s('<path d="m9 5 7 7-7 7"/>'),
  share: s('<path d="M12 3v13M7 8l5-5 5 5M5 14v6h14v-6"/>'),
  cal: s('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  globe: s('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>'),
  pin: s('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  ticket: s('<path d="M3 8a2 2 0 0 0 0 4v5h18v-5a2 2 0 0 1 0-4V4H3z" transform="translate(0 1.5)"/>'),
  badge: s('<rect x="5" y="3" width="14" height="18" rx="3"/><rect x="8" y="7" width="8" height="7" rx="1"/><path d="M10 17.5h4"/>'),
  info: s('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  lock: s('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  check: s('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  qr: s('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3M14 21h1"/>'),
  plus: s('<path d="M12 5v14M5 12h14"/>'),
  edit: s('<path d="M4 20h4L19 9l-4-4L4 16z"/>')
};
