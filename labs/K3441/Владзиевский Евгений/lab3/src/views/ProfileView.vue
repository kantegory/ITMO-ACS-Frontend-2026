<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import ListingGrid from '../components/ListingGrid.vue';
import StatusBadge from '../components/StatusBadge.vue';
import EmptyState from '../components/EmptyState.vue';
import AppIcon from '../components/AppIcon.vue';
import { useAuth } from '../composables/useAuth.js';
import { useFavorites } from '../composables/useFavorites.js';
import { useFormat } from '../composables/useFormat.js';
import { useToasts } from '../composables/useToasts.js';
import * as api from '../api/resources.js';

const route = useRoute();
const { user, patchUser } = useAuth();
const { favorites, load: loadFavorites } = useFavorites();
const { price, initials, monthYear } = useFormat();
const { toast } = useToasts();

const TABS = [
  { id: 'renting', label: 'Я снимаю', hash: '' },
  { id: 'landlord', label: 'Я сдаю', hash: '#landlord' },
  { id: 'favorites', label: 'Избранное', hash: '#favorites' },
  { id: 'settings', label: 'Настройки', hash: '#settings' }
];

const tab = ref(TABS.find((t) => t.hash === route.hash)?.id || 'renting');

const rentals = ref([]);
const myListings = ref([]);
const requests = ref([]);
const favoriteListings = ref([]);
const loading = ref(true);

const current = computed(() => rentals.value.find((r) => r.status === 'active'));
const past = computed(() => rentals.value.filter((r) => r.status === 'past'));
const income = computed(() => myListings.value.reduce((sum, l) => sum + l.price, 0) * 12);

async function loadAll() {
  loading.value = true;
  try {
    const [rentalsData, listingsData, requestsData] = await Promise.all([
      api.fetchRentals(user.value.id, { _expand: 'listing' }),
      api.fetchListings({ userId: user.value.id }).then((r) => r.items),
      api.fetchRequests(user.value.id, { _expand: 'listing' })
    ]);
    rentals.value = rentalsData;
    myListings.value = listingsData;
    requests.value = requestsData;
    await loadFavoriteListings();
  } catch (error) {
    toast(error.message);
  } finally {
    loading.value = false;
  }
}

async function loadFavoriteListings() {
  await loadFavorites(true);
  const items = await Promise.all(
    favorites.value.map((f) => api.fetchListing(f.listingId).catch(() => null))
  );
  favoriteListings.value = items.filter(Boolean);
}

// ---------- Действия владельца ----------
async function raise(listing) {
  try {
    await api.updateListing(listing.id, { posted: new Date().toISOString().slice(0, 10) });
    toast('Объявление поднято в поиске');
    loadAll();
  } catch (error) {
    toast(error.message);
  }
}

async function unpublish(listing) {
  if (!confirm('Снять объявление с публикации? Его больше не будет в поиске.')) return;
  try {
    await api.deleteListing(listing.id);
    toast('Объявление снято с публикации');
    loadAll();
  } catch (error) {
    toast(error.message);
  }
}

async function confirmRequest(request) {
  try {
    await api.updateRequest(request.id, { status: 'confirmed' });
    toast('Просмотр подтверждён');
    loadAll();
  } catch (error) {
    toast(error.message);
  }
}

// ---------- Настройки ----------
const settings = reactive({ name: '', email: '', phone: '' });
const savingSettings = ref(false);

async function saveSettings() {
  savingSettings.value = true;
  try {
    const updated = await api.updateUser(user.value.id, {
      name: settings.name.trim(),
      email: settings.email.trim().toLowerCase(),
      phone: settings.phone.trim()
    });
    patchUser(updated);
    toast('Изменения сохранены');
  } catch (error) {
    toast(error.message);
  } finally {
    savingSettings.value = false;
  }
}

// ---------- Новое объявление ----------
const draft = reactive({
  type: 'Квартира', city: 'Санкт-Петербург', title: '', address: '',
  rooms: 1, area: '', price: '', text: '', pets: false, kids: true
});
const savingDraft = ref(false);

const TYPE_CODES = { 'Квартира': 'flat', 'Студия': 'studio', 'Комната': 'room', 'Дом': 'house' };

