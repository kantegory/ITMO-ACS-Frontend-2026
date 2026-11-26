import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import jsonServer from 'json-server';

const path = name => fileURLToPath(new URL(name, import.meta.url));
const db = path('./db.local.json');
if (!existsSync(db)) copyFileSync(path('./db.seed.json'), db);
const app = jsonServer.create();
app.use(jsonServer.bodyParser);
app.use(jsonServer.router(db));
app.listen(3001, '127.0.0.1', () => console.log('Заметки · http://localhost:3001/notes'));
