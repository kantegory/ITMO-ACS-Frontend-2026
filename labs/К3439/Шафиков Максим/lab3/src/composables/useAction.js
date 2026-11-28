import { onScopeDispose, ref } from 'vue';

export function useAction() {
  const pending = ref(false);
  const error = ref('');
  let mounted = true;
  onScopeDispose(() => { mounted = false; });

  async function run(action, onSuccess) {
    if (pending.value) return;
    pending.value = true;
    error.value = '';
    try {
      const result = await action();
      if (mounted && onSuccess) await onSuccess(result);
    } catch (failure) {
      if (mounted) error.value = failure.message;
    } finally {
      if (mounted) pending.value = false;
    }
  }

  return { pending, error, run };
}
