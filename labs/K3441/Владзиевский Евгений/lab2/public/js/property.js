// Страница объекта. Объявление, владелец, отзывы и похожие варианты
// приходят с сервера; запись на просмотр и сообщение владельцу — POST-запросы.

const listingId = Number(new URLSearchParams(location.search).get('id')) || 1;
const $ = (sel) => document.querySelector(sel);

let item = null;
let owner = null;

function fillHead() {
  document.title = `${item.title} | Ключи`;
  $('[data-title]').textContent = item.title;
  $('[data-crumb-title]').textContent = item.title;
  $('[data-crumb-city]').textContent = item.city;
  $('[data-crumb-city]').href = `search.html?city=${encodeURIComponent(item.city)}`;
  $('[data-address]').textContent = `${item.city}, ${item.address}. ${item.metro}`;
  $('.fav-inline').dataset.fav = item.id;
  bindFavoriteButtons(document);
}

function fillGallery() {
  $('[data-slides]').innerHTML = item.photos.map((p, i) => `
    <div class="carousel-item ${i === 0 ? 'active' : ''}">
      <img src="img/${esc(p)}.webp" alt="${esc(item.title)}, фото ${i + 1} из ${item.photos.length}" width="1200" height="800">
    </div>`).join('');
  $('[data-thumbs]').innerHTML = item.photos.map((p, i) => `
    <button type="button" data-bs-target="#gallery" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}" aria-label="Фото ${i + 1}" ${i === 0 ? 'aria-current="true"' : ''}>
      <img src="img/${esc(p)}.webp" alt="" width="240" height="160">
    </button>`).join('');
  document.getElementById('gallery').addEventListener('slide.bs.carousel', (e) => {
    document.querySelectorAll('[data-thumbs] button').forEach((b, i) => {
      b.classList.toggle('active', i === e.to);
      if (i === e.to) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  });
}

function fillBody() {
  const facts = [
    ['Тип', roomsLabel(item)],
    ['Площадь', `${item.area} м²`],
    ['Этаж', item.floor],
    ['Год постройки', item.built]
  ];
  $('[data-facts]').innerHTML = facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  $('[data-text]').textContent = item.text;

  // Иконки берутся из общего спрайта: имя символа, подпись, есть ли удобство
  const amenities = [
    ['lamp', 'Мебель', item.furniture],
    ['wind', 'Балкон или терраса', item.balcony],
    ['heart', 'Можно с животными', item.pets],
    ['people', 'Можно с детьми', item.kids],
    ['wifi', 'Интернет', true],
    ['water', 'Стиральная машина', true],
    ['snow', 'Холодильник', true],
    ['tv', 'Телевизор', item.type !== 'room']
  ];
  $('[data-amenities]').innerHTML = amenities.map(([icon, name, yes]) =>
    `<li class="${yes ? '' : 'no'}"><svg class="icon" aria-hidden="true"><use href="img/sprite.svg#${yes ? icon : 'x-lg'}"></use></svg>${name}<span class="visually-hidden">${yes ? ': есть' : ': нет'}</span></li>`
  ).join('');

  const terms = [
    ['Ежемесячный платёж', formatPrice(item.price)],
    ['Залог', formatPrice(item.deposit)],
    ['Комиссия', item.commission ? formatPrice(item.commission) : 'Нет'],
    ['Коммунальные платежи', item.type === 'room' ? 'Делятся между жильцами' : 'По счётчикам, около 5 000 ₽'],
    ['Срок аренды', item.type === 'house' ? 'От 12 месяцев' : 'От 6 месяцев'],
    ['Предоплата', 'За первый месяц'],
    ['Свободна с', '1 ноября 2026']
  ];
  $('[data-terms]').innerHTML = terms.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('');

  // Карта OpenStreetMap
  const d = 0.006;
  $('[data-map]').src = `https://www.openstreetmap.org/export/embed.html?bbox=${item.lng - d * 2},${item.lat - d},${item.lng + d * 2},${item.lat + d}&layer=mapnik&marker=${item.lat},${item.lng}`;

  // Боковая панель
  $('[data-price]').innerHTML = `${formatPrice(item.price)} <small>/ мес</small>`;
  $('[data-price-note]').textContent = `Залог ${formatPrice(item.deposit)}, ${item.commission ? 'комиссия ' + formatPrice(item.commission) : 'без комиссии'}`;
  $('[data-owner]').textContent = owner ? owner.name : 'Владелец';
  $('[data-owner-initials]').textContent = initials(owner?.name);
  if (owner?.responseTime) $('[data-response]').textContent = `Обычно отвечает ${owner.responseTime}`;
}

function fillReviews(reviews) {
  const box = $('[data-reviews]');
  if (!reviews.length) {
    box.innerHTML = '<p class="text-muted-2 m-0">Отзывов пока нет.</p>';
    $('[data-rating]').textContent = 'Пока без оценок';
    return;
  }
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  $('[data-rating]').innerHTML =
    `<svg class="icon text-warning" aria-hidden="true"><use href="img/sprite.svg#star-fill"></use></svg> ${avg.toFixed(1).replace('.', ',')} из 5`;
  box.innerHTML = reviews.map(r => {
    const date = monthYear(r.date);
    return `<article class="panel">
      <div class="d-flex justify-content-between mb-1"><strong>${esc(r.author)}</strong><time class="text-muted-2 small" datetime="${esc(r.date)}">${esc(date)}</time></div>
      <p class="mb-0">${esc(r.text)}</p>
    </article>`;
  }).join('');
}

function fillSimilar(list) {
  $('[data-similar]').innerHTML = list.length
    ? list.map(l => `<div class="col-sm-6 col-lg-4">${listingCard(l)}</div>`).join('')
    : '<p class="text-muted-2">Других вариантов в этом городе пока нет.</p>';
  bindFavoriteButtons($('[data-similar]'));
}

function showNotFound() {
  document.querySelector('main').innerHTML = `
    <div class="empty-state my-5">
      <h1 class="fs-4">Объявление не найдено</h1>
      <p class="text-muted-2">Возможно, его сняли с публикации.</p>
      <a class="btn btn-primary" href="search.html">Вернуться к поиску</a>
    </div>`;
}

// Обе формы требуют входа: бронь и сообщение привязаны к пользователю
function needLogin(modalId) {
  bootstrap.Modal.getInstance(document.getElementById(modalId))?.hide();
  showToast('Войдите, чтобы написать владельцу или записаться на просмотр');
  setTimeout(() => { window.location.href = `login.html?next=property.html%3Fid%3D${item.id}`; }, 1200);
}

function bindForms() {
  const today = new Date().toISOString().slice(0, 10);
  $('#view-date').min = today;

  const viewingForm = document.getElementById('viewing-form');
  bindValidation(viewingForm, () => withPending(viewingForm, async () => {
    if (!api.isLogged) return needLogin('viewingModal');
    try {
      await api.create('/viewings', {
        userId: api.user.id,
        listingId: item.id,
        date: $('#view-date').value,
        time: $('#view-time').value,
        people: $('#view-people').value,
        comment: $('#view-comment').value.trim(),
        status: 'new'
      });
      bootstrap.Modal.getInstance(document.getElementById('viewingModal')).hide();
      const date = new Date($('#view-date').value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      showToast(`Вы записаны на просмотр ${date} в ${$('#view-time').value}`);
      viewingForm.reset();
      viewingForm.classList.remove('was-validated');
    } catch (e) {
      reportError(e, 'viewing');
    }
  }));

  document.querySelectorAll('[data-quick]').forEach(btn => {
    btn.addEventListener('click', () => {
      const area = $('#msg-text');
      area.value = (area.value ? area.value + ' ' : '') + btn.textContent;
      area.focus();
    });
  });

  const messageForm = document.getElementById('message-form');
  bindValidation(messageForm, () => withPending(messageForm, async () => {
    if (!api.isLogged) return needLogin('messageModal');
    try {
      // Если переписки с этим владельцем ещё нет, заводим её
      const existing = await api.getMine('/dialogs', { listingId: item.id, partnerId: item.userId });
      const dialog = existing[0] || await api.create('/dialogs', {
        userId: api.user.id, partnerId: item.userId, listingId: item.id
      });
      await api.create('/messages', {
        userId: api.user.id,
        dialogId: dialog.id,
        authorId: api.user.id,
        text: $('#msg-text').value.trim(),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      });
      bootstrap.Modal.getInstance(document.getElementById('messageModal')).hide();
      showToast('Сообщение отправлено. Ответ придёт в раздел «Сообщения»');
      messageForm.reset();
      messageForm.classList.remove('was-validated');
    } catch (e) {
      reportError(e, 'message');
    }
  }));

  document.getElementById('share-btn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      showToast('Ссылка скопирована');
    } catch (e) {
      showToast('Не получилось скопировать. Скопируйте адрес из строки браузера');
    }
  });
}

(async function load() {
  try {
    item = await api.getOne('/listings', listingId);
  } catch (e) {
    if (e.status === 404) return showNotFound();
    return reportError(e, 'listing');
  }

  // Владелец, отзывы и похожие варианты независимы — запрашиваем разом
  const [ownerData, reviews, similar] = await Promise.all([
    api.getOne('/owners', item.userId).catch(() => null),
    api.getList('/reviews', { ownerId: item.userId, _sort: 'date', _order: 'desc' }).catch(() => []),
    api.getList('/listings', { city: item.city, id_ne: item.id, _limit: 3 }).catch(() => [])
  ]);
  owner = ownerData;

  fillHead();
  fillGallery();
  fillBody();
  fillReviews(reviews);
  fillSimilar(similar);
  bindForms();
})();
