// Избранное. Список нужен и в карточках, и в личном кабинете, и в шапке,
// поэтому состояние общее и грузится один раз.

import { computed, ref } from 'vue';
import * as api from '../api/resources.js';
import { useAuth } from './useAuth.js';
import { useToasts } from './useToasts.js';

const favorites = ref([]);
const loaded = ref(false);

export function useFavorites() {
  const { user, isLogged } = useAuth();
  const { toast } = useToasts();

  async function load(force = false) {
    if (!isLogged.value) {
      favorites.value = [];
      return;
    }
    if (loaded.value && !force) return;
    favorites.value = await api.fetchFavorites(user.value.id);
    loaded.value = true;
  }

  function isFavorite(listingId) {
    return favorites.value.some((item) => Number(item.listingId) === Number(listingId));
  }

  async function toggle(listingId) {
    if (!isLogged.value) {
      toast('Войдите, чтобы сохранять объявления в избранное');
      return;
    }
    const existing = favorites.value.find((item) => Number(item.listingId) === Number(listingId));
    if (existing) {
      await api.removeFavorite(existing.id);
      favorites.value = favorites.value.filter((item) => item.id !== existing.id);
      toast('Убрали из избранного');
      return;
    }
    const created = await api.addFavorite(user.value.id, listingId);
    favorites.value = [...favorites.value, created];
    toast('Добавили в избранное');
  }

  function reset() {
    favorites.value = [];
    loaded.value = false;
  }

  return { favorites, count: computed(() => favorites.value.length), load, isFavorite, toggle, reset };
}
