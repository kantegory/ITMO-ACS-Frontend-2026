// Страница вакансии: данные из API, отклик, избранное и вход через модалку
(async function () {
  const $ = id => document.getElementById(id);
  const toast = (msg, variant) => window.showToast && window.showToast(msg, variant);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const setText = (id, text) => { const el = $(id); if (el) el.textContent = text; };
  const li = arr => (arr || []).map(t => `<li>${esc(t)}</li>`).join('');

  const INDUSTRY = { IT: 'IT и телеком', finance: 'Финансы и банки', trade: 'Торговля',
    marketing: 'Маркетинг и реклама', education: 'Образование', medicine: 'Медицина' };
  const FORMAT = { remote: 'Удалённо', office: 'Офис', hybrid: 'Гибрид' };
  const EMPLOYMENT = { 'full-time': 'Полная занятость', 'part-time': 'Частичная занятость',
    contract: 'Проектная работа', internship: 'Стажировка' };
  const EXPERIENCE = { '0': 'Без опыта', '1-3': '1–3 года', '3-6': '3–6 лет', '6+': 'Более 6 лет' };
  const LOGO_CLASSES = ['bg-primary-subtle text-primary', 'bg-success-subtle text-success',
    'bg-danger-subtle text-danger', 'bg-warning-subtle text-warning-emphasis', 'bg-info-subtle text-info-emphasis'];
  const logoClass = name => LOGO_CLASSES[[...String(name)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % LOGO_CLASSES.length];
  const setLogo = (id, letter, company) => {
    const el = $(id);
    if (!el) return;
    el.textContent = letter;
    el.className = 'company-logo ' + logoClass(company);
  };

  // без ?id= показываем вакансию №1 (на ней основана статичная вёрстка)
  const id = new URLSearchParams(location.search).get('id') || '1';
  let vacancy = null;

  // ---------- данные вакансии
  try {
    const v = vacancy = await api.getVacancy(id);
    document.title = `${v.title} — ${v.companyName} | JobHub`;
    setText('vTitle', v.title);
    setText('vCrumb', v.title);
    setText('vCompany', v.companyName);
    setLogo('vLogo', v.companyLogo, v.companyName);
    setText('vIndustry', INDUSTRY[v.industry] || v.industry);
    if ($('vIndustry')) $('vIndustry').href = `vacancies.html?industry=${encodeURIComponent(v.industry)}`;

    const salary = $('vSalary');
    if (salary && salary.firstChild) salary.firstChild.textContent = formatSalary(v) + ' ';

    setText('vDescription', v.description);
    if ($('vResp')) $('vResp').innerHTML = li(v.responsibilities);
    if ($('vReq')) $('vReq').innerHTML = li(v.requirements);
    if ($('vSkills')) $('vSkills').innerHTML = li(v.skills);

    const meta = $('vMeta');
    if (meta) {
      const badge = (icon, text) => text
        ? `<span class="badge meta-badge"><i aria-hidden="true" class="bi bi-${icon} me-1"></i>${esc(text)}</span>` : '';
      const published = v.publishedDate
        ? 'Опубликовано ' + new Date(v.publishedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
        : '';
      meta.innerHTML =
        badge('geo-alt', v.location) +
        badge('laptop', FORMAT[v.workFormat]) +
        badge('briefcase', EMPLOYMENT[v.employmentType]) +
        badge('bar-chart', v.experience === '0' ? 'Без опыта' : (EXPERIENCE[v.experience] ? 'Опыт ' + EXPERIENCE[v.experience] : '')) +
        badge('clock-history', published);
    }

    // боковая панель с условиями
    setText('sSalary', formatSalary(v));
    setText('sExp', EXPERIENCE[v.experience] || '—');
    setText('sFormat', FORMAT[v.workFormat] || '—');
    setText('sCity', v.location || '—');
    setText('sEmployment', (EMPLOYMENT[v.employmentType] || '—').replace(' занятость', ''));

    setText('respondModalLabel', `Отклик на вакансию «${v.title}»`);
  } catch (e) {
    toast('Не удалось загрузить вакансию', 'text-bg-danger');
  }

  // ---------- компания и похожие вакансии
  if (vacancy) {
    try {
      const c = await api.getCompany(vacancy.companyId);
      setLogo('cLogo', c.logo, c.name);
      setText('cName', c.name);
      setText('cDesc', c.description);
      setText('cIndustry', c.industry);
      setText('cSize', c.size || '—');
      const site = $('cSite');
      if (site && c.website) { site.href = c.website; site.textContent = c.website.replace(/^https?:\/\//, ''); }
    } catch (e) { /* блок «О компании» останется как есть */ }

    try {
      const all = await api.getVacancies();
      setText('cVacancies', `Активных вакансий: ${all.filter(x => x.companyId === vacancy.companyId).length}`);
      setText('vSimilarLabel', `Другие предложения: ${INDUSTRY[vacancy.industry] || vacancy.industry}`);
      const similar = all.filter(x => x.industry === vacancy.industry && x.id !== vacancy.id).slice(0, 3);
      if ($('vSimilar')) {
        $('vSimilar').innerHTML = similar.length ? similar.map(x => `
          <a href="vacancy.html?id=${x.id}" class="text-decoration-none">
            <div class="fw-semibold text-dark">${esc(x.title)}</div>
            <div class="small text-muted">${esc(x.companyName)} · ${esc(formatSalary(x))}</div>
          </a>`).join('') : '<div class="small text-muted">Похожих вакансий нет</div>';
      }
    } catch (e) { /* без похожих */ }
  }

  // ---------- избранное
  const favBtn = $('favBtn');
  const user = api.getUser();
  if (favBtn) {
    let isFav = false;
    const paint = () => {
      favBtn.querySelector('i').className = 'bi ' + (isFav ? 'bi-heart-fill text-danger' : 'bi-heart');
      favBtn.querySelector('span').textContent = isFav ? 'В избранном' : 'В избранное';
    };
    if (user && user.role === 'jobseeker') {
      try { isFav = await api.isFavorite(Number(id)); paint(); } catch (e) { /* ignore */ }
    }
    favBtn.addEventListener('click', async function () {
      const me = api.getUser();
      if (!me) return toast('Войдите, чтобы добавлять вакансии в избранное');
      if (me.role !== 'jobseeker') return toast('Избранное доступно только соискателям');
      try {
        if (isFav) await api.removeFromFavorites(Number(id)); else await api.addToFavorites(Number(id));
        isFav = !isFav; paint();
        toast(isFav ? 'Добавлено в избранное' : 'Удалено из избранного');
      } catch (err) { toast(err.message, 'text-bg-danger'); }
    });
  }

  // ---------- отклик
  const form = $('respondForm');
  const respondModal = () => bootstrap.Modal.getOrCreateInstance($('respondModal'));
  if (user) {
    if ($('respondName')) $('respondName').value = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if ($('respondEmail')) $('respondEmail').value = user.email || '';
  }

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      form.classList.add('was-validated');
      if (!form.checkValidity()) return;

      if (!api.isAuthenticated()) {
        respondModal().hide();
        bootstrap.Modal.getOrCreateInstance($('loginModal')).show();
        return;
      }
      try {
        await api.applyToVacancy(Number(id), $('respondLetter').value);
        respondModal().hide();
        toast('Отклик отправлен!');
      } catch (err) {
        toast(err.message, 'text-bg-danger');   // например «Вы уже откликнулись на эту вакансию»
      }
    });
  }

  // ---------- вход из модалки
  const loginForm = $('loginModalForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      loginForm.classList.add('was-validated');
      if (!loginForm.checkValidity()) return;
      try {
        await api.login($('loginEmail').value, $('loginPassword').value);
        location.reload();                      // шапка перерисуется с аватаром
      } catch (err) {
        toast(err.message || 'Ошибка входа', 'text-bg-danger');
      }
    });
  }
})();
