<script setup>
import { computed, reactive, ref } from 'vue'

import { recipesApi } from '@/api'
import BaseModal from '@/components/BaseModal.vue'
import { useApiError } from '@/composables/useApiError'
import { useToast } from '@/composables/useToast'
import useAuthStore from '@/stores/auth'
import { youtubeId } from '@/utils/format'
import { detectTags, ingredientsToText, parseIngredients, parseLines } from '@/utils/recipe'

const emit = defineEmits(['saved'])

const auth = useAuthStore()
const { handleError } = useApiError()
const { showToast } = useToast()

const TYPES = ['Завтраки', 'Супы', 'Основные блюда', 'Выпечка и десерты']
const DIFFICULTIES = ['Легко', 'Средне', 'Сложно']

const modal = ref(null)
const editing = ref(null)
const validated = ref(false)
const form = reactive({})

const title = computed(() => (editing.value ? 'Изменить рецепт' : 'Новый рецепт'))

function fill(recipe) {
  Object.assign(form, {
    title: recipe?.title ?? '',
    type: recipe?.type ?? TYPES[0],
    difficulty: recipe?.difficulty ?? DIFFICULTIES[0],
    time: recipe?.time ?? 30,
    servings: recipe?.servings ?? 2,
    description: recipe?.description ?? '',
    ingredients: recipe ? ingredientsToText(recipe.ingredients) : '',
    steps: recipe ? recipe.steps.join('\n') : '',
    image: recipe?.image?.startsWith('http') ? recipe.image : '',
    video: recipe?.video ? `https://youtu.be/${recipe.video}` : ''
  })
}

// открыть пустую форму или форму с данными рецепта
function open(recipe = null) {
  editing.value = recipe
  validated.value = false
  fill(recipe)
  modal.value.show()
}

async function submit(event) {
  validated.value = true
  if (!event.target.checkValidity()) return

  const ingredients = parseIngredients(form.ingredients)
  const data = {
    title: form.title.trim(),
    type: form.type,
    difficulty: form.difficulty,
    time: Number(form.time),
    servings: Number(form.servings),
    description: form.description.trim(),
    ingredients,
    tags: detectTags(ingredients),
    steps: parseLines(form.steps),
    video: youtubeId(form.video.trim()),
    image: form.image.trim() || editing.value?.image || '/img/recipes/placeholder.svg'
  }

  try {
    if (editing.value) {
      await recipesApi.update(editing.value.id, data)
      showToast('Рецепт обновлён')
    } else {
      await recipesApi.create({ ...data, userId: auth.user.id, createdAt: new Date().toISOString().slice(0, 10) })
      showToast('Рецепт опубликован')
    }
    modal.value.hide()
    emit('saved')
  } catch (error) {
    handleError(error)
  }
}

defineExpose({ open })
</script>

<template>
  <BaseModal ref="modal" :title="title" size="lg">
    <form :class="{ 'was-validated': validated }" novalidate @submit.prevent="submit">
      <div class="modal-body">
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label" for="recipeTitle">Название</label>
            <input id="recipeTitle" v-model="form.title" class="form-control" type="text" placeholder="Например, сырники со сметаной" aria-describedby="recipeTitleError" required>
            <div id="recipeTitleError" class="invalid-feedback">Укажите название блюда.</div>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="recipeType">Тип блюда</label>
            <select id="recipeType" v-model="form.type" class="form-select">
              <option v-for="type in TYPES" :key="type">{{ type }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="recipeDifficulty">Сложность</label>
            <select id="recipeDifficulty" v-model="form.difficulty" class="form-select">
              <option v-for="level in DIFFICULTIES" :key="level">{{ level }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="recipeTime">Время, минут</label>
            <input id="recipeTime" v-model="form.time" class="form-control" type="number" min="1" required>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="recipeServings">Порций</label>
            <input id="recipeServings" v-model="form.servings" class="form-control" type="number" min="1" required>
          </div>
          <div class="col-12">
            <label class="form-label" for="recipeDescription">Короткое описание</label>
            <textarea id="recipeDescription" v-model="form.description" class="form-control" rows="2" />
          </div>
          <div class="col-md-6">
            <label class="form-label" for="recipeIngredients">Ингредиенты</label>
            <textarea id="recipeIngredients" v-model="form.ingredients" class="form-control" rows="5" placeholder="Творог — 400 г&#10;Яйцо — 1 шт." aria-describedby="ingredientsHint" required />
            <div id="ingredientsHint" class="form-text">Каждый ингредиент с новой строки в формате «продукт — количество».</div>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="recipeSteps">Шаги приготовления</label>
            <textarea id="recipeSteps" v-model="form.steps" class="form-control" rows="5" placeholder="Смешайте творог с яйцом..." aria-describedby="stepsHint" required />
            <div id="stepsHint" class="form-text">Каждый шаг с новой строки.</div>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="recipeImage">Ссылка на фото</label>
            <input id="recipeImage" v-model="form.image" class="form-control" type="url" placeholder="https://...">
          </div>
          <div class="col-md-6">
            <label class="form-label" for="recipeVideo">Ссылка на видео YouTube</label>
            <input id="recipeVideo" v-model="form.video" class="form-control" type="url" placeholder="https://youtube.com/watch?v=...">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-soft" type="button" data-bs-dismiss="modal">Отмена</button>
        <button class="btn btn-accent" type="submit">{{ editing ? 'Сохранить' : 'Опубликовать' }}</button>
      </div>
    </form>
  </BaseModal>
</template>
