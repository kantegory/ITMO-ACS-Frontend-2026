<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BaseModal from '@/components/BaseModal.vue'
import RentalCard from '@/components/profile/RentalCard.vue'
import OwnerListingCard from '@/components/profile/OwnerListingCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useTabs } from '@/composables/useTabs'
import { useToast } from '@/composables/useToast'
import { getUserInitials } from '@/utils/formatters'
import { getUserListings, updateListing } from '@/api/listingsApi'
import { getBookings } from '@/api/bookingsApi'
import { updateUser } from '@/api/usersApi'

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const { showToast } = useToast()
const { activeTab, selectTab, handleTabKeydown } = useTabs('renting', ['renting', 'owned'])
const listings = ref([])
const bookings = ref([])
const loading = ref(true)
const editOpen = ref(false)
const saving = ref(false)
const changingId = ref(null)
const edit = reactive({ name: '', email: '', phone: '' })
const rentals = computed(() =>
  bookings.value.filter((item) => Number(item.userId) === Number(user.value.id)),
)
const activeRentals = computed(
  () => rentals.value.filter((item) => item.status === 'active').length,
)
const pendingBookings = computed(
  () => rentals.value.filter((item) => item.status === 'pending').length,
)
function openEdit() {
  Object.assign(edit, {
    name: user.value.name || '',
    email: user.value.email || '',
    phone: user.value.phone || '',
  })
  editOpen.value = true
}
async function saveProfile() {
  saving.value = true
  try {
    const updated = await updateUser(user.value.id, edit)
    auth.updateCurrentUser(updated)
    editOpen.value = false
    showToast('Данные профиля сохранены')
  } catch {
    showToast('Не удалось сохранить профиль')
  } finally {
    saving.value = false
  }
}
async function toggleListing(listing) {
  changingId.value = listing.id
  try {
    const updated = await updateListing(listing.id, { active: !listing.active })
    listings.value = listings.value.map((item) => (item.id === listing.id ? updated : item))
    showToast(updated.active ? 'Объявление снова опубликовано' : 'Объявление скрыто')
  } catch {
    showToast('Не удалось изменить объявление')
  } finally {
    changingId.value = null
  }
}
async function load() {
  try {
    ;[listings.value, bookings.value] = await Promise.all([
      getUserListings(user.value.id),
      getBookings(),
    ])
  } catch {
    showToast('Не удалось загрузить данные профиля')
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<template>
  <main id="main-content" class="rs-main">
    <div class="rs-container">
      <h1 class="rs-page-title">Личный кабинет</h1>
      <section class="rs-card profile-card">
        <div class="profile-avatar">{{ getUserInitials(user.name || user.email) }}</div>
        <div class="profile-info">
          <h2>{{ user.name || user.email }}</h2>
          <p>{{ user.email }} · {{ user.phone || 'Телефон не указан' }}</p>
        </div>
        <button class="btn btn-primary" @click="openEdit">Редактировать профиль</button>
      </section>
      <section class="stats-grid">
        <article class="rs-card stat-card">
          <strong>{{ listings.length }}</strong
          ><span>Мои объявления</span>
        </article>
        <article class="rs-card stat-card">
          <strong>{{ activeRentals }}</strong
          ><span>Активные аренды</span>
        </article>
        <article class="rs-card stat-card">
          <strong>{{ pendingBookings }}</strong
          ><span>Ожидают подтверждения</span>
        </article>
      </section>
      <div class="tabs" role="tablist">
        <button
          v-for="tab in [
            { id: 'renting', label: 'Я арендую' },
            { id: 'owned', label: 'Мои объявления' },
          ]"
          :key="tab.id"
          :data-tab="tab.id"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :class="{ active: activeTab === tab.id }"
          @click="selectTab(tab.id)"
          @keydown="handleTabKeydown($event, tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
      <p v-if="loading" class="status-message">Загрузка данных…</p>
      <section v-else-if="activeTab === 'renting'" class="rental-list">
        <p v-if="!rentals.length" class="rs-muted">У вас пока нет аренд.</p>
        <RentalCard v-for="booking in rentals" :key="booking.id" :booking="booking" />
      </section>
      <section v-else class="owner-grid">
        <p v-if="!listings.length" class="rs-muted">У вас пока нет объявлений.</p>
        <OwnerListingCard
          v-for="listing in listings"
          :key="listing.id"
          :listing="listing"
          :pending="changingId === listing.id"
          :incoming="
            bookings.filter(
              (item) => Number(item.listingId) === Number(listing.id) && item.status === 'pending',
            ).length
          "
          @toggle="toggleListing(listing)"
        />
      </section>
      <BaseModal v-model="editOpen" labelledby="edit-profile-title"
        ><template #title
          ><h2 id="edit-profile-title" class="h4 m-0">Редактировать профиль</h2></template
        >
        <form id="profile-edit-form" class="stack-form" @submit.prevent="saveProfile">
          <div>
            <label class="form-label" for="profile-name">Имя</label
            ><input id="profile-name" v-model.trim="edit.name" class="form-control" required />
          </div>
          <div>
            <label class="form-label" for="profile-email">Email</label
            ><input
              id="profile-email"
              v-model.trim="edit.email"
              class="form-control"
              type="email"
              required
            />
          </div>
          <div>
            <label class="form-label" for="profile-phone">Телефон</label
            ><input id="profile-phone" v-model.trim="edit.phone" class="form-control" required />
          </div>
        </form>
        <template #footer
          ><button class="btn btn-outline-primary" @click="editOpen = false">Отмена</button
          ><button class="btn btn-primary" form="profile-edit-form" :disabled="saving">
            Сохранить
          </button></template
        ></BaseModal
      >
    </div>
  </main>
</template>

<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
}
.profile-avatar {
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--rs-primary-soft);
  color: var(--rs-primary);
  font-size: 25px;
  font-weight: 700;
}
.profile-info {
  flex: 1;
}
.profile-info h2 {
  margin: 0;
}
.profile-info p {
  margin: 5px 0;
  color: var(--rs-muted);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 22px 0;
}
.stat-card {
  padding: 24px;
}
.stat-card strong,
.stat-card span {
  display: block;
}
.stat-card strong {
  font-size: 34px;
  color: var(--rs-primary);
}
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--rs-border);
  margin-top: 30px;
}
.tabs button {
  padding: 12px 18px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: var(--rs-muted);
  font-weight: 600;
}
.tabs button.active {
  color: var(--rs-primary);
  border-color: var(--rs-primary);
}
.rental-list {
  display: grid;
  gap: 16px;
  margin-top: 22px;
}
.owner-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 22px;
}
@media (max-width: 900px) {
  .owner-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 650px) {
  .profile-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .profile-info {
    min-width: 60%;
  }
  .stats-grid,
  .owner-grid {
    grid-template-columns: 1fr;
  }
}
</style>
