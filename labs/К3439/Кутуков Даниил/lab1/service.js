import { filterRestaurants, restaurants, validateBooking } from './catalog.js';

const prefix = 'stolik:demo:';
const read = (key, fallback) => JSON.parse(localStorage.getItem(prefix + key) ?? JSON.stringify(fallback));
const write = (key, value) => localStorage.setItem(prefix + key, JSON.stringify(value));

function activeUser() {
  const id = read('user-id', null);
  const account = read('accounts', []).find(account => account.id === id);
  if (!account) return null;
  const { name, email } = account;
  return { id, name, email };
}

function requireUser() {
  const user = activeUser();
  if (!user) throw new Error('Войдите, чтобы продолжить.');
  return user;
}

async function passwordHash(password, salt) {
  const bytes = new TextEncoder().encode(salt + password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
}

const normalizeEmail = email => email.trim().toLowerCase();

export const service = {
  currentUser: activeUser,
  async logout() { localStorage.removeItem(prefix + 'user-id'); },
  async list(filters) { return filterRestaurants(restaurants, filters); },
  async getRestaurant(id) { return restaurants.find(restaurant => restaurant.id === Number(id)); },
  async register({ name, email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const salt = crypto.randomUUID();
    const hash = await passwordHash(password, salt);
    const accounts = read('accounts', []);
    if (accounts.some(account => account.email === normalizedEmail)) {
      throw new Error('На этот адрес уже зарегистрирован аккаунт.');
    }
    const id = crypto.randomUUID();
    write('accounts', [...accounts, { id, name: name.trim(), email: normalizedEmail, salt, hash }]);
    write('user-id', id);
    return activeUser();
  },
  async login({ email, password }) {
    const account = read('accounts', []).find(account => account.email === normalizeEmail(email));
    if (!account || account.hash !== await passwordHash(password, account.salt)) {
      throw new Error('Проверьте электронную почту и пароль.');
    }
    write('user-id', account.id);
    return activeUser();
  },
  async getBookings() {
    const { id } = requireUser();
    return read('bookings', []).filter(booking => booking.userId === id);
  },
  async book(booking) {
    const user = requireUser();
    validateBooking(booking);
    const bookings = read('bookings', []);
    if (bookings.some(item => item.userId === user.id && !item.cancelled && item.restaurantId === booking.restaurantId &&
        item.date === booking.date && item.time === booking.time)) {
      throw new Error('У вас уже есть бронь на это время.');
    }
    const entry = { ...booking, id: crypto.randomUUID(), userId: user.id, cancelled: false };
    write('bookings', [...bookings, entry]);
    return entry;
  },
  async cancel(id) {
    const user = requireUser();
    const bookings = read('bookings', []);
    write('bookings', bookings.map(booking =>
      booking.id === id && booking.userId === user.id ? { ...booking, cancelled: true } : booking,
    ));
  },
};
