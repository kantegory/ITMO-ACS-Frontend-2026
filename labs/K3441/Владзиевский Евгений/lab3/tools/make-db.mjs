// Собирает db.json для json-server из тех же данных, что были в ЛР1.
// Пароли хешируются bcrypt — json-server-auth проверяет именно хеш.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

// Читаем массив объявлений прямо из скрипта ЛР1, чтобы данные не разъехались
const legacy = fs.readFileSync(path.join(here, 'listings.js'), 'utf8');
const LISTINGS = (await import('data:text/javascript,' + encodeURIComponent(legacy + '\nexport { LISTINGS };'))).LISTINGS;

const hash = (plain) => bcrypt.hashSync(plain, 10);

// --- Пользователи ------------------------------------------------------
const users = [
  { id: 1, email: 'demo@klyuchi.ru', password: hash('demo1234'), name: 'Евгений Владзиевский', role: 'tenant', phone: '+7 921 000-00-00', since: '2025-03-01', verified: true },
  { id: 2, email: 'olga@klyuchi.ru', password: hash('demo1234'), name: 'Ольга Смирнова', role: 'owner', phone: '+7 921 111-11-11', since: '2023-05-14', verified: true },
  { id: 3, email: 'artem@klyuchi.ru', password: hash('demo1234'), name: 'Артём Васильев', role: 'owner', phone: '+7 921 222-22-22', since: '2024-01-20', verified: true },
  { id: 4, email: 'natalia@klyuchi.ru', password: hash('demo1234'), name: 'Наталья Ким', role: 'owner', phone: '+7 921 333-33-33', since: '2022-09-02', verified: true },
  { id: 5, email: 'igor@klyuchi.ru', password: hash('demo1234'), name: 'Игорь Павлов', role: 'owner', phone: '+7 921 444-44-44', since: '2021-11-30', verified: true },
  { id: 6, email: 'sergey@klyuchi.ru', password: hash('demo1234'), name: 'Сергей Орлов', role: 'owner', phone: '+7 921 555-55-55', since: '2023-02-11', verified: true },
  { id: 7, email: 'maria@klyuchi.ru', password: hash('demo1234'), name: 'Мария Белова', role: 'owner', phone: '+7 921 666-66-66', since: '2024-06-18', verified: true }
];
const ownerId = (name) => users.find(u => u.name === name).id;

// --- Публичные карточки владельцев -------------------------------------
// Отдельная коллекция, а не users: users закрыт целиком (там хеши паролей),
// а имя владельца нужно показывать всем. Заодно работает ?_expand=owner.
const owners = users.map(u => ({
  id: u.id,
  name: u.name,
  since: u.since,
  verified: u.verified,
  responseTime: 'в течение часа'
}));

// --- Объявления --------------------------------------------------------
// Пользователь 1 (демо) заодно владеет двумя объектами — вкладка «Я сдаю»
const landlordOf = { 3: 1, 11: 1 };
// userId, а не ownerId: json-server-auth считает владельцем записи того,
// чей id лежит именно в userId. Публичная карточка владельца — /owners/:userId.
const listings = LISTINGS.map(l => {
  const { owner, ...rest } = l;
  return { ...rest, userId: landlordOf[l.id] ?? ownerId(owner) };
});

// --- Избранное ---------------------------------------------------------
const favorites = [
  { id: 1, userId: 1, listingId: 4 },
  { id: 2, userId: 1, listingId: 9 }
];

// --- Переписка ---------------------------------------------------------
const dialogs = [
  { id: 1, userId: 1, partnerId: 4, listingId: 3, unread: 1 },
  { id: 2, userId: 1, partnerId: 2, listingId: 1, unread: 1 },
  { id: 3, userId: 1, partnerId: 5, listingId: 9, unread: 0 },
  { id: 4, userId: 1, partnerId: 3, listingId: 2, unread: 0 }
];

const messages = [
  { dialogId: 1, authorId: 1, text: 'Здравствуйте! Евродвушка у канала ещё свободна?', time: '12:04' },
  { dialogId: 1, authorId: 4, text: 'Добрый день! Да, свободна с 1 ноября.', time: '12:10' },
  { dialogId: 1, authorId: 1, text: 'Можно посмотреть в субботу днём?', time: '12:11' },
  { dialogId: 1, authorId: null, text: 'Просмотр назначен на 19 октября, 15:00', time: '' },
  { dialogId: 1, authorId: 4, text: 'Жду в субботу в 15:00. Код домофона пришлю утром.', time: '12:30' },
  { dialogId: 2, authorId: 2, text: 'Евгений, напоминаю, что в ноябре придут показания счётчиков.', time: 'вчера' },
  { dialogId: 2, authorId: 1, text: 'Хорошо, сфотографирую и пришлю 25-го.', time: 'вчера' },
  { dialogId: 2, authorId: 2, text: 'Спасибо! И мастер по батареям придёт во вторник после шести.', time: '09:15' },
  { dialogId: 3, authorId: 1, text: 'Дом в Репино сдаётся только на год, или можно на полгода?', time: '14 окт' },
  { dialogId: 3, authorId: 5, text: 'Только от года, извините. Зимой дом не хочу оставлять пустым.', time: '14 окт' },
  { dialogId: 4, authorId: null, text: 'Сделка завершена, депозит 36 000 ₽ возвращён', time: '' },
  { dialogId: 4, authorId: 3, text: 'Спасибо, что следили за квартирой. Удачи на новом месте!', time: '31 мар' }
].map((m, i) => ({ id: i + 1, userId: dialogs.find(d => d.id === m.dialogId).userId, ...m }));

