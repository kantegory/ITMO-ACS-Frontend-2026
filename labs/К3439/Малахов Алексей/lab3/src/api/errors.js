const MESSAGES = {
  'Incorrect password': 'Неверный email или пароль',
  'Cannot find user': 'Неверный email или пароль',
  'Email already exists': 'Пользователь с таким email уже зарегистрирован',
  'Email format is invalid': 'Некорректный email',
  'Password is too short': 'Пароль слишком короткий',
  'jwt expired': 'Сессия истекла, войдите снова',
  'Already exists': 'Уже добавлено',
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function toApiError(error) {
  if (!error.response) {
    return new ApiError(0, 'Сервер недоступен. Запустите API командой npm run api.')
  }
  const { status, data } = error.response
  const text = typeof data === 'string' ? data : ''
  if (status === 401 && !MESSAGES[text])
    return new ApiError(401, 'Сессия истекла, войдите снова')
  return new ApiError(status, MESSAGES[text] || `Ошибка сервера (${status})`)
}
