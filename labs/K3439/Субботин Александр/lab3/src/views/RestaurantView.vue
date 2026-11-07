<script setup>
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { dictionariesApi, restaurantsApi } from '@/api'
import BookingModal from '@/components/restaurant/BookingModal.vue'
import QuickBookingForm from '@/components/restaurant/QuickBookingForm.vue'
import RatingPill from '@/components/restaurant/RatingPill.vue'
import RestaurantGallery from '@/components/restaurant/RestaurantGallery.vue'
import RestaurantMenu from '@/components/restaurant/RestaurantMenu.vue'
import RestaurantReviews from '@/components/restaurant/RestaurantReviews.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseTabs from '@/components/ui/BaseTabs.vue'
import BreadcrumbsNav from '@/components/ui/BreadcrumbsNav.vue'
import ErrorAlert from '@/components/ui/ErrorAlert.vue'
import LoaderBlock from '@/components/ui/LoaderBlock.vue'
import { useAuth } from '@/composables/useAuth'
import { useFavorites } from '@/composables/useFavorites'
import { usePageTitle } from '@/composables/usePageTitle'
import { useRequest } from '@/composables/useRequest'
import { useToast } from '@/composables/useToast'
import { formatMoney, formatRating, pluralReviews, ratingOf } from '@/utils/format'

// id приходит из адреса /restaurants/:id (props: true в маршруте)
const props = defineProps({
  id: { type: Number, required: true },
})

const route = useRoute()
const router = useRouter()
const { isLoggedIn } = useAuth()
const { showToast } = useToast()

const { data: restaurant, loading, error } = useRequest(() => restaurantsApi.getById(props.id))
const { data: features } = useRequest(dictionariesApi.getFeatures, { initialData: [] })

usePageTitle(() => restaurant.value?.name)

const featureNames = computed(() => Object.fromEntries(features.value.map((feature) => [feature.id, feature.name])))
const badges = computed(() => [restaurant.value.cuisine.name, ...restaurant.value.features.map((id) => featureNames.value[id])])
const featureList = computed(() => [
  `Район: ${restaurant.value.district.name}`,
  ...restaurant.value.features.map((id) => featureNames.value[id]),
  'Оплата картой и по QR-коду',
])
const rating = computed(() => ratingOf(restaurant.value.reviews))
const phoneHref = computed(() => `tel:${restaurant.value.phone.replace(/[^\d+]/g, '')}`)
const errorMessage = computed(() => (error.value?.status === 404
  ? 'Такого ресторана нет. Возможно, ссылка устарела.'
  : error.value?.message))

// ---------- Вкладки ----------

const tabs = [
  { id: 'about', label: 'О ресторане' },
  { id: 'menu', label: 'Меню' },
  { id: 'reviews', label: 'Отзывы' },
]
const activeTab = ref('about')

// Ссылка «N отзывов» в шапке открывает вкладку отзывов. Фокус — на открытую панель,
// чтобы следующий Tab шёл по отзывам, а не по шапке
async function openReviews() {
  activeTab.value = 'reviews'
  await nextTick()
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  document.querySelector('#reviews-tab').scrollIntoView({ behavior, block: 'start' })
  document.querySelector('#reviews').focus({ preventScroll: true })
}

// ---------- Бронирование и избранное ----------

const bookingModal = useTemplateRef('bookingModal')

function openBooking(event) {
  bookingModal.value.open({}, event.currentTarget)
}

function onQuickPick(choice, trigger) {
  bookingModal.value.open(choice, trigger)
}

const { findFavorite, toggle } = useFavorites({ restaurantId: props.id })
const isFavorite = computed(() => Boolean(findFavorite(props.id)))
const favoriteBusy = ref(false)

async function toggleFavorite() {
  if (!isLoggedIn.value) {
    router.push({ name: 'login', query: { next: route.fullPath } })
    return
  }
  favoriteBusy.value = true
  try {
    const added = await toggle(props.id)
    showToast(added ? 'Ресторан добавлен в избранное' : 'Ресторан удалён из избранного', added ? 'success' : 'secondary')
  } catch (toggleError) {
    showToast(toggleError.message, 'danger')
  } finally {
    favoriteBusy.value = false
  }
}

