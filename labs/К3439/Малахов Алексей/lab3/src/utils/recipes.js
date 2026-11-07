export const DISH_TYPES = ['Супы', 'Основные блюда', 'Завтраки', 'Салаты', 'Десерты']
export const DIFFICULTIES = ['Легко', 'Средне', 'Сложно']
export const INGREDIENTS = [
  'Яйца',
  'Картофель',
  'Мука',
  'Сыр',
  'Творог',
  'Тыква',
  'Мясо',
  'Помидоры',
  'Рис',
  'Молоко',
]

const INGREDIENT_PATTERNS = {
  Яйца: /^(яйц|яйк|желтк|желток|белк|белок)/,
  Картофель: /^(картоф|картош)/,
  Мука: /^мук/,
  Сыр: /^(сыр|сыра|сыром|пармезан[а-я]*|моцарелл[а-я]*|фета|феты|маскарпоне)$/,
  Творог: /^творог/,
  Тыква: /^тыкв/,
  Мясо: /^(мяс|говяд|свинин|баранин|фарш|куриц|курин|бекон)/,
  Помидоры: /^(помидор|томат)/,
  Рис: /^рис/,
  Молоко: /^(молок|сливк)/,
}

export function detectTags(ingredients) {
  return INGREDIENTS.filter((tag) =>
    ingredients.some((item) =>
      item.name
        .toLowerCase()
        .split(/[^а-яё]+/)
        .some((word) => INGREDIENT_PATTERNS[tag].test(word)),
    ),
  )
}

export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
