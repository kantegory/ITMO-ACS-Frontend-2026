<script setup>
import { reactive } from 'vue'
import { TYPE_NAMES } from '../format'

defineProps({ pending: Boolean })
const emit = defineEmits(['save'])
const initial = { title: '', type: 'APARTMENT', city: '', address: '', pricePerMonth: '', amenities: '', description: '' }
const fields = reactive({ ...initial })
defineExpose({ reset: () => Object.assign(fields, initial) })
</script>

<template>
  <form class="d-grid gap-2" @submit.prevent="emit('save', { ...fields })">
    <label for="title">Название</label>
    <input id="title" v-model.trim="fields.title" class="form-control" required>
    <label for="type">Тип</label>
    <select id="type" v-model="fields.type" class="form-select">
      <option v-for="(label, type) in TYPE_NAMES" :key="type" :value="type">{{ label }}</option>
    </select>
    <label for="city">Город</label>
    <input id="city" v-model.trim="fields.city" class="form-control" required>
    <label for="address">Адрес</label>
    <input id="address" v-model.trim="fields.address" class="form-control" required>
    <label for="price">Цена, ₽/мес</label>
    <input id="price" v-model.number="fields.pricePerMonth" class="form-control" type="number" min="1" required>
    <label for="amenities">Удобства через запятую</label>
    <input id="amenities" v-model.trim="fields.amenities" class="form-control">
    <label for="description">Описание</label>
    <textarea id="description" v-model.trim="fields.description" class="form-control" rows="3"></textarea>
    <button class="btn btn-primary mt-2" :disabled="pending">Добавить объявление</button>
  </form>
</template>
