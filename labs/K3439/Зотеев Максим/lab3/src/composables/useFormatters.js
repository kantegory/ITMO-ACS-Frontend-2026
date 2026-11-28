// Справочники и общие функции форматирования данных недвижимости

export const PROPERTY_TYPES = ['Квартира', 'Студия', 'Комната', 'Дом']
export const CITIES = ['Санкт-Петербург', 'Москва', 'Казань', 'Сочи']
export const VIEWING_TIMES = ['10:00', '13:00', '16:00', '19:00']

export const RENTAL_STATUSES = {
  active: { label: 'Действует', badge: 'text-bg-success' },
  finished: { label: 'Завершён', badge: 'text-bg-secondary' },
  cancelled: { label: 'Отменён', badge: 'text-bg-danger' },
}

export const DEAL_STATUSES = {
  active: { label: 'Действует', badge: 'text-bg-success' },
  finished: { label: 'Завершена', badge: 'text-bg-secondary' },
  cancelled: { label: 'Отменена', badge: 'text-bg-danger' },
}

export function useFormatters() {
  function formatPrice(value) {
    return `${Number(value).toLocaleString('ru-RU')} ₽`
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString('ru-RU', { timeZone: 'UTC' })
  }

  function formatAddress(property) {
    return [property?.city, property?.district, property?.address].filter(Boolean).join(', ')
  }

  function formatYesNo(value) {
    return value ? 'да' : 'нет'
  }

  function getPropertyPhoto(property, width = 600) {
    const photo = property?.photos?.[0]
    if (!photo?.url) {
      return { src: '/img/no-photo.svg', alt: 'Фото не добавлено' }
    }
    return { src: `${photo.url}?w=${width}`, alt: photo.alt || property.title }
  }

  function getRentalStatus(status) {
    return RENTAL_STATUSES[status] ?? { label: status, badge: 'text-bg-secondary' }
  }

  function getDealStatus(status) {
    return DEAL_STATUSES[status] ?? { label: status, badge: 'text-bg-secondary' }
  }

  return {
    formatPrice,
    formatDate,
    formatAddress,
    formatYesNo,
    getPropertyPhoto,
    getRentalStatus,
    getDealStatus,
  }
}
