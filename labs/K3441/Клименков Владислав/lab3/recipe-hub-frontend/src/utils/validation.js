/**
 * validation.js — общие проверки форм.
 */

/** Простая проверка e-mail. */
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}
