<script setup>
import { ref } from 'vue'
import spriteUrl from '@/assets/sprite.svg'

defineProps({
    modelValue: String,
    id: { type: String, required: true },
    label: { type: String, default: 'Пароль' },
    autocomplete: { type: String, default: 'current-password' },
    error: String
})
defineEmits(['update:modelValue'])
const visible = ref(false)
</script>

<template>
  <div class="form-field">
    <label class="form-label" :for="id">{{ label }}</label>
    <div class="password-wrap">
      <input
          :id="id"
          class="form-control"
          :type="visible ? 'text' : 'password'"
          :value="modelValue"
          :autocomplete="autocomplete"
          minlength="8"
          required
          :aria-invalid="Boolean(error)"
          @input="$emit('update:modelValue',
          $event.target.value)"
      />
      <button
          class="password-toggle"
          type="button"
          :aria-label="visible ? 'Скрыть пароль' : 'Показать пароль'"
          @click="visible = !visible"
      >
        <svg class="icon"><use :href="`${spriteUrl}#${visible ? 'eye-slash' : 'eye'}`" /></svg>
      </button>
    </div>
    <div v-if="error" class="field-error">{{ error }}</div>
  </div>
</template>

<style scoped>
.password-wrap {
  position: relative;
}
.password-wrap .form-control {
  padding-right: 50px;
}
.password-toggle {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 48px;
  border: 0;
  background: transparent;
  color: var(--rs-muted);
  cursor: pointer;
}
.password-toggle:hover {
  color: var(--rs-primary);
}
</style>
