// Inline SVG icons, drawn on a 24 by 24 grid. Bundled so they work offline.
const ICON_PATHS = {
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3.2"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.6"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10.5l6-3.5v10l-6-3.5z"/>',
  speaker: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 9a4 4 0 0 1 0 6"/><path d="M19 6.5a7.5 7.5 0 0 1 0 11"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r="0.6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  cloudCheck: '<path d="M7 19a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10.5a4.3 4.3 0 0 1-.5 8.5H7z"/><path d="M9.5 14l2 2 3.5-3.5"/>',
  cloudOff: '<path d="M7 19a5 5 0 0 1-1.8-9.7M9.6 6A6 6 0 0 1 19 10.5a4.3 4.3 0 0 1 1.6 7.4"/><path d="M3 3l18 18"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20v-4h-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  leaf: '<path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z"/><path d="M4 20L14 10"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M4 20h16"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1 1.7v.4"/><circle cx="12" cy="17" r="0.6"/>',
  alert: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5"/><circle cx="12" cy="18" r="0.6"/>',
  spots: '<circle cx="8" cy="9" r="2.2"/><circle cx="15.5" cy="7.5" r="1.6"/><circle cx="14.5" cy="15" r="2.6"/><circle cx="7" cy="16.5" r="1.5"/>',
  squiggle: '<path d="M3 13c2.5-5 4.5 5 7 0s4.5 5 7 0 3 3 4 2"/>',
  message: '<path d="M4 5h16v11H9l-5 4V5z"/>',
  server: '<rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M8 7.5h.01M8 16.5h.01"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
};

export function iconMarkup(iconName) {
  const paths = ICON_PATHS[iconName] || ICON_PATHS.question;
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
}

// Picture buttons for the two plot zones: a hill with the chosen part highlighted.
export function zoneArtMarkup(zoneId) {
  const highlightRect = zoneId === 'upper'
    ? '<rect x="0" y="0" width="120" height="46"/>'
    : '<rect x="0" y="46" width="120" height="44"/>';
  const hillPath = 'M0 90V74C24 64 44 24 72 17c20-5 36 3 48 13v60z';
  const treePositions = [[22, 74], [40, 60], [55, 42], [72, 30], [92, 27], [108, 36], [62, 68], [88, 58], [104, 74], [36, 82]];
  const trees = treePositions
    .map(([x, y]) => `<g class="zone-tree"><rect x="${x - 1}" y="${y}" width="2" height="5"/><circle cx="${x}" cy="${y - 1}" r="4.5"/></g>`)
    .join('');
  return `<svg class="zone-art" viewBox="0 0 120 90" aria-hidden="true" focusable="false">
    <defs><clipPath id="zone-clip-${zoneId}">${highlightRect}</clipPath></defs>
    <rect class="zone-sky" x="0" y="0" width="120" height="90"/>
    <path class="zone-hill" d="${hillPath}"/>
    <path class="zone-hill-active" clip-path="url(#zone-clip-${zoneId})" d="${hillPath}"/>
    ${trees}
  </svg>`;
}
