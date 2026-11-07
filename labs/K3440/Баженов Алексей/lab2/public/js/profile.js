const nextBox = document.getElementById('nextBooking');

async function load() {
  const user = Auth.user();
  document.getElementById('pName').textContent = user.name || '—';
  document.getElementById('pEmail').textContent = user.email;

  try {
    const today = new Date().toISOString().slice(0, 10);
    const list = await api.get(`/bookings?userId=${user.id}&_expand=restaurant&_sort=date,time&_order=asc,asc`);
    const next = list.find((b) => b.date >= today && b.status !== 'cancelled' && b.status !== 'completed');
    if (!next) {
      nextBox.innerHTML = '<p class="text-muted">Предстоящих бронирований нет.</p>';
      return;
    }
    nextBox.innerHTML = `
      <p class="mb-1"><a href="restaurant.html?id=${next.restaurantId}">${esc(next.restaurant ? next.restaurant.name : 'Ресторан')}</a></p>
      <p class="text-muted">${formatDate(next.date)}, ${esc(next.time)} · ${next.guests} ${plural(next.guests, 'гость', 'гостя', 'гостей')}</p>`;
  } catch (e) {
    if (e.status === 401) { requireAuth(); return; }
    nextBox.innerHTML = `<p class="text-danger">${esc(e.message)}</p>`;
  }
}

if (requireAuth()) load();
