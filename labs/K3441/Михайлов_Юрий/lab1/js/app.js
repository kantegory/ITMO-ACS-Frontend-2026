const users = JSON.parse(localStorage.getItem('spbRentUsers') || '[]');

document.querySelector('#registerForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    users.push(data);
    localStorage.setItem('spbRentUsers', JSON.stringify(users));
    localStorage.setItem('spbRentUser', JSON.stringify(data));
    window.location.href = 'account.html';
});

document.querySelector('#loginForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const user = users.find((item) => item.email === data.email && item.password === data.password);
    if (!user) {
        alert('Проверьте email и пароль');
        return;
    }
    localStorage.setItem('spbRentUser', JSON.stringify(user));
    window.location.href = 'account.html';
});

document.querySelector('#filterForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const type = document.querySelector('#typeFilter').value;
    const location = document.querySelector('#locationFilter')?.value || '';
    const max = Number(document.querySelectorAll('#priceFilter')[1]?.value) || Infinity;
    document.querySelectorAll('.property-column').forEach((column) => {
        const card = column.querySelector('[data-type]');
        const locationMatches = !location || location === 'Любой район' || card.dataset.location === location;
        const visible = (!type || type === 'Любой тип' || card.dataset.type === type) && locationMatches && Number(card.dataset.price) <= max;
        column.classList.toggle('d-none', !visible);
    });
});

document.querySelector('#requestForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    localStorage.setItem('spbRentRequest', 'sent');
    bootstrap.Modal.getInstance(document.querySelector('#requestModal')).hide();
    document.querySelector('#requestResult').textContent = 'Заявка отправлена. Мы свяжемся с вами.';
});


document.querySelector('#messageForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.querySelector('#messageText');
    const text = input.value.trim();
    if (!text) return;
    const messages = JSON.parse(localStorage.getItem('spbRentMessages') || '[]');
    messages.push({recipient: 'Алексей Смирнов', text, date: new Date().toLocaleDateString('ru-RU')});
    localStorage.setItem('spbRentMessages', JSON.stringify(messages));
    input.value = '';
    renderMessages();
});

function renderMessages() {
    const list = document.querySelector('#messageList');
    if (!list) return;
    const messages = JSON.parse(localStorage.getItem('spbRentMessages') || '[]');
    messages.forEach((message) => {
        const item = document.createElement('div');
        item.className = 'list-group-item p-4';
        item.innerHTML = `<h2 class="h6 mb-1">${message.recipient}</h2><p class="mb-1">${message.text}</p><small class="text-muted">${message.date}</small>`;
        list.appendChild(item);
    });
}

renderMessages();

document.querySelector('#resetFilter')?.addEventListener('click', () => {
    document.querySelector('#filterForm').reset();
    document.querySelectorAll('.property-column').forEach((column) => column.classList.remove('d-none'));
});

document.querySelector('#sortFilter')?.addEventListener('change', (event) => {
    const list = document.querySelector('#filterForm').nextElementSibling;
    const cards = [...list.querySelectorAll('.property-column')];
    cards.sort((a, b) => {
        const first = Number(a.querySelector('[data-price]').dataset.price);
        const second = Number(b.querySelector('[data-price]').dataset.price);
        return event.target.value === 'cheap' ? first - second : event.target.value === 'expensive' ? second - first : 0;
    });
    cards.forEach((card) => list.appendChild(card));
});

for (const button of document.querySelectorAll('[data-toggle-password]')) {
    button.addEventListener('click', () => {
        const input = document.querySelector(button.dataset.togglePassword);
        input.type = input.type === 'password' ? 'text' : 'password';
        button.textContent = input.type === 'password' ? 'Показать' : 'Скрыть';
    });
}

