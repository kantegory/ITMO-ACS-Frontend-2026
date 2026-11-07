<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import spriteUrl from '@/assets/sprite.svg'

const props = defineProps({
  modelValue: Boolean,
  labelledby: { type: String, default: 'modal-title' },
})
const emit = defineEmits(['update:modelValue'])
function close() {
  emit('update:modelValue', false)
}
function onKeydown(event) {
  if (props.modelValue && event.key === 'Escape') close()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-layer" role="presentation" @mousedown.self="close">
      <section class="base-modal" role="dialog" aria-modal="true" :aria-labelledby="labelledby">
        <header class="base-modal__header">
          <div><slot name="title" /></div>
          <button class="base-modal__close" type="button" aria-label="Закрыть" @click="close">
            <svg class="base-modal__close-icon" aria-hidden="true" focusable="false">
              <use :href="`${spriteUrl}#x-lg`" />
            </svg>
          </button>
        </header>
        <div class="base-modal__body"><slot /></div>
        <footer v-if="$slots.footer" class="base-modal__footer"><slot name="footer" /></footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(0 0 0 / 55%);
}
.base-modal {
  width: min(560px, 100%);
  max-height: calc(100vh - 40px);
  overflow: auto;
  background: var(--rs-surface);
  border-radius: 16px;
  box-shadow: 0 24px 80px rgb(0 0 0 / 35%);
}
.base-modal__header,
.base-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--rs-border);
}
.base-modal__footer {
  justify-content: flex-end;
  border-top: 1px solid var(--rs-border);
  border-bottom: 0;
}
.base-modal__body {
  padding: 22px;
}
.base-modal__close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: var(--rs-text);
  cursor: pointer;
}

.base-modal__close-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}
</style>
