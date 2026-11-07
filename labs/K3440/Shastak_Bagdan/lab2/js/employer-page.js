// Кабинет работодателя: список, создание, редактирование и удаление вакансий через API
document.addEventListener('DOMContentLoaded', function () {
  const body = document.getElementById('employerBody');
  if (!body) return;

  const user = api.getUser();
  if (!user || user.role !== 'employer') return;   // редирект делает profile.js

  const $ = id => document.getElementById(id);
  const toast = (msg, variant) => window.showToast && window.showToast(msg, variant);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const INDUSTRY = { IT: 'IT и телеком', finance: 'Финансы и банки', trade: 'Торговля',
    marketing: 'Маркетинг и реклама', education: 'Образование', medicine: 'Медицина' };
  const EXPERIENCE = { 'Без опыта': '0', '1–3 года': '1-3', '3–6 лет': '3-6', 'Более 6 лет': '6+' };
  const FORMAT = { 'Офис': 'office', 'Гибрид': 'hybrid', 'Удалённо': 'remote' };

  const editModal = bootstrap.Modal.getOrCreateInstance($('vacancyModal'));
  const deleteModal = bootstrap.Modal.getOrCreateInstance($('deleteVacancyModal'));
  const newModal = bootstrap.Modal.getOrCreateInstance($('newVacancyModal'));

  let vacancies = [];
  let currentId = null;

  // «от 150 000 ₽», «до 90 000», «100 000 – 150 000 ₽» -> { salaryFrom, salaryTo }
  function parseSalary(text) {
    const nums = (text.replace(/[\s ]/g, '').match(/\d+/g) || []).map(Number);
    if (/^до/i.test(text.trim()) && nums.length === 1) return { salaryFrom: null, salaryTo: nums[0] };
    return { salaryFrom: nums[0] ?? null, salaryTo: nums[1] ?? null };
  }

  const byId = id => vacancies.find(v => String(v.id) === String(id));

  function render() {
    body.innerHTML = vacancies.length ? vacancies.map(v => `
      <tr data-id="${v.id}">
        <td><div class="fw-semibold">${esc(v.title)}</div>
            <div class="small text-muted">${esc(INDUSTRY[v.industry] || v.industry)}</div></td>
        <td class="text-nowrap fw-semibold salary">${esc(formatSalary(v))}</td>
        <td>${v.status === 'active'
          ? '<span class="badge text-bg-success-subtle text-success-emphasis">Активна</span>'
          : '<span class="badge text-bg-secondary-subtle text-secondary-emphasis">Архив</span>'}</td>
        <td class="text-center">${v.applicationsCount || 0}</td>
        <td class="text-muted small text-nowrap">${v.publishedDate
          ? new Date(v.publishedDate).toLocaleDateString('ru-RU') : ''}</td>
        <td class="text-end text-nowrap">
          <a href="vacancy.html?id=${v.id}" class="btn btn-sm btn-light" title="Открыть"><i class="bi bi-eye"></i></a>
          <button type="button" class="btn btn-sm btn-light" title="Редактировать" data-edit-vacancy><i class="bi bi-pencil"></i></button>
          <button type="button" class="btn btn-sm btn-light text-danger" title="Удалить" data-delete-vacancy><i class="bi bi-trash"></i></button>
        </td>
      </tr>`).join('')
      : '<tr><td colspan="6" class="text-center text-muted py-4">У вас пока нет вакансий. Нажмите «Добавить».</td></tr>';

    if ($('employerVacanciesCount')) $('employerVacanciesCount').textContent = vacancies.length;
    if ($('employerActiveCount')) $('employerActiveCount').textContent = vacancies.filter(v => v.status === 'active').length;
  }

  async function load() {
    try {
      const all = await api.getVacancies();
      vacancies = all.filter(v => v.companyId === user.id);
      render();
    } catch (err) {
      body.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Не удалось загрузить вакансии</td></tr>';
    }
  }

  // кнопки в строках (делегирование: строки перерисовываются)
  body.addEventListener('click', function (e) {
    const row = e.target.closest('tr[data-id]');
    if (!row) return;
    const v = byId(row.dataset.id);
    if (!v) return;

    if (e.target.closest('[data-edit-vacancy]')) {
      currentId = v.id;
      $('vacancyTitle').value = v.title;
      $('vacancyIndustry').value = v.industry;
      $('vacancySalary').value = formatSalary(v) === 'По договорённости' ? '' : formatSalary(v);
      $('vacancyStatus').value = v.status === 'active' ? 'active' : 'closed';
      $('vacancyForm').classList.remove('was-validated');
      editModal.show();
    }
    if (e.target.closest('[data-delete-vacancy]')) {
      currentId = v.id;
      $('deleteVacancyName').textContent = v.title;
      deleteModal.show();
    }
  });

  // редактирование
  $('vacancyForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    this.classList.add('was-validated');
    if (!this.checkValidity()) return;
    const existing = byId(currentId);
    if (!existing) return;
    try {
      await api.updateVacancy(currentId, {
        ...existing,
        title: $('vacancyTitle').value.trim(),
        industry: $('vacancyIndustry').value,
        ...parseSalary($('vacancySalary').value),
        status: $('vacancyStatus').value
      });
      editModal.hide();
      toast('Изменения сохранены');
      load();
    } catch (err) {
      toast(err.message, 'text-bg-danger');
    }
  });

  // удаление
  $('confirmDeleteVacancy').addEventListener('click', async function () {
    try {
      await api.deleteVacancy(currentId);
      deleteModal.hide();
      toast('Вакансия удалена', 'text-bg-danger');
      load();
    } catch (err) {
      toast(err.message, 'text-bg-danger');
    }
  });

  // создание
  const newForm = $('newVacancyForm');
  newForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    this.classList.add('was-validated');
    if (!this.checkValidity()) return;
    try {
      await api.createVacancy({
        title: $('newVacancyTitle').value.trim(),
        companyName: user.companyName,
        companyLogo: user.companyLogo || (user.companyName || '?')[0],
        industry: $('newVacancyIndustry').value,
        location: '',
        ...parseSalary($('newVacancySalary').value),
        salaryCurrency: 'RUB',
        experience: EXPERIENCE[$('newVacancyExperience').value] || '0',
        employmentType: 'full-time',
        workFormat: FORMAT[$('newVacancyFormat').value] || 'office',
        description: $('newVacancyDescription').value.trim(),
        responsibilities: [],
        requirements: [],
        skills: [],
        status: 'active',
        publishedDate: new Date().toISOString().slice(0, 10),
        views: 0,
        applicationsCount: 0
      });
      newModal.hide();
      newForm.reset();
      newForm.classList.remove('was-validated');
      toast('Вакансия опубликована');
      load();
    } catch (err) {
      toast(err.message, 'text-bg-danger');
    }
  });

  load();
});
