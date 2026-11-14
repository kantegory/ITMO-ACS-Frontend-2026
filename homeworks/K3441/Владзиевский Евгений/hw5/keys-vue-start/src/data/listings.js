// Небольшая выборка объявлений из ЛР1. В ЛР3 эти данные придут из API,
// здесь они лежат рядом — задача домашней работы в том, чтобы разобраться
// с компонентами, а не с запросами.
export const listings = [
  { id: 1, title: 'Двухкомнатная квартира с паркетом ёлочкой', city: 'Санкт-Петербург', district: 'Петроградский', type: 'flat', rooms: 2, area: 58, price: 62000, commission: 0, pets: false, img: 'flat-1' },
  { id: 2, title: 'Студия с рабочим местом и видом на парк', city: 'Санкт-Петербург', district: 'Выборгский', type: 'studio', rooms: 1, area: 31, price: 38000, commission: 0, pets: true, img: 'flat-2' },
  { id: 3, title: 'Евродвушка у канала Грибоедова', city: 'Санкт-Петербург', district: 'Адмиралтейский', type: 'flat', rooms: 2, area: 46, price: 55000, commission: 27500, pets: false, img: 'flat-3' },
  { id: 5, title: 'Двушка в сталинке с эркером', city: 'Санкт-Петербург', district: 'Московский', type: 'flat', rooms: 2, area: 64, price: 58000, commission: 0, pets: false, img: 'flat-5' },
  { id: 9, title: 'Дом с садом у Финского залива', city: 'Санкт-Петербург', district: 'Курортный', type: 'house', rooms: 4, area: 180, price: 150000, commission: 0, pets: true, img: 'house-1' },
  { id: 11, title: 'Таунхаус в тихом посёлке', city: 'Казань', district: 'Советский', type: 'house', rooms: 3, area: 120, price: 85000, commission: 0, pets: true, img: 'house-3' }
];

export const TYPE_NAMES = { flat: 'Квартира', studio: 'Студия', room: 'Комната', house: 'Дом' };

export function formatPrice(value) {
  return value.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽';
}
