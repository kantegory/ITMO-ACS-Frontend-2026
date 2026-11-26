const key = 'stolik:api:session';

export function createService(request) {
  function session() {
    try { return JSON.parse(sessionStorage.getItem(key) ?? 'null'); }
    catch { sessionStorage.removeItem(key); return null; }
  }

  async function send(method, path, body) {
    try {
      return await request(method, path, { token: session()?.token, body });
    } catch (error) {
      if (error.status === 401) sessionStorage.removeItem(key);
      throw error;
    }
  }

  async function authenticate(path, values) {
    const data = await send('POST', path, values);
    sessionStorage.setItem(key, JSON.stringify(data));
    return data.user;
  }

  return {
    currentUser: () => session()?.user ?? null,
    async logout() {
      try { await send('POST', '/logout'); }
      finally { sessionStorage.removeItem(key); }
    },
    list: filters => send('GET', '/restaurants?' + new URLSearchParams(filters)),
    async getRestaurant(id) {
      if (!id || !/^\d+$/.test(String(id))) return undefined;
      try { return await send('GET', '/restaurants/' + id); }
      catch (error) { if (error.status !== 404) throw error; return undefined; }
    },
    register: values => authenticate('/register', values),
    login: values => authenticate('/login', values),
    getBookings: () => send('GET', '/bookings'),
    book: values => send('POST', '/bookings', values),
    cancel: id => send('PATCH', '/bookings/' + encodeURIComponent(id), { cancelled: true }),
  };
}
