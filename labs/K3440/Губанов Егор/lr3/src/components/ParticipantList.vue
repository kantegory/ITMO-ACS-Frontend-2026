<script setup>
defineProps({ names: { type: Array, required: true } })
</script>

<template>
  <ul class="participant-list">
    <li v-for="(name, index) in names" :key="index">
      <span class="avatar" aria-hidden="true">{{ name[0] }}</span>
      {{ name }}
    </li>
  </ul>
</template>