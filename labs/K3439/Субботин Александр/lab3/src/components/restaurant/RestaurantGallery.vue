<script setup>
import { ref } from 'vue'

import { assetUrl } from '@/utils/format'

// Карусель фотографий на разметке и стилях Bootstrap, переключение — через состояние компонента
const props = defineProps({
  photos: { type: Array, required: true },
})

const current = ref(0)

function show(index) {
  current.value = (index + props.photos.length) % props.photos.length
}
</script>

<template>
  <div id="gallery" class="carousel slide gallery mb-4" role="region" aria-roledescription="карусель" aria-label="Фотографии ресторана">
    <!-- Для одной фотографии стрелки и точки не нужны. data-bs-target — только для стилей точек
         из Bootstrap: без data-bs-slide-to его JS на них не реагирует, слайды переключает компонент -->
    <div v-if="photos.length > 1" class="carousel-indicators">
      <button
        v-for="(photo, index) in photos"
        :key="photo.src + index"
        type="button"
        data-bs-target="#gallery"
        :class="{ active: index === current }"
        :aria-current="index === current ? 'true' : undefined"
        :aria-label="`Фото ${index + 1} из ${photos.length}`"
        @click="show(index)"
      ></button>
    </div>
    <div class="carousel-inner">
      <div
        v-for="(photo, index) in photos"
        :key="photo.src + index"
        class="carousel-item"
        :class="{ active: index === current }"
        role="group"
        aria-roledescription="слайд"
        :aria-label="`${index + 1} из ${photos.length}`"
      >
        <img class="d-block w-100" :src="assetUrl(photo.src)" :alt="photo.alt">
        <div class="carousel-caption"><p class="mb-0">{{ photo.caption }}</p></div>
      </div>
    </div>
    <template v-if="photos.length > 1">
      <button class="carousel-control-prev" type="button" aria-label="Предыдущее фото" @click="show(current - 1)">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      </button>
      <button class="carousel-control-next" type="button" aria-label="Следующее фото" @click="show(current + 1)">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
      </button>
    </template>
  </div>
</template>
