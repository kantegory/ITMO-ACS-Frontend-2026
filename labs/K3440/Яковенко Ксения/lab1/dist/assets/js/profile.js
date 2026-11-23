function profileEmpty(text,link,label) {return `<div class="empty-state"><svg><use href="#i-book"/></svg><p>${text}</p><a class="button" href="${link}">${label}</a></div>`;}
function renderProfile() {
  const user=currentUser();
  $('#profile-gate').hidden=Boolean(user);$('#profile-content').hidden=!user;
  if(!user)return;
  $('#profile-name').textContent=user.name;
  $('#profile-avatar').textContent=initials(user.name);
  $('#profile-bio').textContent=user.bio || 'Добавьте пару слов о том, что вы любите готовить.';
  $('#edit-name').value=user.name;$('#edit-bio').value=user.bio;
  const saved=allRecipes().filter(recipe=>isSaved(recipe.id));
  const published=allRecipes().filter(recipe=>recipe.authorId===user.id);
  const following=allAuthors().filter(author=>isFollowing(author.id));
  $('#saved-total').textContent=saved.length;$('#publications-total').textContent=published.length;$('#following-total').textContent=following.length;
  $('#saved-list').innerHTML=saved.length?recipeRows(saved):profileEmpty('Здесь будут рецепты, которые вы отметите закладкой.','index.html','Найти рецепт');
  $('#publications-list').innerHTML = published.length
    ? recipeRows(published)
    : '<div class="empty-state"><p>Пока нет публикаций.</p></div>';
  $('#following-list').innerHTML=following.length?following.map(authorRow).join(''):profileEmpty('Подпишитесь на кулинаров, чьи рецепты хочется повторять.','blogs.html','Познакомиться с кулинарами');
}
$('#edit-profile-form').addEventListener('submit',event=>{
  event.preventDefault();const user=currentUser();if(!user)return;
  const name=$('#edit-name').value.trim();
  if(name.length<2){$('#edit-name').setCustomValidity('Введите минимум два символа.');$('#edit-name').reportValidity();return;}
  user.name=name;user.bio=$('#edit-bio').value.trim();
  if(saveDatabase()){bootstrap.Modal.getInstance($('#editProfileModal')).hide();renderShell();renderProfile();notify('Профиль обновлён.');}
});
$('#edit-name').addEventListener('input',()=>$('#edit-name').setCustomValidity(''));
document.addEventListener('app:datachange',renderProfile);
renderProfile();
// Для новых публикаций нужны ID ингредиентов и их количества.
const publishPicker = setupIngredientPicker($('#publish-ingredients'), ids => {
  const oldValues = {};
  for (const input of document.querySelectorAll('[data-ingredient-amount]')) {
    oldValues[input.dataset.ingredientAmount] = input.value;
  }
  // При добавлении продукта сохраняем уже введённые количества.
  $('#publish-amounts').innerHTML = ids.map(id => {
    const ingredient = INGREDIENTS.find(item => item.id === id);
    return `<label class="amount-row">
      <span>${ingredient.name}</span>
      <input class="form-control" data-ingredient-amount="${id}"
        value="${escapeHtml(oldValues[id] || '')}" placeholder="Например, 200 г" required maxlength="50">
    </label>`;
  }).join('');
});
function youtubeId(value) {
  if (!value) return '';
  try {
    const url=new URL(value);
    let id='';
    if(url.hostname==='youtu.be')id=url.pathname.slice(1);
    if(['www.youtube.com','youtube.com','m.youtube.com'].includes(url.hostname))id=url.searchParams.get('v') || (url.pathname.startsWith('/shorts/')?url.pathname.split('/')[2]:'');
    return /^[A-Za-z0-9_-]{11}$/.test(id)?id:null;
  } catch(error) {return null;}
}
function readPhoto(file) {
  return new Promise((resolve,reject) => {
    if(!file){resolve('');return;}
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){reject(new Error('Выберите JPG, PNG или WebP.'));return;}
    if(file.size>1024*1024){reject(new Error('Размер фотографии должен быть не больше 1 МБ.'));return;}
    const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Не удалось прочитать фотографию.'));reader.readAsDataURL(file);
  });
}
$('#publish-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!requireUser()) return;
  const form = event.currentTarget;
  const error = $('#publish-error');
  error.hidden = true;
  const button = form.querySelector('button[type=submit]');

  try {
    const fields = form.elements;
    const title = fields.title.value.trim();
    const description = fields.description.value.trim();
    if (title.length < 4) throw new Error('Введите название длиной от четырёх символов.');
    if (!description) throw new Error('Добавьте короткое описание.');

    const ingredientIds = [...publishPicker.selected];
    if (ingredientIds.length === 0) throw new Error('Выберите хотя бы один ингредиент.');
    const amounts = ingredientIds.map(id => form.querySelector(`[data-ingredient-amount="${id}"]`).value.trim());
    if (amounts.includes('')) throw new Error('Укажите количество каждого ингредиента.');

    const steps = fields.steps.value.split('\n').map(text => text.trim()).filter(Boolean);
    if (steps.length < 2) throw new Error('Опишите минимум два шага, каждый с новой строки.');
    const videoId = youtubeId(fields.video.value.trim());
    if (videoId === null) throw new Error('Укажите ссылку на видео YouTube или оставьте поле пустым.');

    button.disabled = true;
    const photoData = await readPhoto(fields.photo.files[0]);
    const recipe = {
      id: Date.now(),
      title,
      description,
      authorId: currentUser().id,
      photoData,
      type: fields.type.value,
      difficulty: fields.difficulty.value,
      minutes: Number(fields.minutes.value),
      servings: Number(fields.servings.value),
      ingredients: ingredientIds,
      amounts,
      steps: steps.map((text, index) => ({title: 'Шаг ' + (index + 1), text})),
      videoId,
      likes: 0,
      date: new Date().toISOString().slice(0, 10)
    };

    database.publications.unshift(recipe);
    if (!saveDatabase()) {
      database.publications.shift();
      throw new Error('Не удалось сохранить рецепт. Попробуйте фотографию меньшего размера.');
    }
    location.href = 'recipe.html?id=' + recipe.id;
  } catch (problem) {
    error.textContent = problem.message;
    error.hidden = false;
    error.scrollIntoView({block: 'nearest'});
  } finally {
    button.disabled = false;
  }
});

// Ссылка «Свой рецепт» из каталога ведёт сюда и открывает ту же форму.
const profileParams = new URLSearchParams(location.search);
const requestedTab = profileParams.get('tab');
const openPublish = profileParams.get('publish') === '1';

if (openPublish) {
  if (requireUser()) {
    bootstrap.Tab.getOrCreateInstance($('#publications-tab')).show();
    bootstrap.Modal.getOrCreateInstance($('#publishModal')).show();
  }
} else if (currentUser() && ['saved', 'publications', 'following'].includes(requestedTab)) {
  bootstrap.Tab.getOrCreateInstance($('#' + requestedTab + '-tab')).show();
}

