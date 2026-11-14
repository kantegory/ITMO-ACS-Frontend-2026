import { ref, onMounted } from 'vue'

import { parseDate, getStartOfDayTimestamp } from '@/utils/date'

const ONE_DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24

function countTimedeltaFromToday(date) {
  const currDate = new Date()

  // Считаем разницу именно по календарным дням, чтобы заметка,
  // созданная сегодня, не отображалась как «вчера».
  const daysDelta = Math.round(
    (getStartOfDayTimestamp(currDate) - getStartOfDayTimestamp(date)) /
      ONE_DAY_IN_MILLISECONDS
  )
  const monthsDelta = daysDelta / 30
  const yearsDelta = monthsDelta / 12

  return {
    daysDelta,
    monthsDelta,
    yearsDelta
  }
}

const intl = new Intl.RelativeTimeFormat('ru', { style: 'long', numeric: 'auto' })

function formatDate(date) {
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const MAX_DAYS_DELTA = 15
  const MAX_MONTHS_DELTA = 11

  const { daysDelta, monthsDelta, yearsDelta } = countTimedeltaFromToday(date)

  if (daysDelta < MAX_DAYS_DELTA) {
    return intl.format(-daysDelta, 'day')
  }

  if (monthsDelta < MAX_MONTHS_DELTA) {
    return intl.format(Math.floor(-monthsDelta), 'month')
  }

  return intl.format(Math.floor(-yearsDelta), 'year')
}

const useIntlRelativeDateFormat = (dateString) => {
  const relativeDate = ref('')

  onMounted(() => {
    const date = parseDate(dateString)

    relativeDate.value = formatDate(date)
  })

  return relativeDate
}

export default useIntlRelativeDateFormat
