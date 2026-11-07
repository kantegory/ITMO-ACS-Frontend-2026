// Страница объекта: данные из API, запись на просмотр и сообщение владельцу
import { api, getUser } from './api.js';
import { formData, formatDate, formatPrice, propertyPhoto, showAlert } from './ui.js';
import './nav.js';

const user = getUser();
const id = new URLSearchParams(location.search).get('id');
const element = (name) => document.getElementById(name);

function yesNo(value) {
  return value ? 'да' : 'нет';
}

function hasValue([, value]) {
  return value !== undefined && value !== null && value !== '';
}

function renderPhotos(property) {
  const photos = property.photos.length ? property.photos : [{}];

  const slides = photos.map((photo, index) => {
    const slide = document.createElement('div');
    slide.className = `carousel-item${index === 0 ? ' active' : ''}`;

    const image = document.createElement('img');
    image.className = 'd-block w-100 property-photo';
    Object.assign(image, photo.url
      ? { src: `${photo.url}?w=1200`, alt: photo.alt }
      : propertyPhoto(property, 1200));

    slide.append(image);
    return slide;
  });

  element('slides').replaceChildren(...slides);
  document.querySelectorAll('#photos > button').forEach((button) => {
    button.hidden = photos.length < 2;
  });
}

function renderTerms(property) {
  const rows = [
    ['Стоимость', `${formatPrice(property.price)} в месяц`],
    ['Залог', formatPrice(property.deposit)],
    ['Коммунальные услуги', property.utilities],
    ['Минимальный срок', property.minTerm],
    ['Можно с детьми', property.kids === undefined ? undefined : yesNo(property.kids)],
    ['Можно с животными', property.pets === undefined ? undefined : yesNo(property.pets)],
  ].filter(hasValue);

  element('terms').replaceChildren(...rows.map(([name, value]) => {
    const row = document.createElement('tr');
    const header = document.createElement('th');
    const cell = document.createElement('td');
    header.scope = 'row';
    header.textContent = name;
    cell.textContent = value;
    row.append(header, cell);
    return row;
  }));
}

function renderFeatures(property) {
  const items = [
    ['Комнат', property.rooms],
    ['Общая площадь', property.area && `${property.area} м²`],
    ['Этаж', property.floor && `${property.floor} из ${property.floors}`],
    ['Мебель и бытовая техника', property.furniture === undefined ? undefined : yesNo(property.furniture)],
    ['Балкон', property.balcony === undefined ? undefined : yesNo(property.balcony)],
  ].filter(hasValue);

  element('features').replaceChildren(...items.map(([name, value]) => {
    const item = document.createElement('li');
    item.textContent = `${name}: ${value}`;
    return item;
  }));
}

function renderActions(property) {
  const isOwner = user?.id === property.userId;

  element('contactActions').hidden = !user || isOwner;
  element('ownListing').hidden = !isOwner;
  element('loginLink').hidden = Boolean(user);
  element('loginLink').href = `login.html?next=${encodeURIComponent(`property.html?id=${property.id}`)}`;
}

function renderProperty(property) {
  document.title = `${property.title} — Аренда жилья`;
  element('crumb').textContent = property.title;
  element('title').textContent = property.title;
  element('address').textContent = [property.city, property.district, property.address].filter(Boolean).join(', ');
  element('description').textContent = property.description;
  element('price').textContent = formatPrice(property.price);
  element('ownerName').textContent = property.ownerName;
  element('ownerSince').textContent = `Собственник, на сайте с ${property.ownerSince} года`;

  renderPhotos(property);
  renderTerms(property);
  renderFeatures(property);
  renderActions(property);
}

// Переписка по объекту одна: открываем существующую или создаём новую
async function findConversation(property) {
  const [conversation] = await api(`/conversations?propertyId=${property.id}&tenantId=${user.id}`);
  if (conversation) return conversation;

  return api('/conversations', {
    method: 'POST',
    body: {
      propertyId: property.id,
      tenantId: user.id,
      tenantName: `${user.firstName} ${user.lastName}`,
      ownerId: property.userId,
      ownerName: property.ownerName,
    },
  });
}

async function sendToOwner(property, text) {
  const conversation = await findConversation(property);

  await api('/messages', {
    method: 'POST',
    body: { conversationId: conversation.id, senderId: user.id, text },
  });
}

async function bookViewing(property, { date, time }) {
  await api('/viewings', {
    method: 'POST',
    body: { propertyId: property.id, userId: user.id, date, time },
  });
  await sendToOwner(property, `Хочу посмотреть объект ${formatDate(date)} в ${time}.`);
}

function handleModalForm(formId, modalId, successText, submit) {
  const form = element(formId);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const notice = element('notice');

    try {
      await submit(formData(form));
      showAlert(notice, successText, 'success');
    } catch (requestError) {
      showAlert(notice, requestError.message);
    }

    bootstrap.Modal.getInstance(element(modalId)).hide();
  });
}

async function init() {
  try {
    if (!id) throw new Error('Объявление не выбрано');

    const property = await api(`/properties/${encodeURIComponent(id)}`);
    renderProperty(property);
    element('content').hidden = false;

    element('date').min = new Date().toISOString().slice(0, 10);

    handleModalForm('bookingForm', 'bookingModal',
      'Вы записаны на просмотр! Владелец подтвердит время в сообщениях.',
      (fields) => bookViewing(property, fields));
    handleModalForm('messageForm', 'messageModal',
      'Сообщение отправлено владельцу.',
      ({ text }) => sendToOwner(property, text));
  } catch (requestError) {
    const text = requestError.status === 404 ? 'Объявление не найдено' : requestError.message;
    showAlert(element('error'), text);
  } finally {
    element('loading').hidden = true;
  }
}

init();
