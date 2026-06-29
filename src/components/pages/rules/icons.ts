/**
 * Inline SVG path data for every icon used on the rules page. Outline style,
 * meant to be rendered inside an <svg> whose stroke is currentColor, so colour
 * and size are controlled by the caller via Tailwind tokens. Keeping the data
 * here (instead of one file per icon) keeps RulesIcon.astro a thin renderer.
 */

export type RulesIconName =
  | 'wide-angle'
  | 'macro'
  | 'black-and-white'
  | 'animal-behaviour'
  | 'mediterranean-portfolio'
  | 'window'
  | 'fee'
  | 'format'
  | 'limits'
  | 'payment'
  | 'jury'
  | 'open'
  | 'close'
  | 'ceremony'
  | 'trophy'
  | 'trips'
  | 'photo-gear'
  | 'scuba-gear'
  | 'note'
  | 'chevron'
  | 'external'
  | 'check'
  | 'cross'
  | 'address'
  | 'phone'
  | 'globe'
  | 'email';

export const iconPaths: Record<RulesIconName, string> = {
  'wide-angle': `<circle cx="12" cy="12" r="9.25" /><path d="m13.9 7.8 5 8.66M9.7 7.8h9.6M8.1 12l4.8-8.32M9.7 16.2l-4.8-8.32M14.3 16.2H4.7m9.6-4.2-4.8 8.32" />`,
  macro: `<path d="m20.5 20.5-4.6-4.6m0 0a6.75 6.75 0 1 0-9.55-9.55 6.75 6.75 0 0 0 9.55 9.55Z" /><circle cx="11.1" cy="11.1" r="2.5" />`,
  'black-and-white': `<circle cx="12" cy="12" r="9.25" /><path fill="currentColor" stroke="none" d="M12 3.6a8.4 8.4 0 0 1 0 16.8V3.6Z" />`,
  'animal-behaviour': `<path d="M6.8 12c.95-3.3 4.7-5.6 8.1-5.6 3.4 0 5.8 2.3 6.6 5.6-.8 3.3-3.2 5.6-6.6 5.6-3.4 0-7.15-2.3-8.1-5.6Z" /><path d="M17.4 11.4v.4" /><path d="M6.8 12 3.2 9.2v5.6L6.8 12Z" />`,
  'mediterranean-portfolio': `<rect x="3.2" y="7.6" width="12.4" height="9.2" rx="2" /><path d="M7 5.6h9.6a2 2 0 0 1 2 2v8" /><path d="M10.8 3.6h8a2 2 0 0 1 2 2v8.4" />`,
  window: `<path d="M7 3v2.4M17 3v2.4M3.4 9.2h17.2M5 5.4h14a1.6 1.6 0 0 1 1.6 1.6v12A1.6 1.6 0 0 1 19 20.6H5A1.6 1.6 0 0 1 3.4 19V7A1.6 1.6 0 0 1 5 5.4Z" /><path d="M7.6 13h8.8" />`,
  fee: `<path d="M14.5 8.2a4.4 4.4 0 1 0 0 7.6M7.4 10.6h5.4M7.4 13.4h5.4" /><circle cx="12" cy="12" r="9.25" />`,
  format: `<path d="m3.2 15.6 4.7-4.7a2 2 0 0 1 2.85 0l4.65 4.65M14 13.9l1.25-1.25a2 2 0 0 1 2.85 0l2.7 2.7" /><rect x="3.2" y="4.8" width="17.6" height="14.4" rx="1.8" /><circle cx="8.4" cy="9.2" r="1.2" />`,
  limits: `<rect x="3.4" y="3.4" width="12" height="12" rx="1.8" /><path d="M8.6 8.6h12v12h-12" />`,
  payment: `<rect x="2.6" y="5" width="18.8" height="14" rx="2" /><path d="M2.6 9.4h18.8M6 14.8h4M6 16.6h2.4" />`,
  jury: `<path d="M12 3v17.4m0 0c-1.45 0-2.85.26-4.1.74M12 20.4c1.45 0 2.85.26 4.1.74M18.8 5A47 47 0 0 0 12 4.5c-2.3 0-4.55.16-6.8.5m13.6 0 2.5 9.2a4 4 0 0 1-5 0L18.8 5Zm-13.6 0L2.7 14.2a4 4 0 0 0 5 0L5.2 5Z" />`,
  open: `<path d="M12 3.2v2.3M12 18.5v2.3M5.4 5.4l1.6 1.6M17 17l1.6 1.6M3.2 12h2.3M18.5 12h2.3M5.4 18.6 7 17M17 7l1.6-1.6" /><circle cx="12" cy="12" r="3.6" />`,
  close: `<path d="M12 6.4V12l3.8 2.2" /><circle cx="12" cy="12" r="9.25" />`,
  ceremony: `<path d="M16.5 18.6h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.3c0-.62-.5-1.12-1.12-1.12H8.62c-.62 0-1.12.5-1.12 1.12v3.3M6.2 4.5C5.3 4.64 4.4 4.8 3.5 5a6 6 0 0 0 5.4 5M6.2 4.5V4.6c0 2.1.97 4 2.48 5.2M6.2 4.5V3c1.9-.27 3.84-.4 5.8-.4 1.96 0 3.9.13 5.8.4v1.5m0 0c.9.14 1.8.3 2.7.5a6 6 0 0 1-5.4 5m2.7-5.5V4.6c0 2.1-.97 4-2.48 5.2" />`,
  trophy: `<path d="M16.5 18.6h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.3c0-.62-.5-1.12-1.12-1.12H8.62c-.62 0-1.12.5-1.12 1.12v3.3M6.2 4.5C5.3 4.64 4.4 4.8 3.5 5a6 6 0 0 0 5.4 5M6.2 4.5V4.6c0 2.1.97 4 2.48 5.2M6.2 4.5V3c1.9-.27 3.84-.4 5.8-.4 1.96 0 3.9.13 5.8.4v1.5m0 0c.9.14 1.8.3 2.7.5a6 6 0 0 1-5.4 5m2.7-5.5V4.6c0 2.1-.97 4-2.48 5.2" />`,
  trips: `<path d="M6 12 3.3 3.6A57 57 0 0 1 20.7 12 57 57 0 0 1 3.3 20.4L6 12Zm0 0h7.2" />`,
  'photo-gear': `<path d="M6.9 6.3A2.2 2.2 0 0 1 5.3 7.3l-1.1.16C3.2 7.6 2.5 8.5 2.5 9.5V18a2.1 2.1 0 0 0 2.1 2.1h14.8A2.1 2.1 0 0 0 21.5 18V9.5c0-1-.7-1.9-1.7-2.05L18.7 7.3a2.2 2.2 0 0 1-1.6-1l-.78-1.25a2.1 2.1 0 0 0-1.65-1 46 46 0 0 0-5 0 2.1 2.1 0 0 0-1.65 1L6.9 6.3Z" /><circle cx="12" cy="12.8" r="3.6" />`,
  'scuba-gear': `<rect x="8.4" y="6.5" width="7.2" height="14" rx="3.6" /><path d="M10.6 6.5V4.7a1.4 1.4 0 0 1 2.8 0v1.8" /><path d="M13.4 5.2h2.4a2 2 0 0 1 0 4h-.8" />`,
  note: `<path d="M11.3 11.3l.04-.02a.75.75 0 0 1 1.06.85l-.7 2.84a.75.75 0 0 0 1.06.85l.04-.02M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.01v.01H12V8.25Z" />`,
  chevron: `<path d="m6 9 6 6 6-6" />`,
  external: `<path d="M5.5 18.5l13-13m0 0H8.7m9.8 0v9.8" />`,
  check: `<path d="m4.5 12.5 5 5 10-11" />`,
  cross: `<path d="M6 6l12 12M18 6 6 18" />`,
  address: `<path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path d="M19.5 10.5c0 7.14-7.5 11.25-7.5 11.25S4.5 17.64 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />`,
  phone: `<path d="M2.4 6.6c0 8.06 6.54 14.6 14.6 14.6h1.9a2.1 2.1 0 0 0 2.1-2.1v-1.3c0-.48-.33-.9-.8-1.02l-4.1-1.02c-.42-.1-.85.05-1.1.4l-.9 1.2c-.27.35-.73.5-1.13.35a11.6 11.6 0 0 1-6.86-6.86c-.15-.4 0-.86.35-1.13l1.2-.9c.35-.25.5-.68.4-1.1L6.42 3.6a1.05 1.05 0 0 0-1.02-.8H4.1A2.1 2.1 0 0 0 2 4.9Z" />`,
  globe: `<circle cx="12" cy="12" r="9.25" /><path d="M3.2 9.6h17.6M3.2 14.4h17.6M12 2.8a13 13 0 0 1 0 18.4 13 13 0 0 1 0-18.4Z" />`,
  email: `<path d="M21.6 6.8v10.4a2.1 2.1 0 0 1-2.1 2.1H4.5a2.1 2.1 0 0 1-2.1-2.1V6.8m19.2 0A2.1 2.1 0 0 0 19.5 4.7H4.5A2.1 2.1 0 0 0 2.4 6.8m19.2 0L12 13.1 2.4 6.8" />`,
};
