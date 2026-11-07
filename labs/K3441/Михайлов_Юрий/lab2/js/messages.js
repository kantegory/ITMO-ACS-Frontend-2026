function currentUser() { try { return JSON.parse(localStorage.getItem('spbRentUser') || '{}'); } catch { return {}; } }

async function loadMessageHistory() {
    const list = document.querySelector('#messageList');
    if (!list) return;
    try {
        const messages = await api(`/messages?userId=${currentUser().id}&_sort=id&_order=asc`);
        list.innerHTML = '';
        messages.forEach((message) => {
            const item = document.createElement('div'); item.className = 'list-group-item p-4';
            const title = document.createElement('h3'); title.className = 'h6'; title.textContent = message.recipient;
            const body = document.createElement('p'); body.className = 'mb-1'; body.textContent = message.text;
            const date = document.createElement('small'); date.className = 'text-muted'; date.textContent = message.date;
            item.append(title, body, date); list.appendChild(item);
        });
    } catch (error) { console.error('Не удалось загрузить сообщения', error); }
}

document.querySelector('#messageForm')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const input = document.querySelector('#messageText'); const text = input.value.trim(); if (!text) return;
    try {
        await api('/messages', {method:'POST', body:JSON.stringify({recipient:'Алексей Смирнов', text, date:new Date().toLocaleDateString('ru-RU'), userId:currentUser().id})});
        input.value = ''; loadMessageHistory();
    } catch { alert('Войдите в аккаунт и запустите JSON Server'); }
});

async function loadTransactionChat() {
    const box = document.querySelector('#transactionMessages'); if (!box) return;
    try {
        const messages = await api(`/messages?userId=${currentUser().id}&propertyId=${new URLSearchParams(location.search).get('id') || 1}&_sort=id&_order=asc`);
        box.innerHTML = '';
        messages.forEach((message) => { const item = document.createElement('div'); item.className = `chat-message${message.own ? ' chat-message-own' : ''}`; item.textContent = message.text; box.appendChild(item); });
    } catch (error) { console.error('Не удалось загрузить переписку', error); }
}

document.querySelector('#transactionMessageForm')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const input = document.querySelector('#transactionMessageText'); const user = currentUser();
    try {
        await api('/messages', {method:'POST', body:JSON.stringify({recipient:'Алексей Смирнов', text:input.value.trim(), date:new Date().toLocaleDateString('ru-RU'), userId:user.id, propertyId:new URLSearchParams(location.search).get('id') || 1, own:true})});
        input.value = ''; loadTransactionChat();
    } catch { alert('Войдите в аккаунт для отправки сообщения'); }
});

loadMessageHistory(); loadTransactionChat();
