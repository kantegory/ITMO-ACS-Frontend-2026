export const restaurants = [
  {
    id: 1, name: 'Берёза', cuisine: 'Современная русская', district: 'Петроградский', address: 'Кронверкский пр., 35',
    price: 2600, rating: 4.9, reviewCount: 128, image: 'birch.jpg', imageAlt: 'Зал ресторана с деревянными столами и тёплым светом',
    summary: 'Сезонные продукты, открытая кухня и уютный зал на Петроградской стороне.',
    hours: '12:00–23:00', menu: [{ name: 'Грибные щи', price: 580 }, { name: 'Утиная грудка с брусникой', price: 1190 }, { name: 'Медовик с цветочным мёдом', price: 420 }],
    reviews: [{ author: 'Мария', text: 'Ужинали у окна. Очень понравилась утка с брусникой.', rating: 5 }, { author: 'Илья', text: 'Спокойная музыка и внимательное обслуживание.', rating: 5 }],
  },
  {
    id: 2, name: 'Тбилиси во дворе', cuisine: 'Грузинская', district: 'Центральный', address: 'ул. Рубинштейна, 8',
    price: 1700, rating: 4.8, reviewCount: 96, image: 'tbilisi.jpg', imageAlt: 'Столики и зелень в ресторанном дворике',
    summary: 'Хинкали ручной лепки и домашние хачапури в тихом дворике.',
    hours: '11:00–23:00', menu: [{ name: 'Хинкали с говядиной, 3 шт.', price: 390 }, { name: 'Хачапури по-аджарски', price: 650 }, { name: 'Пхали из свёклы', price: 380 }],
    reviews: [{ author: 'Анна', text: 'Хрустящее тесто у хачапури, приду снова.', rating: 5 }],
  },
  {
    id: 3, name: 'Mizu', cuisine: 'Японская', district: 'Адмиралтейский', address: 'наб. реки Мойки, 82',
    price: 3200, rating: 4.9, reviewCount: 74, image: 'mizu.jpg', imageAlt: 'Деревянная стойка и столики в полутёмном зале',
    summary: 'Рамен на насыщенном бульоне, свежие нигири и японские чаи.',
    hours: '13:00–23:00', menu: [{ name: 'Тонкоцу рамен', price: 830 }, { name: 'Нигири с лососем, 2 шт.', price: 610 }, { name: 'Матча тирамису', price: 490 }],
    reviews: [{ author: 'Сергей', text: 'Отличный рамен. На двоих удобно сесть у стойки.', rating: 5 }],
  },
  {
    id: 4, name: 'Листья', cuisine: 'Европейская', district: 'Центральный', address: 'ул. Жуковского, 24',
    price: 1400, rating: 4.7, reviewCount: 52, image: 'bistro.jpg', imageAlt: 'Небольшое бистро с барной стойкой и подвесными лампами',
    summary: 'Городское бистро с завтраками весь день и десертами из собственной печи.',
    hours: '09:00–22:00', menu: [{ name: 'Омлет с пармезаном', price: 540 }, { name: 'Брускетта с томатами', price: 390 }, { name: 'Лимонный тарт', price: 410 }],
    reviews: [{ author: 'Алиса', text: 'Удобно встретиться за поздним завтраком.', rating: 5 }],
  },
];

export const cuisines = [...new Set(restaurants.map(({ cuisine }) => cuisine))];
export const districts = [...new Set(restaurants.map(({ district }) => district))];
export const priceOptions = [{ value: '2000', label: 'До 2 000 ₽' }, { value: '3000', label: 'До 3 000 ₽' }];
export const times = ['13:00', '14:30', '16:00', '17:30', '19:00', '20:30'];

const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' });
export const formatPrice = value => money.format(value);
export const formatDate = value => date.format(new Date(value + 'T12:00'));

function localDay(current) {
  return new Date(current.getTime() - current.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export const today = () => localDay(new Date());

export function filterRestaurants(items, { query = '', cuisine = '', district = '', price = '' }) {
  const search = query.trim().toLocaleLowerCase('ru');
  return items.filter(restaurant =>
    [restaurant.name, restaurant.cuisine, restaurant.district, restaurant.address].some(
      value => value.toLocaleLowerCase('ru').includes(search),
    ) &&
    (!cuisine || restaurant.cuisine === cuisine) &&
    (!district || restaurant.district === district) &&
    (!price || restaurant.price <= Number(price)),
  );
}

export function validateBooking({ date, time, guests }) {
  const timestamp = new Date(date + 'T' + time);
  if (typeof date !== 'string' || !times.includes(time) || Number.isNaN(timestamp.getTime()) ||
      localDay(timestamp) !== date || timestamp <= new Date()) {
    throw new Error('Выберите время в будущем.');
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > 8) throw new Error('Укажите от 1 до 8 гостей.');
}

export function historyByDate(bookings) {
  return [...bookings].sort((first, second) =>
    (second.date + second.time).localeCompare(first.date + first.time),
  );
}
