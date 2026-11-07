<script setup>
import { Modal } from 'bootstrap'
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

// Обёртка над модальным окном Bootstrap: фокус-ловушку, Esc, затемнение и aria-атрибуты
// даёт сам Bootstrap, а содержимое (.modal-content) приходит через слот
defineProps({
  labelledby: { type: String, required: true },
  dialogClass: { type: String, default: '' },
})
const emit = defineEmits(['show', 'hidden'])

// Имя ref в шаблоне не должно совпадать с переменной в setup: в production-сборке Vue
// записал бы элемент прямо в неё
const element = useTemplateRef('root')
let instance = null
let opener = null

function onShow(event) {
  opener = event.relatedTarget ?? document.activeElement
  emit('show', event)
}

// Модалку открывают из кода, поэтому Bootstrap не вернёт фокус сам — возвращаем на кнопку,
// которая её открыла. Если кнопки уже нет (например, бронь отменили), решает родитель в @hidden
function onHidden() {
  const focusLost = document.activeElement === document.body || element.value.contains(document.activeElement)
  if (focusLost && opener?.isConnected) opener.focus()
  emit('hidden')
}

onMounted(() => {
  instance = Modal.getOrCreateInstance(element.value)
  element.value.addEventListener('show.bs.modal', onShow)
  element.value.addEventListener('hidden.bs.modal', onHidden)
})

// Ушли со страницы по ссылке из открытой модалки («Войдите») — Bootstrap не успеет
// убрать затемнение и блокировку прокрутки, убираем сами
onBeforeUnmount(() => {
  const wasOpen = element.value.classList.contains('show')
  instance.dispose()
  if (!wasOpen) return
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())
  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('padding-right')
})

defineExpose({
  show: (trigger) => instance.show(trigger),
  hide: () => instance.hide(),
})
</script>

<template>
  <div ref="root" class="modal fade" tabindex="-1" :aria-labelledby="labelledby" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" :class="dialogClass">
      <slot />
    </div>
  </div>
</template>
