import { todayISO } from '@/utils/format'

// Слоты на вечер: часть уже занята (в реальном сервисе это пришло бы из API ресторана)
export const TIME_SLOTS = [
  { time: '12:00' },
  { time: '13:30' },
  { time: '15:00' },
  { time: '17:00' },
  { time: '18:30' },
  { time: '19:00', busy: true },
  { time: '19:30' },
  { time: '20:00', busy: true },
  { time: '21:00' },
  { time: '22:00' },
]

export const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export const ZONES = ['Основной зал', 'У окна', 'Летняя веранда']

export const BOOKING_STATUS = {
  confirmed: { label: 'Подтверждено', badge: 'text-bg-success' },
  pending: { label: 'Ожидает подтверждения', badge: 'text-bg-warning' },
  completed: { label: 'Завершено', badge: 'text-bg-secondary' },
  cancelled: { label: 'Отменено', badge: 'text-bg-danger' },
}

// Бронь со статусом «подтверждена/ожидает», дата которой уже прошла, считаем завершённой
export function bookingGroup(booking) {
  if (booking.status === 'cancelled') return 'cancelled'
  if (booking.status === 'completed' || booking.date < todayISO()) return 'completed'
  return 'upcoming'
}

export function bookingStatus(booking) {
  return bookingGroup(booking) === 'completed' ? BOOKING_STATUS.completed : BOOKING_STATUS[booking.status]
}
