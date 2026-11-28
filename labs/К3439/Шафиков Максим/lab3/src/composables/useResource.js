import { ref, shallowRef, watch } from 'vue';

export function useResource(load, source = () => true) {
  const data = shallowRef(null);
  const error = ref('');
  const pending = ref(false);
  const revision = ref(0);

  watch([source, revision], async ([key], _, onCleanup) => {
    let current = true;
    onCleanup(() => { current = false; });
    data.value = null;
    error.value = '';
    pending.value = Boolean(key);
    if (!key) return;
    try {
      const result = await load(key);
      if (current) data.value = result;
    } catch (failure) {
      if (current) error.value = failure.message;
    } finally {
      if (current) pending.value = false;
    }
  }, { immediate: true });

  return { data, error, pending, reload: () => { revision.value++; } };
}
