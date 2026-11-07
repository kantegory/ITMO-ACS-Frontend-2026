import { ref } from 'vue'

const TEXT_FIELDS = 'input[type=text], input[type=password], textarea'

function checkBlank(field) {
  if (field.dataset.noTrim !== undefined) return
  const value = field.type === 'password' ? field.value : field.value.trim()
  const blank = field.required && !field.value.trim()
  field.setCustomValidity(blank || value.length < field.minLength ? 'empty' : '')
}

export function useFormValidation(formRef) {
  const validated = ref(false)

  function onInput(event) {
    if (event.target.matches(TEXT_FIELDS)) checkBlank(event.target)
  }

  function validate() {
    const form = formRef.value
    form.querySelectorAll(TEXT_FIELDS).forEach(checkBlank)
    validated.value = true
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      field.setAttribute('aria-invalid', String(!field.checkValidity()))
    })
    const valid = form.checkValidity()
    if (!valid) form.querySelector(':invalid').focus()
    return valid
  }

  function resetValidation() {
    validated.value = false
    formRef.value
      ?.querySelectorAll('[aria-invalid]')
      .forEach((field) => field.removeAttribute('aria-invalid'))
  }

  return { validated, validate, resetValidation, onInput }
}
