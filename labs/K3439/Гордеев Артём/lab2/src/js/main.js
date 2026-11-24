/**
 * Основной скрипт кулинарного блога "Отравись-ка"
 */

const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initAuthUI();
  initBootstrapComponents();
  initAddRecipeModal();

  // Инициализация специфичной логики для страниц
  initHomePage();
  initLoginPage();
  initRegisterPage();
  initProfilePage();
  initRecipeDetailsPage();
});

/**
 * ==========================================================
 * Темизация оформления (светлая / тёмная)
 * С сохранением выбора в localStorage
 * ==========================================================
 */
function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  // Определение сохраненной или системной темы
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const currentTheme = savedTheme || document.documentElement.getAttribute("data-theme") || (systemPrefersDark ? "dark" : "light");

  applyTheme(currentTheme);
  updateThemeButtonUI(toggleBtn, currentTheme);

  toggleBtn.addEventListener("click", () => {
    const active = document.documentElement.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const newTheme = active === "dark" ? "light" : "dark";

    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    updateThemeButtonUI(toggleBtn, newTheme);
  });

  // Отслеживание изменений системной темы (если пользователь не задал вручную)
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        const autoTheme = e.matches ? "dark" : "light";
        applyTheme(autoTheme);
        updateThemeButtonUI(toggleBtn, autoTheme);
      }
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.body.setAttribute("data-theme", theme);
}

function updateThemeButtonUI(btn, theme) {
  const iconUse = btn.querySelector("use");
  const isDark = theme === "dark";

  if (iconUse) {
    iconUse.setAttribute("href", isDark ? "#sun" : "#moon");
    iconUse.setAttribute("xlink:href", isDark ? "#sun" : "#moon");
  }
  btn.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
  btn.setAttribute("title", isDark ? "Включить светлую тему" : "Включить тёмную тему");
}

/**
 * ==========================================================
 * Динамический навбар и авторизация
 * ==========================================================
 */
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Ошибка парсинга данных пользователя:", e);
    return null;
  }
}

function getAccessToken() {
  return localStorage.getItem("accessToken") || null;
}

function initAuthUI() {
  const authContainer = document.getElementById("nav-auth-container");
  if (!authContainer) return;

  const token = getAccessToken();
  const user = getCurrentUser();

  if (token && user) {
    // Пользователь авторизован
    authContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <a href="profile.html" class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" title="Личный кабинет">
          <svg class="icon" aria-hidden="true"><use xlink:href="#person-circle"></use></svg>
          <span class="user-display-name fw-medium">${escapeHtml(user.name || user.email)}</span>
        </a>
        <button id="btn-logout" class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" title="Выйти" aria-label="Выйти из аккаунта">
          <svg class="icon" aria-hidden="true"><use xlink:href="#logout"></use></svg>
          <span class="d-none d-sm-inline">Выход</span>
        </button>
      </div>
    `;

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.reload();
      });
    }
  } else {
    // Гость
    authContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <a href="login.html" class="btn btn-danger btn-sm">Вход</a>
        <a href="register.html" class="btn btn-outline-danger btn-sm">Регистрация</a>
      </div>
    `;
  }
}

/**
 * ==========================================================
 * Инициализация Bootstrap компонентов
 * ==========================================================
 */
function initBootstrapComponents() {
  if (window.bootstrap) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(el => new bootstrap.Tooltip(el));
  }
}

/**
 * ==========================================================
 * Главная страница: Загрузка, фильтрация и добавление рецептов
 * ==========================================================
 */
let allRecipes = [];

