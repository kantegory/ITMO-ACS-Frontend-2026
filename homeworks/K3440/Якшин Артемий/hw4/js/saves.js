// Кнопка-закладка на карточках рецептов: одинаково работает на главной,
// на странице кулинара и в личном кабинете.

import { addSave, getSaves, removeSave } from './api.js'
import { getCurrentUser, goToLogin, isLoggedIn } from './auth.js'
import { toast } from './ui.js'

// recipeId -> id записи в /saves
export async function loadSaved() {
  if (!isLoggedIn()) return new Map()
  try {
    const saves = await getSaves({ userId: getCurrentUser().id })
    return new Map(saves.map((save) => [save.recipeId, save.id]))
  } catch {
    // истёкшая сессия не должна ломать публичную страницу
    return new Map()
  }
}

export function bindSaveButtons(container, saved, onChange) {
  // слушаем document, а не контейнер: иначе Firefox считает div кликабельным
  // элементом без фокуса и интерактивной роли (проверка «Клавиатура»)
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-save]')
    if (!button || !container.contains(button)) return

    if (!isLoggedIn()) {
      goToLogin()
      return
    }

    const recipeId = Number(button.dataset.save)
    button.disabled = true

    try {
      if (saved.has(recipeId)) {
        await removeSave(saved.get(recipeId))
        saved.delete(recipeId)
        toast('Рецепт убран из сохранённых')
      } else {
        const save = await addSave(getCurrentUser().id, recipeId)
        saved.set(recipeId, save.id)
        toast('Рецепт сохранён')
      }

      const isSaved = saved.has(recipeId)
      button.classList.toggle('is-active', isSaved)
      button.setAttribute('aria-pressed', isSaved)
      button.title = isSaved ? 'Убрать из сохранённых' : 'Сохранить'
      onChange?.(recipeId, isSaved)
    } catch (error) {
      if (error.status === 401) goToLogin()
      else toast(error.message)
    } finally {
      button.disabled = false
    }
  })
}
