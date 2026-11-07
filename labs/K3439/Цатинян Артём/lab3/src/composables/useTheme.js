import { ref } from "vue";
const storageKey = "tablely-theme";
const media = matchMedia("(prefers-color-scheme: dark)");
const theme = ref(document.documentElement.dataset.bsTheme || "light");
function apply(value) {
  theme.value = value;
  document.documentElement.dataset.bsTheme = value;
}
media.addEventListener("change", (event) => {
  if (!localStorage.getItem(storageKey))
    apply(event.matches ? "dark" : "light");
});
export function useTheme() {
  function toggleTheme() {
    const next = theme.value === "dark" ? "light" : "dark";
    localStorage.setItem(storageKey, next);
    apply(next);
  }
  return { theme, toggleTheme };
}
