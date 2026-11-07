const loginForm = document.getElementById('loginForm')
const registerForm = document.getElementById('registerForm')
const formAlert = document.getElementById('formAlert')

function showAlert(type, text) {
  formAlert.className = `alert alert-${type}`
  formAlert.textContent = text
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!validateForm(loginForm)) return

    showAlert('success', 'Форма заполнена верно. Переходим в личный кабинет...')
    setTimeout(() => (location.href = 'profile.html'), 1000)
  })
}

if (registerForm) {
  const password = registerForm.password
  const repeat = registerForm.passwordRepeat

  function checkRepeat() {
    repeat.setCustomValidity(repeat.value === password.value ? '' : 'mismatch')
  }

  password.addEventListener('input', checkRepeat)
  repeat.addEventListener('input', checkRepeat)

  registerForm.addEventListener('submit', (event) => {
    event.preventDefault()
    checkRepeat()
    if (!validateForm(registerForm)) return

    showAlert('success', 'Аккаунт создан. Переходим в личный кабинет...')
    setTimeout(() => (location.href = 'profile.html'), 1000)
  })
}
