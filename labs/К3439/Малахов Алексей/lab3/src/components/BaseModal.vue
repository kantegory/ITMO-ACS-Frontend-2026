<template>
  <div
    :id="id"
    ref="root"
    class="modal fade"
    tabindex="-1"
    :aria-labelledby="`${id}-title`"
    aria-hidden="true"
  >
    <div class="modal-dialog" :class="dialogClass">
      <div class="modal-content">
        <div class="modal-header">
          <h2 :id="`${id}-title`" class="modal-title h5">{{ title }}</h2>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Закрыть"
          />
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Modal } from 'bootstrap'

defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  dialogClass: { type: String, default: '' },
})

const emit = defineEmits(['shown', 'hidden'])
const root = ref(null)
let modal

onMounted(() => {
  modal = new Modal(root.value)
  root.value.addEventListener('shown.bs.modal', () => emit('shown'))
  root.value.addEventListener('hidden.bs.modal', () => emit('hidden'))
})

onBeforeUnmount(() => modal?.dispose())

defineExpose({
  show: () => modal.show(),
  hide: () => modal.hide(),
})
</script>
