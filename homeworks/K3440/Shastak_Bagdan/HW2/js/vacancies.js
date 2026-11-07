// Вакансии из API: список на vacancies.html и «Свежие вакансии» на index.html
(function () {
  const INDUSTRY = { IT: 'IT и телеком', finance: 'Финансы и банки', trade: 'Торговля',
    marketing: 'Маркетинг и реклама', education: 'Образование', medicine: 'Медицина' };
  const FORMAT = { remote: ['laptop', 'Удалённо'], office: ['building', 'Офис'], hybrid: ['house-door', 'Гибрид'] };
  const EXPERIENCE = { '0': 'Без опыта', '1-3': '1–3 года', '3-6': '3–6 лет', '6+': 'Более 6 лет' };
  const EMPLOYMENT = { 'full-time': 'Полная занятость', 'part-time': 'Частичная занятость',
    contract: 'Проектная работа', internship: 'Стажировка' };
  const LOGO_CLASSES = ['bg-primary-subtle text-primary', 'bg-success-subtle text-success',
    'bg-danger-subtle text-danger', 'bg-warning-subtle text-warning-emphasis', 'bg-info-subtle text-info-emphasis'];

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = (msg, variant) => window.showToast && window.showToast(msg, variant);

  const logoClass = name => LOGO_CLASSES[[...String(name)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % LOGO_CLASSES.length];
  const isNew = v => v.publishedDate && (Date.now() - new Date(v.publishedDate).getTime()) <= 3 * 86400000;
  const byDateDesc = (a, b) => String(b.publishedDate || '').localeCompare(String(a.publishedDate || ''));

  // ---------- список на vacancies.html
  function listCard(v, isFav) {
    const [icon, format] = FORMAT[v.workFormat] || FORMAT.office;
    return `
      <article class="vacancy-item card border-0" data-id="${v.id}" aria-labelledby="vacancy-title-${v.id}" data-title="${esc(v.title)}"
               data-company="${esc(v.companyName)}" data-industry="${esc(v.industry)}"
               data-salary="${v.salaryFrom || v.salaryTo || 0}"
               data-experience="${v.experience === '0' ? 'none' : esc(v.experience)}"
               data-remote="${v.workFormat === 'remote'}" data-date="${String(v.publishedDate || '').replace(/-/g, '')}">
        <div class="card-body">
          <div class="d-flex gap-3">
            <span aria-hidden="true" class="company-logo ${logoClass(v.companyName)}">${esc(v.companyLogo)}</span>
            <div class="flex-grow-1">
              <div class="d-flex flex-wrap justify-content-between gap-2">
                <div>
                  <h2 class="h5 mb-1" id="vacancy-title-${v.id}"><a class="vacancy-title" href="vacancy.html?id=${v.id}">${esc(v.title)}</a></h2>
                  <div class="small"><a href="companies.html" class="link-secondary">${esc(v.companyName)}</a> ·
                    <span class="text-muted">${esc(INDUSTRY[v.industry] || v.industry)}</span></div>
                </div>
                <div class="text-end">
                  <div class="fw-bold salary">${esc(formatSalary(v))}</div>
                  ${isNew(v) ? '<span class="badge text-bg-success-subtle text-success-emphasis">Новая</span>' : ''}
                  <button type="button" class="btn btn-sm btn-link p-0 ms-2 align-baseline" data-fav="${v.id}"
                          aria-pressed="${isFav}" aria-label="${isFav ? 'Убрать из избранного' : 'Добавить в избранное'}: ${esc(v.title)}">
                    <i aria-hidden="true" class="bi ${isFav ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i></button>
                </div>
              </div>
              <div class="d-flex flex-wrap gap-2 my-3">
                ${v.location ? `<span class="badge meta-badge"><i aria-hidden="true" class="bi bi-geo-alt me-1"></i>${esc(v.location)}</span>` : ''}
                <span class="badge meta-badge"><i aria-hidden="true" class="bi bi-${icon} me-1"></i>${format}</span>
                <span class="badge meta-badge"><i aria-hidden="true" class="bi bi-bar-chart me-1"></i>${esc(EXPERIENCE[v.experience] || '')}</span>
                <span class="badge meta-badge"><i aria-hidden="true" class="bi bi-clock me-1"></i>${esc(EMPLOYMENT[v.employmentType] || '')}</span>
              </div>
              <p class="small text-muted mb-0">${esc(v.description)}</p>
            </div>
          </div>
        </div>
      </article>`;
  }

  async function initList(list) {
    let vacancies = [];
    const favs = new Set();
    try {
      vacancies = await api.getVacancies();
    } catch (err) {
      list.innerHTML = '<div class="alert alert-danger">Не удалось загрузить вакансии. Запущен ли сервер (npm start)?</div>';
      delete list.dataset.loading;
      list.setAttribute('aria-busy', 'false');
      return;
    }

    const user = api.getUser();
    if (user && user.role === 'jobseeker') {
      try { (await api.request('/favorites')).forEach(f => favs.add(f.vacancyId)); } catch (e) { /* без избранного */ }
    }

    list.innerHTML = vacancies.map(v => listCard(v, favs.has(v.id))).join('');
    delete list.dataset.loading;
    list.setAttribute('aria-busy', 'false');
    if (window.applyVacancyFilters) window.applyVacancyFilters();   // счётчик и «ничего не найдено»

    list.addEventListener('click', async function (e) {
      const btn = e.target.closest('[data-fav]');
      if (!btn) return;
      const me = api.getUser();
      if (!me) return toast('Войдите, чтобы добавлять вакансии в избранное');
      if (me.role !== 'jobseeker') return toast('Избранное доступно только соискателям');
      const id = Number(btn.dataset.fav);
      try {
        if (favs.has(id)) { await api.removeFromFavorites(id); favs.delete(id); }
        else { await api.addToFavorites(id); favs.add(id); }
        const on = favs.has(id);
        btn.querySelector('i').className = 'bi ' + (on ? 'bi-heart-fill text-danger' : 'bi-heart');
        btn.setAttribute('aria-pressed', String(on));
        btn.setAttribute('aria-label', (on ? 'Убрать из избранного' : 'Добавить в избранное') + ': ' + btn.closest('article').dataset.title);
        toast(favs.has(id) ? 'Добавлено в избранное' : 'Удалено из избранного');
      } catch (err) {
        toast(err.message, 'text-bg-danger');
      }
    });
  }

  // ---------- «Свежие вакансии» на index.html
  async function initRecent(box) {
    try {
      const vacancies = (await api.getVacancies()).sort(byDateDesc).slice(0, 4);
      box.innerHTML = vacancies.map(v => {
        const [icon, format] = FORMAT[v.workFormat] || FORMAT.office;
        return `
        <div class="col-md-6">
          <article class="job-card card h-100 border-0 shadow-sm">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start gap-3">
                <div class="d-flex gap-3">
                  <span aria-hidden="true" class="company-logo ${logoClass(v.companyName)}">${esc(v.companyLogo)}</span>
                  <div>
                    <h3 class="h6 mb-1"><a href="vacancy.html?id=${v.id}" class="stretched-link text-dark text-decoration-none">${esc(v.title)}</a></h3>
                    <div class="text-muted small">${esc(v.companyName)} · ${esc(INDUSTRY[v.industry] || v.industry)}</div>
                  </div>
                </div>
                ${isNew(v) ? '<span class="badge text-bg-success-subtle text-success-emphasis">Новая</span>' : ''}
              </div>
              <div class="mt-3 mb-3 fw-bold text-success">${esc(formatSalary(v))} <span class="fw-normal text-muted small">за месяц</span></div>
              <div class="d-flex flex-wrap gap-2 mt-auto">
                ${v.location ? `<span class="badge meta-badge"><i aria-hidden="true" class="bi bi-geo-alt me-1"></i>${esc(v.location)}</span>` : ''}
                <span class="badge meta-badge"><i aria-hidden="true" class="bi bi-${icon} me-1"></i>${format}</span>
                <span class="badge meta-badge"><i aria-hidden="true" class="bi bi-bar-chart me-1"></i>${esc(EXPERIENCE[v.experience] || '')}</span>
              </div>
            </div>
          </article>
        </div>`;
      }).join('') || '<p class="text-muted">Вакансий пока нет</p>';
    } catch (err) {
      box.innerHTML = '<p class="text-danger">Не удалось загрузить вакансии</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const list = document.getElementById('vacancyList');
    if (list) initList(list);
    const recent = document.getElementById('recentVacancies');
    if (recent) initRecent(recent);
  });
})();
