// Страница объекта: заполняем разметку данными объявления по ?id=

const id = Number(new URLSearchParams(location.search).get('id')) || 1;
const item = LISTINGS.find(l => l.id === id) || LISTINGS[0];
const $ = (sel) => document.querySelector(sel);

document.title = `${item.title} | Ключи`;
$('[data-title]').textContent = item.title;
$('[data-crumb-title]').textContent = item.title;
$('[data-crumb-city]').textContent = item.city;
$('[data-crumb-city]').href = `search.html?city=${encodeURIComponent(item.city)}`;
$('[data-address]').textContent = `${item.city}, ${item.address}. ${item.metro}`;
$('.fav-inline').dataset.fav = item.id;

// Галерея
$('[data-slides]').innerHTML = item.photos.map((p, i) => `
  <div class="carousel-item ${i === 0 ? 'active' : ''}">
    <img src="img/${p}.webp" alt="${item.title}, фото ${i + 1} из ${item.photos.length}" width="1200" height="800">
  </div>`).join('');
$('[data-thumbs]').innerHTML = item.photos.map((p, i) => `
  <button type="button" data-bs-target="#gallery" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}" aria-label="Фото ${i + 1}" ${i === 0 ? 'aria-current="true"' : ''}>
    <img src="img/${p}.webp" alt="" width="240" height="160">
  </button>`).join('');
document.getElementById('gallery').addEventListener('slide.bs.carousel', (e) => {
  document.querySelectorAll('[data-thumbs] button').forEach((b, i) => {
    b.classList.toggle('active', i === e.to);
    if (i === e.to) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
  });
});

// Ключевые параметры
const facts = [
  ['Тип', roomsLabel(item)],
  ['Площадь', `${item.area} м²`],
  ['Этаж', item.floor],
  ['Год постройки', item.built]
];
$('[data-facts]').innerHTML = facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
$('[data-text]').textContent = item.text;

const amenities = [
  ['bi-lamp', 'Мебель', item.furniture],
  ['bi-wind', 'Балкон или терраса', item.balcony],
  ['bi-heart', 'Можно с животными', item.pets],
  ['bi-people', 'Можно с детьми', item.kids],
  ['bi-wifi', 'Интернет', true],
  ['bi-water', 'Стиральная машина', true],
  ['bi-snow', 'Холодильник', true],
  ['bi-tv', 'Телевизор', item.type !== 'room']
];
$('[data-amenities]').innerHTML = amenities.map(([icon, name, yes]) =>
  `<li class="${yes ? '' : 'no'}"><i class="bi ${yes ? icon : 'bi-x-lg'}" aria-hidden="true"></i>${name}<span class="visually-hidden">${yes ? ': есть' : ': нет'}</span></li>`
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
$('[data-terms]').innerHTML = terms.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('');

// Карта OpenStreetMap
const d = 0.006;
$('[data-map]').src = `https://www.openstreetmap.org/export/embed.html?bbox=${item.lng - d * 2},${item.lat - d},${item.lng + d * 2},${item.lat + d}&layer=mapnik&marker=${item.lat},${item.lng}`;

// Боковая панель
$('[data-price]').innerHTML = `${formatPrice(item.price)} <small>/ мес</small>`;
$('[data-price-note]').textContent = `Залог ${formatPrice(item.deposit)}, ${item.commission ? 'комиссия ' + formatPrice(item.commission) : 'без комиссии'}`;
$('[data-owner]').textContent = item.owner;
$('[data-owner-initials]').textContent = initials(item.owner);

// Похожие: тот же город, кроме текущего
$('[data-similar]').innerHTML = LISTINGS
  .filter(l => l.id !== item.id && l.city === item.city)
  .slice(0, 3)
  .map(l => `<div class="col-sm-6 col-lg-4">${listingCard(l)}</div>`).join('');

// Модальные окна
const today = new Date().toISOString().slice(0, 10);
$('#view-date').min = today;

bindValidation(document.getElementById('viewing-form'), () => {
  bootstrap.Modal.getInstance(document.getElementById('viewingModal')).hide();
  const date = new Date($('#view-date').value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  showToast(`Вы записаны на просмотр ${date} в ${$('#view-time').value}`);
});

document.querySelectorAll('[data-quick]').forEach(btn => {
  btn.addEventListener('click', () => {
    const area = $('#msg-text');
    area.value = (area.value ? area.value + ' ' : '') + btn.textContent;
    area.focus();
  });
});

bindValidation(document.getElementById('message-form'), () => {
  bootstrap.Modal.getInstance(document.getElementById('messageModal')).hide();
  showToast('Сообщение отправлено. Ответ придёт в раздел «Сообщения»');
  document.getElementById('message-form').reset();
  document.getElementById('message-form').classList.remove('was-validated');
});

document.getElementById('share-btn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    showToast('Ссылка скопирована');
  } catch (e) {
    showToast('Не получилось скопировать. Скопируйте адрес из строки браузера');
  }
});
