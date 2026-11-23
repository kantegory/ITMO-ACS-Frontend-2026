function renderAuthors() {
  if(document.body.dataset.page==='blogs') {$('#authors-list').innerHTML=allAuthors().map(authorRow).join('');return;}
  const id=new URLSearchParams(location.search).get('id') || 'alina';
  const author=getAuthor(id);
  if(!author){$('#author-content').innerHTML='<div class="not-found"><h1>Кулинар не найден</h1><p class="muted">Возможно, ссылка устарела.</p><a class="button" href="blogs.html">Все кулинары</a></div>';return;}
  document.title=author.name+' — Приготовили';
  const own=currentUser()?.id===author.id;
  const recipes=allRecipes().filter(recipe=>recipe.authorId===author.id);
  $('#author-content').innerHTML=`<a class="back-link" href="blogs.html">Все кулинары</a><section class="profile-heading author-hero"><div class="large-avatar" aria-hidden="true">${escapeHtml(initials(author.name))}</div><div><span class="eyebrow">${escapeHtml(author.handle)}</span><h1>${escapeHtml(author.name)}</h1><p class="muted">${escapeHtml(author.bio || 'История этой кухни ещё впереди.')}</p><p class="field-hint mt-2">${followersCount(author)} подписчиков</p></div><button type="button" class="button" data-follow="${escapeHtml(author.id)}" aria-pressed="${isFollowing(author.id)}" ${own?'disabled':''}>${own?'Ваш блог':isFollowing(author.id)?'Вы подписаны':'Подписаться'}</button></section><section class="author-section"><h2>Рецепты автора</h2><div class="recipe-list">${recipeRows(recipes)}</div></section><section class="author-section"><h2>Заметки с кухни</h2>${author.posts.length?author.posts.map(post=>`<article class="blog-post"><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.text)}</p></article>`).join(''):'<p class="muted">Автор пока не опубликовал заметки.</p>'}</section>`;
}
document.addEventListener('app:datachange',renderAuthors);
renderAuthors();
