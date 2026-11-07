<script setup>
import { reactive, useTemplateRef } from 'vue'

import { reviewsApi } from '@/api'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAuth } from '@/composables/useAuth'
import { useFormValidation } from '@/composables/useFormValidation'
import { todayISO } from '@/utils/format'

const props = defineProps({
  restaurantId: { type: Number, required: true },
})
const emit = defineEmits(['created'])

const { user } = useAuth()
const form = useTemplateRef('form')
const { validated, submitting, formError, resync, onSubmit, resetValidation } = useFormValidation(form)

const review = reactive({ rating: null, text: '' })

const submit = onSubmit(async () => {
  const created = await reviewsApi.create({
    restaurantId: props.restaurantId,
    userId: user.value.id,
    author: user.value.name,
    rating: review.rating,
    text: review.text.trim(),
    date: todayISO(),
  })
  Object.assign(review, { rating: null, text: '' })
  resetValidation()
  emit('created', created)
})
</script>

<template>
  <form
    ref="form"
    class="review-form needs-validation mb-4"
    :class="{ 'was-validated': validated }"
    novalidate
    @submit.prevent="submit"
    @input="resync"
    @change="resync"
  >
    <div class="row g-3">
      <div class="col-sm-6">
        <p class="form-label mb-1">Автор</p>
        <p class="fw-semibold mb-0">{{ user.name }}</p>
      </div>
      <div class="col-sm-6">
        <fieldset id="reviewRatingGroup" class="star-rating" role="radiogroup" aria-errormessage="reviewRatingError">
          <legend class="form-label fs-6 mb-2">Оценка</legend>
          <div class="star-rating-inputs">
            <template v-for="star in [5, 4, 3, 2, 1]" :key="star">
              <input :id="`star-${star}`" v-model="review.rating" class="visually-hidden" name="rating" type="radio" :value="star" required>
              <label :for="`star-${star}`" :title="`${star} из 5`"><AppIcon class="icon-fill" name="star" /><span class="visually-hidden">{{ star }} из 5</span></label>
            </template>
          </div>
          <div id="reviewRatingError" class="invalid-feedback">Поставьте оценку от 1 до 5.</div>
        </fieldset>
      </div>
      <div class="col-12">
        <label class="form-label" for="reviewText">Отзыв</label>
        <textarea
          id="reviewText"
          v-model="review.text"
          class="form-control"
          rows="3"
          minlength="10"
          maxlength="1000"
          required
          aria-errormessage="reviewTextError"
        ></textarea>
        <div id="reviewTextError" class="invalid-feedback">Напишите хотя бы пару предложений (от 10 символов).</div>
      </div>
      <div class="col-12">
        <div v-if="formError" class="alert alert-danger mb-3" role="alert">{{ formError }}</div>
        <button class="btn btn-primary" type="submit" :disabled="submitting">Опубликовать</button>
      </div>
    </div>
  </form>
</template>
