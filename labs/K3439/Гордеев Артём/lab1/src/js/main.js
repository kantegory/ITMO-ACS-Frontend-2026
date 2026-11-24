document.addEventListener("DOMContentLoaded", () => {
  // 1. Инициализация тултипов и поповеров Bootstrap при наличии
  if (window.bootstrap) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(el => new bootstrap.Tooltip(el));
  }

  // 2. Интерактивная фильтрация рецептов на главной странице
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const difficultyFilter = document.getElementById("difficulty-filter");
  const recipeCards = document.querySelectorAll(".recipe-item");
  const recipeCountEl = document.getElementById("recipe-count");

  function filterRecipes() {
    if (!recipeCards.length) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const category = categoryFilter ? categoryFilter.value : "all";
    const difficulty = difficultyFilter ? difficultyFilter.value : "all";

    let visibleCount = 0;

    recipeCards.forEach(card => {
      const title = card.getAttribute("data-title") || "";
      const cardCategory = card.getAttribute("data-category") || "";
      const cardDifficulty = card.getAttribute("data-difficulty") || "";
      const ingredients = card.getAttribute("data-ingredients") || "";

      const matchQuery = !query || title.includes(query) || ingredients.includes(query);
      const matchCategory = category === "all" || cardCategory === category;
      const matchDifficulty = difficulty === "all" || cardDifficulty === difficulty;

      if (matchQuery && matchCategory && matchDifficulty) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    if (recipeCountEl) {
      recipeCountEl.textContent = `Найдено рецептов: ${visibleCount}`;
    }
  }

  if (searchInput) searchInput.addEventListener("input", filterRecipes);
  if (categoryFilter) categoryFilter.addEventListener("change", filterRecipes);
  if (difficultyFilter) difficultyFilter.addEventListener("change", filterRecipes);

  // Быстрые кнопки категорий
  const tagButtons = document.querySelectorAll(".btn-category-tag");
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

  // 3. Интерактивные лайки
  document.querySelectorAll(".btn-like").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const icon = btn.querySelector("i");
      const countSpan = btn.querySelector(".like-count");
      let count = parseInt(countSpan.textContent, 10) || 0;

      if (btn.classList.contains("liked")) {
        btn.classList.remove("liked");
        if (icon) {
          icon.classList.remove("bi-heart-fill", "text-danger");
          icon.classList.add("bi-heart");
        }
        countSpan.textContent = Math.max(0, count - 1);
      } else {
        btn.classList.add("liked");
        if (icon) {
          icon.classList.remove("bi-heart");
          icon.classList.add("bi-heart-fill", "text-danger");
        }
        countSpan.textContent = count + 1;
      }
    });
  });

  // 4. Интерактивные закладки
  document.querySelectorAll(".btn-bookmark").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const icon = btn.querySelector("i");
      if (btn.classList.contains("bookmarked")) {
        btn.classList.remove("bookmarked");
        if (icon) {
          icon.classList.remove("bi-bookmark-fill", "text-warning");
          icon.classList.add("bi-bookmark");
        }
      } else {
        btn.classList.add("bookmarked");
        if (icon) {
          icon.classList.remove("bi-bookmark");
          icon.classList.add("bi-bookmark-fill", "text-warning");
        }
      }
    });
  });

  // 5. Кнопка подписки на автора
  document.querySelectorAll(".btn-subscribe").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("subscribed")) {
        btn.classList.remove("subscribed", "btn-secondary");
        btn.classList.add("btn-outline-danger");
        btn.innerHTML = '<i class="bi bi-person-plus me-1"></i>Подписаться';
      } else {
        btn.classList.add("subscribed", "btn-secondary");
        btn.classList.remove("btn-outline-danger");
        btn.innerHTML = '<i class="bi bi-check2 me-1"></i>Вы подписаны';
      }
    });
  });

  // 6. Добавление комментария на странице рецепта
  const commentForm = document.getElementById("comment-form");
  const commentsList = document.getElementById("comments-list");

  if (commentForm && commentsList) {
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const authorInput = document.getElementById("comment-author");
      const textInput = document.getElementById("comment-text");
      const ratingSelect = document.getElementById("comment-rating");

      const author = authorInput ? authorInput.value.trim() : "Гость";
      const text = textInput ? textInput.value.trim() : "";
      const rating = ratingSelect ? parseInt(ratingSelect.value, 10) : 5;

      if (!text) return;

      const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
      const newComment = document.createElement("div");
      newComment.className = "card border-0 shadow-sm mb-3";
      newComment.innerHTML = `
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <strong>${escapeHtml(author)}</strong>
              <span class="text-warning ms-2" title="Оценка ${rating} из 5">${stars}</span>
            </div>
            <small class="text-muted">только что</small>
          </div>
          <p class="card-text mb-0">${escapeHtml(text)}</p>
        </div>
      `;

      commentsList.prepend(newComment);
      commentForm.reset();

      // Увеличение счетчика комментариев
      const commentCountBadge = document.getElementById("comment-count");
      if (commentCountBadge) {
        let current = parseInt(commentCountBadge.textContent, 10) || 0;
        commentCountBadge.textContent = current + 1;
      }
    });
  }

  // 7. Добавление рецепта через модальное окно
  const addRecipeForm = document.getElementById("add-recipe-form");
  if (addRecipeForm) {
    addRecipeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const titleInput = document.getElementById("new-recipe-title");
      const categorySelect = document.getElementById("new-recipe-category");
      const difficultySelect = document.getElementById("new-recipe-difficulty");
      const timeInput = document.getElementById("new-recipe-time");
      const descInput = document.getElementById("new-recipe-desc");

      const title = titleInput ? titleInput.value.trim() : "";
      if (!title) return;

      const category = categorySelect ? categorySelect.value : "dinner";
      const difficulty = difficultySelect ? difficultySelect.value : "easy";
      const time = timeInput ? timeInput.value : "30 мин";
      const desc = descInput ? descInput.value.trim() : "Вкусное домашнее блюдо";

      const categoryLabels = {
        breakfast: "Завтрак",
        lunch: "Обед",
        dinner: "Ужин",
        dessert: "Десерт"
      };

      const difficultyLabels = {
        easy: "Просто",
        medium: "Средне",
        hard: "Сложно"
      };

      // Добавление карточки в список рецептов
      const container = document.getElementById("recipe-cards-container");
      if (container) {
        const col = document.createElement("div");
        col.className = "col recipe-item";
        col.setAttribute("data-title", title.toLowerCase());
        col.setAttribute("data-category", category);
        col.setAttribute("data-difficulty", difficulty);
        col.setAttribute("data-ingredients", "домашние ингредиенты");

        col.innerHTML = `
          <div class="card h-100 recipe-card shadow-sm">
            <img src="images/чизкейк.png" class="card-img-top recipe-card-img" alt="${escapeHtml(title)}">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-danger-subtle text-danger recipe-badge">${categoryLabels[category] || "Блюдо"}</span>
                <span class="badge bg-secondary-subtle text-secondary recipe-badge"><i class="bi bi-clock me-1"></i>${escapeHtml(time)}</span>
              </div>
              <h5 class="card-title fw-bold">
                <a href="recipe.html" class="text-decoration-none text-dark">${escapeHtml(title)}</a>
              </h5>
              <p class="card-text text-muted flex-grow-1 small">${escapeHtml(desc)}</p>
              <div class="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                <small class="text-muted"><i class="bi bi-person me-1"></i>Гордеев Артём</small>
                <div>
                  <button class="btn-action btn-like me-1">
                    <i class="bi bi-heart"></i> <span class="like-count">0</span>
                  </button>
                  <button class="btn-action btn-bookmark">
                    <i class="bi bi-bookmark"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        container.prepend(col);
        filterRecipes();
      }

      // Закрытие модального окна
      const modalEl = document.getElementById("addRecipeModal");
      if (modalEl && window.bootstrap) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      addRecipeForm.reset();
    });
  }

  // 8. Валидация форм входа и регистрации
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach(form => {
    form.addEventListener("submit", event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add("was-validated");
    }, false);
  });
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
