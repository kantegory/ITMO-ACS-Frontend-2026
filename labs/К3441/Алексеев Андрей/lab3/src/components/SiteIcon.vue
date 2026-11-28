<script setup>
defineProps({ name: { type: String, required: true } });

const sprite = import.meta.env.BASE_URL + 'icons.svg';
</script>

<template>
  <svg class="icon" aria-hidden="true" focusable="false">
    <use :href="`${sprite}#${name}`" />
  </svg>
</template>
