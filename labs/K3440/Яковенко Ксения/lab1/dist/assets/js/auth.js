// Регистрация и вход имитируются в браузере. Настоящего сервера авторизации нет.
async function hashPassword(password,salt) {
  // Это учебная имитация входа, а не серверная защита аккаунта.
  const bytes=new TextEncoder().encode(salt+':'+password);
  const hash=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2,'0')).join('');
}
function signIn(user) {
  database.currentUserId=user.id;
  if (saveDatabase()) location.href=nextPage();
}

function showAuthError(message) {
  $('#auth-error').textContent = message;
  $('#auth-error').hidden = false;
}

// Если гость пришёл с рецепта или формы публикации, вернём его туда после входа.
const destination = new URLSearchParams(location.search).get('next');
if (destination) {
  const alternate = $('.auth-alternative a');
  alternate.href = alternate.getAttribute('href') + '?next=' + encodeURIComponent(nextPage());
}

const loginForm=$('#login-form');
if(loginForm) {
  loginForm.addEventListener('submit',async event=>{
    event.preventDefault();$('#auth-error').hidden=true;
    const button=loginForm.querySelector('button[type=submit]');button.disabled=true;
    try {
      const email=loginForm.elements.email.value.trim().toLowerCase();
      const user=database.users.find(item=>item.email===email);
      if(!user || await hashPassword(loginForm.elements.password.value,user.salt)!==user.passwordHash) {
        showAuthError('Почта или пароль не совпадают. Проверьте введённые данные.');return;
      }
      signIn(user);
    } catch(error) {showAuthError('Не удалось выполнить вход. Откройте сайт через локальный HTTP-сервер или используйте демопрофиль.');}
    finally{button.disabled=false;}
  });
  $('[data-demo-login]').addEventListener('click',()=>signIn(database.users.find(user=>user.id==='dasha')));
}
const registerForm=$('#register-form');
if(registerForm) {
  registerForm.addEventListener('submit',async event=>{
    event.preventDefault();$('#auth-error').hidden=true;
    const button=registerForm.querySelector('button[type=submit]');button.disabled=true;
    try {
      const name=registerForm.elements.name.value.trim();
      const email=registerForm.elements.email.value.trim().toLowerCase();
      const password=registerForm.elements.password.value;
      if(name.length<2){showAuthError('Введите имя минимум из двух символов.');return;}
      if(password!==registerForm.elements.confirm.value){showAuthError('Пароли не совпадают.');return;}
      if(database.users.some(user=>user.email===email)){showAuthError('Профиль с такой почтой уже есть. Попробуйте войти.');return;}
      const id=crypto.randomUUID(),salt=crypto.randomUUID();
      const user={id,name,email,salt,passwordHash:await hashPassword(password,salt),bio:'',handle:'cook.'+id.slice(0,6)};
      database.users.push(user);
      signIn(user);
    } catch(error){showAuthError('Не удалось создать профиль. Откройте сайт через локальный HTTP-сервер.');}
    finally{button.disabled=false;}
  });
}
