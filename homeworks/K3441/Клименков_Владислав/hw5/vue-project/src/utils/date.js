const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// Даты вида YYYY-MM-DD парсим как локальные, иначе new Date()
// воспринимает их как UTC и в некоторых часовых поясах сдвигает на день.
export const parseDate = (value) => {
  if (typeof value === 'string' && DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split('-').map(Number)

    return new Date(year, month - 1, day)
  }

  return new Date(value)
}

export const getStartOfDayTimestamp = (date) => {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}
