import { onBeforeUnmount } from 'vue'
import { Modal } from 'bootstrap'

function cleanupBodyModalState() {
  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('padding-right')
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())
}

// Обёртка для управления жизненным циклом модального окна Bootstrap
export function useBootstrapModal(modalRef) {
  let instance = null

  function getModal() {
    if (!modalRef.value) return null
    if (!instance) {
      instance = Modal.getOrCreateInstance(modalRef.value)
    }
    return instance
  }

  function show() {
    getModal()?.show()
  }

  function hide() {
    getModal()?.hide()
  }

  onBeforeUnmount(() => {
    const modal = instance
    const element = modalRef.value
    instance = null
    if (!modal || !element) return

    const wasOpen = element.classList.contains('show')

    const finalizeDispose = () => {
      modal.dispose()
      if (wasOpen) cleanupBodyModalState()
    }

    // Если размонтирование случилось во время CSS-анимации Bootstrap, дожидаемся её окончания перед dispose()
    if (modal._isTransitioning) {
      let disposed = false
      const safeDispose = () => {
        if (disposed) return
        disposed = true
        finalizeDispose()
      }
      element.addEventListener('shown.bs.modal', safeDispose, { once: true })
      element.addEventListener('hidden.bs.modal', safeDispose, { once: true })
      setTimeout(safeDispose, 400)
      if (wasOpen) cleanupBodyModalState()
      return
    }

    finalizeDispose()
  })

  return {
    show,
    hide,
  }
}
