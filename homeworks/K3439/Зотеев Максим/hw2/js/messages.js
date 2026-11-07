// Диалоги, переписка и история сделок пользователя
import { api, requireAuth } from './api.js';
import { createBadge, formatDate, formatPrice, hideAlert, showAlert } from './ui.js';
import './nav.js';

const DEAL_STATUSES = {
  active: { label: 'Действует', badge: 'text-bg-success' },
  finished: { label: 'Завершена', badge: 'text-bg-secondary' },
  cancelled: { label: 'Отменена', badge: 'text-bg-danger' },
};

const element = (name) => document.getElementById(name);
const list = element('conversations');
const chat = element('chat');
const form = element('messageForm');
const input = element('messageText');
const error = element('error');

let currentConversation = null;

function interlocutor(conversation, user) {
  return conversation.ownerId === user.id ? conversation.tenantName : conversation.ownerName;
}

function appendMessage(message, user) {
  const bubble = document.createElement('div');
  const sender = document.createElement('span');
  const isMine = message.senderId === user.id;
  bubble.className = isMine
    ? 'message align-self-end bg-primary text-white rounded p-2'
    : 'message align-self-start bg-light border rounded p-2';
  // Отправителя на экране видно только по стороне и цвету, поэтому называем его текстом
  sender.className = 'visually-hidden';
  sender.textContent = isMine ? 'Вы: ' : `${interlocutor(currentConversation, user)}: `;
  bubble.append(sender, message.text);
  chat.append(bubble);
}

async function openConversation(conversation, user) {
  currentConversation = conversation;
  hideAlert(error);

  [...list.children].forEach((item) => {
    const isCurrent = Number(item.dataset.id) === conversation.id;
    item.classList.toggle('active', isCurrent);
    if (isCurrent) item.setAttribute('aria-current', 'true');
    else item.removeAttribute('aria-current');
  });

  element('chatName').textContent = interlocutor(conversation, user);
  element('chatCard').hidden = false;
  chat.replaceChildren();

  try {
    const messages = await api(`/messages?conversationId=${conversation.id}&_sort=id`);
    messages.forEach((message) => appendMessage(message, user));
    chat.scrollTop = chat.scrollHeight;
  } catch (requestError) {
    showAlert(error, requestError.message);
  }
}

function createConversationItem(conversation, user) {
  const item = document.createElement('button');
  const name = document.createElement('div');
  const title = document.createElement('small');

  item.type = 'button';
  item.className = 'list-group-item list-group-item-action';
  item.dataset.id = conversation.id;
  name.className = 'fw-bold';
  name.textContent = interlocutor(conversation, user);
  title.textContent = conversation.property.title;

  item.append(name, title);
  item.addEventListener('click', () => openConversation(conversation, user));
  return item;
}

// Пользователь бывает и арендатором, и владельцем, поэтому запрашиваем обе стороны
async function loadBothSides(resource, user) {
  const [asTenant, asOwner] = await Promise.all([
    api(`/${resource}?tenantId=${user.id}&_expand=property`),
    api(`/${resource}?ownerId=${user.id}&_expand=property`),
  ]);
  return [...asTenant, ...asOwner];
}

async function loadConversations(user) {
  const conversations = await loadBothSides('conversations', user);
  const propertyId = Number(new URLSearchParams(location.search).get('property'));

  list.replaceChildren(...conversations.map((conversation) => createConversationItem(conversation, user)));
  element('noConversations').hidden = conversations.length > 0;

  const selected = conversations.find((conversation) => conversation.propertyId === propertyId) ?? conversations[0];
  if (selected) await openConversation(selected, user);
}

function createDealRow(deal, user) {
  const row = document.createElement('tr');
  const status = DEAL_STATUSES[deal.status];
  const cells = [
    formatDate(deal.startDate),
    deal.property.title,
    deal.ownerId === user.id ? 'Владелец' : 'Арендатор',
    formatPrice(deal.price),
    createBadge(status.label, status.badge),
  ];

  cells.forEach((content) => {
    const cell = document.createElement('td');
    cell.append(content);
    row.append(cell);
  });

  return row;
}

async function loadDeals(user) {
  const deals = await loadBothSides('rentals', user);
  deals.sort((first, second) => second.startDate.localeCompare(first.startDate));

  element('deals').replaceChildren(...deals.map((deal) => createDealRow(deal, user)));
  element('noDeals').hidden = deals.length > 0;
}

function handleSending(user) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert(error);

    try {
      const message = await api('/messages', {
        method: 'POST',
        body: { conversationId: currentConversation.id, senderId: user.id, text: input.value },
      });
      appendMessage(message, user);
      input.value = '';
      chat.scrollTop = chat.scrollHeight;
    } catch (requestError) {
      showAlert(error, requestError.message);
    }
  });
}

async function init(user) {
  handleSending(user);

  try {
    await Promise.all([loadConversations(user), loadDeals(user)]);
  } catch (requestError) {
    showAlert(error, requestError.message);
  }
}

const user = requireAuth();
if (user) init(user);
