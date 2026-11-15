// Собирает SVG-спрайт из отдельных иконок Bootstrap Icons.
// Каждая иконка становится <symbol> со своим id, viewBox берётся из исходника.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'node_modules/bootstrap-icons/icons';
const names = process.argv.slice(3);
const out = process.argv[2];

const symbols = names.map(name => {
  const file = path.join(SRC, `${name}.svg`);
  const raw = fs.readFileSync(file, 'utf8');
  const viewBox = raw.match(/viewBox="([^"]+)"/)[1];
  // внутренности <svg>…</svg> без самого тега
  const body = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim()
    .split('\n').map(l => '    ' + l.trim()).join('\n');
  return `  <symbol id="${name}" viewBox="${viewBox}">\n${body}\n  </symbol>`;
}).join('\n');

const sprite = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Спрайт иконок сервиса «Ключи».
  Иконки из Bootstrap Icons 1.11.3 (лицензия MIT, https://icons.getbootstrap.com).
  Подключение: <svg class="icon" aria-hidden="true"><use href="img/sprite.svg#key-fill"></use></svg>
-->
<svg xmlns="http://www.w3.org/2000/svg" style="display: none">
${symbols}
</svg>
`;
fs.writeFileSync(out, sprite);
console.log(`${names.length} иконок, ${(sprite.length / 1024).toFixed(1)} КБ`);
