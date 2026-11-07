import { toValue, watchEffect } from 'vue'

export const SITE_NAME = 'Столик'

// Заголовок вкладки для страниц, у которых он зависит от данных (название ресторана).
// Статичные заголовки задаются в meta маршрутов
export function usePageTitle(title) {
  watchEffect(() => {
    const value = toValue(title)
    if (value) document.title = `${value} — ${SITE_NAME}`
  })
}
