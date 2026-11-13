// Mock data for development without server

const mockVacancies = [
  {
    id: 1,
    title: "Senior Frontend-разработчик",
    companyName: "Яндекс",
    companyLogo: "Я",
    industry: "IT",
    location: "Москва",
    salaryFrom: 280000,
    salaryTo: null,
    experience: "3-6",
    workFormat: "remote",
    description: "Разработка интерфейсов сервисов поиска. React, TypeScript, архитектура фронтенда.",
    status: "active",
    views: 342,
    applicationsCount: 18
  },
  {
    id: 2,
    title: "Финансовый аналитик",
    companyName: "СберБанк",
    companyLogo: "С",
    industry: "finance",
    location: "Москва",
    salaryFrom: 180000,
    salaryTo: 240000,
    experience: "1-3",
    workFormat: "office",
    description: "Финансовое моделирование, бюджетирование, анализ эффективности продуктов.",
    status: "active",
    views: 218,
    applicationsCount: 12
  },
  {
    id: 3,
    title: "UX/UI-дизайнер продукта",
    companyName: "MTC Digital",
    companyLogo: "М",
    industry: "IT",
    location: "Санкт-Петербург",
    salaryFrom: null,
    salaryTo: 210000,
    experience: "0",
    workFormat: "hybrid",
    description: "Проектирование интерфейсов мобильных приложений.",
    status: "active",
    views: 156,
    applicationsCount: 9
  },
  {
    id: 4,
    title: "Врач-терапевт",
    companyName: "Медгородок",
    companyLogo: "В",
    industry: "medicine",
    location: "Казань",
    salaryFrom: 150000,
    salaryTo: null,
    experience: "1-3",
    workFormat: "office",
    description: "Приём пациентов, диагностика, назначение лечения.",
    status: "active",
    views: 89,
    applicationsCount: 5
  }
];

// Mock API Service (работает без сервера)
class MockAPIService {
  constructor() {
    this.vacancies = mockVacancies;
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

  // Регистрация (mock)
  async register(userData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: Date.now(),
          email: userData.email,
          role: userData.role,
          ...(userData.role === 'jobseeker' ? {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone || '',
            city: userData.city || '',
            avatar: `${userData.firstName[0]}${userData.lastName[0]}`,
            skills: userData.skills || [],
            experience: userData.experience || '0'
          } : {
            companyName: userData.companyName,
            companyLogo: userData.companyName[0],
            companyIndustry: userData.companyIndustry || ''
          })
        };
        const token = 'mock_token_' + Date.now();
        this.setAuth(token, user);
        resolve({ token, user });
      }, 500);
    });
  }

  // Вход (mock)
  async login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Тестовые учетки
        if (email === 'faralones67@gmail.com' && password === 'password123') {
          const user = {
            id: 1,
            email,
            role: 'jobseeker',
            firstName: 'Денис',
            lastName: 'Фёдоров',
            avatar: 'ДФ'
          };
          const token = 'mock_token_jobseeker';
          this.setAuth(token, user);
          resolve({ token, user });
        } else if (email === 'hr@yandex.ru' && password === 'employer123') {
          const user = {
            id: 2,
            email,
            role: 'employer',
            companyName: 'Яндекс',
            companyLogo: 'Я'
          };
          const token = 'mock_token_employer';
          this.setAuth(token, user);
          resolve({ token, user });
        } else {
          reject(new Error('Неверный email или пароль'));
        }
      }, 500);
    });
  }

  logout() {
    this.clearAuth();
    window.location.href = 'index.html';
  }

  // Получить все вакансии
  async getVacancies() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.vacancies]), 300);
    });
  }

  // Поиск с фильтрами
  async searchVacancies(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...this.vacancies];

        if (filters.keyword) {
          const keyword = filters.keyword.toLowerCase();
          result = result.filter(v => 
            v.title.toLowerCase().includes(keyword) ||
            v.description.toLowerCase().includes(keyword)
          );
        }

        if (filters.industry) {
          result = result.filter(v => v.industry === filters.industry);
        }

        if (filters.salaryFrom) {
          const minSalary = parseInt(filters.salaryFrom);
          result = result.filter(v => v.salaryFrom && v.salaryFrom >= minSalary);
        }

        if (filters.experience) {
          result = result.filter(v => v.experience === filters.experience);
        }

        if (filters.remote) {
          result = result.filter(v => v.workFormat === 'remote');
        }

        resolve(result);
      }, 300);
    });
  }

  // Получить вакансию по ID
  async getVacancy(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const vacancy = this.vacancies.find(v => v.id === parseInt(id));
        resolve(vacancy);
      }, 200);
    });
  }

  // Заглушки для остальных методов
  async getCurrentUser() {
    return this.getUser();
  }

  async applyToVacancy(vacancyId, coverLetter) {
    console.log('Mock: Отклик отправлен на вакансию', vacancyId);
    return { success: true };
  }

  async addToFavorites(vacancyId) {
    console.log('Mock: Добавлено в избранное', vacancyId);
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.includes(vacancyId)) {
      favorites.push(vacancyId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    return { success: true };
  }

  async removeFromFavorites(vacancyId) {
    console.log('Mock: Удалено из избранного', vacancyId);
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    favorites = favorites.filter(id => id !== vacancyId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    return { success: true };
  }

  async isFavorite(vacancyId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.includes(vacancyId);
  }

  async getMyFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return this.vacancies.filter(v => favorites.includes(v.id));
  }

  async getMyApplications() {
    return [];
  }

  async getCompanies() {
    return [];
  }
}

// Используем mock API
const api = new MockAPIService();

console.log('📦 Работает в режиме MOCK (без сервера)');
console.log('ℹ️  Для полного функционала установите Node.js и запустите: npm install && npm start');
