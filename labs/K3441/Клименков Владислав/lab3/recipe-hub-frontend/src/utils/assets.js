/**
 * assets.js — пути к статическим файлам из public/.
 *
 * В данных рецепта изображение хранится как `assets/img/recipe-placeholder.svg`.
 * На вложенном маршруте относительный путь сломался бы, поэтому все картинки
 * и SVG-спрайт собираются от BASE_URL приложения.
 */

const FALLBACK_IMAGE = 'assets/img/recipe-placeholder.svg';

export function assetUrl(path) {
  const value = path || FALLBACK_IMAGE;

  if (/^(?:https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  const base = import.meta.env.BASE_URL || '/';
  return `${base}${String(value).replace(/^\/+/, '')}`;
}

export function spriteHref(name) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}assets/img/sprite.svg#icon-${name}`;
}
