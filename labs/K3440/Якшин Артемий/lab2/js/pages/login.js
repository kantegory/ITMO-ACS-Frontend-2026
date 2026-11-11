import { login } from '../api.js'
import { isLoggedIn, saveSession } from '../auth.js'
import { renderHeader } from '../ui.js'

renderHeader()

const form = document.getElementById('loginForm')
const errorBox = document.getElementById('formError')

// после входа возвращаемся туда, откуда пришли (только на страницы этого сайта)
function nextPage() {
  const next = new URLSearchParams(location.search).get('next')
  return next && next.startsWith('/') && !next.startsWith('//') ? next : 'profile.html'
}

if (isLoggedIn()) location.replace(nextPage())

const messages = {
  'Cannot find user': 'Пользователь с такой почтой не найден',
  'Incorrect password': 'Неверный пароль'
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  form.classList.add('was-validated')
  errorBox.classList.add('d-none')
  if (!form.checkValidity()) return

  const button = form.querySelector('[type="submit"]')
  button.disabled = true

  try {
    const session = await login(form.email.value.trim(), form.password.value)
    saveSession(session)
    location.href = nextPage()
  } catch (error) {
    errorBox.textContent = error instanceof TypeError
      ? 'Сервер не отвечает. Запустите API командой npm start.'
      : messages[error.message] ?? error.message
    errorBox.classList.remove('d-none')
  } finally {
    button.disabled = false
  }
})
