<template>
  <base-modal
    id="editProfileModal"
    ref="modal"
    title="Редактирование профиля"
    @hidden="resetValidation"
  >
    <form
      ref="form"
      novalidate
      :class="{ 'was-validated': validated }"
      @input="onInput"
      @submit.prevent="submit"
    >
      <div class="modal-body">
        <div class="mb-3">
          <label for="editName" class="form-label">Имя</label>
          <input
            id="editName"
            v-model="draft.name"
            type="text"
            class="form-control"
            required
            minlength="2"
            aria-describedby="editNameError"
          />
          <div id="editNameError" class="invalid-feedback">Введите имя.</div>
        </div>
        <div class="mb-3">
          <label for="editCity" class="form-label">Город</label>
          <input id="editCity" v-model="draft.city" type="text" class="form-control" />
        </div>
        <div>
          <label for="editBio" class="form-label">О себе</label>
          <textarea
            id="editBio"
            v-model="draft.bio"
            class="form-control"
            rows="3"
            maxlength="200"
          />
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
          Отмена
        </button>
        <button type="submit" class="btn btn-primary" :disabled="sending">
          Сохранить
        </button>
      </div>
    </form>
  </base-modal>
</template>

<script setup>
import { reactive, ref } from 'vue'

import { profilesApi } from '@/api'
import BaseModal from '@/components/BaseModal.vue'
import { useFormValidation } from '@/composables/useFormValidation'
import { useNotify } from '@/composables/useNotify'

const props = defineProps({
  profile: { type: Object, required: true },
})

const emit = defineEmits(['saved'])

const { notify } = useNotify()
const modal = ref(null)
const form = ref(null)
const sending = ref(false)
const draft = reactive({ name: '', city: '', bio: '' })
const { validated, validate, resetValidation, onInput } = useFormValidation(form)

function show() {
  Object.assign(draft, {
    name: props.profile.name,
    city: props.profile.city || '',
    bio: props.profile.bio || '',
  })
  modal.value.show()
}

async function submit() {
  if (!validate()) return
  sending.value = true
  try {
    const { data } = await profilesApi.update(props.profile.id, {
      name: draft.name.trim(),
      city: draft.city.trim(),
      bio: draft.bio.trim(),
    })
    emit('saved', data)
    modal.value.hide()
  } catch (error) {
    notify(error.message)
  } finally {
    sending.value = false
  }
}

defineExpose({ show })
</script>
