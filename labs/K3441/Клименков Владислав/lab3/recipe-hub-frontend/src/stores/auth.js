/**
 * stores/auth.js — сессия пользователя и JWT.
 *
 * Восстановление сессии выполняется один раз (ensureRestored), после чего
 * router guard может синхронно проверить isAuthenticated. Вход и регистрация
 * сразу загружают коллекции пользователя (лайки, закладки, подписки).
 */

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { auth as authApi, users as usersApi } from '@/api/resources';
import { clearToken, decodeJwt, getToken, saveToken } from '@/api/token';
import { useCatalogStore } from './catalog';

/** Убрать password из объекта пользователя. */
function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const ready = ref(false);

  let restorePromise = null;

  const isAuthenticated = computed(() => Boolean(user.value));

  /**
   * Текущий пользователь по токену или null.
   * При истёкшем/невалидном токене очищает его.
   */
  async function fetchCurrentUser() {
    const token = getToken();
    if (!token) return null;

    let payload;
    try {
      payload = decodeJwt(token);
    } catch {
      clearToken();
      return null;
    }

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      clearToken();
      return null;
    }

    try {
      const data = await usersApi.get(payload.sub);
      return sanitizeUser(data);
    } catch (error) {
      if ([401, 403, 404].includes(error.status)) {
        clearToken();
        return null;
      }
      throw error;
    }
  }

  async function restore() {
    const catalog = useCatalogStore();

    try {
      const restored = await fetchCurrentUser();
      user.value = restored;

      if (restored) {
        catalog.upsertUser(restored);
        try {
          await catalog.loadUserCollections(restored.id);
        } catch (error) {
          console.error(
            'RecipeHub: не удалось загрузить коллекции пользователя',
            error,
          );
        }
      }
    } catch (error) {
      console.error('RecipeHub: не удалось восстановить сессию', error);
      user.value = null;
    } finally {
      ready.value = true;
    }
  }

  /** Гарантировать однократное восстановление сессии. */
  function ensureRestored() {
    if (!restorePromise) restorePromise = restore();
    return restorePromise;
  }

  async function loadCurrentUser() {
    const current = await fetchCurrentUser();
    if (!current) throw new Error('Не удалось определить пользователя');

    const catalog = useCatalogStore();
    user.value = current;
    catalog.upsertUser(current);
    await catalog.loadUserCollections(current.id);
    return current;
  }

  async function login(email, password, remember = true) {
    const token = await authApi.login(email, password);
    saveToken(token, remember);

    try {
      const current = await loadCurrentUser();
      ready.value = true;
      return current;
    } catch (error) {
      clearToken();
      user.value = null;
      throw error;
    }
  }

  async function register(payload) {
    const token = await authApi.register(payload);
    saveToken(token, true);

    try {
      const current = await loadCurrentUser();
      ready.value = true;
      return current;
    } catch (error) {
      clearToken();
      user.value = null;
      throw error;
    }
  }

  /** Обновить данные текущего пользователя после редактирования профиля. */
  function updateUser(updated) {
    if (!updated) return;
    user.value = sanitizeUser(updated);
    if (user.value) useCatalogStore().upsertUser(user.value);
  }

  function logout() {
    clearToken();
    user.value = null;
    ready.value = true;
    useCatalogStore().resetUserState();
  }

  return {
    user,
    ready,
    isAuthenticated,
    ensureRestored,
    login,
    register,
    updateUser,
    logout,
  };
});
