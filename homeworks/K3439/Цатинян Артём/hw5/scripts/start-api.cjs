const fs = require("node:fs");
const path = require("node:path");
const jsonServer = require("json-server");

const base = path.join(__dirname, "..");
const database = process.env.NOTES_DB || path.join(base, "db.json");
if (!fs.existsSync(database)) {
  fs.copyFileSync(path.join(base, "db.example.json"), database);
}

const server = jsonServer.create();
server.use(jsonServer.defaults({ logger: false }));
server.use(jsonServer.router(database));
const port = Number(process.env.NOTES_API_PORT) || 3003;
server.listen(port, "127.0.0.1", () => {
  console.log(`Notes API: http://127.0.0.1:${port}`);
});
