const sprite = new URL('./sprite.svg', import.meta.url).href;
const names = new Set(['pin', 'search', 'calendar', 'user', 'star']);

export function icon(name) {
  if (!names.has(name)) return '';
  return '<svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">' +
    '<use href="' + sprite + '#' + name + '"></use></svg>';
}
