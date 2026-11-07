import { ref } from "vue";
export function useAsync() {
  const loading = ref(false);
  const error = ref("");
  async function run(action) {
    loading.value = true;
    error.value = "";
    try {
      return await action();
    } catch (cause) {
      error.value = cause.message;
      return null;
    } finally {
      loading.value = false;
    }
  }
  return { loading, error, run };
}
