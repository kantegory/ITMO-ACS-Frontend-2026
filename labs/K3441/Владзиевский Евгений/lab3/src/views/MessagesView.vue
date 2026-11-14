<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import StatusBadge from '../components/StatusBadge.vue';
import AppIcon from '../components/AppIcon.vue';
import EmptyState from '../components/EmptyState.vue';
import { useAuth } from '../composables/useAuth.js';
import { useFormat } from '../composables/useFormat.js';
import { useToasts } from '../composables/useToasts.js';
import * as api from '../api/resources.js';

const { user } = useAuth();
const { price, initials } = useFormat();
const { toast } = useToasts();

const tab = ref('chat');
const dialogs = ref([]);
const deals = ref([]);
const owners = ref(new Map());
const listings = ref(new Map());
const currentId = ref(null);
const loading = ref(true);
const sending = ref(false);
const draft = ref('');
const dealFilter = ref('all');

const FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Действуют' },
  { value: 'wait', label: 'Ждут подписи' },
  { value: 'done', label: 'Завершены' },
  { value: 'cancel', label: 'Отменены' }
];

const current = computed(() => dialogs.value.find((d) => d.id === currentId.value) || null);
const partnerName = (dialog) => owners.value.get(dialog.partnerId)?.name || 'Собеседник';
const listingOf = (dialog) => listings.value.get(dialog.listingId);
const visibleDeals = computed(() =>
  deals.value.filter((d) => dealFilter.value === 'all' || d.status === dealFilter.value));

async function load() {
  loading.value = true;
  try {
    const [dialogsData, dealsData, ownersData] = await Promise.all([
      api.fetchDialogs(user.value.id, { _embed: 'messages' }),
      api.fetchDeals(user.value.id),
      api.fetchOwners()
    ]);
    dialogs.value = dialogsData;
    deals.value = dealsData;
    owners.value = new Map(ownersData.map((o) => [o.id, o]));

    const ids = [...new Set([...dialogsData.map((d) => d.listingId), ...dealsData.map((d) => d.listingId)])];
    const items = await Promise.all(ids.map((id) => api.fetchListing(id).catch(() => null)));
    listings.value = new Map(items.filter(Boolean).map((l) => [l.id, l]));

    currentId.value = dialogs.value[0]?.id ?? null;
  } catch (error) {
    toast(error.message);
  } finally {
    loading.value = false;
  }
}

async function openDialog(dialog) {
  currentId.value = dialog.id;
  if (!dialog.unread) return;
  dialog.unread = 0;
  try {
    await api.updateDialog(dialog.id, { unread: 0 });
  } catch {
    // счётчик не критичен
  }
}

async function send() {
  const text = draft.value.trim();
  if (!text || !current.value) return;
  sending.value = true;
  try {
    const created = await api.createMessage({
      userId: user.value.id,
      dialogId: current.value.id,
      authorId: user.value.id,
      text,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    });
    current.value.messages.push(created);
    draft.value = '';
  } catch (error) {
    toast(error.message);
  } finally {
    sending.value = false;
  }
}

// ---------- Предложить сделку ----------
const deal = reactive({ start: '', term: '11 месяцев', price: '' });
const savingDeal = ref(false);

