import { ref } from 'vue';

export function useRequest() {
  const busy = ref(false);
  const error = ref('');

  async function run(action) {
    if (busy.value) return;
    busy.value = true;
    error.value = '';
    try {
      return await action();
    } catch (cause) {
      error.value = cause.message;
    } finally {
      busy.value = false;
    }
  }

  return { busy, error, run };
}
