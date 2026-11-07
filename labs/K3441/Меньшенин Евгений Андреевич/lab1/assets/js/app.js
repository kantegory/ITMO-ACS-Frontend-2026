document.addEventListener('DOMContentLoaded', () => {
  const toastElement = document.querySelector('#liveToast');
  const toastBody = toastElement?.querySelector('.toast-body');

  const notify = (message) => {
    if (!toastElement) return;
    toastBody.textContent = message;
    bootstrap.Toast.getOrCreateInstance(toastElement).show();
  };

  document.querySelectorAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', () => {
      button.classList.toggle('active');
      const icon = button.querySelector('i');
      icon.className = button.classList.contains('active') ? 'bi bi-heart-fill' : 'bi bi-heart';
      notify(button.classList.contains('active') ? 'Рецепт сохранён' : 'Рецепт удалён из сохранённых');
    });
  });

  document.querySelectorAll('[data-follow]').forEach((button) => {
    button.addEventListener('click', () => {
      const following = button.dataset.following === 'true';
      button.dataset.following = String(!following);
      button.textContent = following ? 'Подписаться' : 'Вы подписаны';
      button.classList.toggle('btn-primary', following);
      button.classList.toggle('btn-outline-primary', !following);
      notify(following ? 'Подписка отменена' : 'Автор добавлен в подписки');
    });
  });

  const catalog = document.querySelector('[data-catalog]');
  if (catalog) {
    const cards = [...catalog.querySelectorAll('[data-recipe-card]')];
    const controls = [...document.querySelectorAll('[data-filter]')];
    const query = document.querySelector('[data-search]');
    const count = document.querySelector('[data-result-count]');
    const empty = document.querySelector('.empty-state');

    const applyFilters = () => {
      const text = query.value.trim().toLowerCase();
      const values = Object.fromEntries(controls.map((control) => [control.name, control.value]));
      let visible = 0;

      cards.forEach((card) => {
        const matchesText = card.dataset.title.includes(text) || card.dataset.ingredients.includes(text);
        const matchesType = !values.type || card.dataset.type === values.type;
        const matchesDifficulty = !values.difficulty || card.dataset.difficulty === values.difficulty;
        const matchesTime = !values.time || Number(card.dataset.time) <= Number(values.time);
        const show = matchesText && matchesType && matchesDifficulty && matchesTime;
        card.closest('.recipe-col').classList.toggle('d-none', !show);
        visible += Number(show);
      });

      count.textContent = `${visible} ${visible === 1 ? 'рецепт' : visible < 5 ? 'рецепта' : 'рецептов'}`;
      empty.style.display = visible ? 'none' : 'block';
    };

    query.addEventListener('input', applyFilters);
    controls.forEach((control) => control.addEventListener('change', applyFilters));
    document.querySelector('[data-reset]')?.addEventListener('click', () => {
      query.value = '';
      controls.forEach((control) => { control.value = ''; });
      applyFilters();
    });
  }

  document.querySelectorAll('.needs-validation').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopPropagation();
      form.classList.add('was-validated');
      if (form.checkValidity()) notify(form.dataset.success || 'Готово! Данные сохранены');
    });
  });

  const commentForm = document.querySelector('[data-comment-form]');
  commentForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = commentForm.querySelector('textarea');
    const text = input.value.trim();
    if (!text) return;
    const item = document.createElement('div');
    item.className = 'd-flex gap-3 py-3 border-bottom';
    item.innerHTML = `<div class="author-avatar">ВЫ</div><div><div class="d-flex gap-2 align-items-center"><strong>Вы</strong><small class="text-muted">только что</small></div><p class="mb-0 mt-1"></p></div>`;
    item.querySelector('p').textContent = text;
    document.querySelector('[data-comments]').prepend(item);
    input.value = '';
    notify('Комментарий опубликован');
  });
});
