export const TYPES = ['Завтрак', 'Основное блюдо', 'Салат', 'Выпечка']
export const DIFFICULTIES = ['Легко', 'Средне', 'Сложно']
export const PHOTOS = ['pasta', 'ratatouille', 'apple', 'salad', 'chicken', 'pancakes']
export const same = (a, b) => String(a) === String(b)

export function validateRecipe(input) {
  const title = String(input.title || '').trim()
  const description = String(input.description || '').trim()
  const minutes = Number(input.minutes)
  const servings = Number(input.servings)
  const ingredients = Array.isArray(input.ingredients) ? input.ingredients.map((i) => ({ name: String(i.name || '').trim(), amount: String(i.amount || '').trim() })) : []
  const steps = Array.isArray(input.steps) ? input.steps.map((s) => String(s).trim()) : []
  const video = String(input.video || '').trim()
  if (title.length < 3 || title.length > 100) throw new Error('Название должно содержать от 3 до 100 символов.')
  if (description.length < 10 || description.length > 500) throw new Error('Описание должно содержать от 10 до 500 символов.')
  if (!TYPES.includes(input.type) || !DIFFICULTIES.includes(input.difficulty)) throw new Error('Выберите тип блюда и сложность.')
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440 || !Number.isInteger(servings) || servings < 1 || servings > 30) throw new Error('Укажите время от 1 до 1440 минут и от 1 до 30 порций.')
  if (!ingredients.length || ingredients.length > 30 || ingredients.some((i) => !i.name || i.name.length > 80 || !i.amount || i.amount.length > 50)) throw new Error('Добавьте от 1 до 30 ингредиентов в формате «Название | Количество».')
  if (!steps.length || steps.length > 20 || steps.some((s) => s.length < 5 || s.length > 1000)) throw new Error('Добавьте от 1 до 20 шагов, каждый от 5 до 1000 символов.')
  if (video && !/^[a-zA-Z0-9_-]{11}$/.test(video)) throw new Error('Укажите 11-символьный идентификатор видео YouTube или оставьте поле пустым.')
  if (!PHOTOS.some((photo) => input.image === `photos/${photo}.jpg`)) throw new Error('Выберите изображение из списка.')
  return { title, description, type: input.type, difficulty: input.difficulty, minutes, servings, ingredients, steps, video, image: input.image }
}

export function filterRecipes(recipes, query) {
  const term = (key) => String(query.get(key) || '').trim().toLocaleLowerCase('ru')
  let result = recipes.filter((r) =>
    (!term('search') || `${r.title} ${r.description}`.toLocaleLowerCase('ru').includes(term('search'))) &&
    (!term('type') || r.type.toLocaleLowerCase('ru') === term('type')) &&
    (!term('difficulty') || r.difficulty.toLocaleLowerCase('ru') === term('difficulty')) &&
    (!term('ingredient') || r.ingredients.some((i) => i.name.toLocaleLowerCase('ru').includes(term('ingredient')))) &&
    (!term('authorId') || same(r.userId, query.get('authorId'))))
  return result.sort(query.get('sort') === 'quick' ? (a, b) => a.minutes - b.minutes : (a, b) => b.createdAt.localeCompare(a.createdAt))
}
