<script setup>
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'
import SvgIcon from '@/components/common/SvgIcon.vue'

const props = defineProps({
  property: {
    type: Object,
    required: true,
  },
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
  loginReturnPath: {
    type: String,
    required: true,
  },
})

defineEmits(['book', 'message'])

const { formatPrice } = useFormatters()

const canContact = computed(() => props.isAuthenticated && !props.isOwner)
</script>

<template>
  <aside class="col-lg-4" aria-label="Стоимость и контакты владельца">
    <div class="card">
      <div class="card-body">
        <p class="fs-3 fw-bold mb-1">{{ formatPrice(property.price) }}</p>
        <p class="text-muted">в месяц</p>

        <div v-if="canContact">
          <button
            type="button"
            class="btn btn-primary w-100 mb-2"
            @click="$emit('book')"
          >
            <SvgIcon name="calendar" /> Записаться на просмотр
          </button>
          <button
            type="button"
            class="btn btn-outline-primary w-100"
            @click="$emit('message')"
          >
            <SvgIcon name="message" /> Написать владельцу
          </button>
        </div>

        <p v-else-if="isOwner" class="text-muted mb-0">Это ваше объявление.</p>

        <RouterLink
          v-else
          class="btn btn-primary w-100"
          :to="{ name: 'login', query: { next: loginReturnPath } }"
        >
          Войдите, чтобы связаться с владельцем
        </RouterLink>

        <hr>
        <p class="mb-1 fw-bold">{{ property.ownerName }}</p>
        <p class="text-muted small mb-0">
          Собственник, на сайте с {{ property.ownerSince }} года
        </p>
      </div>
    </div>
  </aside>
</template>
