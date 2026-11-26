import { mountAccessibility } from './hw2/accessibility.js';
import { mountThemeButton } from './hw3/theme.js';
import { icon } from './icons.js';

const symbols = { '⌖': 'pin', '⌕': 'search', '♙': 'user' };

export function enhance() {
  mountAccessibility();
  mountThemeButton();
  document.querySelectorAll('svg.icon > text').forEach(glyph => {
    const name = symbols[glyph.textContent];
    if (name) glyph.parentElement.outerHTML = icon(name);
  });
}
