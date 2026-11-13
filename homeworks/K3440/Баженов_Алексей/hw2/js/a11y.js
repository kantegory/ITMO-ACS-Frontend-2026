const filterForm = document.getElementById('filterForm');
const resultCount = document.getElementById('resultCount');
if (filterForm && resultCount) {
  const announce = () => {
    const n = document.querySelectorAll('[data-name]:not([hidden])').length;
    resultCount.textContent = n ? `Найдено ресторанов: ${n}` : 'Ничего не найдено';
  };
  filterForm.addEventListener('input', announce);
  filterForm.addEventListener('reset', () => setTimeout(announce));
}

const pwdToggle = document.getElementById('togglePassword');
const pwdInput = document.getElementById('password');
if (pwdToggle && pwdInput) {
  pwdToggle.addEventListener('click', () => {
    pwdToggle.setAttribute('aria-label', pwdInput.type === 'text' ? 'Скрыть пароль' : 'Показать пароль');
  });
}