async function publishDraft() {
  if (draft.title.trim().length < 10 || !draft.address.trim() || !draft.area || !draft.price) {
    toast('Заполните заголовок, адрес, площадь и цену');
    return;
  }
  savingDraft.value = true;
  try {
    await api.createListing({
      userId: user.value.id,
      type: TYPE_CODES[draft.type] || 'flat',
      rooms: Number(draft.rooms),
      area: Number(draft.area),
      price: Number(draft.price),
      deposit: Number(draft.price),
      commission: 0,
      city: draft.city,
      district: '—',
      metro: '—',
      address: draft.address.trim(),
      title: draft.title.trim(),
      text: draft.text.trim() || 'Описание появится позже.',
      floor: '—',
      built: new Date().getFullYear(),
      img: 'flat-1',
      photos: ['flat-1'],
      pets: draft.pets,
      kids: draft.kids,
      furniture: true,
      balcony: false,
      lat: 59.9343,
      lng: 30.3351,
      posted: new Date().toISOString().slice(0, 10)
    });
    toast('Объявление опубликовано');
    Object.assign(draft, { title: '', address: '', rooms: 1, area: '', price: '', text: '' });
    tab.value = 'landlord';
    loadAll();
  } catch (error) {
    toast(error.message);
  } finally {
    savingDraft.value = false;
  }
}

onMounted(() => {
  Object.assign(settings, {
    name: user.value.name,
    email: user.value.email,
    phone: user.value.phone || ''
  });
  loadAll();
});
</script>