function initHomePage() {
  const container = document.getElementById("recipe-cards-container");
  if (!container) return;

  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const difficultyFilter = document.getElementById("difficulty-filter");
  const recipeCountEl = document.getElementById("recipe-count");
  const tagButtons = document.querySelectorAll(".btn-category-tag");
  const addRecipeForm = document.getElementById("add-recipe-form");

  // Загрузка рецептов с JSON-сервера
  fetchRecipes();

  async function fetchRecipes() {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Загрузка рецептов...</span>
        </div>
        <p class="text-muted mt-2">Загружаем аппетитные рецепты...</p>
      </div>
    `;

    try {
      const response = await fetch(`${API_URL}/recipes`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      allRecipes = await response.json();
      renderRecipes(allRecipes);
    } catch (err) {
      console.warn("Не удалось загрузить с сервера, используем локальные данные:", err);
      // Запасной список рецептов, если сервер временно не запущен
      allRecipes = [
        {
          id: 1,
          title: "Паста Карбонара по-домашнему",
          category: "dinner",
          difficulty: "medium",
          time: "25 мин",
          desc: "Классическая итальянская паста с хрустящим беконом, сливочным соусом из желтков и ароматным пармезаном.",
          author: "Шеф Марко",
          image: "images/карбонара.png",
          likes: 142
        },
        {
          id: 2,
          title: "Греческий салат с фетой",
          category: "lunch",
          difficulty: "easy",
          time: "15 мин",
          desc: "Свежие овощи, сочные томаты черри, хрустящий огурец и нежная фета с оливковым маслом первого отжима.",
          author: "Елена Соколова",
          image: "images/греческий.png",
          likes: 89
        },
        {
          id: 3,
          title: "Домашний наваристый борщ",
          category: "lunch",
          difficulty: "hard",
          time: "90 мин",
          desc: "Традиционный борщ на мясном бульоне со свеклой, чесночной заправкой и ароматной зеленью.",
          author: "Бабушка Нина",
          image: "images/борщ.png",
          likes: 310
        },
        {
          id: 4,
          title: "Пышные американские панкейки",
          category: "breakfast",
          difficulty: "easy",
          time: "20 мин",
          desc: "Воздушные блинчики на молоке с добавлением свежих ягод черники и кленового сиропа.",
          author: "Шеф Артём",
          userId: 1,
          image: "images/панки.png",
          likes: 215
        },
        {
          id: 5,
          title: "Классический чизкейк Нью-Йорк",
          category: "dessert",
          difficulty: "medium",
          time: "60 мин",
          desc: "Нежнейшая кремовая текстура на основе творожного сыра с хрустящей песочной основой.",
          author: "Кондитер Анна",
          image: "images/чизкейк.png",
          likes: 198
        },
        {
          id: 6,
          title: "Хрустящая пицца Пепперони",
          category: "dinner",
          difficulty: "medium",
          time: "35 мин",
          desc: "Пышное воздушное тесто с аппетитной сырной корочкой, пряным томатным соусом и колбасками пепперони.",
          author: "Шеф Марко",
          image: "images/пицца.png",
          likes: 276
        }
      ];
      renderRecipes(allRecipes);
    }
  }

  function renderRecipes(recipesToRender) {
    if (!recipesToRender.length) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="fs-5 text-muted">Рецептов не найдено. Попробуйте изменить параметры поиска.</p>
        </div>
      `;
      if (recipeCountEl) recipeCountEl.textContent = "Найдено рецептов: 0";
      return;
    }

    const categoryLabels = {
      breakfast: "Завтрак",
      lunch: "Обед",
      dinner: "Ужин",
      dessert: "Десерт"
    };

    const categoryBadgeStyles = {
      breakfast: "bg-warning-subtle text-warning",
      lunch: "bg-success-subtle text-success",
      dinner: "bg-danger-subtle text-danger",
      dessert: "bg-primary-subtle text-primary"
    };

    const difficultyLabels = {
      easy: "Просто",
      medium: "Средне",
      hard: "Сложно"
    };

    const difficultyBadgeStyles = {
      easy: "bg-info-subtle text-info",
      medium: "bg-warning-subtle text-warning",
      hard: "bg-danger-subtle text-danger"
    };

    container.innerHTML = recipesToRender.map(recipe => {
      const catLabel = categoryLabels[recipe.category] || "Блюдо";
      const catStyle = categoryBadgeStyles[recipe.category] || "bg-secondary-subtle text-secondary";
      const diffLabel = difficultyLabels[recipe.difficulty] || "Средне";
      const diffStyle = difficultyBadgeStyles[recipe.difficulty] || "bg-secondary-subtle text-secondary";

      return `
        <article class="col recipe-item" data-id="${recipe.id}" data-title="${escapeHtml(recipe.title.toLowerCase())}" data-category="${escapeHtml(recipe.category)}" data-difficulty="${escapeHtml(recipe.difficulty)}" aria-label="${escapeHtml(recipe.title)}">
          <div class="card h-100 recipe-card shadow-sm">
            <img src="${escapeHtml(recipe.image || 'images/чизкейк.png')}" class="card-img-top recipe-card-img" alt="Фото блюда: ${escapeHtml(recipe.title)}">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge ${catStyle} recipe-badge">${catLabel}</span>
                <span class="badge bg-secondary-subtle text-secondary recipe-badge d-flex align-items-center gap-1">
                  <svg class="icon" aria-hidden="true"><use xlink:href="#clock"></use></svg>
                  <span>${escapeHtml(recipe.time || '30 мин')}</span>
                </span>
                <span class="badge ${diffStyle} recipe-badge">${diffLabel}</span>
              </div>
              <h5 class="card-title fw-bold">
                <a href="recipe.html?id=${recipe.id}" class="text-decoration-none">${escapeHtml(recipe.title)}</a>
              </h5>
              <p class="card-text text-muted flex-grow-1 small">${escapeHtml(recipe.desc)}</p>
              <div class="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                <small class="text-muted d-flex align-items-center gap-1">
                  <svg class="icon" aria-hidden="true"><use xlink:href="#person"></use></svg>
                  <span>${escapeHtml(recipe.author || 'Шеф')}</span>
                </small>
                <div class="d-flex align-items-center">
                  <button class="btn-action btn-like me-1" title="Нравится" aria-label="Нравится рецепт ${escapeHtml(recipe.title)}">
                    <svg class="icon" aria-hidden="true"><use xlink:href="#heart"></use></svg>
                    <span class="like-count">${recipe.likes || 0}</span>
                  </button>
                  <button class="btn-action btn-bookmark" title="В закладки" aria-label="Сохранить в закладки рецепт ${escapeHtml(recipe.title)}">
                    <svg class="icon" aria-hidden="true"><use xlink:href="#bookmark"></use></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");

    if (recipeCountEl) {
      recipeCountEl.textContent = `Найдено рецептов: ${recipesToRender.length}`;
    }

    bindCardSocialActions();
  }

  function filterRecipes() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const category = categoryFilter ? categoryFilter.value : "all";
    const difficulty = difficultyFilter ? difficultyFilter.value : "all";

    const filtered = allRecipes.filter(recipe => {
      const matchQuery = !query ||
        recipe.title.toLowerCase().includes(query) ||
        (recipe.desc && recipe.desc.toLowerCase().includes(query));
      const matchCategory = category === "all" || recipe.category === category;
      const matchDifficulty = difficulty === "all" || recipe.difficulty === difficulty;

      return matchQuery && matchCategory && matchDifficulty;
    });

    renderRecipes(filtered);
  }

  if (searchInput) searchInput.addEventListener("input", filterRecipes);
  if (categoryFilter) categoryFilter.addEventListener("change", filterRecipes);
  if (difficultyFilter) difficultyFilter.addEventListener("change", filterRecipes);

  const searchBtn = document.getElementById("btn-search");
  if (searchBtn) searchBtn.addEventListener("click", filterRecipes);

  tagButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tagButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (categoryFilter) {
        categoryFilter.value = btn.getAttribute("data-category");
        filterRecipes();
      }
    });
  });

  // Слушатель добавления рецепта вынесен в initAddRecipeModal()
}

/**
 * Инициализация модального окна добавления рецепта
 */
function initAddRecipeModal() {
  const addRecipeForm = document.getElementById("add-recipe-form");
  if (!addRecipeForm) return;

  addRecipeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = getAccessToken();
    const user = getCurrentUser();

    if (!token) {
      alert("Для добавления рецепта необходимо войти в систему.");
      window.location.href = "login.html";
      return;
    }

    const titleInput = document.getElementById("new-recipe-title");
    const categorySelect = document.getElementById("new-recipe-category");
    const difficultySelect = document.getElementById("new-recipe-difficulty");
    const timeInput = document.getElementById("new-recipe-time");
    const descInput = document.getElementById("new-recipe-desc");

    const title = titleInput ? titleInput.value.trim() : "";
    if (!title) return;

    const newRecipe = {
      title: title,
      category: categorySelect ? categorySelect.value : "dinner",
      difficulty: difficultySelect ? difficultySelect.value : "easy",
      time: timeInput ? timeInput.value.trim() : "30 мин",
      desc: descInput ? descInput.value.trim() : "Вкусное домашнее блюдо",
      author: user ? (user.name || user.username || user.email) : "Кулинар",
      userId: user ? user.id : null,
      image: "images/чизкейк.png",
      likes: 0
    };

    try {
      const response = await fetch(`${API_URL}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newRecipe)
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const savedRecipe = await response.json();
      if (typeof allRecipes !== "undefined" && typeof renderRecipes === "function") {
        allRecipes.unshift(savedRecipe);
        renderRecipes(allRecipes);
      }
      if (typeof loadUserRecipes === "function" && document.getElementById("my-recipes-list")) {
        loadUserRecipes(user);
      }
    } catch (err) {
      console.warn("Не удалось отправить на сервер, добавляем в локальный список:", err);
      newRecipe.id = Date.now();
      if (typeof allRecipes !== "undefined" && typeof renderRecipes === "function") {
        allRecipes.unshift(newRecipe);
        renderRecipes(allRecipes);
      }
      if (typeof loadUserRecipes === "function" && document.getElementById("my-recipes-list")) {
        loadUserRecipes(user);
      }
    }

    // Закрытие модального окна и очистка формы
    const modalEl = document.getElementById("addRecipeModal");
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
    addRecipeForm.reset();
  });
}