// --- Сделки ------------------------------------------------------------
const deals = [
  { id: 1, userId: 1, no: 'К-2026-0412', listingId: 1, role: 'Арендатор', other: 'Ольга Смирнова', period: '01.04.2026 – 31.03.2027', price: 62000, status: 'active' },
  { id: 2, userId: 1, no: 'К-2026-0977', listingId: 11, role: 'Владелец', other: 'Семья Гариповых', period: '01.07.2026 – 30.06.2027', price: 85000, status: 'active' },
  { id: 3, userId: 1, no: 'К-2026-1105', listingId: 3, role: 'Владелец', other: 'Мария Лебедева', period: 'с 01.11.2026', price: 55000, status: 'wait' },
  { id: 4, userId: 1, no: 'К-2025-0833', listingId: 2, role: 'Арендатор', other: 'Артём Васильев', period: '01.09.2025 – 31.03.2026', price: 36000, status: 'done' },
  { id: 5, userId: 1, no: 'К-2025-0310', listingId: 12, role: 'Арендатор', other: 'Артём Васильев', period: '01.02.2025 – 31.08.2025', price: 22000, status: 'done' },
  { id: 6, userId: 1, no: 'К-2025-0702', listingId: 6, role: 'Арендатор', other: 'Сергей Орлов', period: '–', price: 95000, status: 'cancel' }
];

// --- Текущая и прошлые аренды -----------------------------------------
const rentals = [
  { id: 1, userId: 1, listingId: 1, status: 'active', price: 62000, deposit: 62000, utilities: 4870, nextPayment: '1 ноября', until: '31 марта 2027', monthsDone: 7, monthsTotal: 12 },
  { id: 2, userId: 1, listingId: 2, status: 'past', price: 36000, deposit: 36000, period: 'сен 2025 – мар 2026', depositReturned: true, rating: 5 },
  { id: 3, userId: 1, listingId: 12, status: 'past', price: 22000, deposit: 12000, period: 'фев 2025 – авг 2025', depositReturned: true, rating: null }
];

// --- Просмотры --------------------------------------------------------
// Две коллекции, а не одна: у json-server-auth запись принадлежит тому,
// чей id лежит в userId. Записавшийся и владелец — разные люди,
// поэтому «куда записался я» и «кто просится ко мне» разведены.

// на что записался текущий пользователь
const viewings = [
  { id: 1, userId: 1, listingId: 4, date: '2026-10-22', time: '19:30', people: '2', comment: 'Работаем удалённо, с нами кот', status: 'confirmed' }
];

// заявки на объекты текущего пользователя
const requests = [
  { id: 1, userId: 1, listingId: 3, name: 'Мария Лебедева', date: '2026-10-19', time: '15:00', people: '1', comment: 'Работаю дизайнером, живу одна, без животных. Готова заехать с 1 ноября.', status: 'new' },
  { id: 2, userId: 1, listingId: 3, name: 'Кирилл и Настя', date: '2026-10-20', time: '18:00', people: '2', comment: 'Молодая семья, оба работаем. Есть рекомендации от прошлого владельца.', status: 'new' }
];

// --- Отзывы о владельцах ----------------------------------------------
const reviews = [
  { id: 1, ownerId: 2, author: 'Дмитрий К.', date: '2026-08-20', rating: 5, text: 'Снимали год, всё как в объявлении. Сломался бойлер, мастер пришёл на следующий день за счёт владельца.' },
  { id: 2, ownerId: 2, author: 'Алина С.', date: '2026-03-02', rating: 5, text: 'Депозит вернули в день выезда, акт подписали за десять минут.' },
  { id: 3, ownerId: 4, author: 'Павел Н.', date: '2026-05-12', rating: 5, text: 'Квартира в центре, с документами всё чисто. Договор подписали онлайн.' },
  { id: 4, ownerId: 5, author: 'Елена Б.', date: '2026-07-01', rating: 4, text: 'Дом хороший, но до магазина далеко. Владелец отвечает быстро.' },
  { id: 5, ownerId: 3, author: 'Ника Т.', date: '2026-02-08', rating: 5, text: 'Студия чистая, интернет действительно быстрый.' },
  { id: 6, ownerId: 1, author: 'Семья Гариповых', date: '2026-07-04', rating: 5, text: 'Таунхаус сдали вовремя, ключи передали лично. На вопросы отвечает в тот же день.' },
  { id: 7, ownerId: 1, author: 'Роман Д.', date: '2026-04-16', rating: 4, text: 'Квартира как на фото. Небольшая задержка с актом, но всё решили за день.' }
];

const db = { users, owners, listings, favorites, dialogs, messages, deals, rentals, viewings, requests, reviews };
fs.writeFileSync(path.join(root, 'db.json'), JSON.stringify(db, null, 2) + '\n');

console.log('db.json собран:');
for (const [k, v] of Object.entries(db)) console.log(`  ${k}: ${v.length}`);
console.log('Пароль у всех тестовых пользователей: demo1234');
