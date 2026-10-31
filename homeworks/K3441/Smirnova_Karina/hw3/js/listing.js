// Подключает загрузку объекта, расчёт стоимости и отправку бронирования.
function setupListingPage() {
  const listingRoot = document.querySelector('[data-listing-page]');
  if (!listingRoot) return;

  const listingId = new URLSearchParams(window.location.search).get('id');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  const bookingDateError = document.getElementById('bookingDateError');
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
    endDate.setAttribute('aria-invalid', String(!datesAreValid));
    bookingDateError.hidden = datesAreValid;
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
    mainImage.alt = `${listing.title}, основная фотография`;
    mainImage.closest('button').setAttribute('aria-label', `Открыть фотографии объекта «${listing.title}»`);
    const galleryFirstImage = document.getElementById('galleryFirstImage');
    galleryFirstImage.src = listing.image;
    galleryFirstImage.alt = `${listing.title}, основная фотография`;
    document.querySelector('[data-booking-title]').textContent = listing.title;

    updateBookingSummary();
  }

  // Получает объявление по id из адресной строки.
  async function loadListing() {
    listingRoot.setAttribute('aria-busy', 'true');
    if (!listingId) {
      showMessage('Не указан идентификатор объекта');
      listingRoot.setAttribute('aria-busy', 'false');
      return;
    }

    try {
      currentListing = await getListing(listingId);
      renderListing(currentListing);
    } catch (error) {
      console.error(error);
      showMessage('Не удалось загрузить объект');
    } finally {
      listingRoot.setAttribute('aria-busy', 'false');
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
      (startDate.checkValidity() ? endDate : startDate).focus();
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
  const galleryModal = document.getElementById('galleryModal');
  const carousel = document.getElementById('galleryCarousel');
  const positionStatus = document.getElementById('galleryPosition');
  if (!galleryModal || !carousel || !positionStatus || !window.bootstrap) return;

  const items = Array.from(carousel.querySelectorAll('.carousel-item'));
  const indicators = Array.from(carousel.querySelectorAll('[data-bs-slide-to]'));
  const carouselInstance = bootstrap.Carousel.getOrCreateInstance(carousel, {
    interval: false,
    keyboard: false,
    ride: false,
    touch: true,
    wrap: true,
  });

  function updateGalleryStatus(index) {
    const image = items[index]?.querySelector('img');
    positionStatus.textContent = `Фото ${index + 1} из ${items.length}: ${image?.alt || 'фотография объекта'}`;
    indicators.forEach((indicator, indicatorIndex) => {
      if (indicatorIndex === index) {
        indicator.setAttribute('aria-current', 'true');
      } else {
        indicator.removeAttribute('aria-current');
      }
    });
  }

  document.querySelectorAll('[data-gallery-index]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const index = Number(trigger.dataset.galleryIndex);
      carouselInstance.to(index);
      updateGalleryStatus(index);
    });
  });

  galleryModal.addEventListener('shown.bs.modal', () => carousel.focus());

  galleryModal.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const actions = {
      ArrowLeft: () => carouselInstance.prev(),
      ArrowRight: () => carouselInstance.next(),
      Home: () => carouselInstance.to(0),
      End: () => carouselInstance.to(items.length - 1),
    };
    const action = actions[event.key];
    if (!action) return;

    event.preventDefault();
    action();
  });

  carousel.addEventListener('slid.bs.carousel', (event) => updateGalleryStatus(event.to));
}

document.addEventListener('DOMContentLoaded', () => {
  setupListingPage();
  setupGallery();
});
