export function enhanceAccessibility(document = window.document) {
  const main = document.getElementById('main');
  if (!main || document.querySelector('.skip-link')) return;

  main.tabIndex = -1;
  const skip = document.createElement('a');
  skip.className = 'skip-link';
  skip.href = '#main';
  skip.textContent = 'Перейти к содержимому';
  skip.addEventListener('click', () => main.focus());
  document.body.prepend(skip);

  for (const id of ['catalog-status', 'restaurant-status', 'history-status', 'account-status']) {
    const status = document.getElementById(id);
    if (status) status.setAttribute('role', 'status');
  }
  document.getElementById('history-status')?.setAttribute('tabindex', '-1');

  for (const id of ['form-error', 'booking-error']) {
    const error = document.getElementById(id);
    if (!error) continue;
    error.setAttribute('role', 'alert');
    error.tabIndex = -1;
    const form = error.closest('form');
    const descriptions = form.getAttribute('aria-describedby')?.split(' ') ?? [];
    if (!descriptions.includes(id)) form.setAttribute('aria-describedby', [...descriptions, id].join(' '));
  }

  const dialog = document.getElementById('booking-dialog');
  dialog?.setAttribute('aria-describedby', 'booking-help');
  if (dialog) {
    const help = document.createElement('p');
    help.id = 'booking-help';
    help.className = 'muted mb-0 mt-2';
    help.textContent = 'Укажите дату, время и число гостей от 1 до 8.';
    dialog.querySelector('form').before(help);
    dialog.querySelector('input[type="date"]').autofocus = true;
  }
}

export function mountAccessibility() {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('./accessibility.css', import.meta.url).href;
  document.head.append(style);
  enhanceAccessibility();
}
