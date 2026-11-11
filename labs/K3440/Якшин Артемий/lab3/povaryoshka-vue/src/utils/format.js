// Небольшие чистые функции без состояния, которые нужны в нескольких местах

export function plural(n, one, few, many) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function countLabel(n, one, few, many) {
  return `${n} ${plural(n, one, few, many)}`
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

// из ссылки вида youtube.com/watch?v=ID или youtu.be/ID достаём ID видео
export function youtubeId(value = '') {
  const match = value.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)
  if (match) return match[1]
  return /^[\w-]{11}$/.test(value) ? value : null
}
