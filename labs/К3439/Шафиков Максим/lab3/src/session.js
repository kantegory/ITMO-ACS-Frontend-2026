import { ref, shallowRef } from 'vue';

const tokenKey = 'kachalochka-lab3:token';

export const token = ref(sessionStorage.getItem(tokenKey));
export const profile = shallowRef(null);

export function setSession(value, user = null) {
  token.value = value;
  profile.value = user;
  if (value) sessionStorage.setItem(tokenKey, value);
  else sessionStorage.removeItem(tokenKey);
}
