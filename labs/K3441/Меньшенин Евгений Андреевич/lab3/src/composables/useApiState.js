import { ref } from "vue";

export function useApiState() {
  const loading = ref(false);
  const error = ref("");
  async function run(action) {
    loading.value = true;
    error.value = "";
    try {
      return await action();
    } catch (reason) {
      error.value = reason.userMessage || reason.message;
      throw reason;
    } finally {
      loading.value = false;
    }
  }
  return { loading, error, run };
}
