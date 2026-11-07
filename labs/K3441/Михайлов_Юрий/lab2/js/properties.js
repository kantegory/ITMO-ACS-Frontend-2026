const money = (price) => `${Number(price).toLocaleString('ru-RU')} ₽`;

function propertyCard(property, compact = false) {
    const wrapper = document.createElement(compact ? 'article' : 'div');
    wrapper.className = compact ? 'col-md-4' : 'property-column col-md-6 col-lg-4';
    wrapper.innerHTML = `<article class="property-card" data-type="${property.type}" data-location="${property.location}" data-price="${property.price}">
        <div class="property-image"><svg class="property-svg-image" viewBox="0 0 100 100" role="img" aria-label="Изображение: ${property.title}" preserveAspectRatio="xMidYMid slice"><image href="${property.image}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/></svg><span class="badge badge-soft property-image-badge">${property.type}</span></div>
        <div class="p-4"><h2 class="h5">${property.title}</h2><p class="text-muted small">${property.location} район</p>
        <strong>${money(property.price)} <small class="text-muted fw-normal">/ месяц</small></strong>
        <a class="btn btn-outline-primary btn-sm float-end" href="property.html?id=${property.id}">Подробнее</a></div></article>`;
    return wrapper;
}

async function loadProperties() {
    try {
        const properties = await api('/properties');
        const catalog = document.querySelector('#propertyCatalog');
        if (catalog) { catalog.innerHTML = ''; properties.forEach((property) => catalog.appendChild(propertyCard(property))); }
        const homeCatalog = document.querySelector('#homePropertyCatalog');
        if (homeCatalog) { homeCatalog.innerHTML = ''; properties.forEach((property) => homeCatalog.appendChild(propertyCard(property, true))); }
        const id = new URLSearchParams(location.search).get('id') || '1';
        if (id && document.querySelector('#propertyDetails')) {
            const property = properties.find((item) => String(item.id) === id);
            if (property) {
                const root = document.querySelector('#propertyDetails');
                root.querySelector('[data-property-image]').innerHTML = `<svg class="property-svg-image" viewBox="0 0 100 100" role="img" aria-label="Изображение: ${property.title}" preserveAspectRatio="xMidYMid slice"><image href="${property.image}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/></svg>`;
                root.querySelector('[data-property-title]').textContent = property.title;
                root.querySelector('[data-property-label]').textContent = `${property.type.toUpperCase()} · ${property.location.toUpperCase()} РАЙОН`;
                root.querySelector('[data-property-price]').textContent = `${money(property.price)} / месяц`;
                root.querySelector('[data-property-meta]').textContent = property.meta;
                root.querySelector('[data-property-description]').textContent = property.description;
                document.querySelector('#requestViewingButton').dataset.propertyId = property.id;
            }
        }
    } catch (error) { console.error('Не удалось загрузить объекты', error); }
}

document.querySelector('#filterForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const type = document.querySelector('#typeFilter').value, locationFilter = document.querySelector('#locationFilter').value;
    const min = Number(document.querySelector('#minPrice').value) || 0; const max = Number(document.querySelector('#maxPrice').value) || Infinity;
    document.querySelectorAll('.property-column').forEach((column) => {
        const card = column.querySelector('[data-type]');
        column.classList.toggle('d-none', !((type === 'Любой тип' || card.dataset.type === type) && (locationFilter === 'Любой район' || card.dataset.location === locationFilter) && Number(card.dataset.price) >= min && Number(card.dataset.price) <= max));
    });
});
document.querySelector('#resetFilter')?.addEventListener('click', () => { document.querySelector('#filterForm').reset(); document.querySelectorAll('.property-column').forEach((item) => item.classList.remove('d-none')); });
document.querySelector('#sortFilter')?.addEventListener('change', (event) => {
    const list = document.querySelector('#propertyCatalog');
    [...list.children].sort((a, b) => {
        const x = Number(a.querySelector('[data-price]').dataset.price), y = Number(b.querySelector('[data-price]').dataset.price);
        return event.target.value === 'cheap' ? x-y : event.target.value === 'expensive' ? y-x : 0;
    }).forEach((item) => list.appendChild(item));
});
loadProperties();
