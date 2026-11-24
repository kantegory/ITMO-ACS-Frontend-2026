/**
 * VICE BITES — клиентская логика
 * Фильтры, лайки, комментарии, подписка, модалки
 */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function formatLikes(n) {
    return n.toLocaleString("ru-RU");
  }

  function todayRu() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}.${mm}.${d.getFullYear()}`;
  }

  /* ---------- Catalog / filters ---------- */

  function initCatalog() {
    const grid = qs("#recipe-grid");
    if (!grid || typeof RECIPES === "undefined") return;

    const typeSelect = qs("#filter-type");
    const diffSelect = qs("#filter-difficulty");
    const searchInput = qs("#filter-search");
    const chipBox = qs("#ingredient-chips");
    const resetBtn = qs("#filter-reset");
    const countEl = qs("#results-count");

    const selectedIngredients = new Set();

    if (chipBox) {
      getUniqueIngredients().forEach((ing) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip";
        chip.textContent = ing;
        chip.dataset.ingredient = ing;
        chip.addEventListener("click", () => {
          if (selectedIngredients.has(ing)) {
            selectedIngredients.delete(ing);
            chip.classList.remove("is-active");
          } else {
            selectedIngredients.add(ing);
            chip.classList.add("is-active");
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
        const hay = [
          recipe.title,
          recipe.description,
          recipe.type,
          ...recipe.ingredients,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (selectedIngredients.size) {
        for (const ing of selectedIngredients) {
          if (!recipe.ingredients.includes(ing)) return false;
        }
      }
      return true;
    }

    function cardHtml(recipe) {
      const author = getAuthorById(recipe.authorId);
      const tags = recipe.ingredients
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
                <img src="${author.avatar}" alt="">
                <span>${author.name}</span>
              </div>
              <button type="button" class="btn-like ${recipe.liked ? "is-liked" : ""}" data-like="${recipe.id}" aria-pressed="${recipe.liked}">
                <span class="heart" aria-hidden="true">${recipe.liked ? "♥" : "♡"}</span>
                <span class="like-count">${formatLikes(recipe.likes)}</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }

    function render() {
      const list = RECIPES.filter(matches);
      if (countEl) {
        countEl.textContent = `Найдено: ${list.length}`;
      }
      if (!list.length) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1">
            <h3 class="display">Ничего не нашлось</h3>
            <p>Сбрось фильтры или попробуй другой запрос — закат ещё не кончился.</p>
          </div>`;
        return;
      }
      grid.innerHTML = list.map(cardHtml).join("");
      bindLikeButtons(grid);
    }

    [typeSelect, diffSelect].forEach((el) => {
      el?.addEventListener("change", render);
    });
    searchInput?.addEventListener("input", render);

    resetBtn?.addEventListener("click", () => {
      if (typeSelect) typeSelect.value = "";
      if (diffSelect) diffSelect.value = "";
      if (searchInput) searchInput.value = "";
      selectedIngredients.clear();
      qsa(".chip", chipBox).forEach((c) => c.classList.remove("is-active"));
      render();
    });

    render();
  }

  /* ---------- Likes ---------- */

  function bindLikeButtons(root) {
    qsa("[data-like]", root).forEach((btn) => {
      btn.addEventListener("click", () => toggleLike(btn));
    });
  }

  function toggleLike(btn) {
    const id = btn.dataset.like;
    const recipe = getRecipeById(id);
    if (!recipe) return;

    recipe.liked = !recipe.liked;
    recipe.likes += recipe.liked ? 1 : -1;

    btn.classList.toggle("is-liked", recipe.liked);
    btn.setAttribute("aria-pressed", String(recipe.liked));
    const heart = qs(".heart", btn);
    const count = qs(".like-count", btn);
    if (heart) heart.textContent = recipe.liked ? "♥" : "♡";
    if (count) count.textContent = formatLikes(recipe.likes);
  }

  /* ---------- Recipe page ---------- */

  function initRecipePage() {
    const root = qs("#recipe-page");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "r1";
    const recipe = getRecipeById(id);

    if (!recipe) {
      root.innerHTML = `
        <div class="container section">
          <div class="empty-state">
            <h1 class="display">Рецепт не найден</h1>
            <p><a href="index.html">Вернуться в каталог</a></p>
          </div>
        </div>`;
      return;
    }

    const author = getAuthorById(recipe.authorId);
    document.title = `${recipe.title} — VICE BITES`;

    qs("#recipe-image", root).src = recipe.image;
    qs("#recipe-image", root).alt = recipe.title;
    qs("#recipe-title", root).textContent = recipe.title;
    qs("#recipe-desc", root).textContent = recipe.description;
    qs("#recipe-type", root).textContent = recipe.type;
    qs("#recipe-diff", root).textContent = recipe.difficulty;
    qs("#recipe-time", root).textContent = recipe.time;

    const ingList = qs("#ingredient-list", root);
    ingList.innerHTML = recipe.ingredients.map((i) => `<li>${i}</li>`).join("");

    const steps = qs("#steps-list", root);
    steps.innerHTML = recipe.steps.map((s) => `<li>${s}</li>`).join("");

    const authorBox = qs("#author-box", root);
    authorBox.innerHTML = `
      <img src="${author.avatar}" alt="${author.name}" width="64" height="64">
      <div class="flex-grow-1">
        <strong class="display" style="font-size:1.35rem">${author.name}</strong>
        <div class="profile-handle">${author.handle}</div>
        <p class="mb-0 small mt-1">${author.bio}</p>
      </div>
      <button type="button" class="btn btn-vice btn-vice-teal" id="btn-follow" data-following="false">
        Подписаться
      </button>
    `;

    const followBtn = qs("#btn-follow", root);
    followBtn?.addEventListener("click", () => {
      const on = followBtn.dataset.following === "true";
      followBtn.dataset.following = String(!on);
      followBtn.textContent = on ? "Подписаться" : "Вы подписаны";
      followBtn.classList.toggle("btn-vice-primary", !on);
      followBtn.classList.toggle("btn-vice-teal", on);
    });

    const likeBtn = qs("#recipe-like", root);
    likeBtn.dataset.like = recipe.id;
    likeBtn.classList.toggle("is-liked", recipe.liked);
    likeBtn.setAttribute("aria-pressed", String(recipe.liked));
    qs(".heart", likeBtn).textContent = recipe.liked ? "♥" : "♡";
    qs(".like-count", likeBtn).textContent = formatLikes(recipe.likes);
    likeBtn.addEventListener("click", () => toggleLike(likeBtn));

    const videoBox = qs("#video-frame", root);
    const loadVideo = () => {
      videoBox.innerHTML = `<iframe src="${recipe.videoUrl}" title="Видео: ${recipe.title}" allowfullscreen loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
    };
    qs("#video-placeholder", root)?.addEventListener("click", loadVideo);

    renderComments(recipe);
    initCommentForm(recipe);
  }

  function renderComments(recipe) {
    const list = qs("#comments-list");
    if (!list) return;

    if (!recipe.comments.length) {
      list.innerHTML = `<p class="text-muted mb-0">Пока тихо — будь первым, кто оставит комментарий.</p>`;
      return;
    }

    list.innerHTML = recipe.comments
      .map(
        (c) => `
      <article class="comment">
        <div class="comment__head">
          <span class="comment__author">${c.author}</span>
          <time datetime="${c.date}">${c.date}</time>
        </div>
        <p class="mb-0">${c.text}</p>
      </article>`
      )
      .join("");
  }

  function initCommentForm(recipe) {
    const form = qs("#comment-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = qs("#comment-name");
      const textInput = qs("#comment-text");
      const name = (nameInput?.value || "").trim() || "Гость";
      const text = (textInput?.value || "").trim();
      if (!text) {
        textInput?.focus();
        return;
      }

      recipe.comments.unshift({
        id: "c" + Date.now(),
        author: name,
        text,
        date: todayRu(),
      });

      if (textInput) textInput.value = "";
      renderComments(recipe);

      const modalEl = qs("#commentSuccessModal");
      if (modalEl && window.bootstrap) {
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      }
    });
  }

  /* ---------- Profile ---------- */

  function initProfile() {
    const root = qs("#profile-page");
    if (!root || typeof CURRENT_USER === "undefined") return;

    qs("#profile-name", root).textContent = CURRENT_USER.name;
    qs("#profile-handle", root).textContent = CURRENT_USER.handle;
    qs("#profile-bio", root).textContent = CURRENT_USER.bio;
    const av = qs("#profile-avatar", root);
    if (av) {
      av.src = CURRENT_USER.avatar;
      av.alt = CURRENT_USER.name;
    }

    const savedGrid = qs("#saved-grid", root);
    const pubGrid = qs("#published-grid", root);
    const followList = qs("#following-list", root);

    const card = (recipe) => {
      const author = getAuthorById(recipe.authorId);
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
                <img src="${author.avatar}" alt="">
                <span>${author.name}</span>
              </div>
            </div>
          </div>
        </article>`;
    };

    if (savedGrid) {
      const saved = CURRENT_USER.savedIds.map(getRecipeById).filter(Boolean);
      savedGrid.innerHTML = saved.length
        ? saved.map(card).join("")
        : `<div class="empty-state" style="grid-column:1/-1"><p>Сохранённых рецептов пока нет.</p></div>`;
    }

    if (pubGrid) {
      const pubs = CURRENT_USER.publishedIds.map(getRecipeById).filter(Boolean);
      pubGrid.innerHTML = pubs.length
        ? pubs.map(card).join("")
        : `<div class="empty-state" style="grid-column:1/-1"><p>Вы ещё ничего не опубликовали.</p></div>`;
    }

    if (followList) {
      const following = CURRENT_USER.followingIds.map(getAuthorById).filter(Boolean);
      followList.innerHTML = following
        .map(
          (a) => `
        <div class="follow-card">
          <img src="${a.avatar}" alt="${a.name}">
          <div class="flex-grow-1">
            <strong>${a.name}</strong>
            <div class="small text-muted">${a.handle} · ${a.followers.toLocaleString("ru-RU")} подписчиков</div>
            <p class="mb-0 small">${a.bio}</p>
          </div>
          <button type="button" class="btn btn-vice btn-vice-ghost btn-sm btn-unfollow">Отписаться</button>
        </div>`
        )
        .join("");

      qsa(".btn-unfollow", followList).forEach((btn) => {
        btn.addEventListener("click", () => {
          btn.closest(".follow-card")?.remove();
          if (!followList.children.length) {
            followList.innerHTML = `<p class="text-muted">Подписок нет.</p>`;
          }
        });
      });
    }
  }

  /* ---------- Auth forms (demo) ---------- */

  function initAuthForms() {
    const login = qs("#login-form");
    login?.addEventListener("submit", (e) => {
      e.preventDefault();
      window.location.href = "profile.html";
    });

    const register = qs("#register-form");
    register?.addEventListener("submit", (e) => {
      e.preventDefault();
      const pass = qs("#reg-password")?.value;
      const pass2 = qs("#reg-password2")?.value;
      if (pass !== pass2) {
        const alert = qs("#reg-alert");
        if (alert) {
          alert.textContent = "Пароли не совпадают.";
          alert.classList.remove("d-none");
        }
        return;
      }
      window.location.href = "profile.html";
    });
  }

  /* ---------- Active nav ---------- */

  function highlightNav() {
    const page = location.pathname.split("/").pop() || "index.html";
    qsa(".site-header .nav-link").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === page || (page === "" && href === "index.html")) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------- Boot ---------- */

  document.addEventListener("DOMContentLoaded", () => {
    highlightNav();
    initCatalog();
    initRecipePage();
    initProfile();
    initAuthForms();
    bindLikeButtons(document);
  });
})();
