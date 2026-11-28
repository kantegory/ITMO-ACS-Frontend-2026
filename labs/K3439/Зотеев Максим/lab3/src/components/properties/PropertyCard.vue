<script setup>
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'
import SvgIcon from '@/components/common/SvgIcon.vue'

const props = defineProps({
  property: {
    type: Object,
    required: true,
  },
})

const { formatPrice, getPropertyPhoto } = useFormatters()

const photo = computed(() => getPropertyPhoto(props.property, 600))
const location = computed(() =>
  [props.property.city, props.property.district].filter(Boolean).join(', '),
)
</script>

<template>
  <article class="card h-100">
    <img class="card-img-top" :src="photo.src" :alt="photo.alt">
    <div class="card-body">
      <span class="badge text-bg-secondary mb-2">{{ property.type }}</span>
      <h3 class="h5 card-title">{{ property.title }}</h3>
      <p class="card-text text-muted mb-2">
        <SvgIcon name="location" /> {{ location }}
      </p>
      <p class="fw-bold fs-5 mb-0">{{ formatPrice(property.price) }} / мес</p>
    </div>
    <div class="card-footer bg-body border-0 pb-3">
      <RouterLink
        class="btn btn-outline-primary w-100"
        :to="{ name: 'property', params: { id: property.id } }"
        :aria-label="`Подробнее: ${property.title}`"
      >
        Подробнее
      </RouterLink>
    </div>
  </article>
</template>
