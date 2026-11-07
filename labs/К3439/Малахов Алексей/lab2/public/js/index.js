const popularList = document.getElementById('popularRecipes')
const authorsList = document.getElementById('authorsList')

document.getElementById('dishTypes').innerHTML = DISH_TYPES.map(
  (type) => `<a class="btn btn-chip" href="search.html?type=${encodeURIComponent(type)}">${type}</a>`
).join('')

async function loadHome() {
  showLoading(popularList)
  try {
    await loadCommon()
    const [recipes, follows] = await Promise.all([api('/recipes?_embed=likes'), api('/follows')])
    remember(recipes)

    const popular = [...recipes].sort((a, b) => b.likes.length - a.likes.length).slice(0, 6)
    renderRecipeGrid(popularList, popular, 'Рецептов пока нет')

    const authors = [...state.profiles.values()].filter((profile) => recipes.some((recipe) => recipe.userId === profile.id))
    authorsList.innerHTML = authors
      .map((author) => {
        const count = recipes.filter((recipe) => recipe.userId === author.id).length
        const followers = follows.filter((follow) => follow.authorId === author.id).length
        return `
          <div class="col-12 col-md-4">
            <a class="panel d-flex gap-3 align-items-center text-decoration-none text-reset h-100" href="author.html?id=${author.id}">
              <span class="avatar" aria-hidden="true">${escapeHtml(initials(author.name))}</span>
              <span>
                <span class="d-block fw-medium">${escapeHtml(author.name)}</span>
                <span class="d-block text-muted small">${plural(count, ['рецепт', 'рецепта', 'рецептов'])} · ${plural(followers, ['подписчик', 'подписчика', 'подписчиков'])}</span>
              </span>
            </a>
          </div>
        `
      })
      .join('')
  } catch (error) {
    showError(popularList, error)
  }
}

loadHome()
