<script setup>
import { computed, useTemplateRef } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { assetUrl } from '@/utils/format'

const props = defineProps({
  favorites: { type: Array, required: true },
  cuisines: { type: Array, required: true },
})
const emit = defineEmits(['remove'])

const cuisineNames = computed(() => Object.fromEntries(props.cuisines.map((cuisine) => [cuisine.id, cuisine.name])))
const removeButtons = useTemplateRef('removeButtons')

// Удалённая кнопка была в фокусе — родитель переводит его на соседнюю карточку (или на заголовок блока)
function focusNear(index) {
  const buttons = removeButtons.value ?? []
  const target = buttons[Math.min(index, buttons.length - 1)]
  target?.focus()
  return Boolean(target)
}

defineExpose({ focusNear })
</script>

<template>
  <div class="row row-cols-1 row-cols-md-2 g-3">
    <div v-for="(favorite, index) in favorites" :key="favorite.id" class="col">
      <article class="favorite-card">
        <img :src="assetUrl(favorite.restaurant.image)" alt="" width="64" height="64">
        <div class="flex-grow-1">
          <h3 class="h6 mb-1">
            <RouterLink :to="{ name: 'restaurant', params: { id: favorite.restaurant.id } }">{{ favorite.restaurant.name }}</RouterLink>
          </h3>
          <p class="small text-muted-warm mb-0">{{ cuisineNames[favorite.restaurant.cuisineId] }} · м. {{ favorite.restaurant.metro }}</p>
        </div>
        <button
          ref="removeButtons"
          class="btn btn-sm btn-light favorite-remove"
          type="button"
          :aria-label="`Убрать «${favorite.restaurant.name}» из избранного`"
          @click="emit('remove', favorite, index)"
        >
          <AppIcon name="close" />
        </button>
      </article>
    </div>
  </div>
</template>
