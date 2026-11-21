<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api, errorText } from '../api'
import { useAuth } from '../composables/useAuth'
import { useRentals } from '../composables/useRentals'
import { useRequest } from '../composables/useRequest'
import RentalTable from '../components/RentalTable.vue'

const route = useRoute()
const { user } = useAuth()
const me = user.value.id
const { outgoing, incoming, loadRentals } = useRentals(me)
const { pending, error, run } = useRequest()
const loading = ref(false)
const loadError = ref('')
const chats = ref([])
const messages = ref([])
const draft = ref('')
const log = ref(null)
const current = computed(() => chats.value.find(chat => String(chat.id) === route.query.chat) || chats.value[0])
const history = computed(() => [...new Map([...outgoing.value, ...incoming.value].map(r => [r.id, r])).values()]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))

function partner(chat) {
  return chat.tenantId === me ? chat.landlordName : chat.tenantName
}

async function scrollToEnd() {
  await nextTick()
  if (log.value) log.value.scrollTop = log.value.scrollHeight
}

async function loadChats() {
  const common = { _expand: 'property' }
  const [renting, owning] = await Promise.all([
    api.get('/chats', { params: { ...common, tenantId: me } }),
    api.get('/chats', { params: { ...common, landlordId: me } })
  ])
  chats.value = [...new Map([...renting.data, ...owning.data].map(chat => [chat.id, chat])).values()]
}

const { error: initialError, run: initialize } = useRequest()
onMounted(() => initialize(() => Promise.all([loadChats(), loadRentals()])))

watch(() => current.value?.id, async (id, _, onCleanup) => {
  messages.value = []
  draft.value = ''
  if (!id) return
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await api.get('/messages', {
      params: { chatId: id, _sort: 'createdAt' },
      signal: controller.signal
    })
    if (!controller.signal.aborted) {
      messages.value = data
      await scrollToEnd()
    }
  } catch (cause) {
    if (!controller.signal.aborted) loadError.value = errorText(cause)
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
})

function send() {
  const text = draft.value.trim()
  if (!text || !current.value) return
  return run(async () => {
    const chatId = current.value.id
    const { data } = await api.post('/messages', { chatId, senderId: me, text, createdAt: new Date().toISOString() })
    if (current.value?.id === chatId) {
      messages.value.push(data)
      draft.value = ''
      await scrollToEnd()
    }
  })
}
</script>

<template>
  <h1 class="h3 mb-3">Сообщения и сделки</h1>
  <p v-if="error || loadError || initialError" role="alert" class="alert alert-danger">{{ error || loadError || initialError }}</p>
  <div class="row g-3">
    <nav class="col-md-4" aria-label="Диалоги">
      <p v-if="!chats.length">Диалогов пока нет</p>
      <div v-else class="list-group">
        <RouterLink v-for="chat in chats" :key="chat.id" class="list-group-item list-group-item-action"
                    :aria-current="current?.id === chat.id ? 'true' : null" :class="{ active: current?.id === chat.id }"
                    :to="{ name: 'messages', query: { chat: chat.id } }">
          {{ partner(chat) }} · {{ chat.property?.title || 'Объявление' }}
        </RouterLink>
      </div>
    </nav>
    <section v-if="current" class="col-md-8" aria-labelledby="chat-title">
      <div class="card card-body d-flex chat">
        <h2 id="chat-title" class="h5">{{ partner(current) }}</h2>
        <div ref="log" class="messages flex-grow-1 mb-2" role="log" aria-label="Сообщения" tabindex="0">
          <p v-for="message in messages" :key="message.id" class="msg mb-0 text-break" :class="{ 'msg-other': message.senderId !== me }">
            <span class="visually-hidden">{{ message.senderId === me ? 'Вы' : 'Собеседник' }}: </span>{{ message.text }}
          </p>
          <p v-if="!messages.length && !loading && !loadError" class="text-body-secondary">Сообщений пока нет</p>
        </div>
        <form class="d-flex gap-2" @submit.prevent="send">
          <label for="message" class="visually-hidden">Текст сообщения</label>
          <input id="message" v-model="draft" class="form-control" placeholder="Введите сообщение" required :disabled="pending || loading">
          <button class="btn btn-primary" :disabled="pending || loading || !draft.trim()">Отправить</button>
        </form>
      </div>
    </section>
  </div>
  <section class="mt-4" aria-labelledby="history-title">
    <h2 id="history-title" class="h5">История сделок</h2>
    <RentalTable :rentals="history" caption="История сделок" />
  </section>
</template>
