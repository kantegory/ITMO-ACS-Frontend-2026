<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import AlertBanner from '@/components/common/AlertBanner.vue'
import ConversationList from '@/components/messages/ConversationList.vue'
import ChatWindow from '@/components/messages/ChatWindow.vue'
import DealsTable from '@/components/messages/DealsTable.vue'
import { messagesApi, rentalsApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useAsyncState } from '@/composables/useAsyncState'

const route = useRoute()
const auth = useAuthStore()
const { loading, error, clearError, run } = useAsyncState(true)
const {
  loading: chatLoading,
  error: chatError,
  clearError: clearChatError,
  run: runChat,
} = useAsyncState()

const conversations = ref([])
const currentConversation = ref(null)
const messages = ref([])
const deals = ref([])
const sending = ref(false)
const sendError = ref('')
const chatWindowRef = ref(null)

let activeChatRequest = 0

const combinedError = computed(() => error.value || chatError.value || sendError.value)

const interlocutorName = computed(() => {
  if (!currentConversation.value || !auth.user) return ''
  return currentConversation.value.ownerId === auth.user.id
    ? currentConversation.value.tenantName
    : currentConversation.value.ownerName
})

async function selectConversation(conversation) {
  const requestId = ++activeChatRequest
  currentConversation.value = conversation
  messages.value = []
  sendError.value = ''
  clearError()
  clearChatError()

  try {
    const loaded = await runChat(() => messagesApi.getMessages(conversation.id))
    if (requestId === activeChatRequest) {
      messages.value = loaded
    }
  } catch {
    if (requestId === activeChatRequest) {
      messages.value = []
    }
  }
}

async function handleSend(text) {
  if (!currentConversation.value || !auth.user || sending.value) return
  const targetConversationId = currentConversation.value.id
  sending.value = true
  sendError.value = ''

  try {
    const created = await messagesApi.sendMessage({
      conversationId: targetConversationId,
      senderId: auth.user.id,
      text,
    })
    if (currentConversation.value?.id === targetConversationId) {
      messages.value = [...messages.value, created]
      chatWindowRef.value?.clearInput()
    }
  } catch (requestError) {
    sendError.value = requestError.message
  } finally {
    sending.value = false
  }
}

async function initMessages() {
  if (!auth.user) return
  try {
    const [loadedConversations, loadedDeals] = await run(() =>
      Promise.all([
        messagesApi.getUserConversations(auth.user.id),
        rentalsApi.getUserDeals(auth.user.id),
      ]),
    )
    conversations.value = loadedConversations
    deals.value = loadedDeals

    const requestedPropertyId = Number(route.query.property)
    const initial =
      loadedConversations.find((item) => item.propertyId === requestedPropertyId) ??
      loadedConversations[0]
    if (initial) {
      await selectConversation(initial)
    }
  } catch {
    // Ошибка уже записана в error через useAsyncState
  }
}

onMounted(() => {
  initMessages()
})
</script>

<template>
  <AppLayout>
    <h1 class="h2 mb-4">Сообщения</h1>
    <AlertBanner :message="combinedError" type="danger" />

    <p v-if="loading" class="text-muted" role="status">Загрузка…</p>

    <template v-else-if="auth.user && !error">
      <div class="row g-4 mb-5">
        <div class="col-md-4">
          <ConversationList
            :conversations="conversations"
            :selected-id="currentConversation?.id ?? null"
            :current-user-id="auth.user.id"
            @select="selectConversation"
          />
        </div>

        <div class="col-md-8">
          <ChatWindow
            v-if="currentConversation"
            ref="chatWindowRef"
            :interlocutor-name="interlocutorName"
            :messages="messages"
            :current-user-id="auth.user.id"
            :loading="chatLoading"
            :sending="sending"
            @send="handleSend"
          />
        </div>
      </div>

      <DealsTable :deals="deals" :current-user-id="auth.user.id" />
    </template>
  </AppLayout>
</template>
