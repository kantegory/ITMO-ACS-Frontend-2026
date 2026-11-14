import { ref, onMounted } from 'vue'

import { parseDate } from '@/utils/date'

const useDateFormat = (value) => {
  const date = ref('')

  onMounted(() => {
    const parsedDate = parseDate(value)

    if (!Number.isNaN(parsedDate.getTime())) {
      date.value = parsedDate.toLocaleDateString('ru-RU')
    }
  })

  return date
}

export default useDateFormat
