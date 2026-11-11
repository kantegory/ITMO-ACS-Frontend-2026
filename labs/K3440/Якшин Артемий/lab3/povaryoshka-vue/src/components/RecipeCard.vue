<script setup>
import BaseIcon from '@/components/BaseIcon.vue'
import UserAvatar from '@/components/UserAvatar.vue'

defineProps({
  recipe: { type: Object, required: true },
  saved: { type: Boolean, default: false },
  // кнопки «Изменить» и «Удалить» — только для своих рецептов в кабинете
  editable: { type: Boolean, default: false }
})

defineEmits(['toggle-save', 'edit', 'delete'])
</script>

<template>
  <article class="recipe-card card h-100">
    <div class="recipe-card__media">
      <!-- название есть в заголовке карточки, поэтому фото декоративное -->
      <img :src="recipe.image || '/img/recipes/placeholder.svg'" alt="" loading="lazy">
      <span class="badge recipe-card__type">{{ recipe.type }}</span>
      <button
        class="recipe-card__save"
        :class="{ 'is-active': saved }"
        type="button"
        :aria-pressed="saved"
        :aria-label="`Сохранить рецепт «${recipe.title}»`"
        :title="saved ? 'Убрать из сохранённых' : 'Сохранить'"
        @click="$emit('toggle-save', recipe.id)"
      >
        <BaseIcon name="bookmark" />
      </button>
    </div>
    <div class="card-body">
      <h3 class="recipe-card__title">
        <RouterLink class="stretched-link" :to="{ name: 'recipe', params: { id: recipe.id } }">{{ recipe.title }}</RouterLink>
      </h3>
      <p v-if="recipe.user" class="recipe-card__author">
        <UserAvatar :user="recipe.user" size="sm" /> {{ recipe.user.name }}
      </p>
      <ul class="recipe-meta">
        <li><BaseIcon name="clock" /> <span class="visually-hidden">Время приготовления:</span> {{ recipe.time }} мин</li>
        <li><BaseIcon name="level" /> <span class="visually-hidden">Сложность:</span> {{ recipe.difficulty }}</li>
        <li><BaseIcon name="heart" /> <span class="visually-hidden">Лайков:</span> {{ recipe.likes?.length ?? 0 }}</li>
      </ul>
    </div>
    <div v-if="editable" class="recipe-card__actions">
      <button class="btn btn-soft btn-sm" type="button" :aria-label="`Изменить рецепт «${recipe.title}»`" @click="$emit('edit', recipe)">
        <BaseIcon name="edit" /> Изменить
      </button>
      <button class="btn btn-soft btn-sm" type="button" :aria-label="`Удалить рецепт «${recipe.title}»`" @click="$emit('delete', recipe)">
        <BaseIcon name="trash" /> Удалить
      </button>
    </div>
  </article>
</template>
