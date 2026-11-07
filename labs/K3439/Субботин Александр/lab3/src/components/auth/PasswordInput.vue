<script setup>
import { ref } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'

// Поле пароля с кнопкой «глаз»: показать введённое или снова скрыть
const password = defineModel({ type: String, default: '' })

defineProps({
  id: { type: String, required: true },
  autocomplete: { type: String, default: 'current-password' },
  minlength: { type: Number, default: 6 },
  large: { type: Boolean, default: false },
  describedby: { type: String, default: undefined },
  error: { type: String, required: true },
})

const visible = ref(false)
</script>

<template>
  <div class="input-group has-validation">
    <input
      :id="id"
      v-model="password"
      class="form-control"
      :class="{ 'form-control-lg': large }"
      :type="visible ? 'text' : 'password'"
      :autocomplete="autocomplete"
      :minlength="minlength"
      required
      :aria-describedby="describedby"
      :aria-errormessage="`${id}Error`"
    >
    <button
      class="btn btn-outline-secondary password-toggle"
      type="button"
      :aria-label="visible ? 'Скрыть пароль' : 'Показать пароль'"
      :aria-pressed="String(visible)"
      @click="visible = !visible"
    >
      <!-- Иконка — другой символ спрайта: открытый глаз ↔ перечёркнутый -->
      <AppIcon :name="visible ? 'eye-off' : 'eye'" />
    </button>
    <div :id="`${id}Error`" class="invalid-feedback">{{ error }}</div>
  </div>
</template>
