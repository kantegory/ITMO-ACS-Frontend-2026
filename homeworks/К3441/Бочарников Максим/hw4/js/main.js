/**
 * VICE BITES ЛР2 — клиентская логика поверх API
 */

(function () {
  "use strict";

  let recipesCache = [];
  let authorsCache = [];

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function formatLikes(n) {
    return Number(n || 0).toLocaleString("ru-RU");
  }

  function todayRu() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}.${mm}.${d.getFullYear()}`;
  }

  function getAuthor(id) {
    return authorsCache.find((a) => Number(a.id) === Number(id));
  }

  function showApiError(el, message) {
    if (!el) {
      alert(message);
      return;
    }
    el.textContent = message;
    el.classList.remove("d-none");
    el.focus?.();
  }

  function ensureApiOrWarn(container) {
    return fetch(`${Api.API_URL}/recipes`)
      .then(() => true)
      .catch(() => {
        if (container) {
          container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
              <h3 class="display">API не запущен</h3>
              <p class="mb-0">В папке lab2 выполни <code>npm start</code> (порт 3000), затем обнови страницу.</p>
            </div>`;
        }
        return false;
      });
  }

  /* ---------- Catalog ---------- */

  async function initCatalog() {
    const grid = qs("#recipe-grid");
    if (!grid) return;

    const ok = await ensureApiOrWarn(grid);
    if (!ok) return;

    try {
      [recipesCache, authorsCache] = await Promise.all([
        Api.getRecipes(),
        Api.getAuthors(),
      ]);
    } catch (e) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>${e.message}</p></div>`;
      return;
    }

    let likedIds = new Set();
    if (Auth.isLoggedIn()) {
      try {
        const likes = await Api.getLikes({ userId: Auth.getUser().id });
        likedIds = new Set(likes.map((l) => Number(l.recipeId)));
      } catch {
        /* публичный каталог всё равно покажем */
      }
    }

    const typeSelect = qs("#filter-type");
    const diffSelect = qs("#filter-difficulty");
    const searchInput = qs("#filter-search");
    const chipBox = qs("#ingredient-chips");
    const resetBtn = qs("#filter-reset");
    const countEl = qs("#results-count");
    const selectedIngredients = new Set();

    const ingredients = Array.from(
      new Set(recipesCache.flatMap((r) => r.ingredients || []))
    ).sort((a, b) => a.localeCompare(b, "ru"));

    if (chipBox) {
      chipBox.innerHTML = "";
      ingredients.forEach((ing) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip";
        chip.textContent = ing;
        chip.setAttribute("aria-pressed", "false");
        chip.addEventListener("click", () => {
          if (selectedIngredients.has(ing)) {
            selectedIngredients.delete(ing);
            chip.classList.remove("is-active");
            chip.setAttribute("aria-pressed", "false");
          } else {
            selectedIngredients.add(ing);
            chip.classList.add("is-active");
            chip.setAttribute("aria-pressed", "true");
          }
          render();
        });
        chipBox.appendChild(chip);
      });
    }

    function matches(recipe) {
      const type = typeSelect?.value || "";
      const diff = diffSelect?.value || "";
      const q = (searchInput?.value || "").trim().toLowerCase();

      if (type && recipe.type !== type) return false;
      if (diff && recipe.difficulty !== diff) return false;
      if (q) {
        const hay = [recipe.title, recipe.description, recipe.type, ...(recipe.ingredients || [])]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (selectedIngredients.size) {
        for (const ing of selectedIngredients) {
          if (!(recipe.ingredients || []).includes(ing)) return false;
        }
      }
      return true;
    }

    function cardHtml(recipe) {
      const author = getAuthor(recipe.authorId) || { name: "Автор", avatar: "" };
      const liked = likedIds.has(Number(recipe.id));
      const tags = (recipe.ingredients || [])
        .slice(0, 3)
        .map((i) => `<span class="tag">${i}</span>`)
        .join("");

      return `
        <article class="recipe-card" data-id="${recipe.id}">
          <a class="recipe-card__media" href="recipe.html?id=${recipe.id}">
            <img src="${recipe.image}" alt="${recipe.title}" loading="lazy" width="400" height="300">
            <span class="recipe-card__badge">${recipe.type}</span>
          </a>
          <div class="recipe-card__body">
            <h3 class="recipe-card__title">
              <a href="recipe.html?id=${recipe.id}">${recipe.title}</a>
            </h3>
            <div class="recipe-card__meta">
              <span>${recipe.difficulty}</span>
              <span>${recipe.time}</span>
            </div>
            <div class="recipe-card__tags">${tags}</div>
            <div class="recipe-card__footer">
              <div class="author-mini">
                <img src="${author.avatar}" alt="Автор: ${author.name}">
                <span>${author.name}</span>
              </div>
              <button type="button" class="btn-like ${liked ? "is-liked" : ""}" data-like="${recipe.id}" aria-pressed="${liked}" aria-label="${liked ? "Убрать лайк" : "Поставить лайк"}: ${recipe.title}">
                ${ViceIcons.html(ViceIcons.heartId(liked), "icon heart")}
                <span class="like-count">${formatLikes(recipe.likes)}</span>
              </button>
            </div>
          </div>
        </article>`;
    }

    function render() {
      const list = recipesCache.filter(matches);
      if (countEl) countEl.textContent = `Найдено: ${list.length}`;
      if (!list.length) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1">
            <h3 class="display">Ничего не нашлось</h3>
            <p>Сбрось фильтры или попробуй другой запрос.</p>
          </div>`;
        return;
      }
      grid.innerHTML = list.map(cardHtml).join("");
      bindLikeButtons(grid, likedIds);
    }

    [typeSelect, diffSelect].forEach((el) => el?.addEventListener("change", render));
    searchInput?.addEventListener("input", render);
    resetBtn?.addEventListener("click", () => {
      if (typeSelect) typeSelect.value = "";
      if (diffSelect) diffSelect.value = "";
      if (searchInput) searchInput.value = "";
      selectedIngredients.clear();
      qsa(".chip", chipBox).forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      render();
    });

    render();
  }

  /* ---------- Likes ---------- */

  function bindLikeButtons(root, likedIds) {
    qsa("[data-like]", root).forEach((btn) => {
      btn.addEventListener("click", () => toggleLike(btn, likedIds));
    });
  }

  async function toggleLike(btn, likedIds) {
    if (!Auth.isLoggedIn()) {
      window.location.href = "login.html";
      return;
    }

    const recipeId = Number(btn.dataset.like);
    const user = Auth.getUser();
    const countEl = qs(".like-count", btn);
    const heart = qs(".heart", btn);
    let likes = Number((countEl?.textContent || "0").replace(/\s/g, "")) || 0;

    btn.disabled = true;
    try {
      const existing = await Api.getLikes({ recipeId, userId: user.id });
      if (existing.length) {
        await Api.removeLike(existing[0].id);
        likes = Math.max(0, likes - 1);
        likedIds?.delete(recipeId);
        btn.classList.remove("is-liked");
        btn.setAttribute("aria-pressed", "false");
        if (btn.getAttribute("aria-label")) {
          btn.setAttribute(
            "aria-label",
            btn.getAttribute("aria-label").replace("Убрать лайк", "Поставить лайк")
          );
        }
        if (heart) ViceIcons.set(heart, ViceIcons.heartId(false));
      } else {
        await Api.addLike(recipeId, user.id);
        likes += 1;
        likedIds?.add(recipeId);
        btn.classList.add("is-liked");
        btn.setAttribute("aria-pressed", "true");
        if (btn.getAttribute("aria-label")) {
          btn.setAttribute(
            "aria-label",
            btn.getAttribute("aria-label").replace("Поставить лайк", "Убрать лайк")
          );
        }
        if (heart) ViceIcons.set(heart, ViceIcons.heartId(true));
      }
      await Api.patchRecipeLikes(recipeId, likes);
      if (countEl) countEl.textContent = formatLikes(likes);
    } catch (e) {
      alert(e.message || "Не удалось обновить лайк. Нужна авторизация?");
    } finally {
      btn.disabled = false;
    }
  }

  /* ---------- Recipe page ---------- */

  async function initRecipePage() {
    const root = qs('main[data-page="recipe"]') || qs("#recipe-page");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "1";

    const ok = await ensureApiOrWarn(qs(".recipe-detail", root) || root);
    if (!ok) return;

    let recipe;
    let author;
    let comments;
    let liked = false;
    let followRow = null;

    try {
      authorsCache = await Api.getAuthors();
      recipe = await Api.getRecipe(id);
      author = getAuthor(recipe.authorId) || (await Api.getAuthor(recipe.authorId));
      comments = await Api.getComments(id);

      if (Auth.isLoggedIn()) {
        const user = Auth.getUser();
        const likes = await Api.getLikes({ recipeId: id, userId: user.id });
        liked = likes.length > 0;
        const follows = await Api.getFollowing(user.id);
        followRow = follows.find((f) => Number(f.authorId) === Number(recipe.authorId)) || null;
      }
    } catch (e) {
      root.innerHTML = `
        <div class="container section">
          <div class="empty-state">
            <h1 class="display">Рецепт не найден</h1>
            <p>${e.message}</p>
            <p><a href="index.html">Вернуться в каталог</a></p>
          </div>
        </div>`;
      return;
    }

    document.title = `${recipe.title} — VICE BITES`;
    qs("#recipe-image", root).src = recipe.image;
    qs("#recipe-image", root).alt = recipe.title;
    qs("#recipe-title", root).textContent = recipe.title;
    const crumb = qs("#recipe-title-crumb");
    if (crumb) crumb.textContent = recipe.title;
    qs("#recipe-desc", root).textContent = recipe.description;
    qs("#recipe-type", root).textContent = recipe.type;
    qs("#recipe-diff", root).textContent = recipe.difficulty;
    qs("#recipe-time", root).innerHTML =
      ViceIcons.html("icon-clock", "icon") + " " + recipe.time;

    qs("#ingredient-list", root).innerHTML = (recipe.ingredients || [])
      .map((i) => `<li>${i}</li>`)
      .join("");
    qs("#steps-list", root).innerHTML = (recipe.steps || [])
      .map((s) => `<li>${s}</li>`)
      .join("");

    const following = Boolean(followRow);
    qs("#author-box", root).innerHTML = `
      <img src="${author.avatar}" alt="${author.name}" width="64" height="64">
      <div class="flex-grow-1">
        <strong class="display" style="font-size:1.35rem">${author.name}</strong>
        <div class="profile-handle">${author.handle}</div>
        <p class="mb-0 small mt-1">${author.bio || ""}</p>
      </div>
      <button type="button" class="btn btn-vice ${following ? "btn-vice-primary" : "btn-vice-teal"}" id="btn-follow">
        ${following ? "Вы подписаны" : "Подписаться"}
      </button>`;

    qs("#btn-follow", root)?.addEventListener("click", async () => {
      if (!Auth.isLoggedIn()) {
        window.location.href = "login.html";
        return;
      }
      const btn = qs("#btn-follow", root);
      btn.disabled = true;
      try {
        const user = Auth.getUser();
        if (followRow) {
          await Api.removeFollowing(followRow.id);
          followRow = null;
          btn.textContent = "Подписаться";
          btn.classList.remove("btn-vice-primary");
          btn.classList.add("btn-vice-teal");
        } else {
          followRow = await Api.addFollowing(recipe.authorId, user.id);
          btn.textContent = "Вы подписаны";
          btn.classList.add("btn-vice-primary");
          btn.classList.remove("btn-vice-teal");
        }
      } catch (e) {
        alert(e.message);
      } finally {
        btn.disabled = false;
      }
    });

    const likeBtn = qs("#recipe-like", root);
    likeBtn.dataset.like = recipe.id;
    likeBtn.classList.toggle("is-liked", liked);
    likeBtn.setAttribute("aria-pressed", String(liked));
    likeBtn.setAttribute(
      "aria-label",
      `${liked ? "Убрать лайк" : "Поставить лайк"}: ${recipe.title}`
    );
    ViceIcons.set(qs(".heart", likeBtn), ViceIcons.heartId(liked));
    qs(".like-count", likeBtn).textContent = formatLikes(recipe.likes);
    const likedSet = new Set(liked ? [Number(recipe.id)] : []);
    likeBtn.addEventListener("click", () => toggleLike(likeBtn, likedSet));

    const loadVideo = () => {
      qs("#video-frame", root).innerHTML = `<iframe src="${recipe.videoUrl}" title="Видео: ${recipe.title}" allowfullscreen loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
    };
    const videoPh = qs("#video-placeholder", root);
    videoPh?.addEventListener("click", loadVideo);
    videoPh?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        loadVideo();
      }
    });

    renderComments(comments);
    initCommentForm(recipe);
  }

  function renderComments(comments) {
    const list = qs("#comments-list");
    if (!list) return;
    if (!comments.length) {
      list.innerHTML = `<p class="text-muted mb-0">Пока тихо — будь первым, кто оставит комментарий.</p>`;
      return;
    }
    list.innerHTML = comments
      .map(
        (c) => `
      <article class="comment">
        <div class="comment__head">
          <span class="comment__author">${c.author}</span>
          <time>${c.date}</time>
        </div>
        <p class="mb-0">${c.text}</p>
      </article>`
      )
      .join("");
  }

  function initCommentForm(recipe) {
    const form = qs("#comment-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!Auth.isLoggedIn()) {
        window.location.href = "login.html";
        return;
      }

      const user = Auth.getUser();
      const nameInput = qs("#comment-name");
      const textInput = qs("#comment-text");
      const name = (nameInput?.value || "").trim() || user.name || user.email;
      const text = (textInput?.value || "").trim();
      if (!text) {
        textInput?.focus();
        return;
      }

      try {
        await Api.addComment({
          recipeId: Number(recipe.id),
          userId: Number(user.id),
          author: name,
          text,
          date: todayRu(),
        });
        if (textInput) textInput.value = "";
        const comments = await Api.getComments(recipe.id);
        renderComments(comments);
        const modalEl = qs("#commentSuccessModal");
        if (modalEl && window.bootstrap) {
          bootstrap.Modal.getOrCreateInstance(modalEl).show();
        }
      } catch (err) {
        alert(err.message || "Не удалось отправить комментарий");
      }
    });
  }

  /* ---------- Profile ---------- */

  async function initProfile() {
    const root = qs('main[data-page="profile"]') || qs("#profile-page");
    if (!root) return;

    if (!Auth.requireAuth("login.html")) return;

    const user = Auth.getUser();
    qs("#profile-name", root).textContent = user.name || user.email;
    qs("#profile-handle", root).textContent = user.handle || user.email;
    qs("#profile-bio", root).textContent = user.bio || "Пользователь VICE BITES";
    const av = qs("#profile-avatar", root);
    if (av) {
      av.src =
        user.avatar ||
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop";
      av.alt = user.name || "Профиль";
    }

    const savedGrid = qs("#saved-grid", root);
    const pubGrid = qs("#published-grid", root);
    const followList = qs("#following-list", root);

    const card = (recipe, authorMap) => {
      const author = authorMap.get(Number(recipe.authorId)) || { name: "Автор", avatar: "" };
      return `
        <article class="recipe-card">
          <a class="recipe-card__media" href="recipe.html?id=${recipe.id}">
            <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
            <span class="recipe-card__badge">${recipe.type}</span>
          </a>
          <div class="recipe-card__body">
            <h3 class="recipe-card__title"><a href="recipe.html?id=${recipe.id}">${recipe.title}</a></h3>
            <div class="recipe-card__meta">
              <span>${recipe.difficulty}</span>
              <span>${recipe.time}</span>
            </div>
            <div class="recipe-card__footer">
              <div class="author-mini">
                <img src="${author.avatar}" alt="Автор: ${author.name}">
                <span>${author.name}</span>
              </div>
            </div>
          </div>
        </article>`;
    };

    try {
      const [authors, savedRows, published, followingRows] = await Promise.all([
        Api.getAuthors(),
        Api.getSaved(user.id),
        Api.getRecipesByUser(user.id),
        Api.getFollowing(user.id),
      ]);
      const authorMap = new Map(authors.map((a) => [Number(a.id), a]));

      if (savedGrid) {
        const recipes = await Promise.all(
          savedRows.map((s) => Api.getRecipe(s.recipeId).catch(() => null))
        );
        const list = recipes.filter(Boolean);
        savedGrid.innerHTML = list.length
          ? list.map((r) => card(r, authorMap)).join("")
          : `<div class="empty-state" style="grid-column:1/-1"><p>Сохранённых рецептов пока нет.</p></div>`;
      }

      if (pubGrid) {
        pubGrid.innerHTML = published.length
          ? published.map((r) => card(r, authorMap)).join("")
          : `<div class="empty-state" style="grid-column:1/-1"><p>Вы ещё ничего не опубликовали.</p></div>`;
      }

      if (followList) {
        followList.innerHTML = followingRows.length
          ? followingRows
              .map((f) => {
                const a = authorMap.get(Number(f.authorId));
                if (!a) return "";
                return `
            <div class="follow-card" data-follow-id="${f.id}">
              <img src="${a.avatar}" alt="${a.name}">
              <div class="flex-grow-1">
                <strong>${a.name}</strong>
                <div class="small text-muted">${a.handle} · ${(a.followers || 0).toLocaleString("ru-RU")} подписчиков</div>
                <p class="mb-0 small">${a.bio || ""}</p>
              </div>
              <button type="button" class="btn btn-vice btn-vice-ghost btn-sm btn-unfollow">Отписаться</button>
            </div>`;
              })
              .join("")
          : `<p class="text-muted">Подписок нет.</p>`;

        qsa(".btn-unfollow", followList).forEach((btn) => {
          btn.addEventListener("click", async () => {
            const cardEl = btn.closest(".follow-card");
            const id = cardEl?.dataset.followId;
            try {
              await Api.removeFollowing(id);
              cardEl?.remove();
              if (!followList.querySelector(".follow-card")) {
                followList.innerHTML = `<p class="text-muted">Подписок нет.</p>`;
              }
            } catch (e) {
              alert(e.message);
            }
          });
        });
      }
    } catch (e) {
      alert(e.message || "Не удалось загрузить кабинет. Запущен ли API?");
    }
  }

  /* ---------- Auth forms ---------- */

  function initAuthForms() {
    const login = qs("#login-form");
    login?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const alertEl = qs("#login-alert");
      alertEl?.classList.add("d-none");
      const email = qs("#login-email")?.value.trim();
      const password = qs("#login-password")?.value;
      try {
        const data = await Api.login(email, password);
        Auth.saveSession(data);
        window.location.href = "profile.html";
      } catch (err) {
        showApiError(
          alertEl,
          err.status === 400
            ? "Неверный email или пароль."
            : err.message || "Ошибка входа. Запущен ли API на :3000?"
        );
      }
    });

    const register = qs("#register-form");
    register?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const alertEl = qs("#reg-alert");
      alertEl?.classList.add("d-none");
      const pass = qs("#reg-password")?.value;
      const pass2 = qs("#reg-password2")?.value;
      if (pass !== pass2) {
        showApiError(alertEl, "Пароли не совпадают.");
        return;
      }
      const payload = {
        email: qs("#reg-email")?.value.trim(),
        password: pass,
        name: qs("#reg-name")?.value.trim(),
        handle: "@" + (qs("#reg-name")?.value.trim() || "chef").toLowerCase().replace(/\s+/g, "_"),
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
        bio: "Новый кулинар VICE BITES",
      };
      try {
        const data = await Api.register(payload);
        Auth.saveSession(data);
        window.location.href = "profile.html";
      } catch (err) {
        showApiError(
          alertEl,
          err.status === 400
            ? "Email уже занят или данные некорректны."
            : err.message || "Ошибка регистрации. Запущен ли API на :3000?"
        );
      }
    });
  }

  function highlightNav() {
    const page = location.pathname.split("/").pop() || "index.html";
    qsa(".site-header .nav-link").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === page) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    highlightNav();
    initCatalog();
    initRecipePage();
    initProfile();
    initAuthForms();
  });
})();