/**
 * Интерактивные лайки и закладки на карточках
 */
function bindCardSocialActions() {
  document.querySelectorAll(".btn-like").forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const countSpan = btn.querySelector(".like-count");
      const useEl = btn.querySelector("use");
      let count = parseInt(countSpan.textContent, 10) || 0;

      if (btn.classList.contains("liked")) {
        btn.classList.remove("liked");
        if (useEl) {
          useEl.setAttribute("href", "#heart");
          useEl.setAttribute("xlink:href", "#heart");
        }
        countSpan.textContent = Math.max(0, count - 1);
      } else {
        btn.classList.add("liked");
        if (useEl) {
          useEl.setAttribute("href", "#heart-fill");
          useEl.setAttribute("xlink:href", "#heart-fill");
        }
        countSpan.textContent = count + 1;
      }
    };
  });

  document.querySelectorAll(".btn-bookmark").forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const useEl = btn.querySelector("use");
      if (btn.classList.contains("bookmarked")) {
        btn.classList.remove("bookmarked");
        if (useEl) {
          useEl.setAttribute("href", "#bookmark");
          useEl.setAttribute("xlink:href", "#bookmark");
        }
      } else {
        btn.classList.add("bookmarked");
        if (useEl) {
          useEl.setAttribute("href", "#bookmark-fill");
          useEl.setAttribute("xlink:href", "#bookmark-fill");
        }
      }
    };
  });
}

