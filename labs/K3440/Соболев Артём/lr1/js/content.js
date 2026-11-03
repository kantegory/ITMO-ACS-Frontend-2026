// Загружает данные API и передаёт их модулям тренировок, статей и прогресса.
import { getCollection } from "./api.js";
import { renderWorkoutContent } from "./workouts.js";
import { renderArticleContent } from "./articles.js";
import { loadProgress } from "./progress.js";

export async function hydrateApiContent() {
  // Запросы независимы: выполняем параллельно, результаты сохраняют исходный порядок.
  const [workouts, articles] = await Promise.all([getCollection("workouts"), getCollection("articles")]);
  renderWorkoutContent(workouts);
  renderArticleContent(articles);
  if (document.querySelector("#historyList")) loadProgress();
}
