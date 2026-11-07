import { computed } from 'vue'

import { bookingsApi } from '@/api'
import { useAuth } from '@/composables/useAuth'
import { useRequest } from '@/composables/useRequest'
import { bookingGroup } from '@/utils/booking'

const byDateDesc = (a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)

// Брони текущего пользователя — нужны и в личном кабинете (ближайшая бронь, число визитов),
// и в истории бронирований (список с фильтром, отмена)
export function useBookings() {
  const { user } = useAuth()

  const { data: bookings, loading, error, run: load } = useRequest(
    async () => (await bookingsApi.getByUser(user.value.id)).sort(byDateDesc),
    { initialData: [] },
  )

  const counts = computed(() => {
    const result = { all: bookings.value.length, upcoming: 0, completed: 0, cancelled: 0 }
    bookings.value.forEach((booking) => {
      result[bookingGroup(booking)] += 1
    })
    return result
  })

  // Ближайшая из предстоящих
  const nextBooking = computed(() => bookings.value
    .filter((booking) => bookingGroup(booking) === 'upcoming')
    .sort((a, b) => byDateDesc(b, a))[0] ?? null)

  async function cancel(booking) {
    const updated = await bookingsApi.cancel(booking.id)
    Object.assign(booking, updated)
  }

  return { bookings, loading, error, load, counts, nextBooking, cancel }
}
