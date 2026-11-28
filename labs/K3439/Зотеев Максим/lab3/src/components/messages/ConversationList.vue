<script setup>
const props = defineProps({
  conversations: { type: Array, required: true },
  selectedId: { type: Number, default: null },
  currentUserId: { type: Number, required: true },
})

defineEmits(['select'])

function interlocutor(conversation) {
  return conversation.ownerId === props.currentUserId
    ? conversation.tenantName
    : conversation.ownerName
}
</script>

<template>
  <h2 id="conversationsTitle" class="visually-hidden">Диалоги</h2>
  <div
    v-if="conversations.length"
    class="list-group"
    role="group"
    aria-labelledby="conversationsTitle"
  >
    <button
      v-for="conversation in conversations"
      :key="conversation.id"
      type="button"
      :class="['list-group-item list-group-item-action', { active: conversation.id === selectedId }]"
      :aria-current="conversation.id === selectedId ? 'true' : undefined"
      @click="$emit('select', conversation)"
    >
      <div class="fw-bold">{{ interlocutor(conversation) }}</div>
      <small>{{ conversation.property?.title }}</small>
    </button>
  </div>
  <p v-else class="text-muted">
    Диалогов пока нет. Напишите владельцу со страницы объекта.
  </p>
</template>
