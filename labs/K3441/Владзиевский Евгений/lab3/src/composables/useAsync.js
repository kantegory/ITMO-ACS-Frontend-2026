// Обёртка над любым запросом: убирает повторяющиеся loading / error / data.
//
// Без неё в каждом компоненте был бы один и тот же кусок с try/catch
// и тремя ref. Здесь это один вызов.

import { ref, shallowRef } from 'vue';

export function useAsync(task, { initial = null, immediate = false } = {}) {
  const data = shallowRef(initial);
  const error = ref(null);
  const pending = ref(false);

  // Если запросы наложились друг на друга (быстро меняли фильтры),
  // в data попадает результат последнего, а не того, что пришёл позже.
  let lastRun = 0;

  async function run(...args) {
    const current = ++lastRun;
    pending.value = true;
    error.value = null;
    try {
      const result = await task(...args);
      if (current === lastRun) data.value = result;
      return result;
    } catch (e) {
      if (current === lastRun) error.value = e;
      throw e;
    } finally {
      if (current === lastRun) pending.value = false;
    }
  }

  if (immediate) run();

  return { data, error, pending, run };
}
