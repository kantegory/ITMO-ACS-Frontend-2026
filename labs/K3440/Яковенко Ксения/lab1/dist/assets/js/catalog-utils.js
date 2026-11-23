// Убираем различия регистра и ё/е, чтобы поиск не зависел от написания.
function normalizeText(text) {
  return String(text).toLowerCase().replaceAll('ё', 'е').trim();
}

function findIngredients(query) {
  const words = normalizeText(query).split(' ').filter(word => word !== '');
  return INGREDIENTS.filter(ingredient => {
    const text = normalizeText([ingredient.name, ...ingredient.aliases].join(' '));
    return words.every(word => text.includes(word));
  }).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

function filterRecipes(recipes, filters) {
  const query = normalizeText(filters.query);
  return recipes.filter(recipe => {
    const titleMatches = normalizeText(recipe.title).includes(query);
    const timeMatches = !filters.maxMinutes || recipe.minutes <= filters.maxMinutes;
    const typeMatches = !filters.type || recipe.type === filters.type;
    const difficultyMatches = !filters.difficulty || recipe.difficulty === filters.difficulty;
    // every = каждый выбранный ингредиент должен входить в рецепт.
    // У рецепта при этом могут быть и другие ингредиенты.
    const ingredientsMatch = filters.ingredientIds.every(id => recipe.ingredients.includes(id));
    return titleMatches && timeMatches && typeMatches && difficultyMatches && ingredientsMatch;
  });
}