/**
 * ==========================================================
 * Страница авторизации (login.html)
 * ==========================================================
 */
function initLoginPage() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  const errorAlert = document.getElementById("login-error-alert");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginForm.classList.add("was-validated");

    if (!loginForm.checkValidity()) return;

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const submitBtn = loginForm.querySelector("button[type='submit']");

    if (errorAlert) errorAlert.classList.add("d-none");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Вход...
      `;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Неверный логин или пароль");
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "profile.html";
    } catch (err) {
      console.error("Ошибка входа:", err);
      if (errorAlert) {
        errorAlert.textContent = "Неверный адрес электронной почты или пароль. Попробуйте еще раз.";
        errorAlert.classList.remove("d-none");
      } else {
        alert("Ошибка входа: " + err.message);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Войти в аккаунт";
      }
    }
  });
}

/**
 * ==========================================================
 * Страница регистрации (register.html)
 * ==========================================================
 */
function initRegisterPage() {
  const registerForm = document.getElementById("register-form");
  if (!registerForm) return;

  const errorAlert = document.getElementById("register-error-alert");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    registerForm.classList.add("was-validated");

    const passInput = document.getElementById("reg-password");
    const confirmPassInput = document.getElementById("reg-confirm-password");

    if (passInput && confirmPassInput && passInput.value !== confirmPassInput.value) {
      confirmPassInput.setCustomValidity("Пароли не совпадают");
    } else if (confirmPassInput) {
      confirmPassInput.setCustomValidity("");
    }

    if (!registerForm.checkValidity()) return;

    const firstName = document.getElementById("reg-firstname") ? document.getElementById("reg-firstname").value.trim() : "";
    const lastName = document.getElementById("reg-lastname") ? document.getElementById("reg-lastname").value.trim() : "";
    const username = document.getElementById("reg-username") ? document.getElementById("reg-username").value.trim() : "";
    const email = document.getElementById("reg-email").value.trim();
    const password = passInput.value;
    const fullName = `${firstName} ${lastName}`.trim() || username || email;

    const submitBtn = registerForm.querySelector("button[type='submit']");
    if (errorAlert) errorAlert.classList.add("d-none");

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Регистрация...
      `;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: fullName,
          username: username || email.split("@")[0],
          bio: "Кулинарный энтузиаст"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Не удалось зарегистрировать пользователя");
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "profile.html";
    } catch (err) {
      console.error("Ошибка регистрации:", err);
      if (errorAlert) {
        errorAlert.textContent = "Пользователь с таким email уже существует или введены некорректные данные.";
        errorAlert.classList.remove("d-none");
      } else {
        alert("Ошибка регистрации: " + err.message);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Зарегистрироваться";
      }
    }
  });
}

