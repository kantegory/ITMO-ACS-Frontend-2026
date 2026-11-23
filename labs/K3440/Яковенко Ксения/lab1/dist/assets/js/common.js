/* Общие функции: хранение учебных данных, навигация и Bootstrap-компоненты. */
const STORAGE_KEY = 'prigotovili-lab1-v1';
const DIFFICULTIES = {easy:'Просто',medium:'Средняя',hard:'Сложно'};
const TYPES = {main:'Основное',breakfast:'Завтрак',soup:'Суп',salad:'Салат',dessert:'Десерт',baking:'Выпечка',snack:'Закуска'};
const DEMO_USER = {id:'dasha',name:'Дарья Соколова',handle:'dasha.food',bio:AUTHORS[2].bio,email:'demo@prigotovili.local',salt:'demo',passwordHash:'6c9047fd518abc16e41ea8d7dc3146f4ea0b030d1bbd16bc65aa7da8906d8922'};
const $ = selector => document.querySelector(selector);
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;

// Пользовательский текст экранируется перед вставкой в HTML.
function escapeHtml(value) {
  const symbols = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
  return String(value ?? '').replace(/[&<>"']/g, character => symbols[character]);
}
function emptyDatabase() {
  return {users:[{...DEMO_USER}],currentUserId:null,saved:{},likes:{},following:{},comments:[],publications:[]};
}
function loadDatabase() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && Array.isArray(stored.users) && Array.isArray(stored.publications) && Array.isArray(stored.comments)) {
      return {...emptyDatabase(),...stored};
    }
  } catch (error) { console.info('Начинаем с пустого учебного профиля.'); }
  return emptyDatabase();
}
const database = loadDatabase();
function saveDatabase() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
    return true;
  } catch (error) {
    notify('Браузер не смог сохранить данные. Возможно, закончилось место или хранение запрещено.');
    return false;
  }
}
function currentUser() {return database.users.find(user => user.id === database.currentUserId) || null;}
function allRecipes() {return [...database.publications,...RECIPES];}
function getRecipe(id) {return allRecipes().find(recipe => recipe.id === Number(id));}
function getAuthor(id) {
  const author = AUTHORS.find(item => item.id === id);
  const user = database.users.find(item => item.id === id);
  if (!author && !user) return null;
  return {...{bio:'',followers:0,posts:[]},...author,...user};
}
function allAuthors() {
  const ids = [...new Set([...AUTHORS.map(author => author.id),...database.publications.map(recipe => recipe.authorId)])];
  return ids.map(getAuthor).filter(Boolean);
}
function initials(name) {return name.trim().split(/\s+/).slice(0,2).map(word => word[0]).join('').toUpperCase();}
function userIds(collection) {const user=currentUser();return user ? database[collection][user.id] || [] : [];}
function isSaved(id) {return userIds('saved').includes(Number(id));}
function isLiked(id) {return userIds('likes').includes(Number(id));}
function isFollowing(id) {return userIds('following').includes(id);}
function likesCount(recipe) {return recipe.likes + Object.values(database.likes).filter(ids => ids.includes(recipe.id)).length;}
function followersCount(author) {return author.followers + Object.values(database.following).filter(ids => ids.includes(author.id)).length;}
function updateCollection(collection, id) {
  const user = currentUser();
  const values = userIds(collection);
  const alreadyAdded = values.includes(id);
  const updated = alreadyAdded ? values.filter(value => value !== id) : [...values, id];

  // Один и тот же принцип для закладки, лайка и подписки.
  database[collection][user.id] = updated;
  if (!saveDatabase()) {
    database[collection][user.id] = values;
    return null;
  }
  document.dispatchEvent(new Event('app:datachange'));
  return !alreadyAdded;
}
function notify(message) {
  $('#toast-text').textContent=message;
  bootstrap.Toast.getOrCreateInstance($('#app-toast'),{delay:3500}).show();
}
function nextPage() {
  const value=new URLSearchParams(location.search).get('next') || 'profile.html';
  const allowed=['index.html','profile.html','recipe.html','blogs.html','author.html'];
  return allowed.includes(value.split('?')[0]) && !value.includes('..') ? value : 'profile.html';
}
function requireUser() {
  if (currentUser()) return true;
  const next=location.pathname.split('/').pop()+location.search;
  location.href='login.html?next='+encodeURIComponent(next);
  return false;
}
function renderShell() {
  const page=document.body.dataset.page;
  const active=page==='author' ? 'blogs' : page==='recipe' ? 'catalog' : page;
  document.querySelectorAll('[data-nav]').forEach(link => {
    const selected=link.dataset.nav===active;
    link.classList.toggle('selected',selected);
    if (selected) link.setAttribute('aria-current','page');
  });
  const user=currentUser();
  if (page==='login' || page==='register') $('#session-controls').innerHTML='<a class="text-button" href="index.html">К рецептам</a>';
  else $('#session-controls').innerHTML=user ? `<span class="session-name">${escapeHtml(user.name)}</span>` : '<a class="text-button" href="login.html">Войти</a>';
  if (user) $('#sidebar-user').innerHTML=`<span class="small-rule"></span><div class="sidebar-user-name">${escapeHtml(user.name)}</div><button type="button" class="text-button" data-logout>Выйти из профиля</button>`;
}
function photoMarkup(recipe,className='recipe-photo') {
  if (recipe.photoData) return `<img class="${className}" src="${escapeHtml(recipe.photoData)}" alt="${escapeHtml(recipe.title)}">`;
  if (recipe.image) return `<img class="${className}" src="assets/images/${escapeHtml(recipe.image)}" alt="${escapeHtml(recipe.title)}">`;
  return `<div class="${className==='recipe-photo'?'recipe-placeholder':'recipe-hero-placeholder'}" role="img" aria-label="Автор не добавил фотографию">${icon('book')}</div>`;
}
function recipeRows(recipes) {
  return recipes.map(recipe => {
    const author=getAuthor(recipe.authorId);
    return `<article class="recipe-row"><div class="recipe-summary"><a href="recipe.html?id=${recipe.id}" tabindex="-1" aria-hidden="true">${photoMarkup(recipe)}</a><div class="recipe-info"><h2><a href="recipe.html?id=${recipe.id}">${escapeHtml(recipe.title)}</a></h2><p class="recipe-description">${escapeHtml(recipe.description)}</p><a class="byline" href="author.html?id=${encodeURIComponent(recipe.authorId)}"><span class="avatar" aria-hidden="true">${escapeHtml(author.name[0])}</span><span>${escapeHtml(author.handle)}</span></a></div></div><span class="recipe-time">${icon('clock')}${recipe.minutes} мин</span><span class="recipe-level">${DIFFICULTIES[recipe.difficulty]}</span><button type="button" class="save-button" data-save="${recipe.id}" aria-pressed="${isSaved(recipe.id)}" aria-label="Сохранить: ${escapeHtml(recipe.title)}">${icon('bookmark')}</button></article>`;
  }).join('');
}
function authorRow(author) {
  const own=currentUser()?.id===author.id;
  const count=allRecipes().filter(recipe => recipe.authorId===author.id).length;
  return `<article class="author-row"><span class="avatar" aria-hidden="true">${escapeHtml(initials(author.name))}</span><div><h2><a href="author.html?id=${encodeURIComponent(author.id)}">${escapeHtml(author.name)}</a></h2><p>${escapeHtml(author.bio || 'Здесь скоро появится история этой кухни.')}</p><span class="author-meta">${escapeHtml(author.handle)} · ${count} ${count===1?'рецепт':count<5?'рецепта':'рецептов'} · ${followersCount(author)} подписчиков</span></div><button type="button" class="button" data-follow="${escapeHtml(author.id)}" aria-pressed="${isFollowing(author.id)}" ${own?'disabled':''}>${own?'Ваш блог':isFollowing(author.id)?'Вы подписаны':'Подписаться'}</button></article>`;
}

