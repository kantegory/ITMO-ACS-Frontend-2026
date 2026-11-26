import { onScopeDispose, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionStore } from '../stores/session.js';

export function useRequest({ authenticated = false } = {}) {
  const pending = ref(false);
  const failure = ref('');
  const router = useRouter();
  const session = useSessionStore();
  let latest = 0;

  onScopeDispose(() => { latest += 1; });

  async function run(task, onSuccess) {
    const request = ++latest;
    pending.value = true;
    failure.value = '';
    try {
      const result = await task();
      if (request === latest) {
        onSuccess?.(result);
        return true;
      }
    } catch (error) {
      if (request === latest && error.status === 401 && authenticated) {
        const next = router.currentRoute.value.fullPath;
        session.sync();
        await router.replace({ name: 'login', query: { next } });
      } else if (request === latest) {
        failure.value = error.message;
      }
    } finally {
      if (request === latest) pending.value = false;
    }
    return false;
  }

  return { pending, failure, run };
}
