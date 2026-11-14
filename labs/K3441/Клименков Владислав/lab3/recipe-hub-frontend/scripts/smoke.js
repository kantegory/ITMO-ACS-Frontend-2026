/**
 * scripts/smoke.js — быстрая проверка мокового API.
 *
 * Запуск: npm run smoke (сервер должен быть запущен через npm run api).
 * Проверяет чтение, авторизацию, разграничение прав и CRUD рецепта.
 */

const BASE = process.env.API_URL || 'http://localhost:3000';

const results = [];

function check(name, passed, details = '') {
  results.push({ name, passed, details });
  const mark = passed ? 'OK  ' : 'FAIL';
  console.log(`${mark} ${name}${details ? ` — ${details}` : ''}`);
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, options);
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return { response, data };
}

async function main() {
  try {
    await fetch(`${BASE}/recipes`);
  } catch {
    console.error(
      `Не удалось подключиться к ${BASE}. Сначала запустите npm run api.`,
    );
    process.exit(1);
  }

  let { response, data } = await request('/recipes');
  check(
    'GET /recipes',
    response.ok && Array.isArray(data) && data.length > 0,
    `${Array.isArray(data) ? data.length : 0} рецептов`,
  );

  ({ response, data } = await request('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@recipehub.ru',
      password: 'demo1234',
    }),
  }));

  const token = data && data.accessToken;
  check('POST /login', response.ok && Boolean(token), `HTTP ${response.status}`);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  ({ response, data } = await request('/users/1'));
  check(
    'GET /users/1 не отдаёт password',
    response.ok && data && !('password' in data),
    `HTTP ${response.status}`,
  );

  ({ response } = await request('/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Без токена', userId: 1 }),
  }));
  check(
    'POST /recipes без токена → 401',
    response.status === 401,
    `HTTP ${response.status}`,
  );

  ({ response } = await request('/recipes', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Чужой рецепт', userId: 2 }),
  }));
  check(
    'POST /recipes с чужим userId → 403',
    response.status === 403,
    `HTTP ${response.status}`,
  );

  const recipe = {
    title: 'Smoke-тест',
    userId: 1,
    dishType: 'Супы',
    difficulty: 'Низкая',
    timeMinutes: 5,
    servings: 1,
    description: 'Временный рецепт для проверки API.',
    ingredients: ['вода'],
    steps: ['Шаг'],
    image: 'assets/img/recipe-placeholder.svg',
    likes: 0,
    videoUrl: '',
    createdAt: new Date().toISOString(),
  };

  ({ response, data } = await request('/recipes', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(recipe),
  }));
  check(
    'POST /recipes со своим userId → 201',
    response.status === 201 && Boolean(data && data.id),
    `HTTP ${response.status}`,
  );

  const createdId = data && data.id;

  if (createdId) {
    ({ response } = await request(`/recipes/${createdId}`, {
      method: 'DELETE',
      headers: authHeaders,
    }));
    check(
      'DELETE своего рецепта → 200',
      response.ok,
      `HTTP ${response.status}`,
    );
  }

  ({ response, data } = await request(
    `/recipes?dishType=${encodeURIComponent('Супы')}`,
  ));
  check(
    'Фильтр dishType=Супы',
    response.ok &&
      Array.isArray(data) &&
      data.length > 0 &&
      data.every((item) => item.dishType === 'Супы'),
    `${Array.isArray(data) ? data.length : 0} рецептов`,
  );

  ({ response, data } = await request(
    `/recipes?timeMinutes_lte=20&_sort=timeMinutes&_order=asc`,
  ));
  check(
    'Фильтр по времени и сортировка',
    response.ok &&
      Array.isArray(data) &&
      data.every((item) => item.timeMinutes <= 20),
    `${Array.isArray(data) ? data.length : 0} рецептов`,
  );

  const failed = results.filter((item) => !item.passed);

  console.log(
    `\nИтого: ${results.length - failed.length}/${results.length} проверок пройдено.`,
  );

  if (failed.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Smoke-тест упал:', error);
  process.exit(1);
});
