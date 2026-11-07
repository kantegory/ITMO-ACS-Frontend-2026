// Личный кабинет: данные пользователя, его аренда, объявления и настройки
import { api, requireAuth, updateStoredUser } from './api.js';
import {
  RENTAL_STATUSES, createBadge, formData, formatDate, formatPrice, hideAlert, propertyPhoto, showAlert,
} from './ui.js';
import './nav.js';

const element = (name) => document.getElementById(name);
const notice = element('notice');
const settingsForm = element('settingsForm');
const addForm = element('addForm');

function renderUser(user) {
  element('avatar').textContent = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  element('profileName').textContent = `${user.firstName} ${user.lastName}`;
  element('profileEmail').textContent = user.email;
  element('profilePhone').textContent = user.phone;
  element('userName').textContent = `${user.firstName} ${user.lastName}`;

  ['firstName', 'lastName', 'email', 'phone'].forEach((name) => {
    settingsForm[name].value = user[name] ?? '';
  });
  settingsForm.notify.checked = Boolean(user.notify);
}

function createRentalCard(rental) {
  const card = element('rentalTemplate').content.cloneNode(true);
  const field = (name) => card.querySelector(`[data-field="${name}"]`);
  const { property } = rental;
  const status = RENTAL_STATUSES[rental.status];

  Object.assign(field('photo'), propertyPhoto(property, 600));
  field('status').textContent = status.label;
  field('status').classList.add(status.badge);
  field('title').textContent = property.title;
  field('location').textContent = `${property.city}, ${property.district}`;
  field('period').textContent = `Договор: ${formatDate(rental.startDate)} — ${formatDate(rental.endDate)}`;
  field('price').textContent = `${formatPrice(rental.price)} / мес`;

  if (rental.status === 'active') {
    field('chat').href = `messages.html?property=${property.id}`;
    field('chat').setAttribute('aria-label', `Написать владельцу: ${property.title}`);
  } else {
    field('chat').remove();
  }

  return card;
}

async function loadRenting(user) {
  const rentals = await api(`/rentals?tenantId=${user.id}&status_ne=cancelled&_expand=property&_sort=startDate&_order=desc`);

  element('rentingList').replaceChildren(...rentals.map(createRentalCard));
  element('rentingEmpty').hidden = rentals.length > 0;
  element('rentingLoading').hidden = true;
}

function createOwnedRow(property, rental) {
  const row = document.createElement('tr');
  const status = rental
    ? createBadge('Сдаётся', 'text-bg-success')
    : createBadge('Свободен', 'text-bg-warning');
  const link = document.createElement('a');
  link.href = `property.html?id=${property.id}`;
  link.textContent = property.title;

  [link, formatPrice(property.price), status, rental?.tenantName ?? '—'].forEach((content) => {
    const cell = document.createElement('td');
    cell.append(content);
    row.append(cell);
  });

  return row;
}

async function loadOwning(user) {
  const [properties, rentals] = await Promise.all([
    api(`/properties?userId=${user.id}`),
    api(`/rentals?ownerId=${user.id}&status=active`),
  ]);

  element('owningList').replaceChildren(...properties.map((property) => (
    createOwnedRow(property, rentals.find((rental) => rental.propertyId === property.id))
  )));
  element('owningEmpty').hidden = properties.length > 0;
}

function handleSettings(user) {
  settingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert(notice);

    const { notify, ...fields } = formData(settingsForm);

    try {
      const updated = await api(`/users/${user.id}`, {
        method: 'PATCH',
        body: { ...fields, notify: Boolean(notify) },
      });
      const { password, ...publicFields } = updated;
      updateStoredUser(publicFields);
      renderUser(publicFields);
      showAlert(notice, 'Настройки сохранены.', 'success');
    } catch (requestError) {
      showAlert(notice, requestError.message);
    }
  });
}

function handleNewListing(user) {
  addForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert(notice);

    const modal = bootstrap.Modal.getInstance(element('addModal'));
    const fields = formData(addForm);
    const price = Number(fields.price);
    const area = Number(fields.area);

    try {
      await api('/properties', {
        method: 'POST',
        body: {
          ...fields,
          price,
          area,
          deposit: price,
          title: `${fields.type}, ${area} м²`,
          userId: user.id,
          ownerName: `${user.firstName} ${user.lastName}`,
          ownerSince: user.since,
          photos: [],
        },
      });
      await loadOwning(user);
      addForm.reset();
      modal.hide();
      bootstrap.Tab.getOrCreateInstance(element('owningTab')).show();
      showAlert(notice, 'Объявление опубликовано.', 'success');
    } catch (requestError) {
      modal.hide();
      showAlert(notice, requestError.message);
    }
  });
}

async function init(sessionUser) {
  handleSettings(sessionUser);
  handleNewListing(sessionUser);

  try {
    const user = await api(`/users/${sessionUser.id}`);
    renderUser(user);
    if (user.role === 'owner') bootstrap.Tab.getOrCreateInstance(element('owningTab')).show();
    await Promise.all([loadRenting(user), loadOwning(user)]);
  } catch (requestError) {
    element('rentingLoading').hidden = true;
    showAlert(notice, requestError.message);
  }
}

const sessionUser = requireAuth();
if (sessionUser) init(sessionUser);
