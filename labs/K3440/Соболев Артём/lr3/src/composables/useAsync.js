import { ref } from "vue";

export function useAsync(task, initial = null) {
  const data = ref(initial);
  const loading = ref(false);
  const error = ref("");

  async function execute() {
    if (loading.value) return;
    loading.value = true;
    error.value = "";
    try {
      data.value = await task();
    } catch (failure) {
      error.value = failure.message;
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, execute };
}