/* Один компонент выбора ингредиентов используется и в поиске, и в форме публикации. */
function setupIngredientPicker(root,onChange) {
  const selected=new Set();
  const details=root.querySelector('details');
  const search=root.querySelector('.ingredient-query');
  const options=root.querySelector('.ingredient-options');
  function drawOptions() {
    const found=findIngredients(search.value);
    options.innerHTML=found.length ? found.map(ingredient => `<label class="ingredient-option"><input type="checkbox" value="${ingredient.id}" ${selected.has(ingredient.id)?'checked':''}><span>${ingredient.name}</span><small>${ingredient.group}</small></label>`).join('') : '<p class="ingredient-not-found">Такого продукта пока нет. Попробуйте другое название.</p>';
    root.querySelector('.library-count').textContent=`${found.length} из ${INGREDIENTS.length} ингредиентов`;
  }
  function chips() {
    return [...selected].map(id => `<button type="button" class="ingredient-chip" data-remove-ingredient="${id}" aria-label="Убрать: ${INGREDIENTS.find(item => item.id===id).name}">${INGREDIENTS.find(item => item.id===id).name}<span aria-hidden="true">×</span></button>`).join('');
  }
  function drawSelection() {
    const count=root.querySelector('.ingredient-count');count.textContent=selected.size;count.hidden=selected.size===0;
    root.querySelector('.selected-ingredients').innerHTML=chips();
    options.querySelectorAll('input').forEach(input => input.checked=selected.has(input.value));
    onChange([...selected],chips());
  }
  function remove(id) {selected.delete(id);drawSelection();details.querySelector('summary').focus();}
  search.addEventListener('input',drawOptions);
  options.addEventListener('change',event => {const input=event.target;if(input.checked)selected.add(input.value);else selected.delete(input.value);drawSelection();});
  root.addEventListener('click',event => {const button=event.target.closest('[data-remove-ingredient]');if(button)remove(button.dataset.removeIngredient);});
  root.querySelector('.picker-done').addEventListener('click',() => {details.open=false;details.querySelector('summary').focus();});
  details.addEventListener('toggle',() => {if(details.open)search.focus();});
  root.addEventListener('keydown',event => {if(event.key==='Escape'){details.open=false;details.querySelector('summary').focus();}});
  document.addEventListener('click',event => {if(!root.contains(event.target))details.open=false;});
  drawOptions();
  return {selected,chips,remove,clear(){selected.clear();search.value='';drawOptions();drawSelection();details.open=false;}};
}

// Делегирование событий: кнопки работают и у новых строк, добавленных после фильтрации.
document.addEventListener('click',event => {
  const save=event.target.closest('[data-save]');
  if (save && requireUser()) {
    const active = updateCollection('saved', Number(save.dataset.save));
    if (active !== null) notify(active ? 'Рецепт сохранён.' : 'Рецепт убран из сохранённого.');
  }
  const like=event.target.closest('[data-like]');
  if(like){if(!requireUser())return;updateCollection('likes',Number(like.dataset.like));}
  const follow=event.target.closest('[data-follow]');
  if (follow && requireUser()) {
    const active = updateCollection('following', follow.dataset.follow);
    if (active !== null) notify(active ? 'Вы подписались на кулинара.' : 'Подписка отменена.');
  }
  if(event.target.closest('[data-logout]')){database.currentUserId=null;saveDatabase();location.href='index.html';}
});
renderShell();