<template>
  <div class="profile-head">
    <div class="container">
      <div class="d-flex flex-wrap align-items-center gap-3 gap-md-4 mb-4">
        <span class="avatar avatar-lg" aria-hidden="true">{{ initials(user.name) }}</span>
        <div class="flex-grow-1">
          <h1 class="mb-1">{{ user.name }}</h1>
          <p class="text-muted-2 mb-0">{{ user.email }}, на сервисе с {{ monthYear(user.since, { of: true }) }}</p>
          <p v-if="user.verified" class="mb-0 mt-1 small">
            <AppIcon name="patch-check-fill" class="text-primary me-1" />Паспорт подтверждён
          </p>
        </div>
        <button class="btn btn-tag btn-lg" type="button" data-bs-toggle="modal" data-bs-target="#newListingModal">
          <AppIcon name="plus-lg" class="me-1" />Новое объявление
        </button>
      </div>

      <ul class="nav profile-tabs" role="tablist">
        <li v-for="item in TABS" :key="item.id" class="nav-item" role="presentation">
          <button
            class="nav-link"
            type="button"
            role="tab"
            :class="{ active: tab === item.id }"
            :aria-selected="tab === item.id"
            @click="tab = item.id"
          >
            {{ item.label }}
            <span v-if="item.id === 'landlord' && myListings.length" class="badge-dot">
              {{ myListings.length }}<span class="visually-hidden"> моих объявлений</span>
            </span>
            <span v-if="item.id === 'favorites' && favoriteListings.length" class="badge-dot">
              {{ favoriteListings.length }}<span class="visually-hidden"> в избранном</span>
            </span>
          </button>
        </li>
      </ul>
    </div>
  </div>

  <div class="container py-4">
    <!-- Я снимаю -->
    <section v-if="tab === 'renting'" role="tabpanel" tabindex="0">
      <h2 class="fs-4 mb-3">Текущая аренда</h2>

      <EmptyState
        v-if="!loading && !current"
        title="Сейчас вы ничего не снимаете"
        text="Загляните в поиск — там хватает вариантов."
      >
        <RouterLink class="btn btn-primary" :to="{ name: 'search' }">Перейти к поиску</RouterLink>
      </EmptyState>

      <article v-else-if="current" class="rent-card mb-4">
        <img :src="`/img/${current.listing.img}.webp`" :alt="current.listing.title" width="520" height="347">
        <div class="rent-card-body">
          <div class="d-flex flex-wrap justify-content-between gap-2 mb-2">
            <h3 class="m-0">
              <RouterLink class="text-reset text-decoration-none" :to="{ name: 'property', params: { id: current.listing.id } }">
                {{ current.listing.title }}
              </RouterLink>
            </h3>
            <StatusBadge status="active" label="Договор действует" />
          </div>
          <p class="text-muted-2 mb-3">{{ current.listing.city }}, {{ current.listing.address }}</p>

          <div class="row g-3 mb-3">
            <div class="col-6 col-md-3"><div class="small text-muted-2">Плата</div><div class="fw-semibold">{{ price(current.price) }}</div></div>
            <div class="col-6 col-md-3"><div class="small text-muted-2">Следующий платёж</div><div class="fw-semibold">{{ current.nextPayment }}</div></div>
            <div class="col-6 col-md-3"><div class="small text-muted-2">Депозит у сервиса</div><div class="fw-semibold">{{ price(current.deposit) }}</div></div>
            <div class="col-6 col-md-3"><div class="small text-muted-2">Договор до</div><div class="fw-semibold">{{ current.until }}</div></div>
          </div>

          <div class="mb-1 d-flex justify-content-between small">
            <span>Прожито {{ current.monthsDone }} из {{ current.monthsTotal }} месяцев</span>
            <span>{{ Math.round(current.monthsDone / current.monthsTotal * 100) }}%</span>
          </div>
          <div
            class="progress mb-3"
            role="progressbar"
            aria-label="Срок договора"
            :aria-valuenow="Math.round(current.monthsDone / current.monthsTotal * 100)"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="progress-bar" :style="{ width: `${Math.round(current.monthsDone / current.monthsTotal * 100)}%` }"></div>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-primary" type="button" @click="toast(`Оплата ${price(current.price + (current.utilities || 0))} прошла`)">
              Оплатить ноябрь
            </button>
            <RouterLink class="btn btn-outline-secondary" :to="{ name: 'messages' }">Написать владельцу</RouterLink>
          </div>
        </div>
      </article>

      <h2 class="fs-4 mb-3">Раньше снимал</h2>
      <div class="panel p-0 table-responsive">
        <table class="table table-clean">
          <caption class="visually-hidden">Жильё, которое я снимал раньше</caption>
          <thead>
            <tr>
              <th scope="col" class="ps-3">Объект</th><th scope="col">Период</th>
              <th scope="col">Плата</th><th scope="col">Депозит</th><th scope="col" class="pe-3">Отзыв</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rental in past" :key="rental.id">
              <td class="ps-3">{{ rental.listing?.title || 'Объект' }}</td>
              <td>{{ rental.period }}</td>
              <td>{{ price(rental.price) }}</td>
              <td><StatusBadge v-if="rental.depositReturned" status="active" label="Возвращён" /></td>
              <td class="pe-3">
                <template v-if="rental.rating"><AppIcon name="star-fill" class="text-warning" /> {{ rental.rating }}</template>
                <button v-else class="btn btn-sm btn-outline-primary" type="button" @click="toast('Форма отзыва появится позже')">Оставить</button>
              </td>
            </tr>
            <tr v-if="!past.length">
              <td colspan="5" class="text-center text-muted-2 py-4">Раньше вы ничего не снимали</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Я сдаю -->
    <section v-else-if="tab === 'landlord'" role="tabpanel" tabindex="0">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 class="fs-4 m-0">Мои объявления</h2>
        <div class="small text-muted-2">
          Доход за год при полной занятости: <strong class="text-body">{{ price(income) }}</strong>
        </div>
      </div>

      <div class="panel p-0 table-responsive mb-4">
        <table class="table table-clean">
          <caption class="visually-hidden">Мои объявления</caption>
          <thead>
            <tr>
              <th scope="col" class="ps-3">Объект</th><th scope="col">Статус</th>
              <th scope="col">Цена</th><th scope="col" class="pe-3"><span class="visually-hidden">Действия</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="listing in myListings" :key="listing.id">
              <td class="ps-3">
                <div class="d-flex align-items-center gap-2">
                  <img :src="`/img/${listing.img}.webp`" alt="" width="72" height="48" class="rounded" style="object-fit:cover">
                  <div>
                    <RouterLink :to="{ name: 'property', params: { id: listing.id } }">{{ listing.title }}</RouterLink>
                    <div class="small text-muted-2">{{ listing.city }}, {{ listing.district }} р-н</div>
                  </div>
                </div>
              </td>
              <td><StatusBadge status="published" /></td>
              <td>{{ price(listing.price) }}</td>
              <td class="pe-3 text-end">
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    :aria-label="`Действия с объявлением «${listing.title}»`"
                  >
                    <AppIcon name="three-dots" />
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <RouterLink class="dropdown-item" :to="{ name: 'property', params: { id: listing.id } }">
                        Открыть объявление
                      </RouterLink>
                    </li>
                    <li><button class="dropdown-item" type="button" @click="raise(listing)">Поднять в поиске</button></li>
                    <li><button class="dropdown-item text-danger" type="button" @click="unpublish(listing)">Снять с публикации</button></li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="!myListings.length">
              <td colspan="4" class="text-center text-muted-2 py-4">У вас пока нет объявлений</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="fs-4 mb-3">Заявки на просмотр</h2>
      <p v-if="!requests.length" class="text-muted-2">Заявок на просмотр пока нет.</p>

      <div v-else class="row g-3">
        <div v-for="request in requests" :key="request.id" class="col-md-6">
          <article class="panel h-100">
            <div class="d-flex gap-3 align-items-center mb-2">
              <span class="avatar" aria-hidden="true">{{ initials(request.name) }}</span>
              <div>
                <strong>{{ request.name }}</strong>
                <div class="small text-muted-2">
                  {{ request.listing?.title }},
                  {{ new Date(request.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) }}
                  в {{ request.time }}
                </div>
              </div>
            </div>
            <p class="mb-3">{{ request.comment }}</p>
            <div class="d-flex gap-2 align-items-center">
              <template v-if="request.status === 'new'">
                <button class="btn btn-primary btn-sm" type="button" @click="confirmRequest(request)">Подтвердить</button>
                <button class="btn btn-outline-secondary btn-sm" type="button" @click="toast('Предложили другое время')">Другое время</button>
              </template>
              <StatusBadge v-else :status="request.status" />
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Избранное -->
    <section v-else-if="tab === 'favorites'" role="tabpanel" tabindex="0">
      <h2 class="fs-4 mb-3">Избранное</h2>
      <ListingGrid :listings="favoriteListings" :pending="loading" :skeletons="3" />
      <EmptyState
        v-if="!loading && !favoriteListings.length"
        title="В избранном пусто"
        text="Нажмите на сердечко на карточке, и квартира появится здесь."
      >
        <RouterLink class="btn btn-primary" :to="{ name: 'search' }">Перейти к поиску</RouterLink>
      </EmptyState>
    </section>

    <!-- Настройки -->
    <section v-else role="tabpanel" tabindex="0">
      <h2 class="fs-4 mb-3">Настройки профиля</h2>
      <form class="panel" style="max-width: 640px" novalidate @submit.prevent="saveSettings">
        <div class="row g-3">
          <div class="col-sm-6">
            <label class="form-label" for="set-name">Имя и фамилия</label>
            <input id="set-name" v-model="settings.name" class="form-control" required>
          </div>
          <div class="col-sm-6">
            <label class="form-label" for="set-phone">Телефон</label>
            <input id="set-phone" v-model="settings.phone" class="form-control" type="tel">
          </div>
          <div class="col-12">
            <label class="form-label" for="set-email">Почта</label>
            <input id="set-email" v-model="settings.email" class="form-control" type="email" required>
          </div>
        </div>
        <button class="btn btn-primary mt-4" type="submit" :disabled="savingSettings">
          {{ savingSettings ? 'Сохраняем…' : 'Сохранить изменения' }}
        </button>
      </form>
    </section>
  </div>

  <!-- Новое объявление -->
  <div id="newListingModal" class="modal fade" tabindex="-1" aria-labelledby="newListingTitle">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <form class="modal-content" novalidate @submit.prevent="publishDraft">
        <div class="modal-header">
          <h2 id="newListingTitle" class="modal-title fs-5">Новое объявление</h2>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
        </div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="nl-type">Тип жилья</label>
              <select id="nl-type" v-model="draft.type" class="form-select">
                <option>Квартира</option><option>Студия</option><option>Комната</option><option>Дом</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="nl-city">Город</label>
              <select id="nl-city" v-model="draft.city" class="form-select">
                <option>Санкт-Петербург</option><option>Москва</option><option>Казань</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label" for="nl-title">Заголовок объявления</label>
              <input id="nl-title" v-model="draft.title" class="form-control" placeholder="Например: двушка у метро с балконом" minlength="10" required>
            </div>
            <div class="col-12">
              <label class="form-label" for="nl-address">Адрес</label>
              <input id="nl-address" v-model="draft.address" class="form-control" placeholder="Улица, дом" required>
            </div>
            <div class="col-4">
              <label class="form-label" for="nl-rooms">Комнат</label>
              <input id="nl-rooms" v-model.number="draft.rooms" class="form-control" type="number" min="1" max="10">
            </div>
            <div class="col-4">
              <label class="form-label" for="nl-area">Площадь, м²</label>
              <input id="nl-area" v-model.number="draft.area" class="form-control" type="number" min="8" required>
            </div>
            <div class="col-4">
              <label class="form-label" for="nl-price">Цена, ₽/мес</label>
              <input id="nl-price" v-model.number="draft.price" class="form-control" type="number" min="5000" step="500" required>
            </div>
            <div class="col-12">
              <label class="form-label" for="nl-text">Описание</label>
              <textarea id="nl-text" v-model="draft.text" class="form-control" rows="3" placeholder="Что рядом, какой ремонт, кто соседи"></textarea>
            </div>
            <div class="col-12">
              <fieldset>
                <legend class="form-label fs-6">Кого готовы пустить</legend>
                <div class="form-check form-check-inline">
                  <input id="nl-pets" v-model="draft.pets" class="form-check-input" type="checkbox">
                  <label class="form-check-label" for="nl-pets">С животными</label>
                </div>
                <div class="form-check form-check-inline">
                  <input id="nl-kids" v-model="draft.kids" class="form-check-input" type="checkbox">
                  <label class="form-check-label" for="nl-kids">С детьми</label>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="submit" class="btn btn-primary" data-bs-dismiss="modal" :disabled="savingDraft">Опубликовать</button>
        </div>
      </form>
    </div>
  </div>
</template>
