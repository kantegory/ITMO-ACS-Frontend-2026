// Загружает, фильтрует и отображает объявления на странице поиска.
function setupSearchPage() {
  const searchForm = document.getElementById('searchForm');
  const listingGrid = document.getElementById('listingGrid');
  const template = document.getElementById('listingCardTemplate');
  const resultsCount = document.getElementById('resultsCount');
  const emptyResults = document.getElementById('emptyResults');
  const sortOrder = document.getElementById('sortOrder');
  const modeButtons = document.querySelectorAll('[data-rent-mode]');

  // Создаёт HTML-карточки из данных, полученных от JSON Server.
  function renderListings(listings) {
    listingGrid.replaceChildren();

    listings.forEach((listing) => {
      const card = template.content.firstElementChild.cloneNode(true);
      const isDaily = listing.mode === 'DAILY';

      card.dataset.id = listing.id;
      card.querySelector('.property-image').src = listing.image;
      card.querySelector('.property-image').alt = listing.title;
      card.querySelector('.property-mode').textContent = isDaily ? 'Посуточно' : 'Помесячно';
      card.querySelector('.property-type').textContent = listing.type;
      card.querySelector('.property-title').textContent = listing.title;
      card.querySelector('.property-address-text').textContent = `${listing.location}, ${listing.address}`;
      card.querySelector('.property-price').textContent =
        `${Number(listing.price).toLocaleString('ru-RU')} ₽ / ${isDaily ? 'ночь' : 'месяц'}`;
      card.querySelector('.property-description').textContent = listing.description;
      card.querySelector('.property-link').href = `listing.html?id=${listing.id}`;

      listingGrid.append(card);
    });

    resultsCount.textContent = `Найдено объектов: ${listings.length}`;
    emptyResults.hidden = listings.length !== 0;
  }

  // Собирает значения фильтров, запрашивает объявления и обновляет страницу.
  async function loadListings() {
    const activeMode = document.querySelector('[data-rent-mode].active');
    resultsCount.textContent = 'Загрузка объектов...';
    emptyResults.hidden = true;

    try {
      const listings = await getListings({
        mode: activeMode?.dataset.rentMode,
        type: document.getElementById('houseType').value,
        location: document.getElementById('location').value.trim(),
        min: document.getElementById('priceMin').value,
        max: document.getElementById('priceMax').value,
        sort: sortOrder.value,
      });

      renderListings(listings);
    } catch (error) {
      console.error(error);
      listingGrid.replaceChildren();
      resultsCount.textContent = 'Не удалось загрузить объекты';
      showMessage('Ошибка загрузки объявлений');
    }
  }

  // Возвращает фильтры и режим аренды к начальным значениям.
  function resetFilters() {
    searchForm.reset();
    sortOrder.value = 'recommended';
    modeButtons.forEach((button) => button.classList.remove('active'));
    document.querySelector('[data-rent-mode="DAILY"]').classList.add('active');
    loadListings();
  }

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    loadListings();
  });

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      modeButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      loadListings();
    });
  });

  sortOrder.addEventListener('change', loadListings);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
  document.getElementById('emptyResetFilters').addEventListener('click', resetFilters);

  loadListings();
}

// Запускает страницу поиска после загрузки HTML.
document.addEventListener('DOMContentLoaded', setupSearchPage);
