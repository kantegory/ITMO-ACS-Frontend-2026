function asText(value) {
  if (Array.isArray(value)) return value.map(String).join(',')
  return typeof value === 'string' ? value : ''
}

function parseIngredients(value) {
  return asText(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function matches(recipe, { q, type, difficulty, ingredients }) {
  if (type && recipe.type !== type) return false
  if (difficulty && recipe.difficulty !== difficulty) return false

  if (q) {
    const hay = [recipe.title, recipe.description, recipe.type, ...(recipe.ingredients || [])]
      .join(' ')
      .toLowerCase()
    if (!hay.includes(q)) return false
  }

  if (ingredients.length) {
    const have = recipe.ingredients || []
    for (const ingredient of ingredients) {
      if (!have.includes(ingredient)) return false
    }
  }

  return true
}

module.exports = function filterRecipes(req, res, next) {
  if (req.method !== 'GET') return next()

  const db = req.app.db
  if (!db) return next()

  if (req.path === '/ingredients') {
    const recipes = db.get('recipes').value() || []
    const ingredients = Array.from(
      new Set(recipes.flatMap((recipe) => recipe.ingredients || []))
    ).sort((a, b) => a.localeCompare(b, 'ru'))
    return res.json(ingredients)
  }

  if (req.path !== '/recipes') return next()

  const q = asText(req.query.q).trim().toLowerCase()
  const type = asText(req.query.type).trim()
  const difficulty = asText(req.query.difficulty).trim()
  const ingredients = parseIngredients(req.query.ingredients)

  if (!q && !type && !difficulty && !ingredients.length) return next()

  const recipes = db.get('recipes').value() || []
  const filtered = recipes.filter((recipe) =>
    matches(recipe, { q, type, difficulty, ingredients })
  )
  return res.json(filtered)
}
