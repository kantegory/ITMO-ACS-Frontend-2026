<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'
import { formatPrice } from '../format'
import { useAuth } from '../composables/useAuth'
import { useRentals } from '../composables/useRentals'
import { useRequest } from '../composables/useRequest'
import RentalTable from '../components/RentalTable.vue'
import PropertyForm from '../components/PropertyForm.vue'

const { user } = useAuth()
const owner = user.value
const { outgoing, incoming, loadRentals } = useRentals(owner.id)
const { pending, error, run } = useRequest()
const properties = ref([])
const propertyForm = ref(null)
const notice = ref('')

async function loadProperties() {
  const { data } = await api.get('/properties', { params: { userId: owner.id } })
  properties.value = data
}

onMounted(() => run(() => Promise.all([loadProperties(), loadRentals()])))

function updateStatus(rental, status) {
  return run(async () => {
    const { data } = await api.patch('/rentals/' + rental.id, { status })
    rental.status = data.status
  })
}

function saveProperty(fields) {
  return run(async () => {
    const { data } = await api.post('/properties', {
      ...fields,
      amenities: fields.amenities.split(',').map(item => item.trim()).filter(Boolean),
      userId: owner.id,
      ownerName: owner.firstName + ' ' + owner.lastName,
      images: ['https://picsum.photos/seed/' + Date.now() + '/900/600'],
      minTerm: 1,
      deposit: fields.pricePerMonth,
      utilitiesIncluded: false,
      petsAllowed: false,
      isAvailable: true
    })
    properties.value.push(data)
    propertyForm.value.reset()
    notice.value = 'Объявление добавлено'
  })
}
</script>

<template>
  <h1 class="h3">Личный кабинет</h1>
  <p>{{ owner.firstName }} {{ owner.lastName }} · {{ owner.email }}</p>
  <p v-if="error" role="alert" class="alert alert-danger">{{ error }}</p>
  <p v-if="pending" role="status">Выполняется запрос…</p>
  <section class="mt-4" aria-labelledby="my-rentals">
    <h2 id="my-rentals" class="h5">Мои заявки на аренду</h2>
    <RentalTable :rentals="outgoing" caption="Мои заявки на аренду" />
  </section>
  <section class="mt-4" aria-labelledby="incoming">
    <h2 id="incoming" class="h5">Заявки на мои объекты</h2>
    <RentalTable :rentals="incoming" caption="Заявки на мои объекты">
      <template #actions="{ rental }">
        <div v-if="rental.status === 'PENDING'" class="d-flex gap-2 mt-2">
          <button class="btn btn-success btn-sm" :disabled="pending" @click="updateStatus(rental, 'APPROVED')">Одобрить</button>
          <button class="btn btn-outline-danger btn-sm" :disabled="pending" @click="updateStatus(rental, 'REJECTED')">Отклонить</button>
        </div>
      </template>
    </RentalTable>
  </section>
  <div class="row g-4 mt-2">
    <section class="col-md-6" aria-labelledby="my-properties">
      <h2 id="my-properties" class="h5">Мои объявления</h2>
      <p v-if="!properties.length">Объявлений пока нет</p>
      <ul v-else class="list-group">
        <li v-for="property in properties" :key="property.id" class="list-group-item">
          <RouterLink :to="{ name: 'property', params: { id: property.id } }">{{ property.title }}</RouterLink>
          · {{ formatPrice(property.pricePerMonth) }} / мес
        </li>
      </ul>
    </section>
    <section class="col-md-6" aria-labelledby="add-property">
      <h2 id="add-property" class="h5">Новое объявление</h2>
      <p v-if="notice" class="alert alert-success" role="status">{{ notice }}</p>
      <PropertyForm ref="propertyForm" :pending="pending" @save="saveProperty" />
    </section>
  </div>
</template>