// Кнопки «Забронировать» ведут на /restaurants/N#booking — сразу открываем форму брони,
// а «Оставить отзыв» из истории броней — на #reviews
watch(restaurant, async (loaded) => {
  if (!loaded) return
  await nextTick()
  if (route.hash === '#booking') bookingModal.value.open()
  if (route.hash === '#reviews') activeTab.value = 'reviews'
}, { once: true })
</script>

<template>
  <div class="container py-4">
    <BreadcrumbsNav :items="[{ label: 'Рестораны', to: { name: 'search' } }, { label: restaurant?.name ?? 'Ресторан' }]" />

    <LoaderBlock v-if="loading" text="Загружаем ресторан…" />
    <template v-else-if="error">
      <ErrorAlert :message="errorMessage" />
      <RouterLink class="btn btn-primary" :to="{ name: 'search' }">Все рестораны</RouterLink>
    </template>

    <template v-else-if="restaurant">
      <div class="row g-3 align-items-end mb-4">
        <div class="col-lg-8">
          <div class="d-flex flex-wrap gap-2 mb-2">
            <span v-for="badge in badges" :key="badge" class="badge badge-soft">{{ badge }}</span>
          </div>
          <h1 class="display-5 mb-3">{{ restaurant.name }}</h1>
          <ul class="meta-list">
            <li>
              <RatingPill :value="rating.value" :label="rating.count ? `Рейтинг ${formatRating(rating.value)} из 5` : 'Рейтинга пока нет'" />
              <a href="#reviews" @click.prevent="openReviews">{{ pluralReviews(rating.count) }}</a>
            </li>
            <li><AppIcon name="pin" /><span>{{ restaurant.address }} · м. {{ restaurant.metro }}</span></li>
            <li><AppIcon name="clock" /><span>Ежедневно {{ restaurant.hours }}</span></li>
            <li><AppIcon name="wallet" /><span>Средний чек <span aria-hidden="true">~</span><span class="visually-hidden">около </span>{{ formatMoney(restaurant.avgCheck) }}</span></li>
          </ul>
        </div>
        <div class="col-lg-4 d-flex flex-wrap gap-2 justify-content-lg-end">
          <button
            class="btn btn-outline-primary favorite-btn"
            :class="{ active: isFavorite }"
            type="button"
            :aria-pressed="String(isFavorite)"
            :disabled="favoriteBusy"
            @click="toggleFavorite"
          >
            <AppIcon name="heart" />
            {{ isFavorite ? 'В избранном' : 'В избранное' }}
          </button>
          <button class="btn btn-primary" type="button" @click="openBooking">
            <AppIcon name="calendar" />
            Забронировать
          </button>
        </div>
      </div>

      <RestaurantGallery :photos="restaurant.gallery" />

      <div class="row g-4">
        <div class="col-lg-8">
          <BaseTabs v-model="activeTab" :tabs="tabs">
            <template #about>
              <h2 class="h4">О ресторане</h2>
              <p v-for="paragraph in restaurant.description" :key="paragraph">{{ paragraph }}</p>
              <h3 class="h5 mt-4">Особенности</h3>
              <ul class="feature-list">
                <li v-for="feature in featureList" :key="feature">{{ feature }}</li>
              </ul>
            </template>

            <template #menu>
              <h2 class="visually-hidden">Меню</h2>
              <RestaurantMenu :items="restaurant.menu" />
            </template>

            <template #reviews>
              <RestaurantReviews
                :restaurant-id="restaurant.id"
                :reviews="restaurant.reviews"
                @created="(review) => restaurant.reviews.push(review)"
              />
            </template>
          </BaseTabs>
        </div>

        <div class="col-lg-4">
          <aside id="booking" class="booking-card" aria-labelledby="bookingCardTitle">
            <h2 id="bookingCardTitle" class="h5">Забронировать столик</h2>
            <QuickBookingForm @pick="onQuickPick" />

            <hr>
            <ul class="list-unstyled contact-list mb-3">
              <li><AppIcon name="phone" /><a :href="phoneHref">{{ restaurant.phone }}</a></li>
              <li><AppIcon name="pin" /><span>{{ restaurant.address }}</span></li>
              <li><AppIcon name="clock" /><span>{{ restaurant.hours }}, без выходных</span></li>
            </ul>
            <div class="map-placeholder" role="img" aria-label="Схема проезда к ресторану">
              <span class="map-pin"><AppIcon name="pin" /></span>
            </div>
          </aside>
        </div>
      </div>

      <BookingModal ref="bookingModal" :restaurant="restaurant" />
    </template>
  </div>
</template>