/**
 * ==========================================================
 * Страница личного кабинета (profile.html)
 * ==========================================================
 */
function initProfilePage() {
  const profileContainer = document.getElementById("profile-info-container");
  if (!profileContainer) return;

  const user = getCurrentUser();
  const token = getAccessToken();

  if (!token || !user) {
    profileContainer.innerHTML = `
      <div class="alert alert-warning text-center" role="alert">
        <h4 class="alert-heading">Вы не авторизованы</h4>
        <p>Для просмотра личного кабинета и добавления рецептов войдите в систему.</p>
        <hr>
        <div class="d-flex justify-content-center gap-2">
          <a href="login.html" class="btn btn-danger">Войти</a>
          <a href="register.html" class="btn btn-outline-danger">Регистрация</a>
        </div>
      </div>
    `;
    return;
  }

  // Обновление имени, email и никнейма в профиле
  const nameEl = document.getElementById("profile-name");
  const handleEl = document.getElementById("profile-handle");
  const emailEl = document.getElementById("profile-email");
  const bioEl = document.getElementById("profile-bio");

  if (nameEl) nameEl.textContent = user.name || user.username || user.email;
  if (handleEl) handleEl.textContent = `@${user.username || user.email.split("@")[0]}`;
  if (emailEl) emailEl.textContent = user.email;
  if (bioEl && user.bio) bioEl.textContent = user.bio;

  // Загрузка рецептов пользователя
  loadUserRecipes(user);
}

