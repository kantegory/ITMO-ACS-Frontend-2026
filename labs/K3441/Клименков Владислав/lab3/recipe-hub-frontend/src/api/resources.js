/**
 * resources.js — ресурсы мокового API RecipeHub.
 *
 * Компоненты и хранилища не работают с axios напрямую: они вызывают
 * методы users / recipes / comments / likes / bookmarks / subscriptions
 * или auth. Это сохраняет единый контракт с ЛР2.
 */

import { buildParams, del, get, patch, post } from './client';

export const users = {
  list(params = {}) {
    return get('/users', { params: buildParams(params) });
  },
  get(id) {
    return get(`/users/${id}`);
  },
  update(id, changes) {
    return patch(`/users/${id}`, changes);
  },
};

export const recipes = {
  list(params = {}, config = {}) {
    return get('/recipes', { ...config, params: buildParams(params) });
  },
  get(id, config = {}) {
    return get(`/recipes/${id}`, config);
  },
  create(data) {
    return post('/recipes', data);
  },
  remove(id) {
    return del(`/recipes/${id}`);
  },
};

export const comments = {
  listByRecipe(recipeId, config = {}) {
    return get('/comments', {
      ...config,
      params: buildParams({
        recipeId,
        _sort: 'createdAt',
        _order: 'asc',
      }),
    });
  },
  create(data) {
    return post('/comments', data);
  },
  remove(id) {
    return del(`/comments/${id}`);
  },
};

/** Однотипные коллекции «пользователь — рецепт/автор». */
function userCollection(name) {
  return {
    listByUser(userId, config = {}) {
      return get(`/${name}`, {
        ...config,
        params: buildParams({ userId }),
      });
    },
    create(data) {
      return post(`/${name}`, data);
    },
    remove(id) {
      return del(`/${name}/${id}`);
    },
  };
}

export const likes = userCollection('likes');
export const bookmarks = userCollection('bookmarks');
export const subscriptions = userCollection('subscriptions');

export const auth = {
  /** Вход. Возвращает accessToken. */
  async login(email, password) {
    const data = await post('/login', { email, password });
    return data.accessToken;
  },

  /** Регистрация. Возвращает accessToken. */
  async register(payload) {
    const data = await post('/register', payload);
    return data.accessToken;
  },
};
