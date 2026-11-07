<template>
  <base-modal
    id="newRecipeModal"
    ref="modal"
    title="Новый рецепт"
    dialog-class="modal-lg modal-dialog-scrollable"
    @hidden="clear"
  >
    <form
      ref="form"
      novalidate
      class="d-contents"
      :class="{ 'was-validated': validated }"
      @input="onInput"
      @submit.prevent="submit"
    >
      <div class="modal-body">
        <div class="mb-3">
          <label for="recipeTitleInput" class="form-label">Название</label>
          <input
            id="recipeTitleInput"
            v-model="draft.title"
            type="text"
            class="form-control"
            required
            minlength="3"
            aria-describedby="recipeTitleError"
          />
          <div id="recipeTitleError" class="invalid-feedback">
            Название должно быть не короче 3 символов.
          </div>
        </div>
        <div class="row g-3 mb-3">
          <div class="col-sm-6">
            <label for="recipeTypeInput" class="form-label">Тип блюда</label>
            <select
              id="recipeTypeInput"
              v-model="draft.type"
              class="form-select"
              required
              aria-describedby="recipeTypeError"
            >
              <option value="">Выберите</option>
              <option v-for="type in DISH_TYPES" :key="type">{{ type }}</option>
            </select>
            <div id="recipeTypeError" class="invalid-feedback">Выберите тип блюда.</div>
          </div>
          <div class="col-sm-6">
            <label for="recipeDifficultyInput" class="form-label">Сложность</label>
            <select
              id="recipeDifficultyInput"
              v-model="draft.difficulty"
              class="form-select"
              required
              aria-describedby="recipeDifficultyError"
            >
              <option value="">Выберите</option>
              <option v-for="item in DIFFICULTIES" :key="item">{{ item }}</option>
            </select>
            <div id="recipeDifficultyError" class="invalid-feedback">
              Выберите сложность.
            </div>
          </div>
          <div class="col-sm-6">
            <label for="recipeTimeInput" class="form-label">Время, мин</label>
            <input
              id="recipeTimeInput"
              v-model.number="draft.time"
              type="number"
              class="form-control"
              min="1"
              max="600"
              required
              aria-describedby="recipeTimeError"
            />
            <div id="recipeTimeError" class="invalid-feedback">
              Укажите время от 1 до 600 минут.
            </div>
          </div>
          <div class="col-sm-6">
            <label for="recipeServingsInput" class="form-label">Порции</label>
            <input
              id="recipeServingsInput"
              v-model.number="draft.servings"
              type="number"
              class="form-control"
              min="1"
              max="20"
              required
              aria-describedby="recipeServingsError"
            />
            <div id="recipeServingsError" class="invalid-feedback">
              От 1 до 20 порций.
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label for="recipeDescriptionInput" class="form-label"
            >Короткое описание</label
          >
          <input
            id="recipeDescriptionInput"
            v-model="draft.description"
            type="text"
            class="form-control"
            maxlength="150"
          />
        </div>
        <div class="mb-3">
          <label for="recipeIngredientsInput" class="form-label">Ингредиенты</label>
          <textarea
            id="recipeIngredientsInput"
            v-model="draft.ingredients"
            class="form-control"
            rows="4"
            required
            placeholder="Каждый с новой строки: Мука - 200 г"
            aria-describedby="recipeIngredientsError"
          />
          <div id="recipeIngredientsError" class="invalid-feedback">
            Добавьте хотя бы один ингредиент.
          </div>
        </div>
        <div>
          <label for="recipeStepsInput" class="form-label">Шаги приготовления</label>
          <textarea
            id="recipeStepsInput"
            v-model="draft.steps"
            class="form-control"
            rows="5"
            required
            placeholder="Каждый шаг с новой строки"
            aria-describedby="recipeStepsError"
          />
          <div id="recipeStepsError" class="invalid-feedback">
            Опишите хотя бы один шаг.
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
          Отмена
        </button>
        <button type="submit" class="btn btn-primary" :disabled="sending">
          Опубликовать
        </button>
      </div>
    </form>
  </base-modal>
</template>

<script setup>
import { reactive, ref } from 'vue'

import { recipesApi } from '@/api'
import BaseModal from '@/components/BaseModal.vue'
import { useFormValidation } from '@/composables/useFormValidation'
import { useNotify } from '@/composables/useNotify'
import useAuthStore from '@/stores/auth'
import { DIFFICULTIES, DISH_TYPES, detectTags } from '@/utils/recipes'

const emit = defineEmits(['created'])

const auth = useAuthStore()
const { notify } = useNotify()
const modal = ref(null)
const form = ref(null)
const sending = ref(false)
const { validated, validate, resetValidation, onInput } = useFormValidation(form)

const empty = () => ({
  title: '',
  type: '',
  difficulty: '',
  time: null,
  servings: 2,
  description: '',
  ingredients: '',
  steps: '',
})
const draft = reactive(empty())

const lines = (text) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

function clear() {
  Object.assign(draft, empty())
  resetValidation()
}

async function submit() {
  if (!validate()) return
  const ingredients = lines(draft.ingredients).map((line) => {
    const [name, amount = ''] = line.split(/\s+-\s+/)
    return { name, amount }
  })
  sending.value = true
  try {
    const { data } = await recipesApi.create({
      title: draft.title.trim(),
      image: '/assets/img/placeholder.svg',
      type: draft.type,
      difficulty: draft.difficulty,
      time: draft.time,
      servings: draft.servings,
      userId: auth.userId,
      description: draft.description.trim(),
      tags: detectTags(ingredients),
      ingredients,
      steps: lines(draft.steps),
      video: null,
      createdAt: new Date().toISOString(),
    })
    emit('created', { ...data, likes: [] })
    modal.value.hide()
  } catch (error) {
    notify(error.message)
  } finally {
    sending.value = false
  }
}

defineExpose({ show: () => modal.value.show() })
</script>
