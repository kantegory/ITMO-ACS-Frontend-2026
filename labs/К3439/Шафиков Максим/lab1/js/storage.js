const PREFIX = 'temp-fitness:';

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function getProfile() {
  return read('profiles', []).find(profile => profile.email === read('session', null));
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256',
  }, key, 256);
  return [...new Uint8Array(bits)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function register(name, email, password) {
  const salt = crypto.randomUUID();
  const hash = await hashPassword(password, salt);
  const profiles = read('profiles', []);
  if (profiles.some(profile => profile.email === email)) return false;
  profiles.push({ name, email, salt, hash });
  write('profiles', profiles);
  write('session', email);
  return true;
}

export async function login(email, password) {
  const profile = read('profiles', []).find(entry => entry.email === email);
  if (!profile || await hashPassword(password, profile.salt) !== profile.hash) return false;
  write('session', email);
  return true;
}

export function logout() {
  localStorage.removeItem(PREFIX + 'session');
}

export function getActivity(profile) {
  return read('activity:' + profile.email, { plan: [], completed: [] });
}

export function updateActivity(profile, update) {
  const activity = getActivity(profile);
  update(activity);
  write('activity:' + profile.email, activity);
  return activity;
}

export function today() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
