// Сообщения и сделки. Обе коллекции приватные: без токена сюда не попасть.

if (api.requireLogin()) init();

const statusView = {
  active: ['status-ok', 'Действует'],
  wait: ['status-warn', 'Ждёт подписи'],
  done: ['status-off', 'Завершена'],
  cancel: ['status-danger', 'Отменена']
};

let dialogs = [];
let deals = [];
let listingById = new Map();
let ownerById = new Map();
let currentDialog = null;

const partnerName = (d) => ownerById.get(d.partnerId)?.name || 'Собеседник';
const listingOf = (d) => listingById.get(d.listingId);

function renderDialogs() {
  document.getElementById('dialogs').innerHTML = dialogs.map(d => {
    const last = d.messages[d.messages.length - 1];
    const listing = listingOf(d);
    const mine = last && last.authorId === api.user.id;
    return `
      <li><button type="button" class="${d === currentDialog ? 'active' : ''}" data-dialog="${d.id}" ${d === currentDialog ? 'aria-current="true"' : ''}>
        <span class="avatar" aria-hidden="true">${initials(partnerName(d))}</span>
        <span class="d-block min-w-0 flex-grow-1" style="min-width:0">
          <span class="d-flex gap-2"><span class="who">${esc(partnerName(d))}</span><span class="when">${esc(last?.time || '')}</span></span>
          <span class="obj d-block text-truncate">${esc(listing ? listing.title : 'Объявление снято')}</span>
          <span class="preview d-block">${mine ? 'Вы: ' : ''}${esc(last?.text || '')}</span>
        </span>
        ${d.unread ? `<span class="badge-dot align-self-center">${d.unread}<span class="visually-hidden"> непрочитанное</span></span>` : ''}
      </button></li>`;
  }).join('');

  document.querySelectorAll('[data-dialog]').forEach(btn => btn.addEventListener('click', async () => {
    currentDialog = dialogs.find(d => d.id === Number(btn.dataset.dialog));
    renderFeed();
    // Открыли переписку — гасим счётчик и на сервере
    if (currentDialog.unread) {
      currentDialog.unread = 0;
      try { await api.update('/dialogs', currentDialog.id, { unread: 0 }); } catch (e) { /* не критично */ }
    }
    renderDialogs();
    renderUnreadBadge();
  }));
}

function renderFeed() {
  const d = currentDialog;
  if (!d) return;
  const listing = listingOf(d);
  document.getElementById('chat-avatar').textContent = initials(partnerName(d));
  document.getElementById('chat-name').textContent = partnerName(d);
  const obj = document.getElementById('chat-object');
  obj.textContent = listing ? listing.title : 'Объявление снято';
  obj.href = listing ? `property.html?id=${listing.id}` : '#';
  if (listing) document.getElementById('deal-price').value = listing.price;

  const feed = document.getElementById('feed');
  feed.innerHTML = d.messages.map(m => m.authorId === null
    ? `<div class="msg msg-system">${esc(m.text)}</div>`
    : `<div class="msg ${m.authorId === api.user.id ? 'mine' : ''}">${esc(m.text)}<time>${esc(m.time)}</time></div>`
  ).join('');
  feed.scrollTop = feed.scrollHeight;
}

function bindChatForm() {
  document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !currentDialog) return;
    input.disabled = true;
    try {
      const created = await api.create('/messages', {
        userId: api.user.id,
        dialogId: currentDialog.id,
        authorId: api.user.id,
        text,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      });
      currentDialog.messages.push(created);
      input.value = '';
      renderDialogs();
      renderFeed();
    } catch (err) {
      reportError(err, 'send-message');
    } finally {
      input.disabled = false;
      input.focus();
    }
  });
}

function renderUnreadBadge() {
  const unread = dialogs.reduce((sum, d) => sum + (d.unread || 0), 0);
  document.querySelectorAll('[data-unread]').forEach(el => {
    el.textContent = unread;
    el.closest('.badge-dot')?.classList.toggle('d-none', unread === 0);
  });
}

