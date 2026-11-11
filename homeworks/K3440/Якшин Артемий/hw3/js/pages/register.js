import { register } from '../api.js'
import { isLoggedIn, saveSession } from '../auth.js'
import { renderHeader } from '../ui.js'

renderHeader()

if (isLoggedIn()) location.replace('profile.html')

const form = document.getElementById('registerForm')
const errorBox = document.getElementById('formError')
// все цвета дают контраст не меньше 4.5:1 с белыми инициалами
const colors = ['#b84a24', '#5e6b3f', '#946616', '#3f5e6b', '#8a4f7d', '#4f6b8a']

const messages = {
  'Email already exists': 'Пользователь с такой почтой уже зарегистрирован',
  'Password is too short': 'Пароль слишком короткий'
}

// пароли должны совпадать: проверяем при каждом вводе
form.addEventListener('input', () => {
  const repeat = form.password2
  repeat.setCustomValidity(repeat.value === form.password.value ? '' : 'mismatch')
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  form.classList.add('was-validated')
  errorBox.classList.add('d-none')
  if (!form.checkValidity()) return

  const button = form.querySelector('[type="submit"]')
  button.disabled = true

  try {
    const session = await register({
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
      city: '',
      bio: '',
      avatarColor: colors[Math.floor(Math.random() * colors.length)]
    })
    saveSession(session)
    location.href = 'profile.html'
  } catch (error) {
    errorBox.textContent = error instanceof TypeError
      ? 'Сервер не отвечает. Запустите API командой npm start.'
      : messages[error.message] ?? error.message
    errorBox.classList.remove('d-none')
  } finally {
    button.disabled = false
  }
})
