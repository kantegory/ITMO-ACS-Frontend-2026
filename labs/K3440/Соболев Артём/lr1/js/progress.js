// История пользователя и расчёт показателей за неделю и месяц.
import { api } from "./api.js";
import { getToken, readStoredUser } from "./session.js";
import { escapeHtml } from "./utils.js";

// Загрузка истории и расчёт показателей прогресса.
export async function loadProgress() {
  const history = document.querySelector("#historyList");
  if (!history || !getToken()) return;
  try {
    const user = readStoredUser();
    const sessions = await api(`/sessions?userId=${encodeURIComponent(user.id)}`);
    const data = { sessions };
    const rows = data.sessions.map((session) => {
      const date = new Date(session.completedAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      });
      return `<div class="plan-row"><span class="plan-icon"><svg aria-hidden="true"><use href="assets/icons.svg#check"></use></svg></span><div><b>${escapeHtml(session.title)}</b><small>${date} | ${Number(session.duration)} минут</small></div><span class="ms-auto">Завершена</span></div>`;
    });
    const fullHistory = history.hasAttribute("data-full-history");
    history.innerHTML =
      (fullHistory ? rows : rows.slice(0, 3)).join("") ||
      '<p class="empty-state">Завершённых тренировок пока нет.</p>';
    const now = Date.now();
    const weekCount = data.sessions.filter((session) => {
      const age = now - new Date(session.completedAt).getTime();
      return age >= 0 && age <= 7 * 24 * 60 * 60 * 1000;
    }).length;
    const monthCount = data.sessions.filter((session) => {
      const date = new Date(session.completedAt);
      const current = new Date();
      return (
        date.getMonth() === current.getMonth() &&
        date.getFullYear() === current.getFullYear()
      );
    }).length;
    const stat = document.querySelector("[data-session-count]");
    if (stat) stat.textContent = String(monthCount);
    document
      .querySelector("[data-week-count]")
      ?.replaceChildren(document.createTextNode(String(weekCount)));
    document
      .querySelector("[data-week-goal]")
      ?.replaceChildren(
        document.createTextNode(Math.min(weekCount, 4) + " из 4"),
      );
    document
      .querySelector("[data-week-remaining]")
      ?.replaceChildren(
        document.createTextNode(
          weekCount >= 4
            ? "цель достигнута"
            : "осталось " + (4 - weekCount) + " тренировки",
        ),
      );
  } catch (error) {
    history.innerHTML = `<p class="form-error" role="alert">${escapeHtml(error.message)}</p>`;
  }
}



