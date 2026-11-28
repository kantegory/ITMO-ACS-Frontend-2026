<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import AlertBanner from '@/components/common/AlertBanner.vue'
import SvgIcon from '@/components/common/SvgIcon.vue'
import PropertyGallery from '@/components/properties/PropertyGallery.vue'
import PropertySidebar from '@/components/properties/PropertySidebar.vue'
import BookingModal from '@/components/properties/BookingModal.vue'
import MessageOwnerModal from '@/components/properties/MessageOwnerModal.vue'
import { messagesApi, propertiesApi, viewingsApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useAsyncState } from '@/composables/useAsyncState'
import { useNotice } from '@/composables/useNotice'
import { useFormatters } from '@/composables/useFormatters'

const route = useRoute()
const auth = useAuthStore()
const { loading, error, run } = useAsyncState(true)
const { notice, showSuccess, showError, clearNotice } = useNotice()
const { formatAddress, formatDate, formatPrice, formatYesNo } = useFormatters()

const property = ref(null)
const submitting = ref(false)
const bookingModalRef = ref(null)
const messageModalRef = ref(null)
let activePropertyRequest = 0

function hasValue([, value]) {
  return value !== undefined && value !== null && value !== ''
}

const fullAddress = computed(() => formatAddress(property.value))
const isOwner = computed(() => Boolean(auth.user && property.value && auth.user.id === property.value.userId))

const terms = computed(() => {
  const item = property.value
  if (!item) return []
  return [
    ['Стоимость', `${formatPrice(item.price)} в месяц`],
    ['Залог', item.deposit !== undefined ? formatPrice(item.deposit) : undefined],
    ['Коммунальные услуги', item.utilities],
    ['Минимальный срок', item.minTerm],
    ['Можно с детьми', item.kids === undefined ? undefined : formatYesNo(item.kids)],
    ['Можно с животными', item.pets === undefined ? undefined : formatYesNo(item.pets)],
  ].filter(hasValue)
})

const features = computed(() => {
  const item = property.value
  if (!item) return []
  return [
    ['Комнат', item.rooms],
    ['Общая площадь', item.area && `${item.area} м²`],
    ['Этаж', item.floor && item.floors ? `${item.floor} из ${item.floors}` : undefined],
    ['Мебель и бытовая техника', item.furniture === undefined ? undefined : formatYesNo(item.furniture)],
    ['Балкон', item.balcony === undefined ? undefined : formatYesNo(item.balcony)],
  ].filter(hasValue)
})

async function loadProperty(id) {
  const requestId = ++activePropertyRequest
  property.value = null
  clearNotice()
  try {
    const data = await run(() => propertiesApi.getById(id), {
      mapError: (err) => (err.status === 404 ? 'Объявление не найдено' : err.message),
    })
    if (requestId !== activePropertyRequest || route.name !== 'property') return
    property.value = data
    document.title = `${data.title} — Аренда жилья`
  } catch {
    // Ошибка уже записана в error через useAsyncState
  }
}

watch(
  () => route.params.id,
  (id) => {
    if (id) loadProperty(id)
  },
  { immediate: true },
)

async function handleBookViewing({ date, time }) {
  if (!property.value || !auth.user || submitting.value) return
  submitting.value = true
  clearNotice()
  try {
    await viewingsApi.create({
      propertyId: property.value.id,
      userId: auth.user.id,
      date,
      time,
    })
    await messagesApi.sendToOwner(
      property.value,
      auth.user,
      `Хочу посмотреть объект ${formatDate(date)} в ${time}.`,
    )
    bookingModalRef.value?.hide()
    showSuccess('Вы записаны на просмотр! Владелец подтвердит время в сообщениях.')
  } catch (requestError) {
    bookingModalRef.value?.hide()
    showError(requestError.message)
  } finally {
    submitting.value = false
  }
}

async function handleSendMessage(text) {
  if (!property.value || !auth.user || submitting.value) return
  submitting.value = true
  clearNotice()
  try {
    await messagesApi.sendToOwner(property.value, auth.user, text)
    messageModalRef.value?.hide()
    showSuccess('Сообщение отправлено владельцу.')
  } catch (requestError) {
    messageModalRef.value?.hide()
    showError(requestError.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppLayout>
    <p v-if="loading" class="text-muted" role="status">Загрузка объявления…</p>
    <AlertBanner :message="error" type="danger" />

    <div v-if="property">
      <nav aria-label="Навигационная цепочка">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <RouterLink :to="{ name: 'search' }">Поиск</RouterLink>
          </li>
          <li class="breadcrumb-item active" aria-current="page">{{ property.title }}</li>
        </ol>
      </nav>

      <h1 class="h2">{{ property.title }}</h1>
      <p class="text-muted">
        <SvgIcon name="location" /> {{ fullAddress }}
      </p>

      <AlertBanner v-if="notice" :message="notice.text" :type="notice.type" />

      <div class="row g-4">
        <div class="col-lg-8">
          <PropertyGallery :property="property" />

          <template v-if="property.description">
            <h2 class="h4">Описание</h2>
            <p>{{ property.description }}</p>
          </template>

          <template v-if="terms.length">
            <h2 id="termsTitle" class="h4 mt-4">Условия аренды</h2>
            <table class="table" aria-labelledby="termsTitle">
              <tbody>
                <tr v-for="[name, value] in terms" :key="name">
                  <th scope="row">{{ name }}</th>
                  <td>{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </template>

          <template v-if="features.length">
            <h2 class="h4 mt-4">Характеристики</h2>
            <ul>
              <li v-for="[name, value] in features" :key="name">
                {{ name }}: {{ value }}
              </li>
            </ul>
          </template>
        </div>

        <PropertySidebar
          :property="property"
          :is-authenticated="auth.isAuthenticated"
          :is-owner="isOwner"
          :login-return-path="route.fullPath"
          @book="bookingModalRef?.show()"
          @message="messageModalRef?.show()"
        />
      </div>

      <BookingModal
        ref="bookingModalRef"
        :submitting="submitting"
        @submit="handleBookViewing"
      />
      <MessageOwnerModal
        ref="messageModalRef"
        :submitting="submitting"
        @submit="handleSendMessage"
      />
    </div>
  </AppLayout>
</template>
