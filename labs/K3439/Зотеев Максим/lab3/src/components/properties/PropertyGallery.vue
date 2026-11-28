<script setup>
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'

const props = defineProps({
  property: {
    type: Object,
    required: true,
  },
})

const { getPropertyPhoto } = useFormatters()

const carouselId = computed(() => `property-photos-${props.property.id}`)

const slides = computed(() => {
  if (props.property.photos?.length) {
    return props.property.photos.map((photo) => ({
      src: `${photo.url}?w=1200`,
      alt: photo.alt || props.property.title,
    }))
  }
  return [getPropertyPhoto(props.property, 1200)]
})
</script>

<template>
  <div
    :id="carouselId"
    class="carousel slide mb-4"
    role="group"
    aria-roledescription="карусель"
    aria-label="Фотографии объекта"
  >
    <div class="carousel-inner rounded">
      <div
        v-for="(slide, index) in slides"
        :key="slide.src + index"
        :class="['carousel-item', { active: index === 0 }]"
        role="group"
        aria-roledescription="слайд"
        :aria-label="`${index + 1} из ${slides.length}`"
      >
        <img class="d-block w-100 property-photo" :src="slide.src" :alt="slide.alt">
      </div>
    </div>

    <template v-if="slides.length > 1">
      <button
        class="carousel-control-prev"
        type="button"
        :data-bs-target="`#${carouselId}`"
        data-bs-slide="prev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Предыдущее фото</span>
      </button>
      <button
        class="carousel-control-next"
        type="button"
        :data-bs-target="`#${carouselId}`"
        data-bs-slide="next"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Следующее фото</span>
      </button>
    </template>
  </div>
</template>
