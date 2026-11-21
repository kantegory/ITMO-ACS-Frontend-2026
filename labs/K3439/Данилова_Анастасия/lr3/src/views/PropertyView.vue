<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'
import { formatPrice, TYPE_NAMES } from '../format'
import { useAuth } from '../composables/useAuth'
import { useRequest } from '../composables/useRequest'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { pending, error, run } = useRequest()
const property = ref(null)
const photo = ref(0)
const booking = ref(null)
const dates = reactive({ start: '', end: '' })
const notice = ref('')
const total = computed(() => {
  const days = (Date.parse(dates.end) - Date.parse(dates.start)) / 86400000
  return days > 0 ? Math.round(days / 30 * property.value.pricePerMonth) : 0
})

onMounted(() => run(async () => {
  const response = await api.get('/properties/' + encodeURIComponent(route.params.id))
  property.value = response.data
}))

function openBooking() {
  if (!user.value) return router.push({ name: 'login' })
  booking.value.showModal()
}

function requestRental() {
  return run(async () => {
    const p = property.value
    await api.post('/rentals', {
      propertyId: p.id,
      userId: user.value.id,
      landlordId: p.userId,
      startDate: dates.start,
      endDate: dates.end,
      totalPrice: total.value,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    })
    booking.value.close()
    dates.start = ''
    dates.end = ''
    notice.value = 'Заявка отправлена. Статус доступен в личном кабинете.'
  })
}

function openChat() {
  if (!user.value) return router.push({ name: 'login' })
  return run(async () => {
    const p = property.value
    const tenant = user.value
    const { data } = await api.get('/chats', { params: { propertyId: p.id, tenantId: tenant.id } })
    const chat = data[0] || (await api.post('/chats', {
      propertyId: p.id,
      tenantId: tenant.id,
      tenantName: tenant.firstName + ' ' + tenant.lastName,
      landlordId: p.userId,
      landlordName: p.ownerName
    })).data
    await router.push({ name: 'messages', query: { chat: chat.id } })
  })
}
</script>

<template>
  <RouterLink class="back-link" to="/">Назад к поиску</RouterLink>
  <p v-if="error" role="alert" class="alert alert-danger mt-3">{{ error }}</p>
  <p v-if="!property && pending" role="status" class="mt-3">Загружаем объявление…</p>
  <div v-if="property" class="row g-4 mt-1">
    <section v-if="property.images?.length" class="col-lg-7" aria-label="Фотографии объекта">
      <img class="w-100 rounded property-photo" :src="property.images[photo]" :alt="'Фото ' + (photo + 1) + ': ' + property.title">
      <div class="d-flex align-items-center gap-3 mt-2">
        <button class="btn btn-outline-secondary btn-sm" :disabled="photo === 0" @click="photo--">Предыдущее фото</button>
        <span role="status">{{ photo + 1 }} / {{ property.images.length }}</span>
        <button class="btn btn-outline-secondary btn-sm" :disabled="photo === property.images.length - 1" @click="photo++">Следующее фото</button>
      </div>
    </section>
    <section class="col-lg-5">
      <span class="badge text-bg-secondary">{{ TYPE_NAMES[property.type] }}</span>
      <h1 class="h3 mt-2">{{ property.title }}</h1>
      <p>{{ property.city }}, {{ property.address }}</p>
      <p class="price">{{ formatPrice(property.pricePerMonth) }} / мес</p>
      <p>{{ property.description }}</p>
      <ul v-if="property.amenities?.length">
        <li v-for="amenity in property.amenities" :key="amenity">{{ amenity }}</li>
      </ul>
      <h2 class="h5">Условия аренды</h2>
      <ul>
        <li>Минимальный срок — {{ property.minTerm }} мес.</li>
        <li>Залог — {{ formatPrice(property.deposit) }}</li>
        <li>Коммунальные услуги {{ property.utilitiesIncluded ? 'включены' : 'оплачиваются отдельно' }}</li>
        <li>{{ property.petsAllowed ? 'Можно с питомцами' : 'Без питомцев' }}</li>
      </ul>
      <p>Владелец — {{ property.ownerName }}</p>
      <p v-if="user?.id === property.userId">Это ваше объявление</p>
      <p v-else-if="!property.isAvailable">Сейчас сдано</p>
      <div v-else class="d-grid gap-2">
        <button class="btn btn-primary" :disabled="pending" @click="openBooking">Арендовать</button>
        <button class="btn btn-outline-secondary" :disabled="pending" @click="openChat">Написать владельцу</button>
      </div>
      <p v-if="notice" class="alert alert-success mt-3" role="status">{{ notice }}</p>
    </section>
  </div>
  <dialog ref="booking" class="card-dialog surface" aria-labelledby="booking-title">
    <form class="d-grid gap-2" @submit.prevent="requestRental">
      <h2 id="booking-title" class="h5">Заявка на аренду</h2>
      <label for="start">Заезд</label>
      <input id="start" v-model="dates.start" class="form-control" type="date" required>
      <label for="end">Выезд</label>
      <input id="end" v-model="dates.end" class="form-control" type="date" required>
      <p role="status">{{ total ? 'Итого: ' + formatPrice(total) : 'Выберите даты. Выезд должен быть позже заезда.' }}</p>
      <p v-if="error" role="alert">{{ error }}</p>
      <div class="d-flex gap-2">
        <button class="btn btn-primary" :disabled="pending || !total">Отправить заявку</button>
        <button class="btn btn-outline-secondary" type="button" @click="booking.close()">Закрыть</button>
      </div>
    </form>
  </dialog>
</template>
