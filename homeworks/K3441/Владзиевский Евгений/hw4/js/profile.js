// Личный кабинет

const user = currentUser() || { name: 'Евгений Владзиевский', email: 'demo@klyuchi.ru' };
document.querySelector('[data-user-name]').textContent = user.name;
document.querySelector('[data-user-email]').textContent = user.email;
document.querySelector('[data-user-initials]').textContent = initials(user.name);
document.getElementById('set-name').value = user.name;
document.getElementById('set-email').value = user.email;

// Открываем нужную вкладку по якорю: profile.html#favorites
const tabByHash = { '#landlord': 'tab-landlord', '#favorites': 'tab-favorites', '#settings': 'tab-settings' };
if (tabByHash[location.hash]) {
  bootstrap.Tab.getOrCreateInstance(document.getElementById(tabByHash[location.hash])).show();
}
document.querySelectorAll('.profile-tabs [data-bs-toggle="tab"]').forEach(btn => {
  btn.addEventListener('shown.bs.tab', () => {
    const hash = Object.keys(tabByHash).find(h => tabByHash[h] === btn.id) || '';
    history.replaceState(null, '', `profile.html${hash}`);
  });
});

// Избранное
function renderFavorites() {
  const favs = getFavorites();
  const items = LISTINGS.filter(l => favs.includes(l.id));
  const list = document.getElementById('fav-list');
  list.innerHTML = items.map(l => `<div class="col-sm-6 col-lg-4">${listingCard(l)}</div>`).join('');
  document.getElementById('fav-empty').classList.toggle('d-none', items.length > 0);
  document.querySelector('[data-fav-count]').textContent = items.length;
  bindFavoriteButtons(list);
}
renderFavorites();
document.addEventListener('favorites:change', renderFavorites);

// Кнопки-заглушки показывают уведомление
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-toast]');
  if (btn) showToast(btn.dataset.toast);
});

bindValidation(document.getElementById('settings-form'), () => {
  const updated = { ...user, name: document.getElementById('set-name').value.trim(), email: document.getElementById('set-email').value.trim() };
  storage.set('klyuchi:user', updated);
  renderHeaderAuth();
  document.querySelector('[data-user-name]').textContent = updated.name;
  document.querySelector('[data-user-initials]').textContent = initials(updated.name);
  showToast('Изменения сохранены');
});

const listingForm = document.getElementById('listing-form');
bindValidation(listingForm, () => {
  bootstrap.Modal.getInstance(document.getElementById('newListingModal')).hide();
  listingForm.reset();
  listingForm.classList.remove('was-validated');
  showToast('Объявление отправлено на проверку. Обычно это занимает пару часов');
});
