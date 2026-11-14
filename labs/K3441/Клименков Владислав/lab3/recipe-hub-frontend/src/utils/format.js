/**
 * format.js — форматирование значений для интерфейса.
 */

/** Человекочитаемая длительность: 90 -> "1 ч 30 мин". */
export function formatDuration(minutes) {
  const total = Number(minutes);
  if (!Number.isFinite(total) || total <= 0) return '';

  const hours = Math.floor(total / 60);
  const rest = total % 60;

  if (!hours) return `${rest} мин`;
  if (!rest) return `${hours} ч`;
  return `${hours} ч ${rest} мин`;
}

/** Дата в формате ДД.ММ.ГГГГ. */
export function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ru-RU');
}
