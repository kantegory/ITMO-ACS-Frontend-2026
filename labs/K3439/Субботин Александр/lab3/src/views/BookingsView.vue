<script setup>
import { computed, ref, useTemplateRef } from 'vue'

import AccountNav from '@/components/account/AccountNav.vue'
import BookingItem from '@/components/account/BookingItem.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BreadcrumbsNav from '@/components/ui/BreadcrumbsNav.vue'
import ErrorAlert from '@/components/ui/ErrorAlert.vue'
import LoaderBlock from '@/components/ui/LoaderBlock.vue'
import { useBookings } from '@/composables/useBookings'
import { useToast } from '@/composables/useToast'
import { bookingGroup } from '@/utils/booking'
import { formatDate } from '@/utils/format'

const { bookings, loading, error, counts, cancel } = useBookings()
const { showToast } = useToast()

const FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'upcoming', label: 'Предстоящие' },
  { value: 'completed', label: 'Завершённые' },
  { value: 'cancelled', label: 'Отменённые' },
]
const currentFilter = ref('all')
const visible = computed(() => bookings.value
  .filter((booking) => currentFilter.value === 'all' || bookingGroup(booking) === currentFilter.value))

// ---------- Отмена брони ----------

const cancelModal = useTemplateRef('cancelModal')
const list = useTemplateRef('list')
const bookingToCancel = ref(null)
const cancelling = ref(false)

function askCancel(booking, trigger) {
  bookingToCancel.value = booking
  cancelModal.value.show(trigger)
}

async function confirmCancel() {
  cancelling.value = true
  try {
    await cancel(bookingToCancel.value)
    cancelModal.value.hide()
    showToast('Бронирование отменено', 'secondary')
  } catch (cancelError) {
    showToast(cancelError.message, 'danger')
  } finally {
    cancelling.value = false
  }
}

// Если бронь отменили, кнопки «Отменить» уже нет и BaseModal не может вернуть на неё фокус —
// переводим его на название ресторана в карточке или на текущий фильтр
function onCancelModalHidden() {
  if (document.activeElement !== document.body) return
  const card = list.value?.querySelector(`[data-booking-id="${bookingToCancel.value.id}"] h2 a`)
  ;(card ?? document.querySelector('.booking-filters .active')).focus()
}
</script>

<template>
  <div class="container py-4">
    <BreadcrumbsNav :items="[{ label: 'Личный кабинет', to: { name: 'profile' } }, { label: 'История бронирований' }]" />
    <h1 class="mb-4">История бронирований</h1>

    <div class="row g-4">
      <div class="col-lg-3 d-none d-lg-block">
        <AccountNav />
      </div>

      <div class="col-lg-9">
        <ul class="nav nav-pills booking-filters mb-4" aria-label="Фильтр по статусу">
          <li v-for="filter in FILTERS" :key="filter.value" class="nav-item">
            <button
              class="nav-link"
              :class="{ active: currentFilter === filter.value }"
              type="button"
              :aria-pressed="String(currentFilter === filter.value)"
              @click="currentFilter = filter.value"
            >
              {{ filter.label }} <span class="badge rounded-pill bg-light text-dark">{{ counts[filter.value] }}</span>
            </button>
          </li>
        </ul>

        <p class="visually-hidden" role="status">{{ loading ? '' : `Показано бронирований: ${visible.length}` }}</p>

        <LoaderBlock v-if="loading" text="Загружаем брони…" />
        <ErrorAlert v-else-if="error" :message="error.message" />
        <template v-else>
          <div ref="list" class="d-grid gap-3">
            <BookingItem v-for="booking in visible" :key="booking.id" :booking="booking" @cancel="askCancel" />
          </div>

          <div v-if="!visible.length" class="empty-state text-center py-5">
            <h2 class="h5">Здесь пока пусто</h2>
            <p class="text-muted-warm">В этой категории нет бронирований.</p>
            <RouterLink class="btn btn-primary" :to="{ name: 'search' }">Найти ресторан</RouterLink>
          </div>
        </template>
      </div>
    </div>

    <BaseModal ref="cancelModal" labelledby="cancelModalTitle" @hidden="onCancelModalHidden">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="cancelModalTitle" class="modal-title h5">Отменить бронирование?</h2>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
        </div>
        <div class="modal-body">
          <p v-if="bookingToCancel" class="mb-0">
            Бронь в <strong>{{ bookingToCancel.restaurant.name }}</strong>
            на <strong>{{ formatDate(bookingToCancel.date) }}, {{ bookingToCancel.time }}</strong>
            будет отменена. Ресторан получит уведомление.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Оставить</button>
          <button type="button" class="btn btn-danger" :disabled="cancelling" @click="confirmCancel">Да, отменить</button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