async function proposeDeal() {
  if (!current.value || !deal.start || !deal.price) {
    toast('Укажите дату начала и сумму');
    return;
  }
  savingDeal.value = true;
  try {
    const listing = listingOf(current.value);
    const created = await api.createMessage({
      userId: user.value.id,
      dialogId: current.value.id,
      authorId: null, // системное сообщение: автора нет
      text: `Отправлен договор на ${price(deal.price)} в месяц, срок ${deal.term}`,
      time: ''
    });
    current.value.messages.push(created);

    const saved = await api.createDeal({
      userId: user.value.id,
      no: `К-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      listingId: current.value.listingId,
      role: listing && listing.userId === user.value.id ? 'Владелец' : 'Арендатор',
      other: partnerName(current.value),
      period: `с ${new Date(deal.start).toLocaleDateString('ru-RU')}`,
      price: Number(deal.price),
      status: 'wait'
    });
    deals.value = [saved, ...deals.value];
    Object.assign(deal, { start: '', term: '11 месяцев', price: '' });
    toast('Договор отправлен на подпись');
  } catch (error) {
    toast(error.message);
  } finally {
    savingDeal.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="container py-4">
    <h1 class="mb-3">Сообщения и сделки</h1>

    <ul class="nav profile-tabs mb-4 border-bottom" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link" type="button" role="tab" :class="{ active: tab === 'chat' }" :aria-selected="tab === 'chat'" @click="tab = 'chat'">
          Сообщения
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" type="button" role="tab" :class="{ active: tab === 'deals' }" :aria-selected="tab === 'deals'" @click="tab = 'deals'">
          История сделок
        </button>
      </li>
    </ul>

    <section v-if="tab === 'chat'" role="tabpanel" tabindex="0">
      <div v-if="loading" class="py-5 text-center text-muted-2">
        <span class="spinner-border me-2" aria-hidden="true"></span>Загружаем переписки…
      </div>

      <EmptyState v-else-if="!dialogs.length" title="Переписок пока нет" text="Напишите владельцу со страницы объявления.">
        <RouterLink class="btn btn-primary" :to="{ name: 'search' }">Перейти к поиску</RouterLink>
      </EmptyState>

      <div v-else class="chat">
        <ul class="chat-list" aria-label="Диалоги">
          <li v-for="dialog in dialogs" :key="dialog.id">
            <button
              type="button"
              :class="{ active: dialog.id === currentId }"
              :aria-current="dialog.id === currentId ? 'true' : undefined"
              @click="openDialog(dialog)"
            >
              <span class="avatar" aria-hidden="true">{{ initials(partnerName(dialog)) }}</span>
              <span class="d-block min-w-0 flex-grow-1" style="min-width:0">
                <span class="d-flex gap-2">
                  <span class="who">{{ partnerName(dialog) }}</span>
                  <span class="when">{{ dialog.messages.at(-1)?.time || '' }}</span>
                </span>
                <span class="obj d-block text-truncate">{{ listingOf(dialog)?.title || 'Объявление снято' }}</span>
                <span class="preview d-block">
                  {{ dialog.messages.at(-1)?.authorId === user.id ? 'Вы: ' : '' }}{{ dialog.messages.at(-1)?.text || '' }}
                </span>
              </span>
              <span v-if="dialog.unread" class="badge-dot align-self-center">
                {{ dialog.unread }}<span class="visually-hidden"> непрочитанное</span>
              </span>
            </button>
          </li>
        </ul>

        <div v-if="current" class="chat-window">
          <div class="chat-top">
            <span class="avatar" aria-hidden="true">{{ initials(partnerName(current)) }}</span>
            <div class="flex-grow-1 min-w-0">
              <div class="fw-semibold">{{ partnerName(current) }}</div>
              <RouterLink
                v-if="listingOf(current)"
                class="small"
                :to="{ name: 'property', params: { id: current.listingId } }"
              >
                {{ listingOf(current).title }}
              </RouterLink>
            </div>
            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="modal" data-bs-target="#dealModal">
              Предложить сделку
            </button>
          </div>

          <div class="chat-feed" role="log" aria-live="polite" aria-label="Переписка">
            <div
              v-for="msg in current.messages"
              :key="msg.id"
              :class="msg.authorId === null ? 'msg msg-system' : ['msg', { mine: msg.authorId === user.id }]"
            >
              {{ msg.text }}
              <time v-if="msg.authorId !== null">{{ msg.time }}</time>
            </div>
          </div>

          <form class="chat-form" @submit.prevent="send">
            <label class="visually-hidden" for="chat-input">Сообщение</label>
            <input id="chat-input" v-model="draft" class="form-control" placeholder="Напишите сообщение" autocomplete="off" :disabled="sending">
            <button class="btn btn-primary" type="submit" aria-label="Отправить" :disabled="sending">
              <AppIcon name="send" />
            </button>
          </form>
        </div>
      </div>
    </section>

    <section v-else role="tabpanel" tabindex="0">
      <div class="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Фильтр по статусу">
        <template v-for="filter in FILTERS" :key="filter.value">
          <input :id="`df-${filter.value}`" v-model="dealFilter" class="btn-check" type="radio" :value="filter.value">
          <label class="btn btn-sm btn-outline-secondary" :for="`df-${filter.value}`">{{ filter.label }}</label>
        </template>
      </div>

      <div class="panel p-0 table-responsive">
        <table class="table table-clean">
          <caption class="visually-hidden">История сделок</caption>
          <thead>
            <tr>
              <th scope="col" class="ps-3">№</th><th scope="col">Объект</th><th scope="col">Роль</th>
              <th scope="col">Вторая сторона</th><th scope="col">Период</th>
              <th scope="col">Сумма в месяц</th><th scope="col" class="pe-3">Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in visibleDeals" :key="row.id">
              <td class="ps-3 text-nowrap">{{ row.no }}</td>
              <td>
                <RouterLink v-if="listings.get(row.listingId)" :to="{ name: 'property', params: { id: row.listingId } }">
                  {{ listings.get(row.listingId).title }}
                </RouterLink>
                <template v-else>Объявление снято</template>
              </td>
              <td>{{ row.role }}</td>
              <td>{{ row.other }}</td>
              <td class="text-nowrap">{{ row.period }}</td>
              <td class="text-nowrap">{{ price(row.price) }}</td>
              <td class="pe-3"><StatusBadge :status="row.status" /></td>
            </tr>
            <tr v-if="!visibleDeals.length">
              <td colspan="7" class="text-center text-muted-2 py-4">Сделок с таким статусом нет</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Предложить сделку -->
    <div id="dealModal" class="modal fade" tabindex="-1" aria-labelledby="dealTitle">
      <div class="modal-dialog modal-dialog-centered">
        <form class="modal-content" novalidate @submit.prevent="proposeDeal">
          <div class="modal-header">
            <h2 id="dealTitle" class="modal-title fs-5">Предложить сделку</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted-2">Вторая сторона получит договор на подпись. Условия можно поменять до подписания.</p>
            <div class="row g-3">
              <div class="col-sm-6">
                <label class="form-label" for="deal-start">Начало аренды</label>
                <input id="deal-start" v-model="deal.start" class="form-control" type="date" required>
              </div>
              <div class="col-sm-6">
                <label class="form-label" for="deal-term">Срок</label>
                <select id="deal-term" v-model="deal.term" class="form-select">
                  <option>6 месяцев</option><option>11 месяцев</option><option>12 месяцев</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label" for="deal-price">Плата в месяц, ₽</label>
                <input id="deal-price" v-model.number="deal.price" class="form-control" type="number" min="5000" required>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отмена</button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal" :disabled="savingDeal">Отправить договор</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
