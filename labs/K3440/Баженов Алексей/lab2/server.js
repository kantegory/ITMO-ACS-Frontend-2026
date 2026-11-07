const path = require('path');
const jsonServer = require('json-server');
const auth = require('json-server-auth');
const bcrypt = require('bcryptjs');

const app = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ static: path.join(__dirname, 'public') });

const rules = auth.rewriter({
  restaurants: 444,
  reviews: 444,
  bookings: 660,
  users: 600,
});

const users = router.db.get('users');
if (!users.find({ email: 'ivan@example.com' }).value()) {
  const id = users.value().reduce((max, u) => Math.max(max, u.id), 0) + 1;
  users.push({ id, name: 'Иван Иванов', email: 'ivan@example.com', password: bcrypt.hashSync('123456', 10) }).write();
}

app.db = router.db;
app.use(middlewares);
app.use(rules);
app.use(auth);
app.use(router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сайт и API: http://localhost:${PORT}`);
  console.log('Демо-вход: ivan@example.com / 123456');
});
