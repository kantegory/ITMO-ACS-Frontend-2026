// Подключает загрузку объекта, расчёт стоимости и отправку бронирования.
function setupListingPage() {
  const listingRoot = document.querySelector('[data-listing-page]');
  if (!listingRoot) return;

  const listingId = new URLSearchParams(window.location.search).get('id');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  const confirmButton = document.getElementById('confirmBooking');
  let currentListing = null;
  let bookingTotal = 0;

  // Форматирует цену для вывода в интерфейсе.
  function formatPrice(price) {
    return `${Number(price).toLocaleString('ru-RU')} ₽`;
  }

  // Пересчитывает число ночей и итоговую стоимость бронирования.
  function updateBookingSummary() {
    if (!currentListing || !startDate?.value || !endDate?.value) return;

    const milliseconds = new Date(endDate.value) - new Date(startDate.value);
    const nights = Math.round(milliseconds / 86400000);
    const datesAreValid = nights > 0;

    endDate.setCustomValidity(datesAreValid ? '' : 'Дата выезда должна быть позже даты заезда');
    bookingTotal = datesAreValid ? nights * Number(currentListing.price) : 0;

    document.querySelectorAll('[data-night-count]').forEach((node) => {
      node.textContent = datesAreValid ? nights : 0;
    });
    document.querySelectorAll('[data-booking-total]').forEach((node) => {
      node.textContent = formatPrice(bookingTotal);
    });

    const period = document.querySelector('[data-booking-period]');
    if (period) period.textContent = `${startDate.value} — ${endDate.value}`;
  }

  // Подставляет данные объявления в подготовленную HTML-разметку.
  function renderListing(listing) {
    const isDaily = listing.mode === 'DAILY';
    const priceUnit = isDaily ? 'ночь' : 'месяц';

    document.title = `${listing.title} — RentSpace`;
    document.querySelectorAll('[data-listing-title]').forEach((node) => {
      node.textContent = listing.title;
    });
    document.querySelector('[data-listing-address]').textContent = `${listing.location}, ${listing.address}`;
    document.querySelectorAll('[data-listing-type]').forEach((node) => {
      node.textContent = listing.type;
    });
    document.querySelector('[data-listing-description]').textContent = listing.description;
    document.querySelectorAll('[data-listing-price]').forEach((node) => {
      node.textContent = `${formatPrice(listing.price)} / ${priceUnit}`;
    });
    document.querySelectorAll('[data-daily]').forEach((node) => {
      node.hidden = !isDaily;
    });
    document.querySelectorAll('[data-monthly]').forEach((node) => {
      node.hidden = isDaily;
    });

    const mainImage = document.querySelector('[data-listing-main]');
    mainImage.src = listing.image;
    mainImage.alt = listing.title;
    document.getElementById('galleryFirstImage').src = listing.image;
    document.querySelector('[data-booking-title]').textContent = listing.title;

    updateBookingSummary();
  }

  // Получает объявление по id из адресной строки.
  async function loadListing() {
    if (!listingId) {
      showMessage('Не указан идентификатор объекта');
      return;
    }

    try {
      currentListing = await getListing(listingId);
      renderListing(currentListing);
    } catch (error) {
      console.error(error);
      showMessage('Не удалось загрузить объект');
    }
  }

  // Проверяет авторизацию и отправляет заявку на бронирование в API.
  async function sendBooking() {
    const token = localStorage.getItem('accessToken');
    const currentUser = getCurrentUser();

    if (!token || !currentUser) {
      window.alert('Сначала войдите в аккаунт');
      window.location.href = 'index.html';
      return;
    }

    updateBookingSummary();

    if (!currentListing || !startDate.checkValidity() || !endDate.checkValidity() || bookingTotal <= 0) {
      showMessage('Проверьте даты бронирования');
      return;
    }

    confirmButton.disabled = true;

    try {
      await createBooking({
        userId: currentUser.id,
        listingId: currentListing.id,
        startDate: startDate.value,
        endDate: endDate.value,
        total: bookingTotal,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }, token);

      bootstrap.Modal.getInstance(document.getElementById('bookingModal'))?.hide();
      showMessage('Заявка на бронирование успешно отправлена');
    } catch (error) {
      if (error.response?.status === 401) {
        showMessage('Срок авторизации истёк. Войдите снова');
      } else {
        showMessage('Не удалось отправить заявку');
      }
    } finally {
      confirmButton.disabled = false;
    }
  }

  startDate?.addEventListener('change', updateBookingSummary);
  endDate?.addEventListener('change', updateBookingSummary);
  confirmButton?.addEventListener('click', sendBooking);

  document.getElementById('contactOwner')?.addEventListener('click', () => {
    if (document.querySelector('#communicationChat')?.checked) {
      window.location.href = 'activity.html';
    } else {
      showMessage('Обращение создано. Владелец увидит ваш номер телефона.');
    }
  });

  loadListing();
}

// Открывает выбранную фотографию в Bootstrap Carousel.
function setupGallery() {
  document.querySelectorAll('[data-gallery-index]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const carousel = document.getElementById('galleryCarousel');
      if (!carousel || !window.bootstrap) return;

      bootstrap.Carousel
        .getOrCreateInstance(carousel, { interval: false, ride: false })
        .to(Number(trigger.dataset.galleryIndex));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupListingPage();
  setupGallery();
});
