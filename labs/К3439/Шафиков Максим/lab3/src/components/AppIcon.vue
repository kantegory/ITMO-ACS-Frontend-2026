<script setup>
defineProps({ name: { type: String, required: true } });
</script>

<template>
  <svg class="icon" aria-hidden="true" focusable="false">
    <use :href="'/assets/icons/sprite.svg#' + name" />
  </svg>
</template>