function renderDeals() {
  const filter = document.querySelector('[name="deal-filter"]:checked').value;
  const rows = deals.filter(d => filter === 'all' || d.status === filter);
  document.getElementById('deals').innerHTML = rows.length ? rows.map(d => {
    const [cls, label] = statusView[d.status] || ['status-info', d.status];
    const l = listingById.get(d.listingId);
    return `<tr>
      <td class="ps-3 text-nowrap">${esc(d.no)}</td>
      <td>${l ? `<a href="property.html?id=${l.id}">${esc(l.title)}</a>` : 'Объявление снято'}</td>
      <td>${esc(d.role)}</td>
      <td>${esc(d.other)}</td>
      <td class="text-nowrap">${esc(d.period)}</td>
      <td class="text-nowrap">${formatPrice(d.price)}</td>
      <td class="pe-3"><span class="status ${cls}">${label}</span></td>
    </tr>`;
  }).join('') : '<tr><td colspan="7" class="text-center text-muted-2 py-4">Сделок с таким статусом нет</td></tr>';
}

function bindDealForm() {
  document.querySelectorAll('[name="deal-filter"]').forEach(r => r.addEventListener('change', renderDeals));

  const dealForm = document.getElementById('deal-form');
  bindValidation(dealForm, () => withPending(dealForm, async () => {
    if (!currentDialog) return;
    const price = Number(document.getElementById('deal-price').value);
    try {
      // Системное сообщение в переписке: у него нет автора
      const created = await api.create('/messages', {
        userId: api.user.id,
        dialogId: currentDialog.id,
        authorId: null,
        text: `Отправлен договор на ${formatPrice(price)} в месяц, срок ${document.getElementById('deal-term').value}`,
        time: ''
      });
      currentDialog.messages.push(created);

      const listing = listingOf(currentDialog);
      const deal = await api.create('/deals', {
        userId: api.user.id,
        no: `К-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        listingId: currentDialog.listingId,
        role: listing && listing.userId === api.user.id ? 'Владелец' : 'Арендатор',
        other: partnerName(currentDialog),
        period: `с ${new Date(document.getElementById('deal-start').value).toLocaleDateString('ru-RU')}`,
        price,
        status: 'wait'
      });
      deals.unshift(deal);

      bootstrap.Modal.getInstance(document.getElementById('dealModal')).hide();
      dealForm.reset();
      dealForm.classList.remove('was-validated');
      renderFeed();
      renderDeals();
      showToast('Договор отправлен на подпись');
    } catch (e) {
      reportError(e, 'deal');
    }
  }));
}

async function init() {
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      // Переписки сразу с вложенными сообщениями: json-server умеет _embed
      const [loadedDialogs, loadedDeals, owners] = await Promise.all([
        api.getMine('/dialogs', { _embed: 'messages' }),
        api.getMine('/deals'),
        api.getList('/owners')
      ]);
      dialogs = loadedDialogs;
      deals = loadedDeals;
      owners.forEach(o => ownerById.set(o.id, o));

      // Объявления, которые упоминаются в переписках и сделках
      const ids = [...new Set([...dialogs.map(d => d.listingId), ...deals.map(d => d.listingId)])];
      const listings = await Promise.all(ids.map(id => api.getOne('/listings', id).catch(() => null)));
      listings.filter(Boolean).forEach(l => listingById.set(l.id, l));

      currentDialog = dialogs[0] || null;
      renderDialogs();
      renderFeed();
      renderDeals();
      bindChatForm();
      bindDealForm();

      renderUnreadBadge();

      if (location.hash === '#deals') bootstrap.Tab.getOrCreateInstance(document.getElementById('tab-deals')).show();
    } catch (e) {
      reportError(e, 'messages');
    }
  });
}
