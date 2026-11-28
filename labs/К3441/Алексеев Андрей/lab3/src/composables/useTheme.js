import { onMounted, onUnmounted, ref } from 'vue';

const storageKey = 'vector-theme';

function validPreference(value) {
  return value === 'light' || value === 'dark' ? value : 'system';
}

function readPreference() {
  try {
    return validPreference(localStorage.getItem(storageKey));
  } catch {
    return 'system';
  }
}

export function useTheme() {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const preference = ref(readPreference());

  function applyTheme() {
    document.documentElement.dataset.bsTheme = preference.value === 'system'
      ? (systemDark.matches ? 'dark' : 'light')
      : preference.value;
  }

  function setPreference(value) {
    preference.value = validPreference(value);
    try {
      localStorage.setItem(storageKey, preference.value);
    } catch {
      // При запрете доступа к localStorage тема действует на текущей странице.
    }
    applyTheme();
  }

  function syncPreference(event) {
    if (event.key !== storageKey && event.key !== null) return;
    preference.value = readPreference();
    applyTheme();
  }

  applyTheme();
  onMounted(() => {
    systemDark.addEventListener('change', applyTheme);
    window.addEventListener('storage', syncPreference);
  });
  onUnmounted(() => {
    systemDark.removeEventListener('change', applyTheme);
    window.removeEventListener('storage', syncPreference);
  });

  return { preference, setPreference };
}
