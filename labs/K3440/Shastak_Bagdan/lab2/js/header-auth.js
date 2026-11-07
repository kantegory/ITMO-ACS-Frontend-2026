
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
          <i class="bi bi-box-arrow-in-right me-1"></i>Вход
        </a>
        <a href="register.html" class="btn btn-primary">
          <i class="bi bi-person-plus me-1"></i>Регистрация
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
          <span class="account-avatar" style="width:32px;height:32px;font-size:.85rem;">${esc(initials(user))}</span>
          <span>${esc(name)}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="${cabinet}">
            <i class="bi bi-person-circle me-1"></i>${cabinetLabel}</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" id="navLogout">
            <i class="bi bi-box-arrow-right me-1"></i>Выйти</a></li>
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