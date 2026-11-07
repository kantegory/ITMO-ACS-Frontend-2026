// Форматирование данных из API для вывода на страницах

// Картинки в db.json заданы относительно корня сайта (img/italian.svg)
export function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`
}

export function pluralize(n, [one, few, many]) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ${few}`
  return `${n} ${many}`
}

export const pluralGuests = (n) => pluralize(n, ['гость', 'гостя', 'гостей'])
export const pluralReviews = (n) => pluralize(n, ['отзыв', 'отзыва', 'отзывов'])

export function formatMoney(value) {
  return `${value.toLocaleString('ru-RU')} ₽`
}

export function todayISO() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 10)
}

export function formatDate(iso, { year = false } = {}) {
  const options = { day: 'numeric', month: 'long', ...(year && { year: 'numeric' }) }
  return new Date(`${iso}T00:00`).toLocaleDateString('ru-RU', options).replace(' г.', '')
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

// Рейтинг ресторана считаем по его отзывам — так он сразу меняется после нового отзыва
export function ratingOf(reviews = []) {
  if (!reviews.length) return { value: 0, count: 0 }
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return { value: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length }
}

export function formatRating(value) {
  return value ? value.toFixed(1) : '—'
}

export function ratingLabel({ value, count }) {
  return count ? `Рейтинг ${formatRating(value)} из 5, ${pluralReviews(count)}` : 'Отзывов пока нет'
}
