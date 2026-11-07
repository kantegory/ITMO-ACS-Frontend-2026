// Auth utilities

// Проверка авторизации при загрузке страницы
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    return JSON.parse(user);
  }
  
  return null;
}

// Обновление UI в зависимости от статуса авторизации
function updateAuthUI() {
  const user = checkAuth();
  const authButtons = document.querySelectorAll('.auth-buttons');
  const userMenu = document.querySelectorAll('.user-menu');
  
  if (user) {
    // Пользователь авторизован
    authButtons.forEach(el => el.style.display = 'none');
    userMenu.forEach(el => {
      el.style.display = 'block';
      // Обновляем аватар и имя
      const avatar = el.querySelector('.user-avatar');
      const name = el.querySelector('.user-name');
      
      if (avatar && user.avatar) {
        avatar.textContent = user.avatar;
      }
      if (name) {
        name.textContent = user.role === 'jobseeker' 
          ? `${user.firstName} ${user.lastName}`
          : user.companyName;
      }
    });
  } else {
    // Пользователь не авторизован
    authButtons.forEach(el => el.style.display = 'flex');
    userMenu.forEach(el => el.style.display = 'none');
  }
}

// Защита страниц (редирект на login если не авторизован)
function requireAuth(allowedRoles = []) {
  const user = checkAuth();
  
  if (!user) {
    window.location.href = 'login.html';
    return false;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    showToast('У вас нет доступа к этой странице', 'text-bg-danger');
    window.location.href = 'index.html';
    return false;
  }
  
  return true;
}

// Выход
function logout() {
  if (confirm('Вы действительно хотите выйти?')) {
    api.logout();
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  
  // Обработчики для кнопок выхода
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
});

// Обработка форм входа
if (document.getElementById('loginForm')) {
  const loginForm = document.getElementById('loginForm');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!loginForm.checkValidity()) { loginForm.classList.add('was-validated'); return; }
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    // Блокируем кнопку
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Вход...';
    
    try {
      const response = await api.login(email, password);
      showToast('Успешный вход! Перенаправляем...', 'text-bg-success');
      
      // Перенаправляем в зависимости от роли
      setTimeout(() => {
        if (response.user.role === 'employer') {
          window.location.href = 'employer.html';
        } else {
          window.location.href = 'account.html';
        }
      }, 1000);
      
    } catch (error) {
      showToast(error.message || 'Ошибка входа', 'text-bg-danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i>Войти';
    }
  });
}

// Обработка форм регистрации
if (document.getElementById('registerForm')) {
  const registerForm = document.getElementById('registerForm');
  let selectedRole = 'jobseeker';
  
  // Выбор типа профиля
  document.querySelectorAll('[data-role-select]').forEach(card => {
    card.addEventListener('click', function() {
      const role = this.getAttribute('data-role-select');
      selectedRole = role;
      
      // Обновляем активный стиль
      document.querySelectorAll('[data-role-select]').forEach(c => c.classList.remove('active', 'border-primary'));
      this.classList.add('active', 'border-primary');
      
      // Показываем/скрываем поля в зависимости от роли
      const jobseekerFields = document.getElementById('jobseekerFields');
      const employerFields = document.getElementById('employerFields');
      
      if (role === 'jobseeker') {
        jobseekerFields.style.display = 'block';
        employerFields.style.display = 'none';
      } else {
        jobseekerFields.style.display = 'none';
        employerFields.style.display = 'block';
      }
    });
  });
  
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const agree = document.getElementById('registerAgree').checked;
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    
    // Валидация
    if (password !== passwordConfirm) {
      showToast('Пароли не совпадают', 'text-bg-danger');
      return;
    }
    
    if (!agree) {
      showToast('Необходимо согласиться с условиями', 'text-bg-danger');
      return;
    }
    
    const userData = {
      email,
      password,
      role: selectedRole
    };
    
    if (selectedRole === 'jobseeker') {
      userData.firstName = document.getElementById('registerFirstName').value;
      userData.lastName = document.getElementById('registerLastName').value;
      userData.phone = document.getElementById('registerPhone').value;
    } else {
      userData.companyName = document.getElementById('registerCompanyName').value;
      userData.companyIndustry = document.getElementById('registerCompanyIndustry').value;
    }
    
    // Блокируем кнопку
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Регистрация...';
    
    try {
      const response = await api.register(userData);
      showToast('Регистрация успешна! Перенаправляем...', 'text-bg-success');
      
      setTimeout(() => {
        if (response.user.role === 'employer') {
          window.location.href = 'employer.html';
        } else {
          window.location.href = 'account.html';
        }
      }, 1000);
      
    } catch (error) {
      showToast(error.message || 'Ошибка регистрации', 'text-bg-danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-person-plus me-1"></i>Создать аккаунт';
    }
  });
}

// Показать/скрыть пароль
document.querySelectorAll('[data-toggle-password]').forEach(btn => {
  btn.addEventListener('click', function() {
    const targetId = this.getAttribute('data-toggle-password');
    const input = document.getElementById(targetId);
    const icon = this.querySelector('i');
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('bi-eye');
      icon.classList.add('bi-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('bi-eye-slash');
      icon.classList.add('bi-eye');
    }
  });
});
