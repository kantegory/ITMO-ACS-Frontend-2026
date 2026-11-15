// Сообщения и история сделок

const dialogs = [
  {
    id: 1, name: 'Наталья Ким', listingId: 3, unread: 1,
    messages: [
      { mine: true, text: 'Здравствуйте! Евродвушка у канала ещё свободна?', time: '12:04' },
      { mine: false, text: 'Добрый день! Да, свободна с 1 ноября.', time: '12:10' },
      { mine: true, text: 'Можно посмотреть в субботу днём?', time: '12:11' },
      { system: true, text: 'Просмотр назначен на 19 октября, 15:00' },
      { mine: false, text: 'Жду в субботу в 15:00. Код домофона пришлю утром.', time: '12:30' }
    ]
  },
  {
    id: 2, name: 'Ольга Смирнова', listingId: 1, unread: 1,
    messages: [
      { mine: false, text: 'Евгений, напоминаю, что в ноябре придут показания счётчиков.', time: 'вчера' },
      { mine: true, text: 'Хорошо, сфотографирую и пришлю 25-го.', time: 'вчера' },
      { mine: false, text: 'Спасибо! И мастер по батареям придёт во вторник после шести.', time: '09:15' }
    ]
  },
  {
    id: 3, name: 'Игорь Павлов', listingId: 9, unread: 0,
    messages: [
      { mine: true, text: 'Дом в Репино сдаётся только на год, или можно на полгода?', time: '14 окт' },
      { mine: false, text: 'Только от года, извините. Зимой дом не хочу оставлять пустым.', time: '14 окт' }
    ]
  },
  {
    id: 4, name: 'Артём Васильев', listingId: 2, unread: 0,
    messages: [
      { system: true, text: 'Сделка завершена, депозит 36 000 ₽ возвращён' },
      { mine: false, text: 'Спасибо, что следили за квартирой. Удачи на новом месте!', time: '31 мар' }
    ]
  }
];

const deals = [
  { no: 'К-2026-0412', listingId: 1, role: 'Арендатор', other: 'Ольга Смирнова', period: '01.04.2026 – 31.03.2027', price: 62000, status: 'active' },
  { no: 'К-2026-0977', listingId: 11, role: 'Владелец', other: 'Семья Гариповых', period: '01.07.2026 – 30.06.2027', price: 85000, status: 'active' },
  { no: 'К-2026-1105', listingId: 3, role: 'Владелец', other: 'Мария Лебедева', period: 'с 01.11.2026', price: 55000, status: 'wait' },
  { no: 'К-2025-0833', listingId: 2, role: 'Арендатор', other: 'Артём Васильев', period: '01.09.2025 – 31.03.2026', price: 36000, status: 'done' },
  { no: 'К-2025-0310', listingId: 12, role: 'Арендатор', other: 'Артём Васильев', period: '01.02.2025 – 31.08.2025', price: 22000, status: 'done' },
  { no: 'К-2025-0702', listingId: 6, role: 'Арендатор', other: 'Сергей Орлов', period: '–', price: 95000, status: 'cancel' }
];

const statusView = {
  active: ['status-ok', 'Действует'],
  wait: ['status-warn', 'Ждёт подписи'],
  done: ['status-off', 'Завершена'],
  cancel: ['status-danger', 'Отменена']
};

const byId = (id) => LISTINGS.find(l => l.id === id);
let currentDialog = dialogs[0];

function renderDialogs() {
  document.getElementById('dialogs').innerHTML = dialogs.map(d => {
    const last = d.messages[d.messages.length - 1];
    return `
      <button type="button" role="listitem" class="${d === currentDialog ? 'active' : ''}" data-dialog="${d.id}" ${d === currentDialog ? 'aria-current="true"' : ''}>
        <span class="avatar" aria-hidden="true">${initials(d.name)}</span>
        <span class="d-block min-w-0 flex-grow-1" style="min-width:0">
          <span class="d-flex gap-2"><span class="who">${d.name}</span><span class="when">${last.time || ''}</span></span>
          <span class="obj d-block text-truncate">${byId(d.listingId).title}</span>
          <span class="preview d-block">${last.mine ? 'Вы: ' : ''}${last.text}</span>
        </span>
        ${d.unread ? `<span class="badge-dot align-self-center">${d.unread}<span class="visually-hidden"> непрочитанное</span></span>` : ''}
      </button>`;
  }).join('');
  document.querySelectorAll('[data-dialog]').forEach(btn => btn.addEventListener('click', () => {
    currentDialog = dialogs.find(d => d.id === Number(btn.dataset.dialog));
    currentDialog.unread = 0;
    renderDialogs();
    renderFeed();
  }));
}

function renderFeed() {
  const d = currentDialog;
  const listing = byId(d.listingId);
  document.getElementById('chat-avatar').textContent = initials(d.name);
  document.getElementById('chat-name').textContent = d.name;
  const obj = document.getElementById('chat-object');
  obj.textContent = listing.title;
  obj.href = `property.html?id=${listing.id}`;
  document.getElementById('deal-price').value = listing.price;

  const feed = document.getElementById('feed');
  feed.innerHTML = d.messages.map(m => m.system
    ? `<div class="msg msg-system">${m.text}</div>`
    : `<div class="msg ${m.mine ? 'mine' : ''}">${m.text}<time>${m.time}</time></div>`
  ).join('');
  feed.scrollTop = feed.scrollHeight;
}

document.getElementById('chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  currentDialog.messages.push({ mine: true, text: text.replace(/</g, '&lt;'), time });
  input.value = '';
  renderDialogs();
  renderFeed();
});

function renderDeals() {
  const filter = document.querySelector('[name="deal-filter"]:checked').value;
  const rows = deals.filter(d => filter === 'all' || d.status === filter);
  document.getElementById('deals').innerHTML = rows.length ? rows.map(d => {
    const [cls, label] = statusView[d.status];
    const l = byId(d.listingId);
    return `<tr>
      <td class="ps-3 text-nowrap">${d.no}</td>
      <td><a href="property.html?id=${l.id}">${l.title}</a></td>
      <td>${d.role}</td>
      <td>${d.other}</td>
      <td class="text-nowrap">${d.period}</td>
      <td class="text-nowrap">${formatPrice(d.price)}</td>
      <td class="pe-3"><span class="status ${cls}">${label}</span></td>
    </tr>`;
  }).join('') : '<tr><td colspan="7" class="text-center text-muted-2 py-4">Сделок с таким статусом нет</td></tr>';
}
document.querySelectorAll('[name="deal-filter"]').forEach(r => r.addEventListener('change', renderDeals));

const dealForm = document.getElementById('deal-form');
bindValidation(dealForm, () => {
  bootstrap.Modal.getInstance(document.getElementById('dealModal')).hide();
  currentDialog.messages.push({ system: true, text: `Вы отправили договор на ${formatPrice(Number(document.getElementById('deal-price').value))} в месяц` });
  renderFeed();
  dealForm.classList.remove('was-validated');
  showToast('Договор отправлен на подпись');
});

if (location.hash === '#deals') bootstrap.Tab.getOrCreateInstance(document.getElementById('tab-deals')).show();

renderDialogs();
renderFeed();
renderDeals();
