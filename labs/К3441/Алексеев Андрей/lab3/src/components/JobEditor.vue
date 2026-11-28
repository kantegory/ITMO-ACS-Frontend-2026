<script setup>
import { nextTick, reactive, ref, watch } from 'vue';
import { experiences, formats, industries } from '../domain.js';

const props = defineProps({
  job: Object,
  disabled: Boolean,
  error: String
});
const emit = defineEmits(['save', 'cancel']);
const emptyJob = {
  title: '', company: '', city: '', industry: '', experience: '', format: '',
  salaryMin: '', salaryMax: '', description: '', requirements: ''
};
const form = reactive({ ...emptyJob });
const titleField = ref(null);

watch(() => props.job, async job => {
  for (const key of Object.keys(emptyJob)) form[key] = job ? job[key] : emptyJob[key];
  if (job) {
    await nextTick();
    titleField.value?.focus();
  }
});

function submit() {
  const job = Object.fromEntries(Object.entries(form).map(([key, value]) => [
    key, typeof value === 'string' ? value.trim() : value
  ]));
  emit('save', job);
}

function reset() {
  Object.assign(form, emptyJob);
}

defineExpose({ reset });
</script>

<template>
  <section class="panel p-4 mb-4" aria-labelledby="editor-heading">
    <h2 class="h4 mb-3" id="editor-heading">{{ job ? 'Редактирование вакансии' : 'Новая вакансия' }}</h2>
    <form class="row g-3" aria-describedby="editor-error" @submit.prevent="submit">
      <div class="col-md-6">
        <label class="form-label" for="title">Должность</label>
        <input v-model="form.title" class="form-control" id="title" ref="titleField" name="title" maxlength="100" required>
      </div>
      <div class="col-md-6">
        <label class="form-label" for="company">Компания</label>
        <input v-model="form.company" class="form-control" id="company" name="company" autocomplete="organization" maxlength="80" required>
      </div>
      <div class="col-md-6">
        <label class="form-label" for="city">Город</label>
        <input v-model="form.city" class="form-control" id="city" name="city" autocomplete="address-level2" maxlength="80" required>
      </div>
      <div class="col-md-6">
        <label class="form-label" for="industry">Отрасль</label>
        <select v-model="form.industry" class="form-select" id="industry" name="industry" required>
      <option value="">Выберите отрасль</option>
      <option v-for="value in industries" :key="value">{{ value }}</option>
    </select>
      </div>
      <div class="col-md-6">
        <label class="form-label" for="experience">Опыт</label>
        <select v-model="form.experience" class="form-select" id="experience" name="experience" required>
      <option value="">Выберите опыт</option>
      <option v-for="value in experiences" :key="value">{{ value }}</option>
    </select>
      </div>
      <div class="col-md-6">
        <label class="form-label" for="format">Формат работы</label>
        <select v-model="form.format" class="form-select" id="format" name="format" required>
      <option value="">Выберите формат</option>
      <option v-for="value in formats" :key="value">{{ value }}</option>
    </select>
      </div>
      <div class="col-sm-6">
        <label class="form-label" for="salary-min">Зарплата от, ₽</label>
        <input v-model.number="form.salaryMin" class="form-control" id="salary-min" name="salaryMin" type="number" min="0" max="100000000" required>
      </div>
      <div class="col-sm-6">
        <label class="form-label" for="salary-max">Зарплата до, ₽</label>
        <input v-model.number="form.salaryMax" class="form-control" id="salary-max" name="salaryMax" type="number" min="0" max="100000000" required>
      </div>
      <div class="col-12">
        <label class="form-label" for="description">Описание</label>
        <textarea v-model="form.description" class="form-control" id="description" name="description" rows="3" maxlength="2500" required></textarea>
      </div>
      <div class="col-12">
        <label class="form-label" for="requirements">Требования</label>
        <textarea v-model="form.requirements" class="form-control" id="requirements" name="requirements" rows="3" maxlength="2500" required></textarea>
      </div>
      <div class="col-12">
        <p class="text-danger" id="editor-error" role="alert">{{ error }}</p>
        <button class="btn btn-primary me-2" type="submit" :disabled="disabled">{{ job ? 'Сохранить' : 'Опубликовать' }}</button>
        <button v-if="job" class="btn btn-outline-secondary" type="button" :disabled="disabled" @click="emit('cancel')">Отмена</button>
      </div>
    </form>
  </section>
</template>
