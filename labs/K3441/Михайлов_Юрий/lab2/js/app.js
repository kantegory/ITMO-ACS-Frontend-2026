document.querySelector('#requestViewingButton')?.addEventListener('click', (event) => {
    event.preventDefault();
    if (!localStorage.getItem('spbRentToken')) {
        const result = document.querySelector('#requestResult');
        result.textContent = 'Зарегистрируйтесь или войдите в аккаунт для записи на просмотр';
        result.classList.remove('text-success'); result.classList.add('text-danger'); return;
    }
    bootstrap.Modal.getOrCreateInstance(document.querySelector('#requestModal')).show();
});

document.querySelector('#requestForm')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const fields = [...event.target.querySelectorAll('input')];
    try {
        const user = JSON.parse(localStorage.getItem('spbRentUser') || '{}');
        await api('/requests', {method:'POST', body:JSON.stringify({name:fields[0].value, phone:fields[1].value, propertyId:document.querySelector('#requestViewingButton').dataset.propertyId || 1, userId:user.id})});
        bootstrap.Modal.getInstance(document.querySelector('#requestModal')).hide();
        document.querySelector('#requestResult').textContent = 'Заявка отправлена. Мы свяжемся с вами.';
    } catch { alert('Не удалось отправить заявку. Убедитесь, что вы авторизованы и сервер запущен.'); }
});
