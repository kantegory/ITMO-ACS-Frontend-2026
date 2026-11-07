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
  element.setAttribute('role', type === 'danger' ? 'alert' : 'status');
  element.hidden = false;
  element.textContent = text;
}

export function hideAlert(element) {
  element.hidden = true;
}

// Отмечаем поля с ошибкой и для глаз, и для программ чтения с экрана
export function markInvalid(inputs) {
  inputs.forEach((input) => {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
  });
  inputs[0].focus();
}

export function clearInvalid(form) {
  form.querySelectorAll('[aria-invalid]').forEach((input) => {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
  });
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
