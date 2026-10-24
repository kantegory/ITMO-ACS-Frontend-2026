// Тестовые объявления. В ЛР2 этот массив заменит ответ json-server.
const LISTINGS = [
  {
    id: 1, type: 'flat', rooms: 2, area: 58, floor: '4 из 6', city: 'Санкт-Петербург', district: 'Петроградский',
    metro: 'Чкаловская, 6 мин', address: 'ул. Ленина, 14', price: 62000, deposit: 62000, commission: 0,
    title: 'Двухкомнатная квартира с паркетом ёлочкой', img: 'flat-1', photos: ['flat-1', 'kitchen-1', 'bedroom-1', 'room-1'],
    pets: false, kids: true, furniture: true, balcony: false, built: 1912, owner: 'Ольга Смирнова', posted: '2026-10-15',
    lat: 59.9645, lng: 30.2995,
    text: 'Светлая квартира в доходном доме начала века. Потолки 3,4 м, окна во двор, поэтому тихо. Кухня отделена от комнат, есть посудомойка и стиральная машина. Рядом Карповка и Ботанический сад.'
  },
  {
    id: 2, type: 'studio', rooms: 1, area: 31, floor: '9 из 17', city: 'Санкт-Петербург', district: 'Выборгский',
    metro: 'Лесная, 9 мин', address: 'Кантемировская ул., 39', price: 38000, deposit: 38000, commission: 0,
    title: 'Студия с рабочим местом и видом на парк', img: 'flat-2', photos: ['flat-2', 'kitchen-2', 'room-1'],
    pets: true, kids: false, furniture: true, balcony: true, built: 2019, owner: 'Артём Васильев', posted: '2026-10-16',
    lat: 59.9853, lng: 30.3285,
    text: 'Студия в новом доме с консьержем. Есть отдельный стол у окна и быстрый интернет 500 Мбит/с, роутер оставлю. Можно с котом.'
  },
  {
    id: 3, type: 'flat', rooms: 2, area: 46, floor: '3 из 5', city: 'Санкт-Петербург', district: 'Адмиралтейский',
    metro: 'Садовая, 7 мин', address: 'наб. канала Грибоедова, 98', price: 55000, deposit: 55000, commission: 27500,
    title: 'Евродвушка у канала Грибоедова', img: 'flat-3', photos: ['flat-3', 'bedroom-2', 'kitchen-1'],
    pets: false, kids: true, furniture: true, balcony: false, built: 1880, owner: 'Наталья Ким', posted: '2026-10-12',
    lat: 59.9255, lng: 30.3065,
    text: 'Кухня-гостиная и отдельная спальня. Свежий ремонт 2025 года, новая сантехника. Дом в историческом центре, до Сенной площади пять минут пешком.'
  },
  {
    id: 4, type: 'flat', rooms: 3, area: 92, floor: '6 из 7', city: 'Санкт-Петербург', district: 'Центральный',
    metro: 'Чернышевская, 5 мин', address: 'ул. Фурштатская, 27', price: 120000, deposit: 120000, commission: 0,
    title: 'Трёхкомнатная квартира-лофт с камином', img: 'flat-4', photos: ['flat-4', 'kitchen-2', 'bedroom-3', 'bedroom-1'],
    pets: true, kids: true, furniture: true, balcony: true, built: 1903, owner: 'Игорь Павлов', posted: '2026-10-10',
    lat: 59.9445, lng: 30.3635,
    text: 'Большая квартира с мансардными окнами, две спальни и гостиная с электрокамином. Два санузла. Подходит для семьи или двух пар.'
  },
  {
    id: 5, type: 'flat', rooms: 2, area: 64, floor: '2 из 9', city: 'Санкт-Петербург', district: 'Московский',
    metro: 'Электросила, 4 мин', address: 'Московский пр., 139', price: 58000, deposit: 58000, commission: 0,
    title: 'Двушка в сталинке с эркером', img: 'flat-5', photos: ['flat-5', 'kitchen-1', 'bedroom-2'],
    pets: false, kids: true, furniture: true, balcony: false, built: 1954, owner: 'Ольга Смирнова', posted: '2026-10-08',
    lat: 59.8795, lng: 30.3185,
    text: 'Просторная квартира в сталинском доме. Эркер в гостиной, большая кухня с обеденным столом на шестерых. Метро в соседнем доме.'
  },
  {
    id: 6, type: 'flat', rooms: 3, area: 105, floor: '12 из 16', city: 'Санкт-Петербург', district: 'Приморский',
    metro: 'Беговая, 10 мин', address: 'ул. Савушкина, 145', price: 95000, deposit: 95000, commission: 47500,
    title: 'Трёшка с панорамными окнами на залив', img: 'flat-6', photos: ['flat-6', 'bedroom-3', 'kitchen-2', 'room-1'],
    pets: false, kids: true, furniture: true, balcony: true, built: 2017, owner: 'Сергей Орлов', posted: '2026-10-05',
    lat: 59.9895, lng: 30.2045,
    text: 'Окна в пол, из гостиной видно Лахта Центр и залив. Подземный паркинг, место можно арендовать отдельно за 8 000 ₽.'
  },
  {
    id: 7, type: 'flat', rooms: 1, area: 44, floor: '5 из 8', city: 'Москва', district: 'Хамовники',
    metro: 'Фрунзенская, 6 мин', address: 'Комсомольский пр., 21', price: 98000, deposit: 98000, commission: 0,
    title: 'Однокомнатная квартира с высокими окнами', img: 'flat-7', photos: ['flat-7', 'bedroom-1', 'kitchen-1'],
    pets: true, kids: false, furniture: true, balcony: false, built: 1937, owner: 'Мария Белова', posted: '2026-10-14',
    lat: 55.7275, lng: 37.5845,
    text: 'Тихая квартира в кирпичном доме рядом с Нескучным садом. Дизайнерская мебель, кондиционер, стиральная и сушильная машины.'
  },
  {
    id: 8, type: 'flat', rooms: 4, area: 140, floor: '20 из 20', city: 'Москва', district: 'Пресненский',
    metro: 'Выставочная, 8 мин', address: 'Пресненская наб., 8', price: 260000, deposit: 260000, commission: 130000,
    title: 'Пентхаус с террасой в Сити', img: 'flat-8', photos: ['flat-8', 'kitchen-2', 'bedroom-3', 'bedroom-2'],
    pets: false, kids: true, furniture: true, balcony: true, built: 2015, owner: 'Сергей Орлов', posted: '2026-09-30',
    lat: 55.7485, lng: 37.5395,
    text: 'Последний этаж, своя терраса 30 м². Три спальни, гардеробная, кабинет. Охрана и паркинг в доме.'
  },
  {
    id: 9, type: 'house', rooms: 4, area: 180, floor: '2 этажа', city: 'Санкт-Петербург', district: 'Курортный',
    metro: 'электричка до Репино, 40 мин', address: 'пос. Репино, Приморское ш., 412', price: 150000, deposit: 150000, commission: 0,
    title: 'Дом с садом у Финского залива', img: 'house-1', photos: ['house-1', 'room-1', 'kitchen-1', 'bedroom-1'],
    pets: true, kids: true, furniture: true, balcony: true, built: 2012, owner: 'Игорь Павлов', posted: '2026-10-01',
    lat: 60.1735, lng: 29.8695,
    text: 'Двухэтажный дом на участке 12 соток, до залива 600 м. Сауна, мангальная зона, гараж на две машины. Сдаётся на срок от года.'
  },
  {
    id: 10, type: 'house', rooms: 5, area: 220, floor: '2 этажа', city: 'Москва', district: 'Одинцовский',
    metro: 'МЦД-1 Одинцово, 15 мин на авто', address: 'дер. Жуковка, 61', price: 340000, deposit: 340000, commission: 170000,
    title: 'Современный дом с панорамным остеклением', img: 'house-2', photos: ['house-2', 'kitchen-2', 'bedroom-3', 'bedroom-2'],
    pets: true, kids: true, furniture: true, balcony: true, built: 2021, owner: 'Мария Белова', posted: '2026-09-25',
    lat: 55.7345, lng: 37.2435,
    text: 'Дом в закрытом посёлке. Гостиная с окнами в сад, четыре спальни, кабинет. Обслуживание участка включено в стоимость.'
  },
  {
    id: 11, type: 'house', rooms: 3, area: 120, floor: '3 этажа', city: 'Казань', district: 'Советский',
    metro: 'Горки, 15 мин на авто', address: 'ЖК «Царёво», ул. Петра Гаврилова, 6', price: 85000, deposit: 85000, commission: 0,
    title: 'Таунхаус в тихом посёлке', img: 'house-3', photos: ['house-3', 'room-1', 'kitchen-1'],
    pets: true, kids: true, furniture: false, balcony: true, built: 2018, owner: 'Наталья Ким', posted: '2026-10-11',
    lat: 55.7905, lng: 49.2405,
    text: 'Таунхаус на три этажа с небольшим двориком. Мебель частично, кухня встроенная с техникой. Рядом школа и детский сад.'
  },
  {
    id: 12, type: 'room', rooms: 1, area: 18, floor: '3 из 5', city: 'Санкт-Петербург', district: 'Василеостровский',
    metro: 'Василеостровская, 8 мин', address: '7-я линия В.О., 52', price: 24000, deposit: 12000, commission: 0,
    title: 'Комната в квартире с двумя соседями', img: 'flat-9', photos: ['flat-9', 'kitchen-2'],
    pets: false, kids: false, furniture: true, balcony: false, built: 1899, owner: 'Артём Васильев', posted: '2026-10-17',
    lat: 59.9415, lng: 30.2805,
    text: 'Комната 18 м² с новой мебелью. Соседи: студентка и программист, оба тихие. Коммунальные платежи делим на троих, выходит около 2 500 ₽.'
  }
];

const TYPE_NAMES = { flat: 'Квартира', studio: 'Студия', room: 'Комната', house: 'Дом' };

function formatPrice(value) {
  return value.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽';
}

function roomsLabel(item) {
  if (item.type === 'studio') return 'Студия';
  if (item.type === 'room') return 'Комната';
  if (item.type === 'house') return `Дом, ${item.rooms} комн.`;
  return `${item.rooms}-комн. квартира`;
}
