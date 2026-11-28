import { onMounted, onUnmounted, ref, watchEffect } from 'vue';

const storageKey = 'kachalochka:theme';
const choices = ['auto', 'light', 'dark'];
const system = matchMedia('(prefers-color-scheme: dark)');

function storedTheme() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (choices.includes(stored)) return stored;
  } catch {
    // Browser storage may be disabled.
  }
  return 'auto';
}

export function useTheme() {
  const preference = ref(storedTheme());
  const systemDark = ref(system.matches);

  function updateSystem(event) { systemDark.value = event.matches; }
  function syncStorage(event) {
    if (event.key === storageKey || event.key === null) preference.value = storedTheme();
  }

  onMounted(() => {
    system.addEventListener('change', updateSystem);
    window.addEventListener('storage', syncStorage);
  });
  onUnmounted(() => {
    system.removeEventListener('change', updateSystem);
    window.removeEventListener('storage', syncStorage);
  });

  watchEffect(() => {
    const theme = preference.value === 'auto' ? (systemDark.value ? 'dark' : 'light') : preference.value;
    document.documentElement.dataset.bsTheme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#171c17' : '#f8f9f5';
    try {
      if (localStorage.getItem(storageKey) !== preference.value) localStorage.setItem(storageKey, preference.value);
    } catch {
      // The selected theme remains in effect for this page.
    }
  });

  return preference;
}
