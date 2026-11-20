import { ref, watch } from "vue";
const theme = ref(localStorage.getItem("fitnessPlatformTheme") || "light");
watch(
  theme,
  (value) => {
    document.documentElement.dataset.theme = value;
    localStorage.setItem("fitnessPlatformTheme", value);
  },
  { immediate: true },
);
export function useTheme() {
  return {
    theme,
    toggleTheme: () => {
      theme.value = theme.value === "dark" ? "light" : "dark";
    },
  };
}
