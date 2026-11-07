const API_BASE_URL = 'http://localhost:3000/api';


class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (token && !options.skipAuth) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && token && !options.skipAuth) {
          this.clearAuth();
          if (!/login|register|index/.test(location.pathname)) location.href = 'login.html';
      }
        throw new Error(data.message || 'Ошибка запроса');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async register(userData) {
    const data = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipAuth: true
    });
    this.setAuth(data.token, data.user);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true
    });
    this.setAuth(data.token, data.user);
    return data;
  }

  logout() {
    this.clearAuth();
    window.location.href = 'index.html';
  }

  async getCurrentUser() {
    return await this.request('/me');
  }

    getVacancies()        { return this.request('/vacancies', { skipAuth: true }); }
    getVacancy(id)        { return this.request(`/vacancies/${id}`, { skipAuth: true }); }
    createVacancy(d)      { return this.request('/vacancies', { method: 'POST', body: JSON.stringify(d) }); }
    updateVacancy(id, d)  { return this.request(`/vacancies/${id}`, { method: 'PUT', body: JSON.stringify(d) }); }
    deleteVacancy(id)     { return this.request(`/vacancies/${id}`, { method: 'DELETE' }); }

    getCompanies()        { return this.request('/companies', { skipAuth: true }); }
    getCompany(id)        { return this.request(`/companies/${id}`, { skipAuth: true }); }

    getMyApplications()   { return this.request('/applications'); }          // сервер сам фильтрует по токену
    getVacancyApplications(vacancyId) { return this.request(`/applications?vacancyId=${vacancyId}`); }

    async getMyFavorites() {
      const favs = await this.request('/favorites');
      return Promise.all(favs.map(f => this.getVacancy(f.vacancyId)));
    }
    async isFavorite(vacancyId) {
      if (!this.getUser()) return false;
      const favs = await this.request(`/favorites?vacancyId=${vacancyId}`);
      return favs.length > 0;
    }

  async applyToVacancy(vacancyId, coverLetter = '') {
    return await this.request('/applications', {
      method: 'POST',
      body: JSON.stringify({ vacancyId, coverLetter })
    });
  }


  async addToFavorites(vacancyId) {
    return await this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ vacancyId })
    });
  }

  async removeFromFavorites(vacancyId) {
    return await this.request(`/favorites/${vacancyId}`, {
      method: 'DELETE'
    });
  }
}

const api = new APIService();

function formatSalary(v) {
  const n = x => x.toLocaleString('ru-RU');
  if (v.salaryFrom && v.salaryTo) return `${n(v.salaryFrom)} – ${n(v.salaryTo)} ₽`;
  if (v.salaryFrom) return `от ${n(v.salaryFrom)} ₽`;
  if (v.salaryTo) return `до ${n(v.salaryTo)} ₽`;
  return 'По договорённости';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { APIService, api };
}
