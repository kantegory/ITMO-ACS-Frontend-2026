// Точка входа: импортирует модули и запускает нужные обработчики текущей страницы.
import { setupPageBasics } from "./page.js";
import { loadSharedLayout } from "./layout.js";
import { setupPasswordToggles, setupPasswordConfirmation, setupAuthForms } from "./auth.js";
import { setupWorkoutFilters } from "./workouts.js";
import { setupExpandableSection } from "./utils.js";
import { hydrateApiContent } from "./content.js";

await loadSharedLayout();
setupPageBasics();
setupPasswordToggles();
setupPasswordConfirmation();
setupAuthForms();
setupWorkoutFilters();

// Аргументы: селектор кнопки, селектор блока и подписи закрытого/открытого состояния.
setupExpandableSection("#loadMoreArticles", "#moreArticles", "Читать больше статей", "Скрыть дополнительные статьи");

hydrateApiContent();

