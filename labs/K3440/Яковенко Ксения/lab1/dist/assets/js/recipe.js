const recipeId=Number(new URLSearchParams(location.search).get('id') || 1);
const recipe=getRecipe(recipeId);
function renderComments() {
  const comments=[...START_COMMENTS,...database.comments].filter(comment=>comment.recipeId===recipe.id).sort((a,b)=>b.date.localeCompare(a.date));
  $('#comment-total').textContent=comments.length;
  $('#comments-list').innerHTML=comments.length?comments.map(comment=>{
    const author=getAuthor(comment.userId);
    const name=author?.name || comment.name;
    const date=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Moscow'}).format(new Date(comment.date));
    return `<article class="comment-row"><span class="avatar" aria-hidden="true">${escapeHtml(initials(name))}</span><div><h3>${escapeHtml(name)}<time datetime="${escapeHtml(comment.date)}">${date}</time></h3><p>${escapeHtml(comment.text)}</p></div></article>`;
  }).join(''):'<p class="muted small">Пока без комментариев. Поделитесь первым впечатлением.</p>';
}
function renderRecipeSocial() {
  if(!recipe)return;
  $('#recipe-like').setAttribute('aria-pressed',isLiked(recipe.id));
  $('#recipe-like').innerHTML=icon('heart')+'Нравится · '+likesCount(recipe);
  $('#recipe-save').setAttribute('aria-pressed',isSaved(recipe.id));
  $('#recipe-save').innerHTML=icon('bookmark')+(isSaved(recipe.id)?'Сохранено':'Сохранить');
  $('#comment-form').hidden=!currentUser();$('#comment-gate').hidden=Boolean(currentUser());
  renderComments();
}
function renderRecipePage() {
  if(!recipe){$('#recipe-content').innerHTML='<div class="not-found"><h1>Рецепт не найден</h1><p class="muted">Возможно, ссылка устарела.</p><a class="button" href="index.html">Вернуться к рецептам</a></div>';return;}
  document.title=recipe.title+' — Приготовили';
  const author=getAuthor(recipe.authorId);
  const ingredients=recipe.ingredients.map((id,index)=>{
    const ingredient=INGREDIENTS.find(item=>item.id===id);
    return `<label class="ingredient-line"><input type="checkbox"><span>${ingredient.name}<small>${escapeHtml(recipe.amounts[index] || 'по вкусу')}</small></span></label>`;
  }).join('');
  let video='';
  if(RECIPES.some(item=>item.id===recipe.id))video=`<p>Короткая видеопамятка по этапам · 24 секунды, без звука.</p><video class="recipe-video" controls playsinline preload="metadata" poster="assets/images/${recipe.image}" aria-label="Видеопамятка: ${escapeHtml(recipe.title)}"><source src="assets/video/recipe-${recipe.id}.mp4" type="video/mp4"><track kind="captions" src="assets/video/recipe-${recipe.id}.vtt" srclang="ru" label="Русские субтитры">Ваш браузер не поддерживает видео.</video><a class="video-link" href="assets/video/recipe-${recipe.id}.mp4">Открыть видео отдельно</a>`;
  else if(recipe.videoId)video=`<div class="ratio ratio-16x9"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${recipe.videoId}" title="Видео: ${escapeHtml(recipe.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><a class="video-link" href="https://www.youtube.com/watch?v=${recipe.videoId}" target="_blank" rel="noopener noreferrer">Смотреть на YouTube</a>`;
  else video='<div class="video-placeholder">Автор пока не добавил видео. Все этапы описаны выше.</div>';
  const timeBreakdown=recipe.prepMinutes!==undefined?`${recipe.prepMinutes} мин подготовки · ${recipe.cookMinutes} мин приготовления${recipe.waitMinutes?' · '+recipe.waitMinutes+' мин ожидания':''}`:'';
  $('#recipe-content').innerHTML=`<a class="back-link" href="index.html">Все рецепты</a><section class="recipe-heading"><div><span class="eyebrow">${TYPES[recipe.type]}</span><h1>${escapeHtml(recipe.title)}</h1><p class="description">${escapeHtml(recipe.description)}</p><a class="recipe-author" href="author.html?id=${encodeURIComponent(author.id)}"><span class="avatar" aria-hidden="true">${escapeHtml(author.name[0])}</span>${escapeHtml(author.name)}</a><div class="recipe-facts"><span>${icon('clock')}${recipe.minutes} мин всего</span><span>${DIFFICULTIES[recipe.difficulty]}</span><span>${recipe.servings} порции</span></div>${timeBreakdown?`<p class="field-hint mt-2 mb-0">${timeBreakdown}</p>`:''}</div>${photoMarkup(recipe,'recipe-hero-photo')}</section><div class="recipe-actions"><button class="button" id="recipe-like" data-like="${recipe.id}" type="button"></button><button class="button" id="recipe-save" data-save="${recipe.id}" type="button"></button><button class="text-button" id="print-recipe" type="button">Распечатать</button></div><div class="recipe-layout"><aside class="ingredients-panel"><h2>Ингредиенты</h2><p class="muted">На ${recipe.servings} порции · отмечайте готовое</p><div class="ingredient-list">${ingredients}</div></aside><section aria-labelledby="steps-title"><h2 class="steps-title" id="steps-title">Готовим по шагам</h2>${recipe.steps.map((step,index)=>`<article class="recipe-step"><span class="step-number" aria-hidden="true">${index+1}</span><div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></div></article>`).join('')}${recipe.note?`<p class="recipe-note">${escapeHtml(recipe.note)}</p>`:''}</section></div><section class="video-section"><h2>Видеопамятка</h2>${video}</section><section class="comments-section"><h2>Обсудим рецепт <span class="muted small" id="comment-total"></span></h2><div id="comments-list"></div><p class="comment-gate" id="comment-gate">Чтобы оставить комментарий, <a href="login.html?next=${encodeURIComponent('recipe.html?id='+recipe.id)}">войдите в профиль</a>.</p><form class="comment-form" id="comment-form" hidden><label class="form-label" for="comment-text">Как получилось у вас?</label><textarea class="form-control" id="comment-text" rows="3" minlength="2" maxlength="1000" required placeholder="Поделитесь впечатлениями или задайте вопрос"></textarea><button class="button button-dark" type="submit">Отправить комментарий</button></form></section>`;
  $('#print-recipe').addEventListener('click',()=>window.print());
  $('#comment-form').addEventListener('submit',event=>{
    event.preventDefault();if(!requireUser())return;
    const text=$('#comment-text').value.trim();
    if(text.length<2){$('#comment-text').setCustomValidity('Напишите минимум два символа.');$('#comment-text').reportValidity();return;}
    const user=currentUser();
    database.comments.unshift({id:crypto.randomUUID(),recipeId:recipe.id,userId:user.id,name:user.name,text,date:new Date().toISOString()});
    if(saveDatabase()){$('#comment-text').value='';renderComments();notify('Комментарий добавлен.');}
    else database.comments.shift();
  });
  $('#comment-text').addEventListener('input',()=>$('#comment-text').setCustomValidity(''));
  renderRecipeSocial();
}
document.addEventListener('app:datachange',renderRecipeSocial);
renderRecipePage();
