<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ChatItem from '@/components/activity/ChatItem.vue'
import MessageBubble from '@/components/activity/MessageBubble.vue'
import DealCard from '@/components/activity/DealCard.vue'
import { useTabs } from '@/composables/useTabs'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { getChats, getMessages, createMessage, updateChat } from '@/api/chatApi'
import { getBookings, updateBooking } from '@/api/bookingsApi'

const route = useRoute()
const auth = useAuthStore()
const { showToast } = useToast()
const { activeTab, selectTab, handleTabKeydown } = useTabs('messages', ['messages', 'deals'])
const chats = ref([])
const bookings = ref([])
const activeChat = ref(null)
const messages = ref([])
const chatSearch = ref('')
const messageText = ref('')
const dealFilter = ref('all')
const loading = ref(true)
const sending = ref(false)
const history = ref(null)
const filteredChats = computed(() =>
  chats.value.filter((chat) =>
    `${chat.personName} ${chat.listing?.title}`
      .toLowerCase()
      .includes(chatSearch.value.toLowerCase()),
  ),
)
const userDeals = computed(() =>
  bookings.value.filter(
    (item) =>
      Number(item.userId) === Number(auth.user.id) ||
      Number(item.listing?.userId) === Number(auth.user.id),
  ),
)
const filteredDeals = computed(() =>
  dealFilter.value === 'all'
    ? userDeals.value
    : userDeals.value.filter((item) => item.status === dealFilter.value),
)
async function selectChat(chat) {
  if (!chat) {
    activeChat.value = null
    messages.value = []
    return
  }
  activeChat.value = chat
  messages.value = []
  try {
    messages.value = await getMessages(chat.id)
    await nextTick()
    if (history.value) history.value.scrollTop = history.value.scrollHeight
  } catch {
    showToast('Не удалось загрузить сообщения')
  }
}
async function send() {
  const text = messageText.value.trim()
  if (!text || !activeChat.value) return
  sending.value = true
  try {
    const created = await createMessage({
      userId: auth.user.id,
      chatId: activeChat.value.id,
      senderId: auth.user.id,
      text,
      createdAt: new Date().toISOString(),
    })
    messages.value.push(created)
    messageText.value = ''
    activeChat.value.lastMessage = `Вы: ${text}`
    activeChat.value.lastTime = new Date(created.createdAt).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
    await updateChat(activeChat.value.id, {
      lastMessage: activeChat.value.lastMessage,
      lastTime: activeChat.value.lastTime,
    })
    await nextTick()
    if (history.value) history.value.scrollTop = history.value.scrollHeight
  } catch {
    showToast('Не удалось отправить сообщение')
  } finally {
    sending.value = false
  }
}
function openDealChat(booking) {
  const chat = chats.value.find((item) => Number(item.listingId) === Number(booking.listingId))
  if (!chat) {
    showToast('Для этой сделки чат не найден')
    return
  }
  selectTab('messages')
  selectChat(chat)
}
async function cancelDeal(booking) {
  try {
    const updated = await updateBooking(booking.id, { status: 'canceled' })
    bookings.value = bookings.value.map((item) =>
      item.id === booking.id ? { ...item, ...updated } : item,
    )
    showToast('Заявка отменена')
  } catch {
    showToast('Не удалось отменить заявку')
  }
}
async function load() {
  try {
    ;[chats.value, bookings.value] = await Promise.all([getChats(auth.user.id), getBookings()])
    const requested = chats.value.find(
      (item) => Number(item.listingId) === Number(route.query.listing),
    )
    await selectChat(requested || chats.value[0])
  } catch {
    showToast('Не удалось загрузить сообщения и сделки')
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<template>
  <main id="main-content" class="rs-main">
    <div class="rs-container">
      <h1 class="rs-page-title">Сообщения и сделки</h1>
      <div class="tabs" role="tablist">
        <button
          v-for="tab in [
            { id: 'messages', label: 'Сообщения' },
            { id: 'deals', label: 'Сделки' },
          ]"
          :key="tab.id"
          :data-tab="tab.id"
          role="tab"
          :class="{ active: activeTab === tab.id }"
          :aria-selected="activeTab === tab.id"
          @click="selectTab(tab.id)"
          @keydown="handleTabKeydown($event, tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
      <p v-if="loading" class="status-message">Загрузка…</p>
      <section v-else-if="activeTab === 'messages'" class="rs-card messages-shell">
        <aside class="chat-list">
          <div class="chat-search">
            <input
              v-model="chatSearch"
              class="form-control"
              type="search"
              placeholder="Поиск по чатам"
            />
          </div>
          <p v-if="!filteredChats.length" class="p-3 rs-muted">Чаты не найдены.</p>
          <ChatItem
            v-for="chat in filteredChats"
            :key="chat.id"
            :chat="chat"
            :active="activeChat?.id === chat.id"
            @select="selectChat(chat)"
          />
        </aside>
        <section class="chat-pane">
          <template v-if="activeChat"
            ><header class="chat-head">
              <img :src="`/${activeChat.listing.image}`" alt="" />
              <div>
                <h2>{{ activeChat.personName }}</h2>
                <RouterLink :to="{ name: 'listing', params: { id: activeChat.listing.id } }">{{
                  activeChat.listing.title
                }}</RouterLink>
              </div>
            </header>
            <div ref="history" class="chat-history">
              <p v-if="!messages.length" class="rs-muted text-center">Напишите первое сообщение.</p>
              <MessageBubble
                v-for="message in messages"
                :key="message.id"
                :message="message"
                :own="Number(message.senderId) === Number(auth.user.id)"
              />
            </div>
            <form class="chat-compose" @submit.prevent="send">
              <textarea
                v-model="messageText"
                class="form-control"
                placeholder="Введите сообщение"
                required
              ></textarea
              ><button class="btn btn-primary" :disabled="sending">Отправить</button>
            </form></template
          >
          <p v-else class="status-message">Выберите чат.</p>
        </section>
      </section>
      <section v-else>
        <div class="deal-filters">
          <button
            v-for="filter in [
              { id: 'all', label: 'Все' },
              { id: 'pending', label: 'Ожидают' },
              { id: 'active', label: 'Активные' },
              { id: 'completed', label: 'Завершённые' },
              { id: 'canceled', label: 'Отменённые' },
            ]"
            :key="filter.id"
            :class="['btn', 'btn-primary', { 'deal-filter--inactive': dealFilter !== filter.id }]"
            @click="dealFilter = filter.id"
          >
            {{ filter.label }}
          </button>
        </div>
        <p class="rs-muted">Всего сделок: {{ filteredDeals.length }}</p>
        <div class="deals-list">
          <p v-if="!filteredDeals.length" class="rs-muted">Сделки не найдены.</p>
          <DealCard
            v-for="booking in filteredDeals"
            :key="booking.id"
            :booking="booking"
            :current-user-id="auth.user.id"
            @open-chat="openDealChat(booking)"
            @cancel="cancelDeal(booking)"
          />
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--rs-border);
  margin-bottom: 22px;
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
.messages-shell {
  display: grid;
  grid-template-columns: 340px 1fr;
  min-height: 640px;
  overflow: hidden;
}
.chat-list {
  border-right: 1px solid var(--rs-border);
  overflow: auto;
}
.chat-search {
  padding: 14px;
}
.chat-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.chat-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 20px;
  border-bottom: 1px solid var(--rs-border);
}
.chat-head img {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
}
.chat-head h2 {
  margin: 0;
  font-size: 17px;
}
.chat-head a {
  color: var(--rs-primary);
}
.chat-history {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  max-height: 510px;
  overflow: auto;
  padding: 22px;
}
.chat-compose {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 15px;
  border-top: 1px solid var(--rs-border);
}
.chat-compose textarea {
  min-height: 48px;
  max-height: 120px;
}
.deal-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}
.deal-filter--inactive {
  opacity: 0.72;
}
.deal-filter--inactive:hover,
.deal-filter--inactive:focus-visible {
  opacity: 1;
}
.deals-list {
  display: grid;
  gap: 16px;
}
@media (max-width: 800px) {
  .messages-shell {
    grid-template-columns: 1fr;
  }
  .chat-list {
    max-height: 300px;
    border-right: 0;
    border-bottom: 1px solid var(--rs-border);
  }
  .chat-compose {
    grid-template-columns: 1fr;
  }
}
</style>
