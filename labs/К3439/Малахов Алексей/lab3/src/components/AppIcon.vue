<template>
  <svg class="icon" aria-hidden="true" focusable="false">
    <use :href="`/assets/img/sprite.svg#icon-${name}`" />
  </svg>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
})
</script>
