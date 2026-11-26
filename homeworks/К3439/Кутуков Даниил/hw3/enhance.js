import { mountAccessibility } from './hw2/accessibility.js';
import { mountThemeButton } from './hw3/theme.js';

export function enhance() {
  mountAccessibility();
  mountThemeButton();
}
