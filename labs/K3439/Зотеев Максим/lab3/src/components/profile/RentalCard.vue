<script setup>
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'
import SvgIcon from '@/components/common/SvgIcon.vue'

const props = defineProps({
  rental: { type: Object, required: true },
})

const { formatDate, formatPrice, getPropertyPhoto, getRentalStatus } = useFormatters()

const property = computed(() => props.rental.property)
const photo = computed(() => getPropertyPhoto(property.value, 600))
const status = computed(() => getRentalStatus(props.rental.status))
const location = computed(() =>
  [property.value?.city, property.value?.district].filter(Boolean).join(', '),
)
</script>

<template>
  <article v-if="property" class="card mb-3">
    <div class="row g-0">
      <div class="col-md-4">
        <img class="img-fluid rounded-start h-100 object-fit-cover" :src="photo.src" :alt="photo.alt">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <span :class="['badge', status.badge, 'mb-2']">{{ status.label }}</span>
          <h2 class="h5 card-title">
            <RouterLink
              class="text-decoration-none"
              :to="{ name: 'property', params: { id: property.id } }"
            >
              {{ property.title }}
            </RouterLink>
          </h2>
          <p class="card-text text-muted mb-1">
            <SvgIcon name="location" /> {{ location }}
          </p>
          <p class="card-text mb-1">
            Договор: {{ formatDate(rental.startDate) }} — {{ formatDate(rental.endDate) }}
          </p>
          <p class="card-text fw-bold">{{ formatPrice(rental.price) }} / мес</p>
          <RouterLink
            v-if="rental.status === 'active'"
            class="btn btn-sm btn-outline-primary"
            :to="{ name: 'messages', query: { property: property.id } }"
            :aria-label="`Написать владельцу: ${property.title}`"
          >
            <SvgIcon name="message" /> Написать владельцу
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>
