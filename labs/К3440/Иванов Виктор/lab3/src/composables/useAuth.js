import { ref, readonly } from 'vue';
const key = 'stolik-vue-session';
const saved = JSON.parse(localStorage.getItem(key) || 'null');
const state = ref(saved);
export function useAuth() {
  const setSession = value => { state.value = value; localStorage.setItem(key, JSON.stringify(value)); };
  const clearSession = () => { state.value = null; localStorage.removeItem(key); };
  return { user: readonly(state), setSession, clearSession, token: () => state.value?.token };
}
