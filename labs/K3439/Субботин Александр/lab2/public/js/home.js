// Главная: кухни, районы для формы поиска и популярные рестораны из API

async function renderCuisines() {
  const grid = document.querySelector('#cuisineGrid');
  try {
    const cuisines = await api.get('/cuisines');
    grid.innerHTML = cuisines.map((c) => `
      <a class="cuisine-tile" href="search.html?cuisine=${c.id}"><img src="${c.image}" alt="">${escapeHtml(c.name)}</a>`).join('');
  } catch (error) {
    grid.outerHTML = errorHtml(error.message);
  } finally {
    grid.removeAttribute('aria-busy');
  }
}

async function renderDistricts() {
  const select = document.querySelector('#heroDistrict');
  try {
    const districts = await api.get('/districts');
    select.innerHTML = '<option value="">Любой район</option>'
      + districts.map((d) => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('');
  } catch {
    // если API недоступно, остаются районы из разметки
  }
}

// Популярные = три ресторана с лучшим рейтингом по отзывам
async function renderPopular() {
  const list = document.querySelector('#popularList');
  list.querySelector('[data-loader]').innerHTML = loaderHtml('Загружаем рестораны…');

  try {
    const restaurants = await api.get('/restaurants?_expand=cuisine&_expand=district&_embed=reviews');
    const top = restaurants
      .sort((a, b) => ratingOf(b.reviews).value - ratingOf(a.reviews).value)
      .slice(0, 3);
    list.innerHTML = top.map((r) => `<div class="col">${restaurantCardHtml(r, 'h3')}</div>`).join('');
  } catch (error) {
    list.innerHTML = `<div class="col-12">${errorHtml(error.message)}</div>`;
  }
}

renderCuisines();
renderDistricts();
renderPopular();
