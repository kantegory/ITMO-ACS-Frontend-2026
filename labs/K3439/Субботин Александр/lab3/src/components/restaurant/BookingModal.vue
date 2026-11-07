<script setup>
import { reactive, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'

import { bookingsApi } from '@/api'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useAuth } from '@/composables/useAuth'
import { useFormValidation } from '@/composables/useFormValidation'
import { useToast } from '@/composables/useToast'
import { GUEST_OPTIONS, TIME_SLOTS, ZONES } from '@/utils/booking'
import { formatDate, pluralGuests, todayISO } from '@/utils/format'

const props = defineProps({
  restaurant: { type: Object, required: true },
})

const route = useRoute()
const { user, isLoggedIn } = useAuth()
const { showToast } = useToast()

const modal = useTemplateRef('modal')
const form = useTemplateRef('form')
const { validated, submitting, formError, resync, onSubmit, resetValidation } = useFormValidation(form)

const emptyBooking = () => ({
  date: todayISO(),
  time: null,
  guests: 2,
  zone: ZONES[0],
  phone: '',
  comment: '',
  remind: true,
})
const booking = reactive(emptyBooking())

// Открыть форму; из быстрой формы в сайдбаре приходят уже выбранные дата, время и гости
function open(preset = {}, trigger) {
  const slot = TIME_SLOTS.find((item) => item.time === preset.time)
  Object.assign(booking, {
    ...(preset.date && { date: preset.date }),
    ...(preset.guests && { guests: preset.guests }),
    ...(slot && !slot.busy && { time: slot.time }),
  })
  modal.value.show(trigger)
}

function onShow() {
  if (isLoggedIn.value && !booking.phone) booking.phone = user.value.phone ?? ''
}

const submit = onSubmit(async () => {
  const created = await bookingsApi.create({
    userId: user.value.id,
    restaurantId: props.restaurant.id,
    date: booking.date,
    time: booking.time,
    guests: booking.guests,
    zone: booking.zone,
    phone: booking.phone,
    comment: booking.comment.trim(),
    remind: booking.remind,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  })

  modal.value.hide()
  showToast(`Столик забронирован: ${formatDate(created.date)}, ${created.time}, ${pluralGuests(created.guests)}. Бронь № ${created.id} — в разделе «Мои брони».`)
  Object.assign(booking, emptyBooking())
  resetValidation()
})

defineExpose({ open })
</script>

<template>
  <BaseModal ref="modal" labelledby="bookingModalTitle" dialog-class="modal-lg modal-dialog-scrollable" @show="onShow">
    <form
      ref="form"
      class="modal-content needs-validation"
      :class="{ 'was-validated': validated }"
      novalidate
      @submit.prevent="submit"
      @input="resync"
      @change="resync"
    >
      <div class="modal-header">
        <h2 id="bookingModalTitle" class="modal-title h5">Бронирование · {{ restaurant.name }}</h2>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
      </div>
      <div class="modal-body">
        <div v-if="!isLoggedIn" class="alert alert-warning">
          Бронировать могут только зарегистрированные гости.
          <RouterLink :to="{ name: 'login', query: { next: route.path } }">Войдите</RouterLink>
          или <RouterLink :to="{ name: 'register' }">создайте аккаунт</RouterLink> — это займёт минуту.
        </div>
        <div class="row g-3">
          <div class="col-sm-6">
            <label class="form-label" for="bookingDate">Дата</label>
            <input id="bookingDate" v-model="booking.date" class="form-control" type="date" :min="todayISO()" required aria-errormessage="bookingDateError">
            <div id="bookingDateError" class="invalid-feedback">Выберите дату не раньше сегодняшней.</div>
          </div>
          <div class="col-sm-6">
            <label class="form-label" for="bookingGuests">Количество гостей</label>
            <select id="bookingGuests" v-model.number="booking.guests" class="form-select" required>
              <option v-for="count in GUEST_OPTIONS" :key="count" :value="count">{{ count }}</option>
            </select>
          </div>
          <fieldset id="bookingTimeGroup" class="col-12 time-slots" role="radiogroup" aria-errormessage="bookingTimeError">
            <legend class="form-label fs-6">Время <span class="small text-muted-warm">(зачёркнутые слоты уже заняты)</span></legend>
            <div class="d-flex flex-wrap gap-2">
              <template v-for="slot in TIME_SLOTS" :key="slot.time">
                <input
                  :id="`slot-${slot.time.replace(':', '')}`"
                  v-model="booking.time"
                  class="btn-check"
                  name="time"
                  type="radio"
                  :value="slot.time"
                  :disabled="slot.busy"
                  required
                >
                <label class="btn btn-outline-primary btn-sm" :for="`slot-${slot.time.replace(':', '')}`">{{ slot.time }}<span v-if="slot.busy" class="visually-hidden">, занято</span></label>
              </template>
            </div>
            <div id="bookingTimeError" class="invalid-feedback">Выберите свободное время.</div>
          </fieldset>
          <div class="col-sm-6">
            <label class="form-label" for="bookingZone">Зона</label>
            <select id="bookingZone" v-model="booking.zone" class="form-select">
              <option v-for="zone in ZONES" :key="zone">{{ zone }}</option>
            </select>
          </div>
          <div class="col-sm-6">
            <label class="form-label" for="bookingPhone">Телефон для связи</label>
            <input
              id="bookingPhone"
              v-model="booking.phone"
              class="form-control"
              type="tel"
              autocomplete="tel"
              pattern="^\+?[0-9\s\-\(\)]{10,18}$"
              required
              aria-errormessage="bookingPhoneError"
            >
            <div id="bookingPhoneError" class="invalid-feedback">Например: +7 900 123-45-67.</div>
          </div>
          <div class="col-12">
            <label class="form-label" for="bookingComment">Пожелания</label>
            <input id="bookingComment" v-model="booking.comment" class="form-control" type="text" maxlength="200" placeholder="Например, детский стул или столик у окна">
          </div>
          <div class="col-12">
            <div class="form-check">
              <input id="bookingRemind" v-model="booking.remind" class="form-check-input" type="checkbox">
              <label class="form-check-label" for="bookingRemind">Напомнить о визите за 2 часа</label>
            </div>
          </div>
        </div>
        <div v-if="formError" class="alert alert-danger mt-3 mb-0" role="alert">{{ formError }}</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отмена</button>
        <button type="submit" class="btn btn-primary" :disabled="!isLoggedIn || submitting">Подтвердить бронь</button>
      </div>
    </form>
  </BaseModal>
</template>
