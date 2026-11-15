// Форматирование данных. Раньше лежало в js/data.js рядом с тестовым массивом,
// теперь объявления приходят с сервера, а эти функции нужны всем страницам.

const TYPE_NAMES = { flat: 'Квартира', studio: 'Студия', room: 'Комната', house: 'Дом' };

function formatPrice(value) {
  return Number(value).toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽';
}

function roomsLabel(item) {
  if (item.type === 'studio') return 'Студия';
  if (item.type === 'room') return 'Комната';
  if (item.type === 'house') return `Дом, ${item.rooms} комн.`;
  return `${item.rooms}-комн. квартира`;
}

// 12 объявлений / 2 объявления / 5 объявлений
function plural(n, forms = ['объявление', 'объявления', 'объявлений']) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

// Падеж месяца зависит от места: «на сервисе с марта 2025», но «август 2026»
// отдельной подписью. toLocaleDateString умеет только именительный.
const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const MONTHS_OF = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function monthYear(isoDate, { of = false } = {}) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  return `${(of ? MONTHS_OF : MONTHS)[d.getMonth()]} ${d.getFullYear()}`;
}

// Экранирование: тексты приходят с сервера и попадают в innerHTML
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
