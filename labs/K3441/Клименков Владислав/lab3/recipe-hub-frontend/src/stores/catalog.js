/**
 * stores/catalog.js — кэш справочников и социальных коллекций.
 *
 * Здесь хранятся пользователи, лайки, закладки, подписки и комментарии.
 * Компоненты читают состояние через селекторы, а изменения выполняют через
 * действия — так UI обновляется реактивно без ручной перерисовки DOM.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  bookmarks as bookmarksApi,
  comments as commentsResource,
  likes as likesApi,
  subscriptions as subscriptionsApi,
  users as usersApi,
} from '@/api/resources';

/** Убрать password из объекта пользователя. */
function sanitizeUser(user) {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
}

export const useCatalogStore = defineStore('catalog', () => {
  const users = ref([]);
  const likes = ref([]);
  const bookmarks = ref([]);
  const subscriptions = ref([]);
  const comments = ref({});

  let usersPromise = null;

  /* --------------------------- Пользователи --------------------------- */

  function userById(id) {
    return (
      users.value.find((user) => String(user.id) === String(id)) || null
    );
  }

  function userName(id) {
    const user = userById(id);
    return user ? user.name : 'Неизвестный автор';
  }

  function upsertUser(user) {
    const sanitized = sanitizeUser(user);
    if (!sanitized) return null;

    const index = users.value.findIndex(
      (item) => String(item.id) === String(sanitized.id),
    );

    if (index === -1) {
      users.value = [...users.value, sanitized];
    } else {
      const next = [...users.value];
      next[index] = sanitized;
      users.value = next;
    }

    return sanitized;
  }

  async function loadUsers({ force = false } = {}) {
    if (!force && users.value.length) return users.value;

    if (!usersPromise) {
      usersPromise = usersApi
        .list()
        .then((list) => {
          users.value = list.map(sanitizeUser);
          return users.value;
        })
        .finally(() => {
          usersPromise = null;
        });
    }

    return usersPromise;
  }

  async function ensureUser(id) {
    const known = userById(id);
    if (known) return known;

    try {
      const data = await usersApi.get(id);
      return upsertUser(data);
    } catch {
      return null;
    }
  }

  /* ------------------------- Социальные связи ------------------------- */

  function findLike(recipeId) {
    return (
      likes.value.find(
        (like) => String(like.recipeId) === String(recipeId),
      ) || null
    );
  }

  function isLiked(recipeId) {
    return Boolean(findLike(recipeId));
  }

  function isBookmarked(recipeId) {
    return bookmarks.value.some(
      (bookmark) => String(bookmark.recipeId) === String(recipeId),
    );
  }

  function isSubscribed(authorId) {
    return subscriptions.value.some(
      (subscription) => String(subscription.authorId) === String(authorId),
    );
  }

  async function loadUserCollections(userId) {
    if (userId === null || userId === undefined) {
      resetUserState();
      return;
    }

    const [likesList, bookmarksList, subscriptionsList] = await Promise.all([
      likesApi.listByUser(userId),
      bookmarksApi.listByUser(userId),
      subscriptionsApi.listByUser(userId),
    ]);

    likes.value = likesList;
    bookmarks.value = bookmarksList;
    subscriptions.value = subscriptionsList;
  }

  function resetUserState() {
    likes.value = [];
    bookmarks.value = [];
    subscriptions.value = [];
  }

  /* ------------------------- Изменение связей ------------------------- */

  async function toggleLike(recipeId, userId) {
    const existing = findLike(recipeId);

    if (existing) {
      await likesApi.remove(existing.id);
      likes.value = likes.value.filter(
        (like) => String(like.id) !== String(existing.id),
      );
      return false;
    }

    const created = await likesApi.create({ userId, recipeId });
    likes.value = [...likes.value, created];
    return true;
  }

  async function toggleBookmark(recipeId, userId) {
    const existing = bookmarks.value.find(
      (bookmark) => String(bookmark.recipeId) === String(recipeId),
    );

    if (existing) {
      await bookmarksApi.remove(existing.id);
      bookmarks.value = bookmarks.value.filter(
        (bookmark) => String(bookmark.id) !== String(existing.id),
      );
      return false;
    }

    const created = await bookmarksApi.create({ userId, recipeId });
    bookmarks.value = [...bookmarks.value, created];
    return true;
  }

  async function toggleSubscription(authorId, userId) {
    const existing = subscriptions.value.find(
      (subscription) => String(subscription.authorId) === String(authorId),
    );

    if (existing) {
      await subscriptionsApi.remove(existing.id);
      subscriptions.value = subscriptions.value.filter(
        (subscription) => String(subscription.id) !== String(existing.id),
      );
      return false;
    }

    const created = await subscriptionsApi.create({ userId, authorId });
    subscriptions.value = [...subscriptions.value, created];
    return true;
  }

  /* ---------------------------- Комментарии ---------------------------- */

  function commentsFor(recipeId) {
    return comments.value[String(recipeId)] || [];
  }

  async function loadComments(recipeId) {
    const list = await commentsResource.listByRecipe(recipeId);
    comments.value = { ...comments.value, [String(recipeId)]: list };
    return list;
  }

  async function addComment({ recipeId, userId, text }) {
    const created = await commentsResource.create({
      recipeId,
      userId,
      text,
      createdAt: new Date().toISOString(),
    });

    const key = String(recipeId);
    comments.value = {
      ...comments.value,
      [key]: [...(comments.value[key] || []), created],
    };

    return created;
  }

  return {
    users,
    likes,
    bookmarks,
    subscriptions,
    comments,
    userById,
    userName,
    upsertUser,
    loadUsers,
    ensureUser,
    isLiked,
    findLike,
    isBookmarked,
    isSubscribed,
    loadUserCollections,
    resetUserState,
    toggleLike,
    toggleBookmark,
    toggleSubscription,
    commentsFor,
    loadComments,
    addComment,
  };
});

