/**
 * useBootstrapModal.js — управление модальными окнами Bootstrap.
 *
 * Composable переиспользуется тремя модалками: создание рецепта,
 * редактирование профиля и «Поделиться». При размонтировании компонента
 * инстанс и backdrop очищаются, чтобы страница не осталась затемнённой.
 */

import { onBeforeUnmount, ref } from 'vue';
import { Modal } from 'bootstrap';

export function useBootstrapModal() {
  const element = ref(null);

  function show() {
    if (!element.value) return;
    Modal.getOrCreateInstance(element.value).show();
  }

  function hide() {
    if (!element.value) return;

    const modal = Modal.getOrCreateInstance(element.value);

    // Если окно ещё в процессе открытия, Bootstrap проигнорирует hide().
    // В этом случае закрываем его сразу после завершения анимации показа.
    if (modal._isTransitioning) {
      element.value.addEventListener('shown.bs.modal', () => modal.hide(), {
        once: true,
      });
      return;
    }

    modal.hide();
  }

  function dispose() {
    if (!element.value) return;

    const instance = Modal.getInstance(element.value);
    if (instance) {
      instance.hide();
      instance.dispose();
    }

    document.body.classList.remove('modal-open');
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.remove();
    });
  }

  onBeforeUnmount(dispose);

  return { element, show, hide };
}
