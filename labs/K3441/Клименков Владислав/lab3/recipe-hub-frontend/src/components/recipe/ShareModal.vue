<script setup>
/**
 * ShareModal.vue — модалка «Поделиться рецептом».
 */

import { onBeforeUnmount, ref } from 'vue';
import { useBootstrapModal } from '@/composables/useBootstrapModal';
import { announce } from '@/composables/useLiveRegion';

const props = defineProps({
  url: { type: String, default: '' },
});

const { element, show, hide } = useBootstrapModal();

const input = ref(null);
const copyLabel = ref('Скопировать ссылку');
let resetTimer = null;

function open() {
  copyLabel.value = 'Скопировать ссылку';
  show();
}

async function copy() {
  try {
    await navigator.clipboard.writeText(props.url);
    copyLabel.value = 'Скопировано';
    announce('Ссылка на рецепт скопирована');
  } catch {
    input.value?.select();
    announce('Ссылка выделена. Скопируйте её вручную.');
  }

  window.clearTimeout(resetTimer);
  resetTimer = window.setTimeout(() => {
    copyLabel.value = 'Скопировать ссылку';
  }, 1500);
}

onBeforeUnmount(() => {
  window.clearTimeout(resetTimer);
});

defineExpose({ open });
</script>

<template>
  <div
    ref="element"
    class="modal fade"
    id="shareModal"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    aria-labelledby="shareModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title h5" id="shareModalLabel">
            Поделиться рецептом
          </h2>
          <button
            class="btn-close"
            type="button"
            data-bs-dismiss="modal"
            aria-label="Закрыть"
          ></button>
        </div>
        <div class="modal-body">
          <label class="form-label" for="share-link">Ссылка на рецепт</label>
          <input
            id="share-link"
            ref="input"
            class="form-control"
            type="text"
            :value="url"
            readonly
          >
        </div>
        <div class="modal-footer">
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="hide"
          >
            Закрыть
          </button>
          <button class="btn btn-rh-primary" type="button" @click="copy">
            {{ copyLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
