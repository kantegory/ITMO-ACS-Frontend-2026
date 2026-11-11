<script setup>
import { Modal } from 'bootstrap'
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'

// Обёртка над модальным окном Bootstrap: разметка и заголовок здесь,
// содержимое и кнопки передаются через слоты, открытие — через show()/hide()
defineProps({
  title: { type: String, required: true },
  size: { type: String, default: '' },
  centered: { type: Boolean, default: false }
})

const emit = defineEmits(['hidden'])

const element = ref(null)
const titleId = useId()
let modal = null

function onHidden() {
  emit('hidden')
}

onMounted(() => {
  modal = new Modal(element.value)
  element.value.addEventListener('hidden.bs.modal', onHidden)
})

onBeforeUnmount(() => {
  element.value?.removeEventListener('hidden.bs.modal', onHidden)
  modal?.dispose()
})

defineExpose({
  show: () => modal.show(),
  hide: () => modal.hide()
})
</script>

<template>
  <div ref="element" class="modal fade" tabindex="-1" :aria-labelledby="titleId">
    <div class="modal-dialog" :class="[size && `modal-${size}`, { 'modal-dialog-centered': centered }]">
      <div class="modal-content">
        <div class="modal-header">
          <h2 :id="titleId" class="modal-title h4">{{ title }}</h2>
          <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Закрыть" />
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
