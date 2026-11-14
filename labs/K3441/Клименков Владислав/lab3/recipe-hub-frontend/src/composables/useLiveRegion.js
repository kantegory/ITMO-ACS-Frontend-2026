/**
 * useLiveRegion.js — общий live-region приложения.
 *
 * `announce()` вызывается из любых компонентов и composables, а текст
 * выводится в единственном `role="status"` в App.vue. Сначала регион
 * очищается, чтобы одинаковые сообщения озвучивались повторно.
 */

import { readonly, ref } from 'vue';

const message = ref('');
let timer = null;

export function announce(text) {
  message.value = '';
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    message.value = text;
  }, 100);
}

export function useLiveRegion() {
  return {
    message: readonly(message),
    announce,
  };
}
