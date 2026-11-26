const glyphs = { pin: '⌖', search: '⌕', calendar: '▦', user: '♙', star: '★' };

export function icon(name) {
  return '<svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">' +
    '<text x="12" y="18" text-anchor="middle">' + (glyphs[name] ?? '') + '</text></svg>';
}
