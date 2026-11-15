// Всплывающие уведомления. Компонент AppToasts показывает то,
// что сюда положили, а положить может кто угодно.

import { ref } from 'vue';

const items = ref([]);
let nextId = 0;

export function useToasts() {
  function toast(text, { timeout = 2800 } = {}) {
    const id = ++nextId;
    items.value = [...items.value, { id, text }];
    setTimeout(() => dismiss(id), timeout);
    return id;
  }

  function dismiss(id) {
    items.value = items.value.filter((item) => item.id !== id);
  }

  return { items, toast, dismiss };
}
