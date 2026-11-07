<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ListingGallery from '@/components/listing/ListingGallery.vue'
import BookingPanel from '@/components/listing/BookingPanel.vue'
import { getListing } from '@/api/listingsApi'
import { createBooking } from '@/api/bookingsApi'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { formatPrice } from '@/utils/formatters'
import galleryKitchen from '@/assets/gallery-kitchen.png'
import galleryBedroom from '@/assets/gallery-bedroom.png'
import galleryBath from '@/assets/gallery-bath.png'
import galleryHall from '@/assets/gallery-hall.png'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { showToast } = useToast()
const listing = ref(null)
const loading = ref(true)
const error = ref('')
const pending = ref(false)
const contactMode = ref('chat')
const images = computed(() =>
  listing.value
    ? [`/${listing.value.image}`, galleryKitchen, galleryBedroom, galleryBath, galleryHall]
    : [],
)

async function load() {
  loading.value = true
  error.value = ''
  try {
    listing.value = await getListing(route.params.id)
    document.title = `${listing.value.title} — RentSpace`
  } catch {
    error.value = 'Объект не найден или не удалось загрузить данные.'
  } finally {
    loading.value = false
  }
}
async function book(data) {
  if (!auth.isAuthenticated) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  pending.value = true
  try {
    await createBooking({
      userId: auth.user.id,
      listingId: listing.value.id,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
    showToast('Заявка на бронирование успешно отправлена')
  } catch {
    showToast('Не удалось отправить заявку')
  } finally {
    pending.value = false
  }
}
async function contact() {
  if (!auth.isAuthenticated) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  if (contactMode.value === 'chat')
    await router.push({ name: 'activity', query: { listing: listing.value.id } })
  else showToast('Обращение создано. Владелец увидит ваш номер телефона.')
}
onMounted(load)
watch(() => route.params.id, load)
</script>

<template>
  <main id="main-content" class="rs-main">
    <div class="rs-container">
      <p v-if="loading" class="status-message">Загрузка объекта…</p>
      <section v-else-if="error" class="rs-card empty-state">
        <h1 class="h3">{{ error }}</h1>
        <RouterLink class="btn btn-primary" :to="{ name: 'search' }">Вернуться к поиску</RouterLink>
      </section>
      <template v-else
        ><nav class="breadcrumb-line">
          <RouterLink :to="{ name: 'search' }">Поиск недвижимости</RouterLink><span>/</span
          ><span>{{ listing.title }}</span>
        </nav>
        <h1 class="rs-page-title">{{ listing.title }}</h1>
        <p class="rs-page-subtitle">
          {{ listing.location }}, {{ listing.address }} · {{ listing.type }}
        </p>
        <ListingGallery :images="images" :title="listing.title" />
        <div class="listing-layout">
          <div class="listing-content">
            <article class="rs-card details-card">
              <h2 class="rs-section-title">Об объекте</h2>
              <p>{{ listing.description }}</p>
              <div class="details-grid">
                <div>
                  <span>Тип</span><strong>{{ listing.type }}</strong>
                </div>
                <div>
                  <span>Аренда</span
                  ><strong>{{ listing.mode === 'DAILY' ? 'Посуточно' : 'Помесячно' }}</strong>
                </div>
              </div>
            </article>
            <article class="rs-card details-card">
              <h2 class="rs-section-title">Условия аренды</h2>
              <p class="fs-4 fw-bold">
                {{ formatPrice(listing.price) }} / {{ listing.mode === 'DAILY' ? 'ночь' : 'месяц' }}
              </p>
              <p class="rs-muted">
                Коммунальные услуги и дополнительные условия уточняются у владельца.
              </p>
            </article>
          </div>
          <BookingPanel
            v-if="listing.mode === 'DAILY'"
            :price="listing.price"
            :pending="pending"
            @confirm="book"
          />
          <aside v-else class="rs-card contact-card">
            <div class="booking-price">{{ formatPrice(listing.price) }} / месяц</div>
            <p>Выберите способ связи с владельцем</p>
            <label><input v-model="contactMode" type="radio" value="chat" /> Написать в чате</label
            ><label
              ><input v-model="contactMode" type="radio" value="phone" /> Оставить номер
              телефона</label
            ><button class="btn btn-primary w-100 mt-4" @click="contact">
              Связаться с владельцем
            </button>
          </aside>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.breadcrumb-line {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  color: var(--rs-muted);
}
.breadcrumb-line a {
  color: var(--rs-primary);
}
.listing-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  align-items: start;
  gap: 24px;
}
.listing-content {
  display: grid;
  gap: 20px;
}
.details-card,
.contact-card {
  padding: 26px;
}
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.details-grid span,
.details-grid strong {
  display: block;
}
.details-grid span {
  color: var(--rs-muted);
}
.booking-price {
  margin-bottom: 20px;
  font-size: 25px;
  font-weight: 700;
}
.contact-card {
  display: grid;
  gap: 12px;
  position: sticky;
  top: 24px;
}
.empty-state {
  padding: 50px;
  text-align: center;
}
@media (max-width: 900px) {
  .listing-layout {
    grid-template-columns: 1fr;
  }
  .contact-card {
    position: static;
  }
}
</style>
