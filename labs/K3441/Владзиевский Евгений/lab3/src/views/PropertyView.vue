<script setup>
import { computed, reactive, ref, watchEffect } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import PriceTag from '../components/PriceTag.vue';
import FavoriteButton from '../components/FavoriteButton.vue';
import ListingGrid from '../components/ListingGrid.vue';
import AppIcon from '../components/AppIcon.vue';
import EmptyState from '../components/EmptyState.vue';
import { useAsync } from '../composables/useAsync.js';
import { useAuth } from '../composables/useAuth.js';
import { useFormat } from '../composables/useFormat.js';
import { useToasts } from '../composables/useToasts.js';
import * as api from '../api/resources.js';

const props = defineProps({ id: { type: [String, Number], required: true } });

const router = useRouter();
const { user, isLogged } = useAuth();
const { toast } = useToasts();
const { price, rooms, initials, monthYear } = useFormat();

const owner = ref(null);
const reviews = ref([]);
const similar = ref([]);
const activePhoto = ref(0);

const { data: listing, error, pending, run } = useAsync(async (id) => {
  const item = await api.fetchListing(id);

  // Три независимых запроса — отправляем разом, а не по очереди
  const [ownerData, reviewsData, similarData] = await Promise.all([
    api.fetchOwner(item.userId).catch(() => null),
    api.fetchReviews(item.userId).catch(() => []),
    api.fetchListings({ city: item.city, id_ne: item.id, _limit: 3 }).then((r) => r.items).catch(() => [])
  ]);

  owner.value = ownerData;
  reviews.value = reviewsData;
  similar.value = similarData;
  return item;
}, { initial: null });

watchEffect(() => run(props.id));

const roomsLabel = computed(() => listing.value ? rooms(listing.value) : '');
const rating = computed(() => {
  if (!reviews.value.length) return null;
  return (reviews.value.reduce((sum, r) => sum + r.rating, 0) / reviews.value.length)
    .toFixed(1).replace('.', ',');
});

const facts = computed(() => listing.value ? [
  ['Тип', roomsLabel.value],
  ['Площадь', `${listing.value.area} м²`],
  ['Этаж', listing.value.floor],
  ['Год постройки', listing.value.built]
] : []);

const amenities = computed(() => listing.value ? [
  ['lamp', 'Мебель', listing.value.furniture],
  ['wind', 'Балкон или терраса', listing.value.balcony],
  ['heart', 'Можно с животными', listing.value.pets],
  ['people', 'Можно с детьми', listing.value.kids],
  ['wifi', 'Интернет', true],
  ['water', 'Стиральная машина', true],
  ['snow', 'Холодильник', true],
  ['tv', 'Телевизор', listing.value.type !== 'room']
] : []);

const terms = computed(() => listing.value ? [
  ['Ежемесячный платёж', price(listing.value.price)],
  ['Залог', price(listing.value.deposit)],
  ['Комиссия', listing.value.commission ? price(listing.value.commission) : 'Нет'],
  ['Коммунальные платежи', listing.value.type === 'room' ? 'Делятся между жильцами' : 'По счётчикам, около 5 000 ₽'],
  ['Срок аренды', listing.value.type === 'house' ? 'От 12 месяцев' : 'От 6 месяцев'],
  ['Предоплата', 'За первый месяц'],
  ['Свободна с', '1 ноября 2026']
] : []);

