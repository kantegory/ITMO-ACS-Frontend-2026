// Главная: шесть самых свежих объявлений с сервера.
// Сортировка и ограничение — на стороне json-server (_sort, _order, _limit).

(async function loadFresh() {
  const box = document.getElementById('fresh-list');
  box.innerHTML = skeletonCards(6);
  try {
    const fresh = await api.getList('/listings', { _sort: 'posted', _order: 'desc', _limit: 6 });
    box.innerHTML = fresh.map(item => `<div class="col-sm-6 col-lg-4">${listingCard(item)}</div>`).join('');
    bindFavoriteButtons(box);
  } catch (e) {
    box.innerHTML = `<div class="col-12"><div class="empty-state">
      <h3 class="fs-5">Объявления не загрузились</h3>
      <p class="text-muted-2 mb-0">${esc(e.message)}</p>
    </div></div>`;
  }
})();
