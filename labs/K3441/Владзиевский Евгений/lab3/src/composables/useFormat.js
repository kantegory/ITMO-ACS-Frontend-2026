// Форматирование. Нужно почти в каждом компоненте, поэтому отдельный файл.

const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const MONTHS_OF = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

export const TYPE_NAMES = { flat: 'Квартира', studio: 'Студия', room: 'Комната', house: 'Дом' };

export function useFormat() {
  return {
    price(value) {
      return Number(value).toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽';
    },

    rooms(listing) {
      if (listing.type === 'studio') return 'Студия';
      if (listing.type === 'room') return 'Комната';
      if (listing.type === 'house') return `Дом, ${listing.rooms} комн.`;
      return `${listing.rooms}-комн. квартира`;
    },

    initials(name) {
      return String(name || '').split(' ').filter(Boolean).slice(0, 2)
        .map((part) => part[0].toUpperCase()).join('');
    },

    // Падеж месяца зависит от места: «на сервисе с марта 2025»,
    // но «август 2026» отдельной подписью
    monthYear(isoDate, { of = false } = {}) {
      const date = new Date(isoDate);
      if (Number.isNaN(date.getTime())) return '';
      return `${(of ? MONTHS_OF : MONTHS)[date.getMonth()]} ${date.getFullYear()}`;
    },

    plural(n, forms = ['объявление', 'объявления', 'объявлений']) {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return forms[0];
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
      return forms[2];
    }
  };
}
