const loginForm = document.getElementById('loginForm')
const registerForm = document.getElementById('registerForm')
const formAlert = document.getElementById('formAlert')
const next = new URLSearchParams(location.search).get('next')

function showAlert(type, text) {
  formAlert.className = `alert alert-${type}`
  formAlert.textContent = text
  formAlert.focus()
}

function goNext() {
  location.href = next && /^[a-z]+\.html/.test(next) ? next : 'profile.html'
}

if (currentUser()) goNext()

async function submit(form, action) {
  const button = form.querySelector('button[type=submit]')
  button.disabled = true
  formAlert.className = 'alert d-none'
  try {
    await action()
    goNext()
  } catch (error) {
    showAlert('danger', error.message)
  } finally {
    button.disabled = false
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!validateForm(loginForm)) return

    submit(loginForm, async () => {
      const session = await api('/login', {
        method: 'POST',
        body: { email: loginForm.email.value.trim(), password: loginForm.password.value },
      })
      saveSession(session)
    })
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

    submit(registerForm, async () => {
      const name = registerForm.name.value.trim()
      const email = registerForm.email.value.trim()
      const session = await api('/register', {
        method: 'POST',
        body: { email, password: password.value, name },
      })
      saveSession(session)
      await api('/profiles', {
        method: 'POST',
        body: { id: session.user.id, userId: session.user.id, name, username: email.split('@')[0], city: '', bio: '' },
      })
    })
  })
}
