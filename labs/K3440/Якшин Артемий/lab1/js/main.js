// «Поварёшка» — небольшие сценарии для статичной вёрстки (ЛР1).
// Данные пока лежат прямо в разметке, поэтому фильтры работают
// по data-атрибутам карточек.

document.addEventListener('DOMContentLoaded', () => {
  initFilters()
  initToggles()
  initForms()
  initComments()
})

/* ---------- поиск, фильтры и сортировка на главной ---------- */

function initFilters() {
  const grid = document.getElementById('recipesGrid')
  if (!grid) return

  const filtersForm = document.getElementById('filtersForm')
  const searchForm = document.getElementById('searchForm')
  const sortSelect = document.getElementById('sortSelect')
  const counter = document.getElementById('resultsCount')
  const emptyState = document.getElementById('emptyState')
  const columns = Array.from(grid.children)

  function apply() {
    const data = new FormData(filtersForm)
    const types = data.getAll('type')
    const difficulties = data.getAll('difficulty')
    const tags = data.getAll('tag')
    const maxTime = Number(data.get('time')) || Infinity
    const query = searchForm.q.value.trim().toLowerCase()

    let visible = 0

    columns.forEach((column) => {
      const card = column.querySelector('.recipe-card')
      const cardTags = card.dataset.tags.split(',')

      const matches =
        (!types.length || types.includes(card.dataset.type)) &&
        (!difficulties.length || difficulties.includes(card.dataset.difficulty)) &&
        tags.every((tag) => cardTags.includes(tag)) &&
        Number(card.dataset.time) <= maxTime &&
        (!query || card.dataset.search.includes(query))

      column.classList.toggle('d-none', !matches)
      if (matches) visible += 1
    })

    counter.textContent = visible
    emptyState.classList.toggle('d-none', visible > 0)
  }

  function sort() {
    const key = sortSelect.value
    const value = (column) => column.querySelector('.recipe-card').dataset[key]

    columns.sort((a, b) => {
      if (key === 'time') return Number(value(a)) - Number(value(b))
      if (key === 'date') return value(b).localeCompare(value(a))
      return Number(value(b)) - Number(value(a))
    })

    columns.forEach((column) => grid.append(column))
  }

  filtersForm.addEventListener('change', apply)
  // reset срабатывает до очистки полей, поэтому ждём следующий тик
  filtersForm.addEventListener('reset', () => setTimeout(apply))
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault()
    apply()
  })
  searchForm.q.addEventListener('input', apply)
  sortSelect.addEventListener('change', sort)

  document.querySelectorAll('[data-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      searchForm.q.value = chip.dataset.chip
      apply()
    })
  })
}

/* ---------- лайк, сохранить, подписаться ---------- */

function initToggles() {
  document.querySelectorAll('[data-toggle-like]').forEach((button) => {
    button.addEventListener('click', () => {
      const counter = button.querySelector('[data-like-count]')
      const isActive = button.classList.toggle('is-active')
      counter.textContent = Number(counter.textContent) + (isActive ? 1 : -1)
    })
  })

  document.querySelectorAll('[data-toggle-save]').forEach((button) => {
    button.addEventListener('click', () => {
      const isActive = button.classList.toggle('is-active')
      const label = button.querySelector('[data-save-label]')
      if (label) label.textContent = isActive ? 'В сохранённых' : 'Сохранить'
      button.title = isActive ? 'Убрать из сохранённых' : 'Сохранить'
    })
  })

  document.querySelectorAll('[data-toggle-follow]').forEach((button) => {
    button.addEventListener('click', () => {
      const isActive = button.classList.toggle('is-active')
      button.textContent = isActive ? 'Вы подписаны' : 'Подписаться'

      const counter = document.querySelector('[data-followers-count]')
      if (counter) counter.textContent = Number(counter.textContent) + (isActive ? 1 : -1)
    })
  })
}

/* ---------- формы: проверка полей средствами Bootstrap ---------- */

function initForms() {
  const register = document.getElementById('registerForm')
  if (register) {
    const repeat = register.password2
    register.addEventListener('input', () => {
      repeat.setCustomValidity(repeat.value === register.password.value ? '' : 'mismatch')
    })
  }

  const redirects = { loginForm: 'profile.html', registerForm: 'profile.html' }
  const modals = ['recipeForm', 'profileForm']

  document.querySelectorAll('form.needs-validation').forEach((form) => {
    if (form.id === 'commentForm') return

    form.addEventListener('submit', (event) => {
      event.preventDefault()
      form.classList.add('was-validated')
      if (!form.checkValidity()) return

      if (redirects[form.id]) {
        window.location.href = redirects[form.id]
      }

      if (modals.includes(form.id)) {
        bootstrap.Modal.getInstance(form.closest('.modal')).hide()
        form.classList.remove('was-validated')
      }
    })
  })
}

/* ---------- комментарии на странице рецепта ---------- */

function initComments() {
  const form = document.getElementById('commentForm')
  if (!form) return

  const list = document.getElementById('commentsList')
  const counter = document.querySelector('[data-comments-count]')

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    form.classList.add('was-validated')
    if (!form.checkValidity()) return

    const comment = document.createElement('article')
    comment.className = 'comment'
    comment.innerHTML = `
      <span class="avatar" style="--avatar-bg: #8A4F7D">МИ</span>
      <div>
        <div class="comment__head">
          <span class="comment__name">Мария Иванова</span>
          <span class="comment__date">только что</span>
        </div>
        <p></p>
      </div>`
    comment.querySelector('p').textContent = form.text.value.trim()

    list.prepend(comment)
    counter.textContent = Number(counter.textContent) + 1
    form.reset()
    form.classList.remove('was-validated')
  })
}
