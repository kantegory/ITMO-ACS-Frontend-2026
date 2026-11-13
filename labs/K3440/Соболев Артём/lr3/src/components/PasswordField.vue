<script setup>
import { ref } from "vue";
const model = defineModel({ type: String, default: "" });
defineProps({
  id: { type: String, required: true },
  label: { type: String, default: "Пароль" },
  autocomplete: { type: String, default: "current-password" },
  minlength: { type: Number, default: 9 },
});
const visible = ref(false);
</script>
<template>
  <label :for="id">{{ label }}</label>
  <div class="password-field">
    <input
      :id="id"
      v-model="model"
      class="form-control"
      :type="visible ? 'text' : 'password'"
      :autocomplete="autocomplete"
      :minlength="minlength"
      required
    />
    <button
      type="button"
      class="password-toggle"
      :aria-label="visible ? 'Скрыть пароль' : 'Показать пароль'"
      :aria-controls="id"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        <path v-if="!visible" d="m4 4 16 16" />
      </svg>
    </button>
  </div>
</template>
