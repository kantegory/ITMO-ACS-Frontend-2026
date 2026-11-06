
(function () {
  'use strict';


  const footerContainer = document.getElementById('site-footer');
  if (footerContainer) {
    fetch('blocks/footer.html')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Не удалось загрузить футер');
        }
        return response.text();
      })
      .then(function (html) {
        footerContainer.innerHTML = html;
      })
      .catch(function () {
        footerContainer.innerHTML =
          '<footer class="site-footer bg-dark text-white-50 py-4 mt-auto">' +
          '<div class="container text-center small">© 2026 JobHub</div></footer>';
      });
  }


  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-header .nav-link').forEach(function (link) {
    const target = link.getAttribute('href');
    if (target && target.split('#')[0] === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  document.querySelectorAll('.needs-validation').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const password = form.querySelector('#regPassword');
      const repeat = form.querySelector('#regPassword2');
      if (password && repeat) {
        repeat.setCustomValidity(repeat.value === password.value ? '' : 'mismatch');
      }

      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        event.preventDefault();
        showToast('Данные отправлены. Это демонстрационная версия сайта.');
        const modal = form.closest('.modal');
        if (modal) {
          bootstrap.Modal.getOrCreateInstance(modal).hide();
        }
      }
      form.classList.add('was-validated');
    }, false);

    form.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', function () {
        if (input.id === 'regPassword2' || input.id === 'regPassword') {
          const p1 = form.querySelector('#regPassword');
          const p2 = form.querySelector('#regPassword2');
          if (p2) {
            p2.setCustomValidity(p1 && p2.value === p1.value ? '' : 'mismatch');
          }
        }
        if (input.classList.contains('is-invalid')) {
          input.classList.remove('is-invalid');
        }
      });
    });
  });

  function showToast(message, variant) {
    const toastEl = document.getElementById('appToast');
    if (!toastEl) return;
    const body = document.getElementById('appToastBody');
    if (body) body.textContent = message;
    toastEl.classList.remove('text-bg-success', 'text-bg-danger', 'text-bg-primary');
    toastEl.classList.add(variant || 'text-bg-success');
    bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 4000 }).show();
  }
  window.showToast = showToast;

  document.addEventListener('click', function (event) {
    const button = event.target.closest('[data-toast]');
    if (button) {
      showToast(button.getAttribute('data-toast'));
    }
  });

  initVacancyFilters();
  function initVacancyFilters() {
    const form = document.getElementById('filtersForm');
    const list = document.getElementById('vacancyList');
    if (!form || !list) return;

    const cards = Array.prototype.slice.call(list.querySelectorAll('.vacancy-item'));
    const counter = document.getElementById('resultsCount');
    const emptyState = document.getElementById('emptyState');
    const resetBtn = document.getElementById('resetFilters');
    const sortSelect = document.getElementById('sortSelect');

    function numberFrom(value) {
      return Number(String(value).replace(/\D/g, '')) || 0;
    }

    function applyFilters() {
      const q = form.querySelector('#filterQuery').value.trim().toLowerCase();
      const industry = form.querySelector('#filterIndustry').value;
      const salary = Number(form.querySelector('#filterSalary').value) || 0;
      const experience = Array.prototype.slice.call(
        form.querySelectorAll('input[name="experience"]:checked')
      ).map(function (el) { return el.value; });
      const remoteOnly = form.querySelector('#filterRemote').checked;

      let visible = 0;
      cards.forEach(function (card) {
        const matchesQuery = !q ||
          card.dataset.title.toLowerCase().includes(q) ||
          card.dataset.company.toLowerCase().includes(q);
        const matchesIndustry = !industry || card.dataset.industry === industry;
        const matchesSalary = !salary || numberFrom(card.dataset.salary) >= salary;
        const matchesExperience = !experience.length || experience.indexOf(card.dataset.experience) !== -1;
        const matchesRemote = !remoteOnly || card.dataset.remote === 'true';

        const show = matchesQuery && matchesIndustry && matchesSalary &&
          matchesExperience && matchesRemote;
        card.classList.toggle('is-hidden', !show);
        if (show) visible++;
      });

      if (counter) counter.textContent = visible;
      if (emptyState) emptyState.classList.toggle('d-none', visible !== 0);
      updateQueryString();
    }

    function sortCards() {
      if (!sortSelect) return;
      const mode = sortSelect.value;
      const sorted = cards.slice().sort(function (a, b) {
        if (mode === 'salary') {
          return numberFrom(b.dataset.salary) - numberFrom(a.dataset.salary);
        }
        if (mode === 'date') {
          return Number(b.dataset.date) - Number(a.dataset.date);
        }
        return 0;
      });
      sorted.forEach(function (card) { list.appendChild(card); });
    }

    function updateQueryString() {
      const params = new URLSearchParams();
      const q = form.querySelector('#filterQuery').value.trim();
      const industry = form.querySelector('#filterIndustry').value;
      const salary = form.querySelector('#filterSalary').value;
      if (q) params.set('q', q);
      if (industry) params.set('industry', industry);
      if (salary) params.set('salary', salary);
      if (form.querySelector('#filterRemote').checked) params.set('remote', '1');
      const search = params.toString();
      history.replaceState(null, '', search ? '?' + search : location.pathname);
    }

    // Предзаполнение фильтров из адресной строки
    const params = new URLSearchParams(location.search);
    if (params.get('q')) form.querySelector('#filterQuery').value = params.get('q');
    if (params.get('industry')) form.querySelector('#filterIndustry').value = params.get('industry');
    if (params.get('salary')) form.querySelector('#filterSalary').value = params.get('salary');
    if (params.get('remote') === '1') form.querySelector('#filterRemote').checked = true;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters();
    });
    form.addEventListener('change', applyFilters);
    form.addEventListener('input', applyFilters);

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        form.reset();
        applyFilters();
        sortCards();
      });
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }

    applyFilters();
  }

  const accountSidebar = document.getElementById('accountNav');
  if (accountSidebar) {
    const links = accountSidebar.querySelectorAll('[data-section]');
    const sections = document.querySelectorAll('[data-section-panel]');
    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        const target = link.getAttribute('data-section');
        links.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
        sections.forEach(function (section) {
          section.classList.toggle('d-none', section.getAttribute('data-section-panel') !== target);
        });
      });
    });
  }

  const vacancyForm = document.getElementById('vacancyForm');
  if (vacancyForm) {
    const editModalEl = document.getElementById('vacancyModal');
    const editModal = bootstrap.Modal.getOrCreateInstance(editModalEl);
    const deleteModalEl = document.getElementById('deleteVacancyModal');
    const deleteModal = bootstrap.Modal.getOrCreateInstance(deleteModalEl);

    document.querySelectorAll('[data-edit-vacancy]').forEach(function (button) {
      button.addEventListener('click', function () {
        const row = button.closest('tr');
        vacancyForm.querySelector('#vacancyTitle').value = row.dataset.title || '';
        vacancyForm.querySelector('#vacancyIndustry').value = row.dataset.industry || '';
        vacancyForm.querySelector('#vacancySalary').value = row.dataset.salary || '';
        vacancyForm.querySelector('#vacancyStatus').value = row.dataset.status || 'active';
        editModal.show();
      });
    });

    let rowToDelete = null;
    document.querySelectorAll('[data-delete-vacancy]').forEach(function (button) {
      button.addEventListener('click', function () {
        rowToDelete = button.closest('tr');
        const name = deleteModalEl.querySelector('#deleteVacancyName');
        if (name) name.textContent = rowToDelete.dataset.title;
        deleteModal.show();
      });
    });

    const confirmDelete = document.getElementById('confirmDeleteVacancy');
    if (confirmDelete) {
      confirmDelete.addEventListener('click', function () {
        if (rowToDelete) {
          rowToDelete.remove();
          showToast('Вакансия удалена', 'text-bg-danger');
        }
        deleteModal.hide();
        updateEmployerStats();
      });
    }

    vacancyForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!vacancyForm.checkValidity()) {
        vacancyForm.classList.add('was-validated');
        return;
      }
      editModal.hide();
      showToast('Изменения сохранены');
    });

    function updateEmployerStats() {
      const rows = document.querySelectorAll('#employerVacancies tbody tr');
      const counter = document.getElementById('employerVacanciesCount');
      if (counter) counter.textContent = rows.length;
      const active = document.querySelectorAll('#employerVacancies tbody tr[data-status="active"]');
      const activeCounter = document.getElementById('employerActiveCount');
      if (activeCounter) activeCounter.textContent = active.length;
    }

    const newVacancyModalEl = document.getElementById('newVacancyModal');

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function addVacancyRow(form) {
      const tableBody = document.querySelector('#employerVacancies tbody');
      if (!tableBody) return;
      const title = form.querySelector('#newVacancyTitle').value;
      const industry = form.querySelector('#newVacancyIndustry').value;
      const salary = form.querySelector('#newVacancySalary').value;
      const industryLabels = {
        IT: 'IT и телеком',
        finance: 'Финансы и банки',
        trade: 'Торговля',
        marketing: 'Маркетинг',
        education: 'Образование',
        medicine: 'Медицина'
      };
      const row = document.createElement('tr');
      row.dataset.title = title;
      row.dataset.industry = industry;
      row.dataset.salary = salary;
      row.dataset.status = 'active';
      row.innerHTML =
        '<td><div class="fw-semibold">' + escapeHtml(title) + '</div>' +
        '<div class="small text-muted">' + (industryLabels[industry] || '') + '</div></td>' +
        '<td class="text-nowrap fw-semibold salary">' + escapeHtml(salary) + '</td>' +
        '<td><span class="badge text-bg-success-subtle text-success-emphasis">Активна</span></td>' +
        '<td class="text-center">0</td>' +
        '<td class="text-muted small text-nowrap">сегодня</td>' +
        '<td class="text-end text-nowrap">' +
        '<button type="button" class="btn btn-sm btn-light" data-toast="Открываю предпросмотр">' +
        '<i class="bi bi-eye"></i></button> ' +
        '<button type="button" class="btn btn-sm btn-light" data-toast="Редактирование: ' + escapeHtml(title) + '">' +
        '<i class="bi bi-pencil"></i></button> ' +
        '<button type="button" class="btn btn-sm btn-light text-danger" data-toast="Вакансия снята с публикации">' +
        '<i class="bi bi-trash"></i></button></td>';
      tableBody.prepend(row);
      updateEmployerStats();
    }

    if (newVacancyModalEl) {
      const newForm = newVacancyModalEl.querySelector('form');
      newForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!newForm.checkValidity()) {
          newForm.classList.add('was-validated');
          return;
        }
        addVacancyRow(newForm);
        bootstrap.Modal.getOrCreateInstance(newVacancyModalEl).hide();
        newForm.reset();
        newForm.classList.remove('was-validated');
        showToast('Вакансия опубликована');
      });
    }
  }

  const companySearch = document.getElementById('companySearch');
  if (companySearch) {
    companySearch.addEventListener('input', function () {
      const q = companySearch.value.trim().toLowerCase();
      let visible = 0;
      document.querySelectorAll('#companyGrid .company-col').forEach(function (col) {
        const show = col.dataset.name.toLowerCase().includes(q);
        col.classList.toggle('d-none', !show);
        if (show) visible++;
      });
      const empty = document.getElementById('companyEmpty');
      if (empty) empty.classList.toggle('d-none', visible !== 0);
    });
  }
})();