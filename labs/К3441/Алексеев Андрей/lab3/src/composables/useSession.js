import { readonly, ref } from 'vue';
import * as api from '../api.js';

const user = ref(null);
const sessionError = ref('');
let restorePending;
let restoredToken;

async function restore() {
  const token = api.getToken();
  if (!token) {
    user.value = null;
    return;
  }
  if (restoredToken === token) return;

  restorePending ??= api.getUser().then(account => {
    if (token !== api.getToken()) return;
    user.value = account;
    restoredToken = token;
    sessionError.value = '';
  }).catch(error => {
    if (error.status !== 401) sessionError.value = error.message;
  }).finally(() => {
    restorePending = undefined;
  });
  await restorePending;
}

async function authenticate(kind, data) {
  user.value = await api[kind](data);
  restoredToken = api.getToken();
  sessionError.value = '';
  return user.value;
}

function logout() {
  api.clearToken();
  user.value = null;
  sessionError.value = '';
}

export function cabinet(role) {
  return { name: role === 'employer' ? 'employer' : 'profile' };
}

export function useSession() {
  return { user: readonly(user), sessionError: readonly(sessionError), restore, authenticate, logout };
}
