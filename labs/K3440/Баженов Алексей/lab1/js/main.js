// фильтрация карточек на странице поиска
const form = document.getElementById('filterForm');
if (form) {
  const cards = [...document.querySelectorAll('[data-name]')];
  const empty = document.getElementById('empty');
  const apply = () => {
    const q = form.q.value.trim().toLowerCase();
    cards.forEach(c => {
      c.hidden = !(
        c.dataset.name.toLowerCase().includes(q) &&
        (!form.cuisine.value || c.dataset.cuisine === form.cuisine.value) &&
        (!form.district.value || c.dataset.district === form.district.value) &&
        (!form.price.value || +c.dataset.price <= +form.price.value)
      );
    });
    empty.hidden = cards.some(c => !c.hidden);
  };
  form.addEventListener('input', apply);
  form.addEventListener('reset', () => setTimeout(apply));
}

// показать / скрыть пароль
const toggle = document.getElementById('togglePassword');
if (toggle) {
  toggle.addEventListener('click', () => {
    const input = document.getElementById('password');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Скрыть' : 'Показать';
  });
}
