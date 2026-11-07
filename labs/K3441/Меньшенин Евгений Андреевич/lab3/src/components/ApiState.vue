<script setup>
defineProps({
  kind: { type: String, default: "loading" },
  message: { type: String, required: true },
});
defineEmits(["retry"]);
</script>
<template>
  <div
    :class="['api-state', kind]"
    :role="kind === 'error' ? 'alert' : 'status'"
  >
    <span class="state-icon">{{
      kind === "loading" ? "◌" : kind === "error" ? "!" : "⌕"
    }}</span>
    <p>{{ message }}</p>
    <button
      v-if="kind === 'error'"
      class="button outline"
      type="button"
      @click="$emit('retry')"
    >
      Повторить
    </button>
  </div>
</template>
