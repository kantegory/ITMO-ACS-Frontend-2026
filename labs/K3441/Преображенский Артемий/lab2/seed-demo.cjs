"use strict";

// Демоданные только для локальной проверки. Скрипт запускается отдельно: npm run demo.
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:8766";
const account = {
  email: "student@example.com",
  password: "Lab2-demo-2026",
  full_name: "Преображенский Артемий",
  phone: "+79990000000",
};
const restaurants = [
  {
    name: "BaT",
    city: "Санкт-Петербург",
    address: "Литейный проспект, 28",
    cuisine_type: "european",
    price_category: "medium",
    description: "Мягкий свет и тихий двор за окном. Здесь удобно встретиться за ужином.",
    photos: ["images/window.jpg", "images/hall.jpg", "images/alcove.jpg"],
    menu: [
      { name: "Салат с печеной свеклой", description: "Мягкий сыр, зелень и ореховая заправка", category: "Закуски", price: 520 },
      { name: "Курица с овощами", description: "Запеченная курица, сезонные овощи и сливочный соус", category: "Горячее", price: 790 },
    ],
  },
  {
    name: "BaT на Петроградской",
    city: "Санкт-Петербург",
    address: "Большой проспект П.С., 42",
    cuisine_type: "italian",
    price_category: "high",
    description: "Итальянская кухня и большой стол для друзей в центре города.",
    photos: ["images/hall.jpg", "images/alcove.jpg", "images/window.jpg"],
    menu: [
      { name: "Буррата с томатами", description: "Базилик и оливковое масло", category: "Закуски", price: 890 },
      { name: "Паста с грибами", description: "Сливочный соус, пармезан и свежая зелень", category: "Горячее", price: 980 },
    ],
  },
  {
    name: "BaT в Москве",
    city: "Москва",
    address: "Покровка, 18",
    cuisine_type: "georgian",
    price_category: "low",
    description: "Небольшой зал, грузинская кухня и неспешные разговоры за общим столом.",
    photos: ["images/alcove.jpg", "images/window.jpg", "images/hall.jpg"],
    menu: [
      { name: "Пхали из шпината", description: "Грецкий орех, специи и зерна граната", category: "Закуски", price: 320 },
      { name: "Хачапури по-аджарски", description: "Горячая лодочка с сыром и яйцом", category: "Горячее", price: 490 },
    ],
  },
];
let token;

async function request(path, method = "GET", body) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${baseUrl}/api${path}`, {
    method, headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    const error = new Error(`${method} ${path}: HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function main() {
  if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(baseUrl).hostname)) {
    throw new Error("Демоданные можно добавлять только в локальный API.");
  }
  let session;
  try {
    session = await request("/auth/register", "POST", account);
  } catch (error) {
    if (error.status !== 409) throw error;
    session = await request("/auth/login", "POST", account);
  }
  token = session.token;
  const catalog = await request("/restaurants/");
  if (catalog.restaurants?.length) {
    console.log("Данные уже существуют. Каталог оставлен без изменений.");
    return;
  }
  for (const item of restaurants) {
    const { menu, ...restaurant } = item;
    const created = await request("/restaurants/", "POST", restaurant);
    const route = `/restaurants/${created.restaurant.id}`;
    for (const [index, seats] of [2, 4, 4].entries()) {
      await request(`${route}/tables`, "POST", { table_number: index + 1, seats_count: seats });
    }
    for (const dish of menu) {
      await request(`${route}/menu`, "POST", { ...dish, is_available: true });
    }
  }
  console.log("Добавлены 3 ресторана, 9 столиков и 6 блюд. Брони и отзывы не создавались.");
}

main().catch((error) => {
  console.error(`Не удалось добавить демоданные: ${error.message}`);
  process.exitCode = 1;
});
