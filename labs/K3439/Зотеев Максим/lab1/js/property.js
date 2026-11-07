// Отправка форм из модальных окон на странице объекта
function handleModalForm(formId, modalId, message) {
  const form = document.getElementById(formId);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById(modalId)).hide();
    alert(message);
  });
}

handleModalForm('bookingForm', 'bookingModal', 'Вы записаны на просмотр! Владелец подтвердит время в сообщениях.');
handleModalForm('messageForm', 'messageModal', 'Сообщение отправлено владельцу.');