async function loadUserRecipes(user) {
  const userRecipesContainer = document.getElementById("my-recipes-list");
  if (!userRecipesContainer) return;

  try {
    const response = await fetch(`${API_URL}/recipes`);
    if (!response.ok) throw new Error("HTTP error");
    const recipes = await response.json();

    const myRecipes = recipes.filter(r => 
      (r.userId && Number(r.userId) === Number(user.id)) ||
      (r.author && user.name && r.author.toLowerCase() === user.name.toLowerCase()) ||
      (r.author && user.username && r.author.toLowerCase() === user.username.toLowerCase())
    );

    const countTabEl = document.getElementById("my-recipes-count");
    if (countTabEl) countTabEl.textContent = `(${myRecipes.length})`;

    const statRecipesEl = document.getElementById("profile-stat-recipes");
    if (statRecipesEl) statRecipesEl.textContent = myRecipes.length;

    if (myRecipes.length === 0) {
      userRecipesContainer.innerHTML = `
        <div class="col-12 text-center py-4 text-muted">
          <p>У вас пока нет опубликованных рецептов.</p>
          <button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#addRecipeModal">
            <svg class="icon me-1" aria-hidden="true"><use xlink:href="#plus"></use></svg>
            Создать первый рецепт
          </button>
        </div>
      `;
      return;
    }

    userRecipesContainer.innerHTML = myRecipes.map(recipe => `
      <div class="col">
        <div class="card h-100 recipe-card shadow-sm">
          <img src="${escapeHtml(recipe.image || 'images/чизкейк.png')}" class="card-img-top recipe-card-img" alt="Фото: ${escapeHtml(recipe.title)}">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-danger-subtle text-danger recipe-badge">${escapeHtml(recipe.category)}</span>
              <span class="badge bg-secondary-subtle text-secondary recipe-badge d-flex align-items-center gap-1">
                <svg class="icon" aria-hidden="true"><use xlink:href="#clock"></use></svg>
                <span>${escapeHtml(recipe.time || '30 мин')}</span>
              </span>
            </div>
            <h5 class="card-title fw-bold">
              <a href="recipe.html?id=${recipe.id}" class="text-decoration-none">${escapeHtml(recipe.title)}</a>
            </h5>
            <p class="card-text text-muted flex-grow-1 small">${escapeHtml(recipe.desc)}</p>
            <div class="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
              <small class="text-muted">${recipe.likes || 0} оценок</small>
              <button class="btn btn-sm btn-outline-danger btn-action" title="Удалить" onclick="deleteRecipe(${recipe.id})">
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.warn("Не удалось загрузить рецепты пользователя с сервера:", err);
  }
}

async function deleteRecipe(id) {
  const token = getAccessToken();
  if (!confirm("Вы уверены, что хотите удалить рецепт?")) return;

  try {
    const response = await fetch(`${API_URL}/recipes/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (response.ok) {
      const user = getCurrentUser();
      if (user) loadUserRecipes(user);
    }
  } catch (err) {
    console.error("Ошибка при удалении рецепта:", err);
  }
}
window.deleteRecipe = deleteRecipe;

/**
 * ==========================================================
 * Детальная страница рецепта (recipe.html)
 * ==========================================================
 */
function initRecipeDetailsPage() {
  // Динамическая загрузка рецепта по id из URL-параметров
  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get("id");

  if (recipeId) {
    loadRecipeDetails(recipeId);
  }

  const commentForm = document.getElementById("comment-form");
  const commentsList = document.getElementById("comments-list");

  if (commentForm && commentsList) {
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const textarea = document.getElementById("comment-text");
      const text = textarea ? textarea.value.trim() : "";
      if (!text) return;

      const user = getCurrentUser();
      const authorName = user ? (user.name || user.email) : "Гость";

      const newComment = document.createElement("div");
      newComment.className = "card mb-3 border-0 bg-light p-3 rounded-3";
      newComment.innerHTML = `
        <div class="card-body p-0">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <h6 class="card-subtitle fw-bold mb-0 d-flex align-items-center gap-1">
              <svg class="icon text-danger" aria-hidden="true"><use xlink:href="#person-circle"></use></svg>
              <span>${escapeHtml(authorName)}</span>
            </h6>
            <small class="text-muted">только что</small>
          </div>
          <p class="card-text mb-0 mt-2">${escapeHtml(text)}</p>
        </div>
      `;

      commentsList.prepend(newComment);
      commentForm.reset();

      const commentCountBadge = document.getElementById("comment-count");
      if (commentCountBadge) {
        let current = parseInt(commentCountBadge.textContent, 10) || 0;
        commentCountBadge.textContent = current + 1;
      }
    });
  }

  // Подписка на автора
  const subscribeBtn = document.querySelector(".btn-subscribe");
  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", () => {
      if (subscribeBtn.classList.contains("subscribed")) {
        subscribeBtn.classList.remove("subscribed", "btn-secondary");
        subscribeBtn.classList.add("btn-outline-danger");
        subscribeBtn.innerHTML = `
          <svg class="icon me-1" aria-hidden="true"><use xlink:href="#plus"></use></svg>
          <span>Подписаться</span>
        `;
      } else {
        subscribeBtn.classList.add("subscribed", "btn-secondary");
        subscribeBtn.classList.remove("btn-outline-danger");
        subscribeBtn.innerHTML = `
          <svg class="icon me-1" aria-hidden="true"><use xlink:href="#check"></use></svg>
          <span>Вы подписаны</span>
        `;
      }
    });
  }
}

async function loadRecipeDetails(id) {
  try {
    const response = await fetch(`${API_URL}/recipes/${id}`);
    if (!response.ok) return;
    const recipe = await response.json();
    renderRecipeDetails(recipe);
  } catch (err) {
    console.warn("Не удалось загрузить данные рецепта с API:", err);
  }
}

function renderRecipeDetails(recipe) {
  const titleEl = document.getElementById("recipe-title");
  const descEl = document.getElementById("recipe-desc");
  const imgEl = document.getElementById("recipe-main-img");
  const timeEl = document.getElementById("recipe-time");
  const catEl = document.getElementById("recipe-category");
  const authorEl = document.getElementById("recipe-author");
  const likesEl = document.getElementById("recipe-likes");
  const breadcrumbEl = document.getElementById("recipe-breadcrumb");

  if (titleEl && recipe.title) titleEl.textContent = recipe.title;
  if (breadcrumbEl && recipe.title) breadcrumbEl.textContent = recipe.title;
  if (descEl && recipe.desc) descEl.textContent = recipe.desc;
  if (imgEl && recipe.image) {
    imgEl.src = recipe.image;
    imgEl.alt = `Фото блюда: ${recipe.title}`;
  }
  if (timeEl && recipe.time) timeEl.textContent = recipe.time;
  if (catEl && recipe.category) {
    const categoryLabels = { breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", dessert: "Десерт" };
    catEl.textContent = categoryLabels[recipe.category] || recipe.category;
  }
  if (authorEl && recipe.author) authorEl.textContent = recipe.author;
  if (likesEl && recipe.likes !== undefined) likesEl.textContent = recipe.likes;
}

/**
 * Безопасное экранирование HTML
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}
