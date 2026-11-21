import { ref } from "vue";

// Управление темой: по умолчанию следует системной теме (prefers-color-scheme),
// но пользователь может переключить тему вручную — выбор сохраняется в localStorage
// и с этого момента имеет приоритет над системной темой.
const STORAGE_KEY = "tablebook_theme";
const media = window.matchMedia("(prefers-color-scheme: dark)");

function systemTheme() {
  return media.matches ? "dark" : "light";
}

function storedTheme() {
  return localStorage.getItem(STORAGE_KEY);
}

function apply(value) {
  document.documentElement.setAttribute("data-bs-theme", value);
}

const theme = ref(storedTheme() || systemTheme());
apply(theme.value);

// Пока пользователь не нажимал кнопку переключения, страница следит за изменением
// системной темы и подхватывает её на лету.
media.addEventListener("change", (e) => {
  if (!storedTheme()) {
    theme.value = e.matches ? "dark" : "light";
    apply(theme.value);
  }
});

export function useTheme() {
  function setTheme(value) {
    localStorage.setItem(STORAGE_KEY, value);
    theme.value = value;
    apply(value);
  }

  function toggleTheme() {
    setTheme(theme.value === "dark" ? "light" : "dark");
  }

  return { theme, toggleTheme };
}
