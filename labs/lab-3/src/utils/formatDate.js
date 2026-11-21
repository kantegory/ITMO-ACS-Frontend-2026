// Форматирует дату в привычном для России виде ДД.ММ.ГГГГ.
// new Date(...).toLocaleDateString("ru-RU") обычно даёт тот же результат, но мы
// дополняем нулями вручную, чтобы не зависеть от окружения/движка форматирования.
export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}
