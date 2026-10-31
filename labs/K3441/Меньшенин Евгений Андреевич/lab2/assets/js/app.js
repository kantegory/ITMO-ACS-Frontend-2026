document.addEventListener('DOMContentLoaded', () => {
  const { api, session } = window.LozhkaApi;
  const page = document.body.dataset.page;
  const toastElement = document.querySelector('#liveToast');
  const toastBody = toastElement?.querySelector('.toast-body');

  const notify = (message) => {
    if (!toastElement) return;
    toastBody.textContent = message;
    if (window.bootstrap?.Toast) bootstrap.Toast.getOrCreateInstance(toastElement).show();
    else toastElement.classList.add('show');
  };

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));

  const showState = (container, kind, message) => {
    const icons = { loading: 'hourglass-split', error: 'exclamation-triangle', empty: 'search' };
    container.innerHTML = `<div class="col-12"><div class="api-state ${kind}" role="${kind === 'error' ? 'alert' : 'status'}"><i class="bi bi-${icons[kind]}"></i><p>${escapeHtml(message)}</p>${kind === 'error' ? '<button class="btn btn-outline-primary" type="button" onclick="location.reload()">Повторить</button>' : ''}</div></div>`;
  };

  const recipeCard = (recipe, favoriteIds = new Set(), columns = 'col-md-6 col-lg-4') => `
    <div class="${columns} recipe-col">
      <article class="paper-card hoverable h-100">
        <div class="recipe-visual ${escapeHtml(recipe.visual)}"><span class="food-emoji">${escapeHtml(recipe.emoji)}</span><span class="time-pill"><i class="bi bi-clock"></i> ${recipe.time} мин</span></div>
        <div class="p-4"><div class="d-flex justify-content-between"><span class="tag-pill">${escapeHtml(recipe.difficultyLabel)}</span><span class="rating">★ ${String(recipe.rating).replace('.', ',')}</span></div>
          <h2 class="h4 mt-3">${escapeHtml(recipe.shortTitle || recipe.title)}</h2><p class="text-muted">${escapeHtml(recipe.description)}</p>
          <div class="d-flex justify-content-between align-items-center"><a href="recipe.html?id=${encodeURIComponent(recipe.id)}" class="btn btn-dark">Открыть</a><button class="btn btn-outline-primary icon-button ${favoriteIds.has(String(recipe.id)) ? 'active' : ''}" data-favorite-id="${escapeHtml(recipe.id)}" aria-label="Добавить в избранное"><i class="bi bi-heart${favoriteIds.has(String(recipe.id)) ? '-fill' : ''}"></i></button></div>
        </div>
      </article>
    </div>`;

  const requireUser = () => {
    if (session.user) return session.user;
    notify('Сначала войдите в аккаунт');
    setTimeout(() => { location.href = 'login.html'; }, 700);
    return null;
  };

  async function getFavorites() {
    if (!session.user) return [];
    return api(`/favorites?userId=${encodeURIComponent(session.user.id)}`);
  }

  async function toggleFavorite(button) {
    const user = requireUser();
    if (!user) return;
    button.disabled = true;
    try {
      const recipeId = String(button.dataset.favoriteId);
      const matches = await api(`/favorites?userId=${encodeURIComponent(user.id)}&recipeId=${encodeURIComponent(recipeId)}`);
      if (matches.length) {
        await api(`/favorites/${matches[0].id}`, { method: 'DELETE' });
        button.classList.remove('active');
        button.querySelector('i').className = 'bi bi-heart';
        notify('Рецепт удалён из сохранённых');
      } else {
        await api('/favorites', { method: 'POST', body: JSON.stringify({ userId: String(user.id), recipeId }) });
        button.classList.add('active');
        button.querySelector('i').className = 'bi bi-heart-fill';
        notify('Рецепт сохранён');
      }
    } catch (error) { notify(error.message); }
    finally { button.disabled = false; }
  }

  document.addEventListener('click', (event) => {
    const favorite = event.target.closest('[data-favorite-id]');
    if (favorite) toggleFavorite(favorite);

    const comingSoon = event.target.closest('[data-coming-soon]');
    if (comingSoon) {
      event.preventDefault();
      notify('Эта возможность скоро появится');
    }
  });

  document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', () => {
    session.clear();
    location.href = 'index.html';
  }));

  function updateAccountLinks() {
    if (!session.user) return;
    document.querySelectorAll('[data-guest-only]').forEach((node) => node.classList.add('d-none'));
    document.querySelectorAll('[data-user-only]').forEach((node) => node.classList.remove('d-none'));
  }

  async function initHome() {
    const container = document.querySelector('[data-home-recipes]');
    showState(container, 'loading', 'Загружаем рецепты…');
    try {
      const [recipes, favorites] = await Promise.all([api('/recipes?featured=true'), getFavorites()]);
      const ids = new Set(favorites.map((item) => String(item.recipeId)));
      container.innerHTML = recipes.map((recipe) => recipeCard(recipe, ids)).join('');
    } catch (error) { showState(container, 'error', error.message); }
  }

  async function initSearch() {
    const container = document.querySelector('[data-catalog]');
    const count = document.querySelector('[data-result-count]');
    const query = document.querySelector('[data-search]');
    const controls = [...document.querySelectorAll('[data-filter]')];
    const params = new URLSearchParams(location.search);
    query.value = params.get('q') || '';
    controls.forEach((control) => {
      control.value = params.get(control.name) || '';
    });
    let recipes = [];
    let favoriteIds = new Set();
    showState(container, 'loading', 'Загружаем каталог…');

    const render = () => {
      const text = query.value.trim().toLowerCase();
      const values = Object.fromEntries(controls.map((control) => [control.name, control.value]));
      const filtered = recipes.filter((recipe) => {
        const searchable = `${recipe.title} ${recipe.ingredients.join(' ')}`.toLowerCase();
        return (!text || searchable.includes(text)) && (!values.type || recipe.type === values.type) && (!values.difficulty || recipe.difficulty === values.difficulty) && (!values.time || recipe.time <= Number(values.time));
      });
      count.textContent = `${filtered.length} ${filtered.length === 1 ? 'рецепт' : filtered.length > 1 && filtered.length < 5 ? 'рецепта' : 'рецептов'}`;
      if (!filtered.length) return showState(container, 'empty', 'По вашему запросу ничего не найдено.');
      container.innerHTML = filtered.map((recipe) => recipeCard(recipe, favoriteIds)).join('');
    };

    try {
      const [data, favorites] = await Promise.all([api('/recipes'), getFavorites()]);
      recipes = data;
      favoriteIds = new Set(favorites.map((item) => String(item.recipeId)));
      render();
    } catch (error) { showState(container, 'error', error.message); count.textContent = 'Ошибка загрузки'; }
    query.addEventListener('input', render);
    controls.forEach((control) => control.addEventListener('change', render));
    document.querySelector('[data-reset]').addEventListener('click', () => { query.value = ''; controls.forEach((control) => { control.value = ''; }); render(); });
  }

  async function initRecipe() {
    const container = document.querySelector('[data-recipe]');
    const id = new URLSearchParams(location.search).get('id') || '1';
    showState(container, 'loading', 'Загружаем рецепт…');
    try {
      const recipe = await api(`/recipes/${id}`);
      const authorId = String(recipe.authorId || recipe.userId || '');
      const [comments, favorites, author, authorRecipes] = await Promise.all([
        api(`/comments?recipeId=${id}&_sort=createdAt&_order=desc`),
        getFavorites(),
        authorId ? api(`/users/${authorId}`).catch(() => null) : Promise.resolve(null),
        authorId ? api(`/recipes?authorId=${authorId}`) : Promise.resolve([])
      ]);
      const saved = favorites.some((item) => String(item.recipeId) === String(id));
      const authorName = author ? `${author.name} ${author.surname}` : 'Автор Ложки';
      const authorInitials = authorName.split(' ').map((part) => part[0]).join('').slice(0, 2);
      const isOwnRecipe = session.user && String(session.user.id) === authorId;
      container.innerHTML = `<nav aria-label="breadcrumb"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="index.html">Главная</a></li><li class="breadcrumb-item"><a href="search.html">Рецепты</a></li><li class="breadcrumb-item active">${escapeHtml(recipe.shortTitle || recipe.title)}</li></ol></nav>
        <div class="row align-items-center g-5 mt-1"><div class="col-lg-6"><div class="recipe-visual ${escapeHtml(recipe.visual)} recipe-photo-api"><span class="food-emoji">${escapeHtml(recipe.emoji)}</span></div></div><div class="col-lg-6"><span class="eyebrow">${escapeHtml(recipe.typeLabel)} · ${escapeHtml(recipe.cuisine)}</span><h1 class="display-title mt-3 mb-4">${escapeHtml(recipe.title)}</h1><p class="lead">${escapeHtml(recipe.description)}</p><div class="d-flex flex-wrap gap-4 my-4"><div><small class="text-muted d-block">Подготовка</small><strong>${recipe.prepTime} минут</strong></div><div><small class="text-muted d-block">Готовка</small><strong>${recipe.cookTime} минут</strong></div><div><small class="text-muted d-block">Порции</small><strong>${recipe.servings}</strong></div><div><small class="text-muted d-block">Сложность</small><strong>${escapeHtml(recipe.difficultyLabel)}</strong></div><div><small class="text-muted d-block">Рейтинг</small><strong class="rating">★ ${String(recipe.rating).replace('.', ',')}</strong></div></div><div class="d-flex flex-wrap gap-2"><button class="btn btn-primary ${saved ? 'active' : ''}" data-favorite-id="${escapeHtml(recipe.id)}"><i class="bi bi-heart${saved ? '-fill' : ''} me-2"></i>Сохранить</button><button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#shareModal"><i class="bi bi-share me-2"></i>Поделиться</button></div><div class="d-flex align-items-center gap-3 mt-5 pt-4 border-top"><div class="author-avatar">${escapeHtml(authorInitials)}</div><div class="flex-grow-1"><strong>${escapeHtml(authorName)}</strong><div class="text-muted small">Автор ${authorRecipes.length} рецептов</div></div>${isOwnRecipe ? '<span class="tag-pill">Это вы</span>' : `<button class="btn btn-outline-primary btn-sm" data-author-follow data-author-id="${escapeHtml(authorId)}">Подписаться</button>`}</div></div></div>
        <div class="row g-5 mt-4"><div class="col-lg-5"><h2>Ингредиенты</h2><ul class="ingredient-list list-unstyled">${recipe.ingredients.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><div class="col-lg-7"><h2>Как готовить</h2><ol class="step-list list-unstyled">${recipe.steps.map((step) => `<li class="d-flex gap-3"><span>${escapeHtml(step.replace(/^\d+[.)]\s*/, ''))}</span></li>`).join('')}</ol></div></div>
        <section class="mt-5"><div class="d-flex justify-content-between align-items-center"><h2>Комментарии</h2><span class="text-muted" data-comment-count>${comments.length}</span></div><form class="paper-card p-4 my-4" data-comment-form><label class="form-label" for="comment">Ваш комментарий</label><textarea class="form-control mb-3" id="comment" rows="3" required></textarea><button class="btn btn-primary" type="submit">Опубликовать</button></form><div data-comments>${comments.length ? comments.map(commentTemplate).join('') : '<p class="api-state empty">Комментариев пока нет. Будьте первым!</p>'}</div></section>`;

      const shareInput = document.querySelector('[data-share-url]');
      shareInput.value = location.href;
      document.querySelector('[data-copy-link]').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(shareInput.value);
        } catch {
          shareInput.select();
          document.execCommand('copy');
        }
        notify('Ссылка скопирована');
      });

      const followButton = container.querySelector('[data-author-follow]');
      if (followButton) {
        let follow = null;
        if (session.user) {
          const matches = await api(`/follows?userId=${encodeURIComponent(session.user.id)}&authorId=${encodeURIComponent(authorId)}`);
          [follow] = matches;
        }
        const renderFollow = () => {
          followButton.textContent = follow ? 'Вы подписаны' : 'Подписаться';
          followButton.classList.toggle('btn-primary', Boolean(follow));
          followButton.classList.toggle('btn-outline-primary', !follow);
        };
        renderFollow();
        followButton.addEventListener('click', async () => {
          const user = requireUser();
          if (!user) return;
          followButton.disabled = true;
          try {
            if (follow) {
              await api(`/follows/${follow.id}`, { method: 'DELETE' });
              follow = null;
              notify('Подписка отменена');
            } else {
              follow = await api('/follows', { method: 'POST', body: JSON.stringify({ userId: String(user.id), authorId }) });
              notify('Автор добавлен в подписки');
            }
            renderFollow();
          } catch (error) { notify(error.message); }
          finally { followButton.disabled = false; }
        });
      }

      const form = container.querySelector('[data-comment-form]');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const user = requireUser();
        if (!user) return;
        const textarea = form.querySelector('textarea');
        const text = textarea.value.trim();
        if (!text) return;
        const button = form.querySelector('button');
        button.disabled = true;
        try {
          const comment = await api('/comments', { method: 'POST', body: JSON.stringify({ recipeId: String(id), userId: String(user.id), author: `${user.name} ${user.surname}`, text, createdAt: new Date().toISOString() }) });
          const commentsNode = container.querySelector('[data-comments]');
          if (commentsNode.querySelector('.api-state')) commentsNode.innerHTML = '';
          commentsNode.insertAdjacentHTML('afterbegin', commentTemplate(comment));
          textarea.value = '';
          container.querySelector('[data-comment-count]').textContent = String(Number(container.querySelector('[data-comment-count]').textContent) + 1);
          notify('Комментарий опубликован');
        } catch (error) { notify(error.message); }
        finally { button.disabled = false; }
      });
    } catch (error) { showState(container, 'error', error.message); }
  }

  const commentTemplate = (comment) => `<div class="d-flex gap-3 py-3 border-bottom"><div class="author-avatar">${escapeHtml(comment.author.split(' ').map((part) => part[0]).join('').slice(0, 2))}</div><div><div><strong>${escapeHtml(comment.author)}</strong> <small class="text-muted">${new Date(comment.createdAt).toLocaleDateString('ru-RU')}</small></div><p class="mb-0 mt-1">${escapeHtml(comment.text)}</p></div></div>`;

  async function initProfile() {
    let user = requireUser();
    if (!user) return;
    const savedContainer = document.querySelector('[data-saved-recipes]');
    const mineContainer = document.querySelector('[data-my-recipes]');
    const profileForm = document.querySelector('[data-profile-form]');
    const recipeForm = document.querySelector('[data-recipe-form]');
    let ownRecipes = [];

    const renderIdentity = () => {
      document.querySelector('[data-profile-name]').textContent = `${user.name} ${user.surname}`;
      document.querySelector('[data-profile-meta]').textContent = `@${user.username || user.email.split('@')[0]} · ${user.city || 'Город не указан'}`;
      document.querySelector('[data-profile-bio]').textContent = user.bio || 'Описание пока не заполнено.';
      document.querySelector('[data-profile-avatar]').textContent = `${user.name[0]}${user.surname[0]}`.toUpperCase();
      profileForm.elements.name.value = user.name;
      profileForm.elements.surname.value = user.surname;
      profileForm.elements.city.value = user.city || '';
      profileForm.elements.bio.value = user.bio || '';
    };

    const renderOwnRecipes = () => {
      document.querySelector('[data-profile-recipes]').textContent = String(ownRecipes.length);
      if (!ownRecipes.length) {
        return showState(mineContainer, 'empty', 'Опубликуйте первый рецепт — он появится здесь.');
      }
      mineContainer.innerHTML = ownRecipes.map((recipe) => recipeCard(recipe, new Set(), 'col-md-6')).join('');
    };

    renderIdentity();
    showState(savedContainer, 'loading', 'Загружаем сохранённые рецепты…');
    showState(mineContainer, 'loading', 'Загружаем ваши публикации…');
    try {
      const [favorites, publications, followers, following] = await Promise.all([
        getFavorites(),
        api(`/recipes?authorId=${encodeURIComponent(user.id)}`),
        api(`/follows?authorId=${encodeURIComponent(user.id)}`),
        api(`/follows?userId=${encodeURIComponent(user.id)}`)
      ]);
      ownRecipes = publications;
      renderOwnRecipes();
      document.querySelector('[data-profile-followers]').textContent = String(followers.length);
      document.querySelector('[data-profile-following]').textContent = String(following.length);
      if (!favorites.length) {
        showState(savedContainer, 'empty', 'Сохранённых рецептов пока нет.');
      } else {
        const recipes = await Promise.all(favorites.map((favorite) => api(`/recipes/${favorite.recipeId}`)));
        const ids = new Set(favorites.map((favorite) => String(favorite.recipeId)));
        savedContainer.innerHTML = recipes.map((recipe) => recipeCard(recipe, ids, 'col-md-6')).join('');
      }
    } catch (error) {
      showState(savedContainer, 'error', error.message);
      showState(mineContainer, 'error', error.message);
    }

    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      profileForm.classList.add('was-validated');
      if (!profileForm.checkValidity()) return;
      const button = profileForm.querySelector('button[type="submit"]');
      button.disabled = true;
      try {
        const payload = {
          name: profileForm.elements.name.value.trim(),
          surname: profileForm.elements.surname.value.trim(),
          city: profileForm.elements.city.value.trim(),
          bio: profileForm.elements.bio.value.trim()
        };
        user = await api(`/users/${user.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        session.updateUser(user);
        renderIdentity();
        bootstrap.Modal.getOrCreateInstance(document.querySelector('#editProfile')).hide();
        notify('Профиль обновлён');
      } catch (error) { notify(error.message); }
      finally { button.disabled = false; }
    });

    recipeForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      recipeForm.classList.add('was-validated');
      if (!recipeForm.checkValidity()) return;
      const button = recipeForm.querySelector('button[type="submit"]');
      button.disabled = true;
      const toLines = (value) => value.split('\n').map((line) => line.trim()).filter(Boolean);
      try {
        const title = recipeForm.elements.title.value.trim();
        const recipe = await api('/recipes', {
          method: 'POST',
          body: JSON.stringify({
            title,
            shortTitle: title,
            description: recipeForm.elements.description.value.trim(),
            ingredients: toLines(recipeForm.elements.ingredients.value),
            steps: toLines(recipeForm.elements.steps.value),
            authorId: String(user.id),
            userId: String(user.id),
            type: 'main',
            typeLabel: 'Авторский рецепт',
            cuisine: 'Домашняя кухня',
            difficulty: 'medium',
            difficultyLabel: 'Средняя',
            time: 45,
            prepTime: 15,
            cookTime: 30,
            servings: '2 персоны',
            rating: 5,
            visual: 'visual-1',
            emoji: '🍽️',
            featured: false
          })
        });
        ownRecipes.unshift(recipe);
        renderOwnRecipes();
        recipeForm.reset();
        recipeForm.classList.remove('was-validated');
        bootstrap.Modal.getOrCreateInstance(document.querySelector('#newRecipe')).hide();
        bootstrap.Tab.getOrCreateInstance(document.querySelector('[data-bs-target="#mine"]')).show();
        notify('Рецепт опубликован');
      } catch (error) { notify(error.message); }
      finally { button.disabled = false; }
    });
  }

  function initLogin() {
    const form = document.querySelector('[data-login-form]');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      form.classList.add('was-validated');
      if (!form.checkValidity()) return;
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      try {
        const data = await api('/login', { method: 'POST', body: JSON.stringify({ email: form.email.value.trim(), password: form.password.value }) });
        session.save(data, form.remember.checked);
        notify('Вы успешно вошли');
        setTimeout(() => { location.href = 'profile.html'; }, 600);
      } catch (error) { notify(error.message === 'Cannot find user' ? 'Неверная почта или пароль' : error.message); }
      finally { button.disabled = false; }
    });
  }

  function initRegister() {
    const form = document.querySelector('[data-register-form]');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      form.classList.add('was-validated');
      if (!form.checkValidity()) return;
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      try {
        const payload = { name: form.name.value.trim(), surname: form.surname.value.trim(), email: form.email.value.trim(), password: form.password.value, username: form.email.value.split('@')[0], city: '', bio: '' };
        const data = await api('/register', { method: 'POST', body: JSON.stringify(payload) });
        session.save(data);
        notify('Аккаунт создан');
        setTimeout(() => { location.href = 'profile.html'; }, 600);
      } catch (error) { notify(error.message.includes('Email') ? 'Пользователь с такой почтой уже существует' : error.message); }
      finally { button.disabled = false; }
    });
  }

  async function initCommunity() {
    const buttons = [...document.querySelectorAll('[data-follow]')];
    let follows = [];
    if (session.user) {
      try { follows = await api(`/follows?userId=${encodeURIComponent(session.user.id)}`); }
      catch (error) { notify(error.message); }
    }
    const updateButton = (button) => {
      const followed = follows.some((item) => String(item.authorId) === String(button.dataset.authorId));
      const compact = button.classList.contains('author-follow-short');
      button.textContent = compact ? (followed ? '✓' : '+') : (followed ? 'Вы подписаны' : 'Подписаться');
      button.title = followed ? 'Отменить подписку' : 'Подписаться';
      button.classList.toggle('btn-primary', followed);
      button.classList.toggle('btn-outline-primary', !followed);
    };
    buttons.forEach((button) => {
      updateButton(button);
      button.addEventListener('click', async () => {
        const user = requireUser();
        if (!user) return;
        button.disabled = true;
        try {
          const match = follows.find((item) => String(item.authorId) === String(button.dataset.authorId));
          if (match) {
            await api(`/follows/${match.id}`, { method: 'DELETE' });
            follows = follows.filter((item) => item.id !== match.id);
            notify('Подписка отменена');
          } else {
            const created = await api('/follows', { method: 'POST', body: JSON.stringify({ userId: String(user.id), authorId: String(button.dataset.authorId) }) });
            follows.push(created);
            notify('Автор добавлен в подписки');
          }
          updateButton(button);
        } catch (error) { notify(error.message); }
        finally { button.disabled = false; }
      });
    });

    document.querySelectorAll('[data-post-like]').forEach((button) => {
      button.addEventListener('click', () => {
        const active = button.classList.toggle('active');
        const icon = button.querySelector('i');
        const count = button.querySelector('span');
        icon.className = `bi bi-heart${active ? '-fill' : ''} me-1`;
        count.textContent = String(Number(count.textContent) + (active ? 1 : -1));
        notify(active ? 'Публикация понравилась' : 'Отметка снята');
      });
    });

    document.querySelectorAll('[data-post-save]').forEach((button) => {
      button.addEventListener('click', () => {
        const active = button.classList.toggle('active');
        button.querySelector('i').className = `bi bi-bookmark${active ? '-fill' : ''} me-1`;
        button.querySelector('span').textContent = active ? 'Сохранено' : 'Сохранить';
        notify(active ? 'Публикация сохранена' : 'Публикация удалена из сохранённых');
      });
    });

    document.querySelectorAll('[data-post-comment]').forEach((button) => {
      button.addEventListener('click', () => notify('Обсуждение публикации скоро откроется'));
    });

    const publicationButton = document.querySelector('[data-new-publication]');
    const publicationForm = document.querySelector('[data-publication-form]');
    publicationButton.addEventListener('click', () => {
      if (!requireUser()) return;
      bootstrap.Modal.getOrCreateInstance(document.querySelector('#publicationModal')).show();
    });
    publicationForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = publicationForm.querySelector('textarea').value.trim();
      if (!text) return;
      const user = session.user;
      const initials = `${user.name[0]}${user.surname[0]}`.toUpperCase();
      const article = document.createElement('article');
      article.className = 'paper-card p-4 mb-4';
      article.innerHTML = `<div class="d-flex align-items-center gap-3"><div class="author-avatar">${escapeHtml(initials)}</div><div><strong>${escapeHtml(`${user.name} ${user.surname}`)}</strong><div class="small text-muted">только что</div></div></div><p class="mb-0 mt-3">${escapeHtml(text)}</p>`;
      document.querySelector('.community-page .col-lg-8 article').before(article);
      publicationForm.reset();
      bootstrap.Modal.getOrCreateInstance(document.querySelector('#publicationModal')).hide();
      notify('Публикация добавлена в ленту');
    });
  }

  updateAccountLinks();
  ({ home: initHome, search: initSearch, recipe: initRecipe, profile: initProfile, login: initLogin, register: initRegister, community: initCommunity }[page])?.();
});
