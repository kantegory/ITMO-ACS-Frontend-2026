import { nextTick, ref } from 'vue'

function withoutId(field, id) {
  return (field.getAttribute('aria-describedby') ?? '').split(' ').filter((item) => item && item !== id)
}

function setDescribedBy(field, ids) {
  if (ids.length) field.setAttribute('aria-describedby', ids.join(' '))
  else field.removeAttribute('aria-describedby')
}

// Bootstrap подсвечивает ошибки только цветом. Для скринридера помечаем поле aria-invalid
// и, пока ошибка видна, добавляем её текст (id из aria-errormessage) в aria-describedby
function syncValidity(form) {
  form.querySelectorAll('[aria-errormessage]').forEach((field) => {
    const controls = field.matches('fieldset') ? [...field.querySelectorAll('input')] : [field]
    const invalid = controls.some((control) => !control.validity.valid)
    const errorId = field.getAttribute('aria-errormessage')
    const describedBy = withoutId(field, errorId)
    if (invalid) describedBy.push(errorId)

    field.setAttribute('aria-invalid', String(invalid))
    setDescribedBy(field, describedBy)
  })
}

function clearValidity(form) {
  form.querySelectorAll('[aria-errormessage]').forEach((field) => {
    field.removeAttribute('aria-invalid')
    setDescribedBy(field, withoutId(field, field.getAttribute('aria-errormessage')))
  })
}

// Валидация формы средствами браузера (Constraint Validation API) + стили Bootstrap.
// handler вызывается только для валидной формы; пока он ждёт ответа API, кнопка отправки заблокирована,
// а ошибку API показываем в форме (formError)
export function useFormValidation(formRef) {
  const validated = ref(false)
  const submitting = ref(false)
  const formError = ref('')

  // После первой попытки отправки статус полей обновляется по мере ввода
  function resync() {
    if (validated.value) nextTick(() => syncValidity(formRef.value))
  }

  function onSubmit(handler) {
    return async () => {
      const form = formRef.value
      validated.value = true
      formError.value = ''
      await nextTick()
      syncValidity(form)

      if (!form.checkValidity()) {
        form.querySelector('input:invalid, select:invalid, textarea:invalid')?.focus()
        return
      }

      submitting.value = true
      try {
        await handler()
      } catch (error) {
        formError.value = error.message
      } finally {
        submitting.value = false
      }
    }
  }

  // Сброс подсветки ошибок (после успешной отправки или при повторном открытии модалки)
  function resetValidation() {
    validated.value = false
    formError.value = ''
    clearValidity(formRef.value)
  }

  return { validated, submitting, formError, resync, onSubmit, resetValidation }
}
