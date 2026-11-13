// Доступность форм: связь сообщений об ошибках с полями, aria-invalid и фокус на первом ошибочном поле
(function () {
  'use strict';

  // 1. .invalid-feedback -> aria-describedby у соответствующего поля
  function linkFeedback() {
    document.querySelectorAll('.invalid-feedback').forEach(function (feedback) {
      const control = feedback.parentElement && feedback.parentElement
        .querySelector('.form-control, .form-select, .form-check-input');
      if (!control || !control.id) return;
      if (!feedback.id) feedback.id = control.id + '-error';
      const ids = (control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      if (ids.indexOf(feedback.id) === -1) {
        ids.push(feedback.id);
        control.setAttribute('aria-describedby', ids.join(' '));
      }
    });
  }

  // 2. aria-invalid выставляется при проверке формы и снимается, когда поле исправлено
  let submitting = false;
  document.addEventListener('submit', function () {
    submitting = true;
    setTimeout(function () { submitting = false; }, 0);
  }, true);

  document.addEventListener('invalid', function (event) {
    const field = event.target;
    field.setAttribute('aria-invalid', 'true');
    // фокус — на первое ошибочное поле при отправке формы
    if (submitting) {
      submitting = false;
      field.focus();
    }
  }, true);

  function refresh(event) {
    const field = event.target;
    if (field.hasAttribute && field.hasAttribute('aria-invalid') && field.checkValidity()) {
      field.removeAttribute('aria-invalid');
    }
  }
  document.addEventListener('input', refresh, true);
  document.addEventListener('change', refresh, true);

  document.addEventListener('DOMContentLoaded', linkFeedback);
})();
