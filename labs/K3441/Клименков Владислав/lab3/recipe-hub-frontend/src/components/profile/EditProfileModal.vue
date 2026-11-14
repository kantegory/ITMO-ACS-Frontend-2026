<script setup>
/**
 * EditProfileModal.vue — редактирование имени и описания профиля.
 */

import { nextTick, reactive, ref } from 'vue';
import { useBootstrapModal } from '@/composables/useBootstrapModal';
import { useAuthStore } from '@/stores/auth';
import { users as usersApi } from '@/api/resources';
import { announce } from '@/composables/useLiveRegion';

const emit = defineEmits(['saved']);

const auth = useAuthStore();
const { element, show, hide } = useBootstrapModal();

const form = reactive({ name: '', bio: '' });
const error = ref('');
const nameInvalid = ref(false);
const submitting = ref(false);
const nameInput = ref(null);

function open(user = auth.user) {
  form.name = user?.name || '';
  form.bio = user?.bio || '';
  error.value = '';
  nameInvalid.value = false;
  show();
}

async function submit() {
  error.value = '';

  const name = form.name.trim();
  if (name.length < 2) {
    nameInvalid.value = true;
    await nextTick();
    nameInput.value?.focus();
    return;
  }
  nameInvalid.value = false;

  if (!auth.user) {
    error.value = 'Требуется авторизация.';
    return;
  }

  submitting.value = true;
  try {
    const updated = await usersApi.update(auth.user.id, {
      name,
      bio: form.bio.trim(),
    });

    auth.updateUser(updated);
    hide();
    announce('Профиль обновлён');
    emit('saved', updated);
  } catch (err) {
    error.value = err?.message || 'Не удалось сохранить профиль.';
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <div
    ref="element"
    class="modal fade"
    id="editProfileModal"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    aria-labelledby="editProfileModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <form novalidate :aria-busy="submitting" @submit.prevent="submit">
          <div class="modal-header">
            <h2 class="modal-title h5" id="editProfileModalLabel">
              Редактирование профиля
            </h2>
            <button
              class="btn-close"
              type="button"
              data-bs-dismiss="modal"
              aria-label="Закрыть"
            ></button>
          </div>

          <div class="modal-body">
            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>

            <div class="mb-3">
              <label class="form-label" for="profile-name-input">Имя</label>
              <input
                id="profile-name-input"
                ref="nameInput"
                v-model="form.name"
                class="form-control"
                :class="{ 'is-invalid': nameInvalid }"
                type="text"
                name="name"
                autocomplete="name"
                aria-describedby="profile-name-error"
                :aria-invalid="nameInvalid ? 'true' : 'false'"
                required
              >
              <div class="invalid-feedback" id="profile-name-error">
                Укажите имя (минимум 2 символа).
              </div>
            </div>

            <div class="mb-0">
              <label class="form-label" for="profile-bio-input">
                О себе
              </label>
              <textarea
                id="profile-bio-input"
                v-model="form.bio"
                class="form-control"
                name="bio"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn btn-outline-secondary"
              type="button"
              data-bs-dismiss="modal"
            >
              Отмена
            </button>
            <button
              class="btn btn-rh-primary"
              type="submit"
              :disabled="submitting"
            >
              {{ submitting ? 'Сохранение…' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

