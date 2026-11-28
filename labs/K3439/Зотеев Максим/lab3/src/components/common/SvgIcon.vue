<script setup>
defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <svg class="icon" aria-hidden="true" focusable="false">
    <use :href="`/img/sprite.svg#${name}`" />
  </svg>
</template>
