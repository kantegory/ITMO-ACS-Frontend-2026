<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { dictionariesApi, restaurantsApi } from '@/api'
import RestaurantCard from '@/components/restaurant/RestaurantCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ErrorAlert from '@/components/ui/ErrorAlert.vue'
import LoaderBlock from '@/components/ui/LoaderBlock.vue'
import { useAuth } from '@/composables/useAuth'
import { useRequest } from '@/composables/useRequest'
import { assetUrl, ratingOf } from '@/utils/format'

const router = useRouter()
const { isLoggedIn } = useAuth()

// reactive() разворачивает refs из useRequest: в шаблоне можно писать cuisines.data, cuisines.loading
const cuisines = reactive(useRequest(dictionariesApi.getCuisines, { initialData: [] }))
const districts = reactive(useRequest(dictionariesApi.getDistricts, { initialData: [] }))

// Популярные = три ресторана с лучшим рейтингом по отзывам
const popular = reactive(useRequest(async () => {
  const restaurants = await restaurantsApi.getAll()
  return restaurants
    .sort((a, b) => ratingOf(b.reviews).value - ratingOf(a.reviews).value)
    .slice(0, 3)
}, { initialData: [] }))

const search = reactive({ q: '', district: '' })

function onSearch() {
  const query = {}
  if (search.q.trim()) query.q = search.q.trim()
  if (search.district) query.district = search.district
  router.push({ name: 'search', query })
}

const steps = [
  { title: 'Найдите ресторан', text: 'Фильтруйте по кухне, району, цене и рейтингу, читайте отзывы гостей.' },
  { title: 'Выберите время', text: 'Укажите дату, время и число гостей — свободные слоты видны сразу.' },
  { title: 'Приходите', text: 'Подтверждение придёт на почту, а все брони хранятся в личном кабинете.' },
]
</script>

<template>
  <section class="hero">
    <div class="container">
      <div class="row align-items-center g-5">
        <div class="col-lg-6">
          <h1 class="hero-title mb-3">Столик на вечер — <span>за минуту</span></h1>
          <p class="lead text-muted-warm mb-4">Выбирайте ресторан по кухне, району и среднему чеку, смотрите меню и отзывы и бронируйте без звонков.</p>

          <form class="hero-search row g-2 align-items-center" @submit.prevent="onSearch">
            <div class="col-12">
              <label class="visually-hidden" for="heroQuery">Название или кухня</label>
              <input id="heroQuery" v-model="search.q" class="form-control form-control-lg" type="search" placeholder="Ресторан или кухня">
            </div>
            <div class="col-sm-7">
              <label class="visually-hidden" for="heroDistrict">Район</label>
              <select id="heroDistrict" v-model="search.district" class="form-select form-select-lg">
                <option value="">Любой район</option>
                <option v-for="district in districts.data" :key="district.id" :value="district.id">{{ district.name }}</option>
              </select>
            </div>
            <div class="col-sm-5 d-grid">
              <button class="btn btn-primary btn-lg" type="submit">
                <AppIcon name="search" />
                Найти
              </button>
            </div>
          </form>

          <dl class="hero-stats row mt-4 mb-0">
            <div class="col-4">
              <dt>120+</dt>
              <dd>ресторанов</dd>
            </div>
            <div class="col-4">
              <dt>4.7</dt>
              <dd>средняя оценка</dd>
            </div>
            <div class="col-4">
              <dt>30 с</dt>
              <dd>на бронь</dd>
            </div>
          </dl>
        </div>
        <div class="col-lg-6 text-center">
          <img class="hero-image" :src="assetUrl('img/hero.svg')" width="480" height="420" alt="Сервированный стол: тарелка с салатом, вилка, нож и бокал">
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h2 class="section-title">Какую кухню хочется сегодня?</h2>
      <p class="text-muted-warm mb-4">Выберите кухню — покажем подходящие рестораны.</p>
      <ErrorAlert v-if="cuisines.error" :message="cuisines.error.message" />
      <div v-else class="cuisine-grid" :aria-busy="cuisines.loading">
        <RouterLink
          v-for="cuisine in cuisines.data"
          :key="cuisine.id"
          class="cuisine-tile"
          :to="{ name: 'search', query: { cuisine: cuisine.id } }"
        >
          <img :src="assetUrl(cuisine.image)" alt="">{{ cuisine.name }}
        </RouterLink>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <div>
          <h2 class="section-title">Популярное на этой неделе</h2>
          <p class="text-muted-warm mb-0">Чаще всего бронируют в эти рестораны.</p>
        </div>
        <RouterLink class="btn btn-outline-primary" :to="{ name: 'search' }">Все рестораны</RouterLink>
      </div>

      <LoaderBlock v-if="popular.loading" text="Загружаем рестораны…" />
      <ErrorAlert v-else-if="popular.error" :message="popular.error.message" />
      <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="restaurant in popular.data" :key="restaurant.id" class="col">
          <RestaurantCard :restaurant="restaurant" heading="h3" />
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h2 class="section-title mb-4">Как это работает</h2>
      <div class="row g-4">
        <div v-for="(step, index) in steps" :key="step.title" class="col-md-4">
          <span class="step-number mb-3">{{ index + 1 }}</span>
          <h3 class="h5">{{ step.title }}</h3>
          <p class="text-muted-warm mb-0">{{ step.text }}</p>
        </div>
      </div>
    </div>
  </section>

  <section v-if="!isLoggedIn" class="section pt-0">
    <div class="container">
      <div class="cta d-md-flex align-items-center justify-content-between gap-4">
        <div>
          <h2 class="h3 mb-2">Регистрация займёт минуту</h2>
          <p class="mb-md-0">Сохраняйте любимые места, управляйте бронями и оставляйте отзывы.</p>
        </div>
        <RouterLink class="btn btn-light btn-lg text-nowrap" :to="{ name: 'register' }">Создать аккаунт</RouterLink>
      </div>
    </div>
  </section>
</template>