const mapSrc = computed(() => {
  if (!listing.value) return '';
  const { lat, lng } = listing.value;
  const d = 0.006;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d * 2},${lat - d},${lng + d * 2},${lat + d}&layer=mapnik&marker=${lat},${lng}`;
});

// ---------- Формы ----------
const today = new Date().toISOString().slice(0, 10);
const viewing = reactive({ date: '', time: '', people: '2', comment: '' });
const message = reactive({ text: '' });
const sending = ref(false);

const QUICK = ['Квартира ещё свободна?', 'Можно с животными?', 'Какие коммунальные платежи?'];

function requireLogin() {
  if (isLogged.value) return true;
  toast('Войдите, чтобы написать владельцу или записаться на просмотр');
  router.push({ name: 'login', query: { next: `/property/${props.id}` } });
  return false;
}

async function bookViewing() {
  if (!requireLogin()) return;
  if (!viewing.date || !viewing.time) {
    toast('Выберите день и время');
    return;
  }
  sending.value = true;
  try {
    await api.createViewing({
      userId: user.value.id,
      listingId: listing.value.id,
      date: viewing.date,
      time: viewing.time,
      people: viewing.people,
      comment: viewing.comment.trim(),
      status: 'new'
    });
    const when = new Date(viewing.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    toast(`Вы записаны на просмотр ${when} в ${viewing.time}`);
    Object.assign(viewing, { date: '', time: '', people: '2', comment: '' });
  } catch (e) {
    toast(e.message);
  } finally {
    sending.value = false;
  }
}

async function sendMessage() {
  if (!requireLogin()) return;
  if (message.text.trim().length < 5) {
    toast('Напишите хотя бы пару слов');
    return;
  }
  sending.value = true;
  try {
    // Переписки с этим владельцем может ещё не быть
    const existing = await api.fetchDialogs(user.value.id, {
      listingId: listing.value.id,
      partnerId: listing.value.userId
    });
    const dialog = existing[0] || await api.createDialog({
      userId: user.value.id,
      partnerId: listing.value.userId,
      listingId: listing.value.id,
      unread: 0
    });
    await api.createMessage({
      userId: user.value.id,
      dialogId: dialog.id,
      authorId: user.value.id,
      text: message.text.trim(),
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    });
    message.text = '';
    toast('Сообщение отправлено. Ответ придёт в раздел «Сообщения»');
  } catch (e) {
    toast(e.message);
  } finally {
    sending.value = false;
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(location.href);
    toast('Ссылка скопирована');
  } catch {
    toast('Не получилось скопировать. Скопируйте адрес из строки браузера');
  }
}
</script>

<template>
  <div class="container py-4">
    <EmptyState v-if="error && error.status === 404" title="Объявление не найдено" text="Возможно, его сняли с публикации.">
      <RouterLink class="btn btn-primary" :to="{ name: 'search' }">Вернуться к поиску</RouterLink>
    </EmptyState>

    <EmptyState v-else-if="error" title="Не удалось загрузить объявление" :text="error.message" />

    <div v-else-if="pending || !listing" class="py-5 text-center text-muted-2">
      <span class="spinner-border me-2" aria-hidden="true"></span>Загружаем объявление…
    </div>

    <template v-else>
      <nav aria-label="Навигационная цепочка">
        <ol class="breadcrumb small">
          <li class="breadcrumb-item"><RouterLink :to="{ name: 'home' }">Главная</RouterLink></li>
          <li class="breadcrumb-item">
            <RouterLink :to="{ name: 'search', query: { city: listing.city } }">{{ listing.city }}</RouterLink>
          </li>
          <li class="breadcrumb-item active" aria-current="page">{{ listing.title }}</li>
        </ol>
      </nav>

      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h1 class="mb-2">{{ listing.title }}</h1>
          <p class="text-muted-2 mb-0">
            <AppIcon name="geo-alt" class="me-1" />{{ listing.city }}, {{ listing.address }}. {{ listing.metro }}
          </p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary" type="button" @click="copyLink">
            <AppIcon name="link-45deg" class="me-1" />Скопировать ссылку
          </button>
          <FavoriteButton :listing-id="listing.id" inline />
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="gallery">
            <img
              :src="`/img/${listing.photos[activePhoto]}.webp`"
              :alt="`${listing.title}, фото ${activePhoto + 1} из ${listing.photos.length}`"
              width="1200"
              height="800"
            >
          </div>

          <div class="thumbs">
            <button
              v-for="(photo, index) in listing.photos"
              :key="photo"
              type="button"
              :class="{ active: index === activePhoto }"
              :aria-label="`Фото ${index + 1}`"
              :aria-current="index === activePhoto ? 'true' : undefined"
              @click="activePhoto = index"
            >
              <img :src="`/img/${photo}.webp`" alt="" width="240" height="160">
            </button>
          </div>

          <dl class="facts mt-4">
            <div v-for="[key, value] in facts" :key="key">
              <dt>{{ key }}</dt>
              <dd>{{ value }}</dd>
            </div>
          </dl>

          <section class="mt-4" aria-labelledby="about-title">
            <h2 id="about-title" class="fs-4 mb-3">Описание</h2>
            <p class="fs-6" style="max-width: 68ch">{{ listing.text }}</p>
          </section>

          <section class="mt-4" aria-labelledby="amen-title">
            <h2 id="amen-title" class="fs-4 mb-3">В квартире</h2>
            <ul class="amenities">
              <li v-for="[icon, name, yes] in amenities" :key="name" :class="{ no: !yes }">
                <AppIcon :name="yes ? icon : 'x-lg'" />{{ name }}
                <span class="visually-hidden">{{ yes ? ': есть' : ': нет' }}</span>
              </li>
            </ul>
          </section>

          <section class="mt-4" aria-labelledby="terms-title">
            <h2 id="terms-title" class="fs-4 mb-3">Условия аренды</h2>
            <div class="panel">
              <table class="terms">
                <caption class="visually-hidden">Условия аренды</caption>
                <tbody>
                  <tr v-for="[key, value] in terms" :key="key">
                    <th scope="row">{{ key }}</th>
                    <td>{{ value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="mt-4" aria-labelledby="map-title">
            <h2 id="map-title" class="fs-4 mb-3">На карте</h2>
            <iframe class="map-frame" title="Карта с расположением дома" loading="lazy" :src="mapSrc"></iframe>
          </section>

          <section class="mt-5" aria-labelledby="reviews-title">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h2 id="reviews-title" class="fs-4 m-0">Отзывы о владельце</h2>
              <span class="fw-medium">
                <template v-if="rating"><AppIcon name="star-fill" class="text-warning" /> {{ rating }} из 5</template>
                <template v-else>Пока без оценок</template>
              </span>
            </div>

            <p v-if="!reviews.length" class="text-muted-2">Отзывов пока нет.</p>

            <div v-else class="vstack gap-3">
              <article v-for="review in reviews" :key="review.id" class="panel">
                <div class="d-flex justify-content-between mb-1">
                  <strong>{{ review.author }}</strong>
                  <time class="text-muted-2 small" :datetime="review.date">{{ monthYear(review.date) }}</time>
                </div>
                <p class="mb-0">{{ review.text }}</p>
              </article>
            </div>
          </section>
        </div>

        <aside class="col-lg-4">
          <div class="panel sticky-panel">
            <div class="mb-3"><PriceTag :value="listing.price" large /></div>
            <p class="text-muted-2 small mb-3">
              Залог {{ price(listing.deposit) }},
              {{ listing.commission ? `комиссия ${price(listing.commission)}` : 'без комиссии' }}
            </p>

            <div class="d-flex align-items-center gap-3 py-3 border-top border-bottom mb-3">
              <span class="avatar" style="width:48px;height:48px" aria-hidden="true">{{ initials(owner?.name) }}</span>
              <div>
                <div class="fw-semibold">{{ owner?.name || 'Владелец' }}</div>
                <div class="small text-muted-2">
                  <AppIcon name="patch-check-fill" class="text-primary me-1" />Собственник, документы проверены
                </div>
              </div>
            </div>

            <div class="d-grid gap-2">
              <button class="btn btn-primary btn-lg" type="button" data-bs-toggle="modal" data-bs-target="#viewingModal">
                Записаться на просмотр
              </button>
              <button class="btn btn-outline-primary btn-lg" type="button" data-bs-toggle="modal" data-bs-target="#messageModal">
                Написать владельцу
              </button>
            </div>

            <p class="small text-muted-2 mt-3 mb-0">Обычно отвечает {{ owner?.responseTime || 'в течение часа' }}</p>
          </div>
        </aside>
      </div>

      <section class="mt-5" aria-labelledby="similar-title">
        <h2 id="similar-title" class="mb-3">Похожие варианты</h2>
        <p v-if="!similar.length" class="text-muted-2">Других вариантов в этом городе пока нет.</p>
        <ListingGrid v-else :listings="similar" />
      </section>

      <!-- Запись на просмотр -->
      <div id="viewingModal" class="modal fade" tabindex="-1" aria-labelledby="viewingTitle">
        <div class="modal-dialog modal-dialog-centered">
          <form class="modal-content" novalidate @submit.prevent="bookViewing">
            <div class="modal-header">
              <h2 id="viewingTitle" class="modal-title fs-5">Запись на просмотр</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-sm-6">
                  <label class="form-label" for="view-date">День</label>
                  <input id="view-date" v-model="viewing.date" class="form-control" type="date" :min="today" required>
                </div>
                <div class="col-sm-6">
                  <label class="form-label" for="view-time">Время</label>
                  <select id="view-time" v-model="viewing.time" class="form-select" required>
                    <option value="">Выберите</option>
                    <option>10:00</option><option>12:00</option><option>15:00</option>
                    <option>18:00</option><option>19:30</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label" for="view-people">Сколько человек будет жить</label>
                  <select id="view-people" v-model="viewing.people" class="form-select">
                    <option>1</option><option>2</option><option>3</option><option>4 и больше</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label" for="view-comment">Комментарий для владельца</label>
                  <textarea id="view-comment" v-model="viewing.comment" class="form-control" rows="2" placeholder="Например: с нами кот, работаем удалённо"></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отмена</button>
              <button type="submit" class="btn btn-primary" data-bs-dismiss="modal" :disabled="sending">Записаться</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Сообщение владельцу -->
      <div id="messageModal" class="modal fade" tabindex="-1" aria-labelledby="messageTitle">
        <div class="modal-dialog modal-dialog-centered">
          <form class="modal-content" novalidate @submit.prevent="sendMessage">
            <div class="modal-header">
              <h2 id="messageTitle" class="modal-title fs-5">Сообщение владельцу</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
            </div>
            <div class="modal-body">
              <div class="d-flex flex-wrap gap-2 mb-3" aria-label="Быстрые вопросы">
                <button
                  v-for="question in QUICK"
                  :key="question"
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="message.text = (message.text ? message.text + ' ' : '') + question"
                >
                  {{ question }}
                </button>
              </div>
              <label class="form-label" for="msg-text">Текст сообщения</label>
              <textarea id="msg-text" v-model="message.text" class="form-control" rows="4" required minlength="5"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отмена</button>
              <button type="submit" class="btn btn-primary" data-bs-dismiss="modal" :disabled="sending">Отправить</button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>
