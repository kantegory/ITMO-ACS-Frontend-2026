import { readonly, ref } from 'vue';
import { api } from '../api.js';
import { profile, setSession, token } from '../session.js';

const restoring = ref(false);
const sessionError = ref('');

async function restore() {
  if (!token.value || profile.value || restoring.value) return;
  const requestedToken = token.value;
  restoring.value = true;
  sessionError.value = '';
  try {
    const user = await api.profile();
    if (token.value === requestedToken) profile.value = user;
  } catch (error) {
    if (error.status !== 401 && token.value === requestedToken) sessionError.value = error.message;
  } finally {
    restoring.value = false;
  }
}

async function authenticate(mode, credentials) {
  const { token: value, user } = await api.authenticate(mode, credentials);
  setSession(value, user);
  sessionError.value = '';
}

async function logout() {
  const requestedToken = token.value;
  try {
    if (requestedToken) await api.logout();
  } catch (error) {
    if (error.status !== 401) throw error;
  }
  if (token.value === requestedToken) setSession(null);
  sessionError.value = '';
}

export function useSession() {
  return {
    profile: readonly(profile),
    restoring: readonly(restoring),
    sessionError: readonly(sessionError),
    restore,
    authenticate,
    logout,
  };
}
