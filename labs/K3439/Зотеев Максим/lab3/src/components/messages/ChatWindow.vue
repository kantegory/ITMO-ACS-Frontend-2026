<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  interlocutorName: { type: String, required: true },
  messages: { type: Array, required: true },
  currentUserId: { type: Number, required: true },
  loading: { type: Boolean, default: false },
  sending: { type: Boolean, default: false },
})

const emit = defineEmits(['send'])

const text = ref('')
const chatRef = ref(null)

async function scrollToBottom() {
  await nextTick()
  if (chatRef.value) {
    chatRef.value.scrollTop = chatRef.value.scrollHeight
  }
}

watch(
  () => [props.messages, props.loading],
  ([, isLoading]) => {
    if (!isLoading) scrollToBottom()
  },
  { immediate: true },
)

function handleSubmit() {
  const trimmed = text.value.trim()
  if (!trimmed || props.sending) return
  emit('send', trimmed)
}

function clearInput() {
  text.value = ''
}

defineExpose({ clearInput })
</script>

<template>
  <div class="card">
    <h2 id="chatName" class="card-header bg-body fw-bold fs-6 m-0">
      {{ interlocutorName }}
    </h2>

    <div
      ref="chatRef"
      class="card-body chat d-flex flex-column gap-2"
      role="log"
      aria-labelledby="chatName"
      tabindex="0"
    >
      <p v-if="loading" class="text-muted mb-0" role="status">Загрузка сообщений…</p>
      <template v-else>
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', message.senderId === currentUserId ? 'message--mine' : 'message--other']"
        >
          <!-- Отправителя на экране видно только по стороне и цвету, поэтому называем его текстом -->
          <span class="visually-hidden">
            {{ message.senderId === currentUserId ? 'Вы: ' : `${interlocutorName}: ` }}
          </span>
          {{ message.text }}
        </div>
      </template>
    </div>

    <div class="card-footer bg-body">
      <form class="d-flex gap-2" aria-label="Новое сообщение" @submit.prevent="handleSubmit">
        <label class="visually-hidden" for="chat-message-text">Текст сообщения</label>
        <input
          id="chat-message-text"
          v-model="text"
          type="text"
          class="form-control"
          placeholder="Введите сообщение"
          autocomplete="off"
          :disabled="sending"
          required
        >
        <button type="submit" class="btn btn-primary" :disabled="sending || !text.trim()">
          {{ sending ? 'Отправка…' : 'Отправить' }}
        </button>
      </form>
    </div>
  </div>
</template>
