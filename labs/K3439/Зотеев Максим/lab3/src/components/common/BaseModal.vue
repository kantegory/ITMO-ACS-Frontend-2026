<script setup>
import { ref } from 'vue'
import { useBootstrapModal } from '@/composables/useBootstrapModal'

defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
})

const modalRef = ref(null)
const { show, hide } = useBootstrapModal(modalRef)

defineExpose({ show, hide })
</script>

<template>
  <div
    :id="id"
    ref="modalRef"
    class="modal fade"
    tabindex="-1"
    :aria-labelledby="`${id}-title`"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h2 :id="`${id}-title`" class="modal-title fs-5">{{ title }}</h2>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Закрыть"
          ></button>
        </div>
        <slot :close="hide" />
      </div>
    </div>
  </div>
</template>
