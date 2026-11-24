/**
 * VICE BITES — слой работы с API (fetch + json-server)
 */

const API_URL = "http://127.0.0.1:3000";

const Api = (() => {
  function getToken() {
    return localStorage.getItem("accessToken");
  }

  function authHeaders(json = true) {
    const headers = {};
    if (json) headers["Content-Type"] = "application/json";
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async function request(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, options);
    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!res.ok) {
      const err = new Error(
        (data && data.message) || `Ошибка API: ${res.status}`
      );
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  /* ----- auth ----- */

  function login(email, password) {
    return request("/login", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
    });
  }

  function register(payload) {
    return request("/register", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  /* ----- public data ----- */

  function getRecipes() {
    return request("/recipes");
  }

  function getRecipe(id) {
    return request(`/recipes/${id}`);
  }

  function getAuthors() {
    return request("/authors");
  }

  function getAuthor(id) {
    return request(`/authors/${id}`);
  }

  function getComments(recipeId) {
    return request(`/comments?recipeId=${recipeId}&_sort=id&_order=desc`);
  }

  /* ----- protected (нужен токен) ----- */

  function getLikes(params = {}) {
    const q = new URLSearchParams(params).toString();
    return request(`/likes${q ? `?${q}` : ""}`, {
      headers: authHeaders(false),
    });
  }

  function addLike(recipeId, userId) {
    return request("/600/likes", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ recipeId: Number(recipeId), userId: Number(userId) }),
    });
  }

  function removeLike(id) {
    return request(`/600/likes/${id}`, {
      method: "DELETE",
      headers: authHeaders(false),
    });
  }

  function patchRecipeLikes(id, likes) {
    return request(`/recipes/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ likes }),
    });
  }

  function addComment(payload) {
    return request("/600/comments", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  function getSaved(userId) {
    return request(`/saved?userId=${userId}`, {
      headers: authHeaders(false),
    });
  }

  function getFollowing(userId) {
    return request(`/following?userId=${userId}`, {
      headers: authHeaders(false),
    });
  }

  function addFollowing(authorId, userId) {
    return request("/600/following", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        authorId: Number(authorId),
        userId: Number(userId),
      }),
    });
  }

  function removeFollowing(id) {
    return request(`/600/following/${id}`, {
      method: "DELETE",
      headers: authHeaders(false),
    });
  }

  function getRecipesByUser(userId) {
    return request(`/recipes?userId=${userId}`);
  }

  return {
    API_URL,
    getToken,
    login,
    register,
    getRecipes,
    getRecipe,
    getAuthors,
    getAuthor,
    getComments,
    getLikes,
    addLike,
    removeLike,
    patchRecipeLikes,
    addComment,
    getSaved,
    getFollowing,
    addFollowing,
    removeFollowing,
    getRecipesByUser,
  };
})();
