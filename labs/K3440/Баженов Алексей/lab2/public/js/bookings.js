const STATUSES = {
  confirmed: ['success', 'Подтверждено'],
  pending: ['warning', 'Ожидает'],
  completed: ['secondary', 'Завершено'],
  cancelled: ['secondary', 'Отменено'],
};

const tbody = document.getElementById('bookingsBody');
const stateBox = document.getElementById('state');

function row(b) {
  const [color, label] = STATUSES[b.status] || ['secondary', b.status];
  const name = b.restaurant ? b.restaurant.name : 'Ресторан';
  return `<tr>
    <td><a href="restaurant.html?id=${b.restaurantId}">${esc(name)}</a></td>
    <td>${formatDate(b.date)}</td><td>${esc(b.time)}</td><td>${b.guests}</td>
    <td><span class="badge text-bg-${color}">${label}</span></td>
  </tr>`;
}

async function load() {
  try {
    const list = await api.get(`/bookings?userId=${Auth.user().id}&_expand=restaurant&_sort=date&_order=desc`);
    tbody.innerHTML = list.map(row).join('');
    stateBox.textContent = list.length ? '' : 'У вас пока нет бронирований.';
  } catch (e) {
    if (e.status === 401) { requireAuth(); return; }
    stateBox.textContent = e.message;
    stateBox.classList.replace('text-muted', 'text-danger');
  }
}

if (requireAuth()) load();
