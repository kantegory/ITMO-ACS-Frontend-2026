// Общие функции отображения данных
export function formatPrice(value) {
  return `${Number(value).toLocaleString('ru-RU')} ₽`;
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString('ru-RU', { timeZone: 'UTC' });
}

export function propertyPhoto(property, width) {
  const [photo] = property.photos;
  if (!photo) return { src: 'img/no-photo.svg', alt: 'Фото не добавлено' };
  return { src: `${photo.url}?w=${width}`, alt: photo.alt };
}

export function showAlert(element, text, type = 'danger') {
  element.className = `alert alert-${type}`;
  element.textContent = text;
  element.hidden = false;
}

export function hideAlert(element) {
  element.hidden = true;
}

export function formData(form) {
  return Object.fromEntries(new FormData(form));
}

export const RENTAL_STATUSES = {
  active: { label: 'Действует', badge: 'text-bg-success' },
  finished: { label: 'Завершён', badge: 'text-bg-secondary' },
  cancelled: { label: 'Отменён', badge: 'text-bg-danger' },
};

export function createBadge(text, badgeClass) {
  const badge = document.createElement('span');
  badge.className = `badge ${badgeClass}`;
  badge.textContent = text;
  return badge;
}
