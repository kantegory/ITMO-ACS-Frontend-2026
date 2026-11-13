
(function () {
  function getUser() {
    try {
      if (!localStorage.getItem('token')) return null;
      return JSON.parse(localStorage.getItem('user'));
    } catch (e) { return null; }
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function initials(user) {
    if (user.avatar) return user.avatar;
    const src = user.role === 'employer'
      ? (user.companyName || 'C')
      : `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || '?';
    return src.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  function render() {
    const slot = document.getElementById('navAuth');
    if (!slot) return;
    const user = getUser();

    if (!user) {
      slot.innerHTML = `
        <a href="login.html" class="btn btn-outline-primary">
          <svg aria-hidden="true" class="icon me-1" focusable="false"><use href="img/sprite.svg#box-arrow-in-right"/></svg>Вход
        </a>
        <a href="register.html" class="btn btn-primary">
          <svg aria-hidden="true" class="icon me-1" focusable="false"><use href="img/sprite.svg#person-plus"/></svg>Регистрация
        </a>`;
      return;
    }

    const isEmployer = user.role === 'employer';
    const name = isEmployer
      ? (user.companyName || 'Компания')
      : `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const cabinet = isEmployer ? 'employer.html' : 'account.html';
    const cabinetLabel = isEmployer ? 'Кабинет работодателя' : 'Мой кабинет';

    slot.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-light dropdown-toggle d-flex align-items-center gap-2" type="button"
                data-bs-toggle="dropdown" aria-expanded="false">
          <span aria-hidden="true" class="account-avatar" style="width:32px;height:32px;font-size:.85rem;">${esc(initials(user))}</span>
          <span>${esc(name)}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="${cabinet}">
            <svg aria-hidden="true" class="icon me-1" focusable="false"><use href="img/sprite.svg#person-circle"/></svg>${cabinetLabel}</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" id="navLogout">
            <svg aria-hidden="true" class="icon me-1" focusable="false"><use href="img/sprite.svg#box-arrow-right"/></svg>Выйти</a></li>
        </ul>
      </div>`;

    document.getElementById('navLogout').addEventListener('click', function (e) {
      e.preventDefault();
      if (!confirm('Вы действительно хотите выйти?')) return;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();