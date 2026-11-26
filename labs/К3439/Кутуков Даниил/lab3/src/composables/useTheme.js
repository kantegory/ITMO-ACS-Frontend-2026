import { onMounted, onUnmounted, ref } from 'vue';
import { applyTheme, toggleTheme } from '@homework/hw3/theme.js';

export function useTheme() {
  const preference = matchMedia('(prefers-color-scheme: dark)');
  const dark = ref(applyTheme());
  const update = () => { dark.value = applyTheme(); };
  const toggle = () => { dark.value = toggleTheme(); };
  onMounted(() => preference.addEventListener('change', update));
  onUnmounted(() => preference.removeEventListener('change', update));
  return { dark, toggle };
}
