<script setup>
/**
 * NewRecipeModal.vue — создание рецепта в личном кабинете.
 */

import { nextTick, reactive, ref } from 'vue';
import { useBootstrapModal } from '@/composables/useBootstrapModal';
import { useAuthStore } from '@/stores/auth';
import { recipes as recipesApi } from '@/api/resources';
import { DIFFICULTIES, DISH_TYPES } from '@/constants';
import { announce } from '@/composables/useLiveRegion';

const emit = defineEmits(['created']);

const auth = useAuthStore();
const { element, show, hide } = useBootstrapModal();

const form = reactive({
  title: '',
  dishType: '',
  difficulty: '',
  timeMinutes: 30,
  servings: 2,
  description: '',
  ingredients: '',
  steps: '',
});

const error = ref('');
const titleInvalid = ref(false);
const submitting = ref(false);
const titleInput = ref(null);

function open() {
  Object.assign(form, {
    title: '',
    dishType: '',
    difficulty: '',
    timeMinutes: 30,
    servings: 2,
    description: '',
    ingredients: '',
    steps: '',
  });
  error.value = '';
  titleInvalid.value = false;
  show();
}

async function submit() {
  error.value = '';

  if (!form.title.trim()) {
    titleInvalid.value = true;
    await nextTick();
    titleInput.value?.focus();
    return;
  }
  titleInvalid.value = false;

  if (!auth.user) {
    error.value = 'Требуется авторизация.';
    return;
  }

  submitting.value = true;
  try {
    const created = await recipesApi.create({
      userId: auth.user.id,
      title: form.title.trim(),
      dishType: form.dishType || 'Основные блюда',
      difficulty: form.difficulty || 'Низкая',
      timeMinutes: Number(form.timeMinutes) || 30,
      servings: Number(form.servings) || 2,
      description: form.description.trim(),
      ingredients: form.ingredients
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      steps: form.steps
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      image: 'assets/img/recipe-placeholder.svg',
      likes: 0,
      videoUrl: '',
      createdAt: new Date().toISOString(),
    });

    hide();
    announce('Рецепт опубликован');
    emit('created', created);
  } catch (err) {
    error.value = err?.message || 'Не удалось сохранить рецепт.';
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <div
    ref="element"
    class="modal fade"
    id="newRecipeModal"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    aria-labelledby="newRecipeModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <form novalidate :aria-busy="submitting" @submit.prevent="submit">
          <div class="modal-header">
            <h2 class="modal-title h5" id="newRecipeModalLabel">
              Новый рецепт
            </h2>
            <button
              class="btn-close"
              type="button"
              data-bs-dismiss="modal"
              aria-label="Закрыть"
            ></button>
          </div>

          <div class="modal-body">
            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>

            <div class="mb-3">
              <label class="form-label" for="recipe-title">Название</label>
              <input
                id="recipe-title"
                ref="titleInput"
                v-model="form.title"
                class="form-control"
                :class="{ 'is-invalid': titleInvalid }"
                type="text"
                name="title"
                aria-describedby="recipe-title-error"
                :aria-invalid="titleInvalid ? 'true' : 'false'"
                required
              >
              <div class="invalid-feedback" id="recipe-title-error">
                Укажите название рецепта.
              </div>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label" for="recipe-dish-type">
                  Тип блюда
                </label>
                <select
                  id="recipe-dish-type"
                  v-model="form.dishType"
                  class="form-select"
                  name="dishType"
                >
                  <option value="">Выберите тип</option>
                  <option
                    v-for="type in DISH_TYPES"
                    :key="type"
                    :value="type"
                  >
                    {{ type }}
                  </option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label" for="recipe-difficulty">
                  Сложность
                </label>
                <select
                  id="recipe-difficulty"
                  v-model="form.difficulty"
                  class="form-select"
                  name="difficulty"
                >
                  <option value="">Выберите сложность</option>
                  <option
                    v-for="level in DIFFICULTIES"
                    :key="level"
                    :value="level"
                  >
                    {{ level }}
                  </option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label" for="recipe-time">
                  Время, минут
                </label>
                <input
                  id="recipe-time"
                  v-model.number="form.timeMinutes"
                  class="form-control"
                  type="number"
                  name="timeMinutes"
                  min="1"
                >
              </div>

              <div class="col-md-6">
                <label class="form-label" for="recipe-servings">
                  Порций
                </label>
                <input
                  id="recipe-servings"
                  v-model.number="form.servings"
                  class="form-control"
                  type="number"
                  name="servings"
                  min="1"
                >
              </div>
            </div>

            <div class="mb-3 mt-3">
              <label class="form-label" for="recipe-description">
                Описание
              </label>
              <textarea
                id="recipe-description"
                v-model="form.description"
                class="form-control"
                name="description"
                rows="2"
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label" for="recipe-ingredients">
                Ингредиенты (через запятую)
              </label>
              <input
                id="recipe-ingredients"
                v-model="form.ingredients"
                class="form-control"
                type="text"
                name="ingredients"
                placeholder="мука, вода, соль"
              >
            </div>

            <div class="mb-0">
              <label class="form-label" for="recipe-steps">
                Шаги (каждый с новой строки)
              </label>
              <textarea
                id="recipe-steps"
                v-model="form.steps"
                class="form-control"
                name="steps"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn btn-outline-secondary"
              type="button"
              data-bs-dismiss="modal"
            >
              Отмена
            </button>
            <button
              class="btn btn-rh-primary"
              type="submit"
              :disabled="submitting"
            >
              {{ submitting ? 'Сохранение…' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

