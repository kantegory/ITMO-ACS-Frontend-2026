// Разбор полей формы рецепта

const TAG_RULES = {
  яйца: /яйц|желтк|белк/i,
  мука: /мук/i,
  молоко: /молок|сливк|сметан|кефир/i,
  сыр: /сыр|пармезан|пекорино|моцарел/i,
  мясо: /мяс|говяд|свин|баран|кур|фарш|бекон|гуанчиале|индейк/i,
  овощи: /картоф|морков|лук|помидор|томат|перец|капуст|тыкв|кабач|свёкл|свекл|огур/i,
  фрукты: /яблок|банан|груш|ягод|апельсин|лимон/i,
  макароны: /макарон|спагетти|паст|лапш|лазань/i,
  рис: /рис/i
}

// теги для фильтра «Ингредиенты» подбираем по названиям продуктов
export function detectTags(ingredients) {
  return Object.keys(TAG_RULES).filter((tag) => ingredients.some((item) => TAG_RULES[tag].test(item.name)))
}

// «Творог — 400 г» -> { name: 'Творог', amount: '400 г' }
export function parseIngredients(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, amount = ''] = line.split(/\s+[—–-]\s+|:\s*/)
      return { name: name.trim(), amount: amount.trim() }
    })
}

export function ingredientsToText(ingredients) {
  return ingredients.map((item) => [item.name, item.amount].filter(Boolean).join(' — ')).join('\n')
}

export function parseLines(text) {
  return text.split('\n').map((line) => line.trim()).filter(Boolean)
}
