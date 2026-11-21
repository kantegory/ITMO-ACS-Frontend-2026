export const TYPE_NAMES = {
  APARTMENT: 'Квартира',
  STUDIO: 'Студия',
  ROOM: 'Комната',
  HOUSE: 'Дом'
}

export const STATUS_NAMES = {
  PENDING: ['На рассмотрении', 'warning'],
  APPROVED: ['Одобрена', 'primary'],
  REJECTED: ['Отклонена', 'danger'],
  ACTIVE: ['Активна', 'success'],
  COMPLETED: ['Завершена', 'secondary'],
  CANCELLED: ['Отменена', 'secondary']
}

export function formatPrice(n) {
  return Number(n).toLocaleString('ru-RU') + ' ₽'
}

export function formatDate(str) {
  return new Date(str).toLocaleDateString('ru-RU')
}
