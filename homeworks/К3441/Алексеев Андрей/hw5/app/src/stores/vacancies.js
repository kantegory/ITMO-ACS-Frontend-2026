import axios from 'axios';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const storageKey = 'vector-demo:saved';

function readSaved() {
  try {
    const ids = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(ids) ? [...new Set(ids.filter(Number.isInteger))] : [];
  } catch {
    return [];
  }
}

export const useVacancies = defineStore('vacancies', () => {
  const jobs = ref([]);
  const savedIds = ref(readSaved());
  const loading = ref(false);
  const error = ref('');
  const savedJobs = computed(() => jobs.value.filter(job => savedIds.value.includes(job.id)));

  async function load() {
    if (loading.value) return;
    loading.value = true;
    error.value = '';
    try {
      const { data } = await axios.get(import.meta.env.BASE_URL + 'vacancies.json', { timeout: 5000 });
      if (!Array.isArray(data)) throw new Error('Неверный формат каталога.');
      jobs.value = data;
    } catch {
      error.value = 'Не удалось загрузить вакансии. Попробуйте ещё раз.';
    } finally {
      loading.value = false;
    }
  }

  function toggleSaved(id) {
    savedIds.value = savedIds.value.includes(id)
      ? savedIds.value.filter(saved => saved !== id)
      : [...savedIds.value, id];
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedIds.value));
    } catch {
      // Текущий список избранного остаётся доступен в памяти.
    }
  }

  return { jobs, savedIds, savedJobs, loading, error, load, toggleSaved };
});
