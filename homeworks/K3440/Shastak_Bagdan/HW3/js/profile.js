// Account page - load user profile dynamically

// Проверка авторизации и загрузка профиля при загрузке личного кабинета
if (window.location.pathname.includes('account.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    const user = api.getUser();
    
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    
    if (user.role !== 'jobseeker') {
      window.location.href = 'employer.html';
      return;
    }
    
    // Загружаем данные профиля
    loadUserProfile(user);
  });
}

function loadUserProfile(user) {
  console.log('Загрузка профиля пользователя:', user);
  
  // Обновляем аватар
  const avatar = document.getElementById('profileAvatar');
  if (avatar && user.avatar) {
    avatar.textContent = user.avatar;
  }
  
  // Обновляем имя
  const nameEl = document.getElementById('profileName');
  if (nameEl && user.firstName && user.lastName) {
    nameEl.textContent = `${user.firstName} ${user.lastName}`;
  }
  
  // Обновляем email
  const emailEl = document.getElementById('profileEmail');
  if (emailEl && user.email) {
    emailEl.textContent = user.email;
  }
  
  // Обновляем город
  const cityEl = document.getElementById('profileCity');
  if (cityEl) {
    cityEl.textContent = user.city || 'Не указан';
  }
  
  // Обновляем навыки
  const skillsEl = document.getElementById('profileSkills');
  if (skillsEl) {
    if (user.skills && user.skills.length > 0) {
      skillsEl.innerHTML = user.skills.map(skill => 
        `<span class="badge skill-badge">${skill}</span>`
      ).join('');
    } else {
      skillsEl.innerHTML = '<span class="text-muted small">Навыки не указаны. Добавьте навыки в настройках профиля.</span>';
    }
  }
  
  console.log('✅ Профиль успешно загружен');
  loadApplications();
  loadFavorites();
}

// ---------- Отклики и избранное соискателя (данные из API)
const APPLICATION_STATUS = {
  pending:   ['warning',   'На рассмотрении'],
  interview: ['success',   'Приглашение'],
  rejected:  ['secondary', 'Отказ']
};

function escHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function loadApplications() {
  const full = document.getElementById('myApplications');
  const recent = document.getElementById('recentApplications');
  if (!full && !recent) return;

  let apps = [], vacancies = [];
  try {
    [apps, vacancies] = await Promise.all([api.getMyApplications(), api.getVacancies()]);
  } catch (err) {
    console.error(err);
    if (full) full.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Не удалось загрузить отклики</td></tr>';
    if (recent) recent.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Не удалось загрузить отклики</td></tr>';
    return;
  }

  apps.sort((a, b) => String(b.appliedDate).localeCompare(String(a.appliedDate)));
  const vacancyById = Object.fromEntries(vacancies.map(v => [v.id, v]));
  const badge = status => {
    const [color, label] = APPLICATION_STATUS[status] || APPLICATION_STATUS.pending;
    return `<span class="badge text-bg-${color}-subtle text-${color}-emphasis">${label}</span>`;
  };
  const date = a => new Date(a.appliedDate).toLocaleDateString('ru-RU');
  const empty = cols => `<tr><td colspan="${cols}" class="text-muted text-center py-4">Откликов пока нет</td></tr>`;

  if (recent) {
    recent.innerHTML = apps.length ? apps.slice(0, 3).map(a => `<tr>
      <td><a href="vacancy.html?id=${a.vacancyId}">${escHtml(a.vacancyTitle)}</a></td>
      <td>${escHtml(a.companyName)}</td>
      <td class="text-nowrap">${date(a)}</td>
      <td>${badge(a.status)}</td></tr>`).join('') : empty(4);
  }

  if (full) {
    const renderFull = filter => {
      const list = filter ? apps.filter(a => a.status === filter) : apps;
      full.innerHTML = list.length ? list.map(a => {
        const v = vacancyById[a.vacancyId];
        return `<tr>
          <td><a href="vacancy.html?id=${a.vacancyId}">${escHtml(a.vacancyTitle)}</a></td>
          <td>${escHtml(a.companyName)}</td>
          <td class="salary text-nowrap">${v ? escHtml(formatSalary(v)) : '—'}</td>
          <td class="text-nowrap">${date(a)}</td>
          <td>${badge(a.status)}</td></tr>`;
      }).join('') : empty(5);
    };
    renderFull('');

    // кнопки «Все / Приглашения / Отказы»
    const group = document.querySelector('[aria-label="Фильтр откликов"]');
    if (group) {
      const filters = ['', 'interview', 'rejected'];
      group.querySelectorAll('button').forEach((btn, i) => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderFull(filters[i] || '');
        });
      });
    }
  }
}

async function loadFavorites() {
  const box = document.getElementById('favoritesList');
  if (!box) return;

  const render = list => {
    box.innerHTML = list.length ? list.map(v => `
      <article class="vacancy-item card border-0" data-vacancy-id="${v.id}">
        <div class="card-body d-flex flex-wrap justify-content-between gap-3">
          <div>
            <h3 class="h6 mb-1"><a class="vacancy-title" href="vacancy.html?id=${v.id}">${escHtml(v.title)}</a></h3>
            <div class="small text-muted">${escHtml(v.companyName)} · ${escHtml(v.location)}</div>
            <div class="fw-semibold salary mt-1">${escHtml(formatSalary(v))}</div>
          </div>
          <div class="d-flex gap-2 align-items-start">
            <a href="vacancy.html?id=${v.id}" class="btn btn-sm btn-primary" aria-label="Откликнуться на вакансию «${escHtml(v.title)}»">Откликнуться</a>
            <button type="button" class="btn btn-sm btn-outline-danger" data-remove-favorite="${v.id}" title="Убрать из избранного" aria-label="Убрать из избранного: ${escHtml(v.title)}">
              <i aria-hidden="true" class="bi bi-heartbreak"></i></button>
          </div>
        </div>
      </article>`).join('') : '<p class="text-muted">В избранном пока пусто</p>';
  };

  try {
    render(await api.getMyFavorites());
  } catch (err) {
    console.error(err);
    box.innerHTML = '<p class="text-danger">Не удалось загрузить избранное</p>';
    return;
  }

  box.addEventListener('click', async e => {
    const btn = e.target.closest('[data-remove-favorite]');
    if (!btn) return;
    try {
      await api.removeFromFavorites(btn.dataset.removeFavorite);
      render(await api.getMyFavorites());
      window.showToast && window.showToast('Вакансия удалена из избранного');
    } catch (err) {
      window.showToast && window.showToast(err.message, 'text-bg-danger');
    }
  });
}


// Employer page - load company profile
if (window.location.pathname.includes('employer.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    const user = api.getUser();
    
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    
    if (user.role !== 'employer') {
      window.location.href = 'account.html';
      return;
    }
    
    // Загружаем данные компании
    loadEmployerProfile(user);
  });
}

function loadEmployerProfile(user) {
  console.log('Загрузка профиля работодателя:', user);
  
  // Обновляем название компании в заголовке
  const pageTitle = document.querySelector('h1');
  if (pageTitle && user.companyName) {
    pageTitle.textContent = `Кабинет работодателя`;
  }
  
  const subtitle = document.querySelector('.text-muted');
  if (subtitle && user.companyName) {
    subtitle.textContent = `${user.companyName} · управление вакансиями и откликами`;
  }
  

  console.log('✅ Профиль работодателя успешно загружен');
}
