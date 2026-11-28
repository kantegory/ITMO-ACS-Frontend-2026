<script setup>
import { nextTick, onMounted, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AlertBanner from '@/components/common/AlertBanner.vue'
import ProfileSidebar from '@/components/profile/ProfileSidebar.vue'
import RentalCard from '@/components/profile/RentalCard.vue'
import OwnedPropertiesTable from '@/components/profile/OwnedPropertiesTable.vue'
import ProfileSettingsForm from '@/components/profile/ProfileSettingsForm.vue'
import AddPropertyModal from '@/components/profile/AddPropertyModal.vue'
import { propertiesApi, rentalsApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { usePropertiesStore } from '@/stores/properties'
import { useAsyncState } from '@/composables/useAsyncState'
import { useNotice } from '@/composables/useNotice'

const TABS = [
  { id: 'renting', label: 'Я арендую' },
  { id: 'owning', label: 'Я сдаю' },
  { id: 'settings', label: 'Настройки' },
]

const auth = useAuthStore()
const propertiesStore = usePropertiesStore()
const { loading, error: loadError, run } = useAsyncState(true)
const { notice, showSuccess, showError, clearNotice } = useNotice()

const activeTab = ref(auth.user?.role === 'owner' ? 'owning' : 'renting')
const tabButtonRefs = ref([])
let userSwitchedTab = false

const rentingList = ref([])
const ownedProperties = ref([])
const activeOwnerRentals = ref([])
const savingSettings = ref(false)
const publishingListing = ref(false)
const addModalRef = ref(null)

function selectTab(tabId) {
  userSwitchedTab = true
  activeTab.value = tabId
}

async function handleTabKeydown(event, currentIndex) {
  let nextIndex = null
  if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % TABS.length
  else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + TABS.length) % TABS.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = TABS.length - 1
  if (nextIndex === null) return

  event.preventDefault()
  selectTab(TABS[nextIndex].id)
  await nextTick()
  tabButtonRefs.value[nextIndex]?.focus()
}

async function loadOwning(userId) {
  const [properties, rentals] = await Promise.all([
    propertiesApi.getByOwner(userId),
    rentalsApi.getActiveOwnerRentals(userId),
  ])
  ownedProperties.value = properties
  activeOwnerRentals.value = rentals
}

async function initProfile() {
  try {
    await run(async () => {
      const freshUser = await auth.refreshProfile()
      if (!freshUser) return
      if (!userSwitchedTab && freshUser.role === 'owner') {
        activeTab.value = 'owning'
      }
      const [rentals] = await Promise.all([
        rentalsApi.getTenantRentals(freshUser.id),
        loadOwning(freshUser.id),
      ])
      rentingList.value = rentals
    })
  } catch (requestError) {
    showError(requestError.message)
  }
}

async function handleSaveSettings(fields) {
  if (savingSettings.value) return
  savingSettings.value = true
  clearNotice()
  try {
    await auth.updateProfile(fields)
    showSuccess('Настройки сохранены.')
  } catch (requestError) {
    showError(requestError.message)
  } finally {
    savingSettings.value = false
  }
}

async function handlePublishListing(fields) {
  if (!auth.user || publishingListing.value) return
  publishingListing.value = true
  clearNotice()
  try {
    await propertiesStore.createProperty({
      ...fields,
      deposit: fields.price,
      title: `${fields.type}, ${fields.area} м²`,
      userId: auth.user.id,
      ownerName: auth.fullName,
      ownerSince: auth.user.since,
      photos: [],
    })
    await loadOwning(auth.user.id)
    addModalRef.value?.reset()
    addModalRef.value?.hide()
    selectTab('owning')
    showSuccess('Объявление опубликовано.')
  } catch (requestError) {
    addModalRef.value?.hide()
    showError(requestError.message)
  } finally {
    publishingListing.value = false
  }
}

onMounted(() => {
  initProfile()
})
</script>

<template>
  <AppLayout>
    <AlertBanner v-if="notice" :message="notice.text" :type="notice.type" />

    <div v-if="auth.user" class="row g-4">
      <div class="col-lg-3">
        <ProfileSidebar
          :user="auth.user"
          :initials="auth.initials"
          :full-name="auth.fullName"
          @add-listing="addModalRef?.show()"
        />
      </div>

      <div class="col-lg-9">
        <ul class="nav nav-tabs mb-3" role="tablist" aria-label="Разделы личного кабинета">
          <li v-for="(tab, index) in TABS" :key="tab.id" class="nav-item" role="presentation">
            <button
              :id="`${tab.id}Tab`"
              :ref="(el) => { tabButtonRefs[index] = el }"
              :class="['nav-link', { active: activeTab === tab.id }]"
              type="button"
              role="tab"
              :tabindex="activeTab === tab.id ? 0 : -1"
              :aria-controls="tab.id"
              :aria-selected="activeTab === tab.id ? 'true' : 'false'"
              @click="selectTab(tab.id)"
              @keydown="handleTabKeydown($event, index)"
            >
              {{ tab.label }}
            </button>
          </li>
        </ul>

        <div class="tab-content">
          <div
            v-show="activeTab === 'renting'"
            id="renting"
            role="tabpanel"
            aria-labelledby="rentingTab"
            tabindex="0"
          >
            <p v-if="loading" class="text-muted" role="status">Загрузка…</p>
            <template v-else-if="!loadError">
              <template v-if="rentingList.length">
                <RentalCard v-for="rental in rentingList" :key="rental.id" :rental="rental" />
              </template>
              <p v-else class="text-muted">Вы пока ничего не арендуете.</p>
            </template>
          </div>

          <div
            v-show="activeTab === 'owning'"
            id="owning"
            role="tabpanel"
            aria-labelledby="owningTab"
            tabindex="0"
          >
            <p v-if="loading" class="text-muted" role="status">Загрузка…</p>
            <OwnedPropertiesTable
              v-else-if="!loadError"
              :properties="ownedProperties"
              :active-rentals="activeOwnerRentals"
            />
          </div>

          <div
            v-show="activeTab === 'settings'"
            id="settings"
            role="tabpanel"
            aria-labelledby="settingsTab"
            tabindex="0"
          >
            <ProfileSettingsForm
              :user="auth.user"
              :saving="savingSettings"
              @save="handleSaveSettings"
            />
          </div>
        </div>
      </div>
    </div>

    <AddPropertyModal
      ref="addModalRef"
      :submitting="publishingListing"
      @submit="handlePublishListing"
    />
  </AppLayout>
</template>
