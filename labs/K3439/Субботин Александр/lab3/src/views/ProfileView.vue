<script setup>
import { computed, nextTick, reactive, useTemplateRef } from 'vue'

import { dictionariesApi, reviewsApi } from '@/api'
import AccountNav from '@/components/account/AccountNav.vue'
import EditProfileModal from '@/components/account/EditProfileModal.vue'
import FavoritesList from '@/components/account/FavoritesList.vue'
import NextBooking from '@/components/account/NextBooking.vue'
import NotificationsForm from '@/components/account/NotificationsForm.vue'
import ProfileCard from '@/components/account/ProfileCard.vue'
import BreadcrumbsNav from '@/components/ui/BreadcrumbsNav.vue'
import ErrorAlert from '@/components/ui/ErrorAlert.vue'
import LoaderBlock from '@/components/ui/LoaderBlock.vue'
import { useAuth } from '@/composables/useAuth'
import { useBookings } from '@/composables/useBookings'
import { useFavorites } from '@/composables/useFavorites'
import { useRequest } from '@/composables/useRequest'
import { useToast } from '@/composables/useToast'

const { user, refreshUser } = useAuth()
const { showToast } = useToast()

// Профиль в localStorage мог устареть — подтягиваем свежий с сервера
refreshUser().catch((error) => showToast(error.message, 'danger'))

const bookings = reactive(useBookings())
const favorites = reactive(useFavorites())
const reviews = reactive(useRequest(() => reviewsApi.getByUser(user.value.id), { initialData: [] }))
const cuisines = reactive(useRequest(dictionariesApi.getCuisines, { initialData: [] }))

const stats = computed(() => ({
  visits: bookings.loading ? null : bookings.counts.completed,
  reviews: reviews.loading ? null : reviews.data.length,
  favorites: favorites.loading ? null : favorites.favorites.length,
}))

const editModal = useTemplateRef('editModal')
const favoritesList = useTemplateRef('favoritesList')
const favoritesTitle = useTemplateRef('favoritesTitle')

async function removeFavorite(favorite, index) {
  try {
    await favorites.remove(favorite)
    showToast(`«${favorite.restaurant.name}» удалён из избранного`, 'secondary')
    // Удалённая кнопка была в фокусе — переводим его на соседнюю карточку или на заголовок блока
    await nextTick()
    if (!favoritesList.value?.focusNear(index)) favoritesTitle.value.focus()
  } catch (error) {
    showToast(error.message, 'danger')
  }
}
</script>

<template>
  <div class="container py-4">
    <BreadcrumbsNav :items="[{ label: 'Личный кабинет' }]" />
    <h1 class="mb-4">Личный кабинет</h1>

    <div class="row g-4">
      <div class="col-lg-4">
        <ProfileCard :user="user" :stats="stats" @edit="(trigger) => editModal.show(trigger)" />
        <AccountNav />
      </div>

      <div class="col-lg-8">
        <section class="account-section mb-4" aria-labelledby="nextBookingTitle">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 id="nextBookingTitle" class="h4 mb-0">Ближайшее бронирование</h2>
            <RouterLink :to="{ name: 'bookings' }">Все брони</RouterLink>
          </div>
          <LoaderBlock v-if="bookings.loading" />
          <ErrorAlert v-else-if="bookings.error" :message="bookings.error.message" />
          <NextBooking v-else-if="bookings.nextBooking" :booking="bookings.nextBooking" />
          <p v-else class="text-muted-warm mb-0">
            Предстоящих броней нет. <RouterLink :to="{ name: 'search' }">Выберите ресторан</RouterLink> на вечер.
          </p>
        </section>

        <section id="favorites" class="account-section mb-4" aria-labelledby="favoritesTitle">
          <h2 id="favoritesTitle" ref="favoritesTitle" class="h4 mb-3" tabindex="-1">Избранные рестораны</h2>
          <LoaderBlock v-if="favorites.loading" />
          <ErrorAlert v-else-if="favorites.error" :message="favorites.error.message" />
          <FavoritesList
            v-else-if="favorites.favorites.length"
            ref="favoritesList"
            :favorites="favorites.favorites"
            :cuisines="cuisines.data"
            @remove="removeFavorite"
          />
          <p v-else class="text-muted-warm mb-0">
            В избранном пока пусто. <RouterLink :to="{ name: 'search' }">Найдите ресторан</RouterLink> и нажмите «В избранное».
          </p>
        </section>

        <section id="notifications" class="account-section" aria-labelledby="notificationsTitle">
          <h2 id="notificationsTitle" class="h4 mb-3">Уведомления</h2>
          <NotificationsForm />
        </section>
      </div>
    </div>

    <EditProfileModal ref="editModal" />
  </div>
</template>
