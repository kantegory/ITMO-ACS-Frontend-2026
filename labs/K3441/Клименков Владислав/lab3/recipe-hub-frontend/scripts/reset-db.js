/**
 * scripts/reset-db.js — сбрасывает рабочую базу db.json к эталону db.seed.json.
 *
 * Запуск: npm run reset-db
 * Полезно, если в процессе проверки в базе накопились тестовые записи.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED_FILE = path.join(ROOT, 'db.seed.json');
const DB_FILE = path.join(ROOT, 'db.json');

if (!fs.existsSync(SEED_FILE)) {
  console.error(`Не найден эталон базы: ${SEED_FILE}`);
  process.exit(1);
}

fs.copyFileSync(SEED_FILE, DB_FILE);
console.log('База db.json восстановлена из db.seed.json');
