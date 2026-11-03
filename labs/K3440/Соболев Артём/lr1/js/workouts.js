// Карточки, каталог, фильтры, описание тренировки и запись её выполнения.
import { api } from "./api.js";
import { getToken, readStoredUser } from "./session.js";
import { escapeHtml, showFormError, renderList } from "./utils.js";

// Шаблоны карточек, получаемых из API.
export function workoutCard(workout) {
  const id = encodeURIComponent(workout.id);
  return `<div class="col-md-6 col-lg-4 workout-item" data-name="${escapeHtml(workout.title.toLowerCase())}" data-level="${escapeHtml(workout.level)}" data-type="${escapeHtml(workout.category)}" data-duration="${Number(workout.duration)}"><a class="workout-card d-block" href="workout.html?id=${id}"><div class="workout-info"><div><span class="card-tag">${escapeHtml(workout.category.toUpperCase())} | ${Number(workout.duration)} МИН</span><h2>${escapeHtml(workout.title)}</h2><p>${escapeHtml(workout.level)} уровень | ${escapeHtml(workout.equipment)}</p></div></div></a></div>`;
}

export function renderWorkoutsPage(workouts) {
  const grid = document.querySelector("#workoutGrid");
  if (!grid) return;
  renderList("#workoutGrid", workouts, workoutCard, "Тренировок пока нет.");
  document
    .querySelector("#typeFilter")
    ?.querySelectorAll("option:not(:first-child)")
    .forEach((option) => option.remove());
  [...new Set(workouts.map((item) => item.category))].forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    document.querySelector("#typeFilter")?.append(option);
  });
}

// Поиск и фильтрация тренировок.
export function setupWorkoutFilters() {
  const grid = document.querySelector("#workoutGrid");
  if (!grid) return;
  const filter = () => {
    const query = (document.querySelector("#searchInput")?.value || "")
      .trim()
      .toLowerCase();
    const level = document.querySelector("#levelFilter")?.value;
    const type = document.querySelector("#typeFilter")?.value;
    const max = document.querySelector("#durationFilter")?.value;
    let count = 0;
    grid.querySelectorAll(".workout-item").forEach((card) => {
      const match =
        card.dataset.name.includes(query) &&
        (!level || card.dataset.level === level) &&
        (!type || card.dataset.type === type) &&
        (!max || Number(card.dataset.duration) <= Number(max));
      card.classList.toggle("d-none", !match);
      if (match) count++;
    });
    document
      .querySelector("#emptyState")
      ?.classList.toggle("d-none", count > 0);
  };
  document.querySelector("#searchInput")?.addEventListener("input", filter);
  ["#levelFilter", "#typeFilter", "#durationFilter"].forEach((selector) =>
    document.querySelector(selector)?.addEventListener("change", filter),
  );
}

// Запись тренировки в историю пользователя.
export function setupWorkoutStart(workouts) {
  document.querySelectorAll("[data-start-workout]").forEach((button) =>
    button.addEventListener("click", async () => {
      const user = readStoredUser();
      if (!getToken() || !user) {
        location.href = "login.html?next=account.html";
        return;
      }
      const id = new URLSearchParams(location.search).get("id") || workouts[0]?.id;
      button.disabled = true;
      try {
        await api("/sessions", {
          method: "POST",
          body: JSON.stringify({ workoutId: id, userId: user.id }),
        });
        button.textContent = "Тренировка записана";
        button.setAttribute("aria-label", "Тренировка записана в историю");
        const status = document.createElement("p");
        status.className = "workout-status";
        status.setAttribute("role", "status");
        status.textContent = "Тренировка записана в историю.";
        button.insertAdjacentElement("afterend", status);
      } catch (error) {
        showFormError(button.closest("main") || document.body, error.message);
        button.disabled = false;
      }
    }),
  );
}

// Заполняет детали тренировкой из API; без query id выбирает первую запись коллекции.
export function renderWorkoutContent(workouts) {
  const loading = document.querySelector("[data-workout-loading]");
  const detailContent = document.querySelector("[data-workout-content]");
  if (!workouts) {
    renderList(
      "#workoutGrid, [data-workout-list]",
      [],
      workoutCard,
      "Не удалось загрузить тренировки. Проверьте, что сервер запущен.",
    );
    if (loading) loading.textContent = "Не удалось загрузить тренировку. Проверьте, что сервер запущен.";
    return;
  }
  if (document.querySelector("#workoutGrid")) renderWorkoutsPage(workouts);
  renderList(
    "[data-workout-list]",
    workouts.slice(0, 3),
    workoutCard,
    "Тренировок пока нет.",
  );
  if (!detailContent) return;
  const requestedId = new URLSearchParams(location.search).get("id");
  const workout = requestedId
    ? workouts.find((item) => item.id === requestedId)
    : workouts[0];
  if (!workout) {
    if (loading) loading.textContent = "Тренировка не найдена.";
    return;
  }
  document.title = `${workout.title} - Fitness Platform`;
  document.querySelector("[data-workout-detail] h1").textContent = workout.title;
  document.querySelector("[data-workout-detail] .eyebrow").textContent = `${workout.category.toUpperCase()} | ${workout.level.toUpperCase()}`;
  document.querySelector("[data-workout-detail] [data-workout-description]").textContent = workout.description;
  const detailPills = document.querySelectorAll("[data-workout-detail] .detail-pill");
  if (detailPills[0]) detailPills[0].textContent = `${workout.duration} минут`;
  if (detailPills[1]) detailPills[1].textContent = workout.equipment;
  const videoLink = document.querySelector("[data-workout-video]");
  const videoWrap = document.querySelector("[data-workout-video-wrap]");
  if (videoLink && workout.videoUrl) {
    videoLink.href = workout.videoUrl;
    if (videoWrap) videoWrap.hidden = false;
  }
  const image = document.querySelector("[data-workout-image]");
  if (image && workout.image) {
    image.src = workout.image;
    image.alt = `Тренировка: ${workout.title}`;
    image.hidden = false;
  }
  const list = document.querySelector("[data-workout-plan]");
  if (list) list.innerHTML = Array.isArray(workout.plan) ? workout.plan.map(escapeHtml).join("<br>") : "";
  detailContent.hidden = false;
  if (loading) loading.hidden = true;
  setupWorkoutStart(workouts);
}
