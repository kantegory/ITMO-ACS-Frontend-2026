<script setup>
import spriteUrl from '@/assets/sprite.svg'
import { useToast } from '@/composables/useToast.js'

const { message, isVisible, hideToast } = useToast()
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="isVisible" class="app-toast" role="status" aria-live="polite" aria-atomic="true">
        <span>{{ message }}</span>

        <button
          class="app-toast__close"
          type="button"
          aria-label="Закрыть уведомление"
          @click="hideToast"
        >
          <svg class="app-toast__close-icon" aria-hidden="true" focusable="false">
            <use :href="`${spriteUrl}#x-lg`" />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.app-toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;

  display: flex;
  align-items: center;
  gap: 16px;

  max-width: min(420px, calc(100vw - 32px));
  padding: 14px 18px;

  color: #ffffff;
  background: #212529;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgb(0 0 0 / 25%);
}

.app-toast__close {
  padding: 0;
  color: inherit;
  font: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.app-toast__close-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 576px) {
  .app-toast {
    right: 16px;
    bottom: 16px;
    left: 16px;
    max-width: none;
  }
}
</style>
