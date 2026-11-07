const popular = [...RECIPES].sort((a, b) => b.likes - a.likes).slice(0, 6)
renderRecipeGrid(document.getElementById('popularRecipes'), popular, 'Рецептов пока нет')

document.getElementById('dishTypes').innerHTML = DISH_TYPES.map(
  (type) => `<a class="btn btn-light border" href="search.html?type=${encodeURIComponent(type)}">${type}</a>`
).join('')

document.getElementById('authorsList').innerHTML = AUTHORS.map((author) => {
  const count = RECIPES.filter((recipe) => recipe.authorId === author.id).length
  return `
    <div class="col-12 col-md-4">
      <a class="panel d-flex gap-3 align-items-center text-decoration-none text-reset h-100" href="author.html?id=${author.id}">
        <span class="avatar">${initials(author.name)}</span>
        <span>
          <span class="d-block fw-medium">${author.name}</span>
          <span class="d-block text-muted small">${plural(count, ['рецепт', 'рецепта', 'рецептов'])} · ${plural(author.followers, ['подписчик', 'подписчика', 'подписчиков'])}</span>
        </span>
      </a>
    </div>
  `
}).join('')
