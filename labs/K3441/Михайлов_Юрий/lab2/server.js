const jsonServer = require('json-server');
const auth = require('json-server-auth');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
server.db = router.db;
server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);
server.use(auth);
server.use(router);
server.listen(3000, () => console.log('SpbRent API запущено: http://localhost:3000'));
