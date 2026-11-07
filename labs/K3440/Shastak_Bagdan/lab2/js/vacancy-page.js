// Страница вакансии: данные из API + отклик + вход через модалку
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
  const EXPERIENCE = { '0': 'Без опыта', '1-3': 'Опыт 1–3 года', '3-6': 'Опыт 3–6 лет', '6+': 'Опыт более 6 лет' };

  // без ?id= показываем вакансию №1 (на ней основана статичная вёрстка)
  const id = new URLSearchParams(location.search).get('id') || '1';

  // ---------- данные вакансии
  try {
    const v = await api.getVacancy(id);
    document.title = `${v.title} — ${v.companyName} | JobHub`;
    setText('vTitle', v.title);
    setText('vCrumb', v.title);
    setText('vCompany', v.companyName);
    setText('vIndustry', INDUSTRY[v.industry] || v.industry);
    const industryLink = $('vIndustry');
    if (industryLink) industryLink.href = `vacancies.html?industry=${encodeURIComponent(v.industry)}`;

    const salary = $('vSalary');
    if (salary && salary.firstChild) salary.firstChild.textContent = formatSalary(v) + ' ';

    setText('vDescription', v.description);
    if ($('vResp')) $('vResp').innerHTML = li(v.responsibilities);
    if ($('vReq')) $('vReq').innerHTML = li(v.requirements);

    const meta = $('vMeta');
    if (meta) {
      const badge = (icon, text) => text
        ? `<span class="badge meta-badge"><i class="bi bi-${icon} me-1"></i>${esc(text)}</span>` : '';
      const published = v.publishedDate
        ? 'Опубликовано ' + new Date(v.publishedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
        : '';
      meta.innerHTML =
        badge('geo-alt', v.location) +
        badge('laptop', FORMAT[v.workFormat]) +
        badge('briefcase', EMPLOYMENT[v.employmentType]) +
        badge('bar-chart', EXPERIENCE[v.experience]) +
        badge('clock-history', published);
    }

    setText('respondModalLabel', `Отклик на вакансию «${v.title}»`);
  } catch (e) {
    toast('Не удалось загрузить вакансию', 'text-bg-danger');
  }

  // ---------- отклик
  const form = $('respondForm');
  const respondModal = () => bootstrap.Modal.getOrCreateInstance($('respondModal'));
  const user = api.getUser();
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
