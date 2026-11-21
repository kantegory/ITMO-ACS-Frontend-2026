<script setup>
defineProps({ cities: { type: Array, required: true } })
const city = defineModel({ type: String, required: true })
</script>

<template>
  <div class="filters">
    <label for="city">Город</label>
    <select id="city" v-model="city">
      <option value="">Все города</option>
      <option v-for="item in cities" :key="item" :value="item">{{ item }}</option>
    </select>
  </div>
</template>
