/**
 * useRecipeSearch.js — состояние и загрузка результатов поиска.
 *
 * Фильтры меняются через v-model, запрос выполняется с debounce 300 мс,
 * устаревшие запросы отменяются через AbortController. Вся эта логика
 * вынесена из SearchView в переиспользуемый composable.
 */

import {
  computed,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
} from 'vue';
import { recipes as recipesApi } from '@/api/resources';
import { DIFFICULTIES, DISH_TYPES } from '@/constants';

function defaultFilters() {
  return {
    query: '',
    dishType: '',
    difficulty: '',
    ingredient: '',
    maxTime: '',
    sort: 'new',
  };
}

/** Параметры сортировки json-server. */
function sortParams(sort) {
  switch (sort) {
    case 'likes':
      return { _sort: 'likes', _order: 'desc' };
    case 'time-asc':
      return { _sort: 'timeMinutes', _order: 'asc' };
    case 'time-desc':
      return { _sort: 'timeMinutes', _order: 'desc' };
    default:
      return { _sort: 'createdAt', _order: 'desc' };
  }
}

export function useRecipeSearch(initialFilters = {}) {
  const filters = reactive({ ...defaultFilters(), ...initialFilters });
  const recipes = ref([]);
  const loading = ref(false);
  const error = ref(null);

  let controller = null;
  let timer = null;
  let skipNextWatch = false;

  const counterText = computed(() => {
    if (loading.value) return 'Загрузка…';
    if (error.value) return 'Не удалось загрузить рецепты';
    return `Найдено рецептов: ${recipes.value.length}`;
  });

  async function load() {
    window.clearTimeout(timer);

    if (controller) controller.abort();
    const current = new AbortController();
    controller = current;

    loading.value = true;
    error.value = null;

    try {
      const params = {
        q: String(filters.query || '').trim(),
        dishType: filters.dishType,
        difficulty: filters.difficulty,
        ingredients_like: String(filters.ingredient || '').trim(),
        timeMinutes_lte: filters.maxTime,
        ...sortParams(filters.sort),
      };

      recipes.value = await recipesApi.list(params, {
        signal: current.signal,
      });
    } catch (err) {
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
        return;
      }
      error.value = err;
      recipes.value = [];
    } finally {
      if (controller === current) {
        loading.value = false;
      }
    }
  }

  function schedule() {
    window.clearTimeout(timer);
    timer = window.setTimeout(load, 300);
  }

  watch(
    filters,
    () => {
      if (skipNextWatch) {
        skipNextWatch = false;
        return;
      }
      schedule();
    },
    { deep: true },
  );

  function applyNow() {
    load();
  }

  function resetFilters() {
    skipNextWatch = true;
    window.clearTimeout(timer);
    Object.assign(filters, defaultFilters());
    load();
  }

  onBeforeUnmount(() => {
    window.clearTimeout(timer);
    if (controller) controller.abort();
  });

  return {
    filters,
    recipes,
    loading,
    error,
    counterText,
    applyNow,
    resetFilters,
    dishTypes: DISH_TYPES,
    difficulties: DIFFICULTIES,
  };
}
